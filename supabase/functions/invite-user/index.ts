import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, role, orgOwnerId, orgName, resend = false, resetPassword = false } = await req.json();

    if (!email || !orgOwnerId) {
      throw new Error("email and orgOwnerId are required");
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const siteUrl = Deno.env.get("SITE_URL") || "http://localhost:5173";
    const normalizedEmail = email.toLowerCase().trim();

    // ── Reset password flow ───────────────────────────────────────────────────
    if (resetPassword) {
      const { error } = await supabaseAdmin.auth.admin.generateLink({
        type: "recovery",
        email: normalizedEmail,
        options: { redirectTo: siteUrl },
      });
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Resend invitation flow ────────────────────────────────────────────────
    if (resend) {
      // Remove old pending record so we can re-invite cleanly
      await supabaseAdmin
        .from("organization_members")
        .delete()
        .eq("org_owner_id", orgOwnerId)
        .eq("email", normalizedEmail)
        .eq("status", "pending");

      // Also delete the Supabase user if they were never confirmed (so invite works again)
      const { data: users } = await supabaseAdmin.auth.admin.listUsers();
      const existing = users?.users?.find((u: { email: string }) => u.email === normalizedEmail && !u.email_confirmed_at);
      if (existing) {
        await supabaseAdmin.auth.admin.deleteUser(existing.id);
      }
    } else {
      // Check for existing active/pending invite
      const { data: existing } = await supabaseAdmin
        .from("organization_members")
        .select("id, status")
        .eq("org_owner_id", orgOwnerId)
        .eq("email", normalizedEmail)
        .neq("status", "revoked")
        .maybeSingle();

      if (existing) {
        throw new Error(`${email} has already been invited to this organization.`);
      }
    }

    // Insert / re-insert pending member record
    const { error: insertError } = await supabaseAdmin
      .from("organization_members")
      .insert({
        org_owner_id: orgOwnerId,
        email: normalizedEmail,
        role: role || "member",
        status: "pending",
        permissions: {},
      });
    if (insertError) throw insertError;

    // Send Supabase invitation email
    const { error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      normalizedEmail,
      {
        data: {
          org_owner_id: orgOwnerId,
          org_name: orgName || "your organization",
          role: role || "member",
          needs_onboarding: true,
        },
        redirectTo: siteUrl,
      }
    );
    if (inviteError) throw inviteError;

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
