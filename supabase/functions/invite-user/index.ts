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
    const { email, role, orgOwnerId, orgName } = await req.json();

    if (!email || !orgOwnerId) {
      throw new Error("email and orgOwnerId are required");
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Check for existing active/pending invite for this email in this org
    const { data: existing } = await supabaseAdmin
      .from("organization_members")
      .select("id, status")
      .eq("org_owner_id", orgOwnerId)
      .eq("email", email)
      .neq("status", "revoked")
      .maybeSingle();

    if (existing) {
      throw new Error(`${email} has already been invited to this organization.`);
    }

    // Create the pending member record
    const { error: insertError } = await supabaseAdmin
      .from("organization_members")
      .insert({
        org_owner_id: orgOwnerId,
        email: email.toLowerCase().trim(),
        role: role || "member",
        status: "pending",
      });

    if (insertError) throw insertError;

    // Send the Supabase invitation email
    const siteUrl = Deno.env.get("SITE_URL") || "http://localhost:5173";
    const { error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      email.toLowerCase().trim(),
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
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
