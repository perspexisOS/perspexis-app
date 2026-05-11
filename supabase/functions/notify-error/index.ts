import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { to, subject, message } = await req.json();

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) {
      // Log that email couldn't be sent but don't fail the request
      console.warn("RESEND_API_KEY not configured — error logged to DB only");
      return new Response(JSON.stringify({ success: false, reason: "RESEND_API_KEY not set" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Maven <errors@perspexis.com>",
        to: [to],
        subject,
        text: message,
      }),
    });

    if (!emailRes.ok) {
      const errBody = await emailRes.text();
      throw new Error(`Resend error ${emailRes.status}: ${errBody}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("notify-error failed:", err);
    return new Response(JSON.stringify({ success: false, error: (err as Error).message }), {
      status: 200, // Return 200 so the client doesn't retry aggressively
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
