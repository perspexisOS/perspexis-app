/**
 * Weekly Error Report — runs every Friday at 9am.
 *
 * Setup in Supabase Dashboard → Database → Extensions → enable pg_cron, then run:
 *
 * SELECT cron.schedule(
 *   'weekly-maven-errors',
 *   '0 9 * * 5',
 *   $$
 *   SELECT net.http_post(
 *     url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/weekly-error-report',
 *     headers := '{"Content-Type":"application/json","Authorization":"Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
 *     body := '{}'::jsonb
 *   )
 *   $$
 * );
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  // Fetch errors from the past 7 days
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: errors, error } = await supabase
    .from("maven_errors")
    .select("*")
    .gte("created_at", since)
    .order("created_at", { ascending: false });

  if (error || !errors?.length) {
    return new Response(JSON.stringify({ success: true, message: "No errors this week" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const report = `
PERSPEXIS — WEEKLY MAVEN ERROR REPORT
Week ending: ${new Date().toLocaleDateString()}
Total errors: ${errors.length}

${"─".repeat(60)}

${errors.map((e, i) => `
${i + 1}. ${e.error_type} — ${new Date(e.created_at).toLocaleString()}
   Org: ${e.org_name || "Unknown"} | User: ${e.user_id}
   Step: ${e.context}
   Error: ${e.error_message}
   Input: ${(e.input_text || "").slice(0, 200)}
   Resolved: ${e.resolved ? "Yes" : "No"}
`).join("\n")}

${"─".repeat(60)}
To mark errors as resolved, update maven_errors.resolved = true in Supabase.
`.trim();

  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (resendKey) {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Perspexis Reports <reports@perspexis.com>",
        to: ["clkillian89@gmail.com"],
        subject: `Weekly Maven Error Report — ${errors.length} issue${errors.length !== 1 ? "s" : ""}`,
        text: report,
      }),
    });
  }

  // Mark all as notified (you could add a "notified_at" column for this)
  return new Response(JSON.stringify({ success: true, count: errors.length }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
