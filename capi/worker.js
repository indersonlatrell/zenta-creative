async function sha256(value) {
  if (!value) return null;
  const data = new TextEncoder().encode(String(value).trim().toLowerCase());
  const buf = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
}
function normalizePhone(v) {
  if (!v) return null;
  const digits = String(v).replace(/[^0-9]/g, "");
  return digits || null;
}
function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}
export default {
  async fetch(request, env) {
    const origin = env.ALLOWED_ORIGIN || "*";
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405, headers: corsHeaders(origin) });
    }
    let body;
    try { body = await request.json(); }
    catch { return new Response("Bad JSON", { status: 400, headers: corsHeaders(origin) }); }
    const contact = body.contact || "";
    const isEmail = contact.includes("@");
    const user_data = {
      client_ip_address: request.headers.get("CF-Connecting-IP") || "",
      client_user_agent: request.headers.get("User-Agent") || "",
    };
    if (body.fbp) user_data.fbp = body.fbp;
    if (body.fbc) user_data.fbc = body.fbc;
    if (isEmail) user_data.em = [await sha256(contact)];
    else if (contact) user_data.ph = [await sha256(normalizePhone(contact))];
    if (body.first_name) user_data.fn = [await sha256(body.first_name)];
    const event = {
      event_name: body.event_name || "Lead",
      event_time: Math.floor(Date.now() / 1000),
      event_id: body.event_id,
      event_source_url: body.event_source_url,
      action_source: "website",
      user_data,
      custom_data: body.custom_data || {},
    };
    const payload = { data: [event] };
    if (env.TEST_EVENT_CODE) payload.test_event_code = env.TEST_EVENT_CODE;
    const version = env.GRAPH_VERSION || "v21.0";
    const url = `https://graph.facebook.com/${version}/${env.PIXEL_ID}/events?access_token=${env.META_ACCESS_TOKEN}`;
    const metaRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const metaText = await metaRes.text();
    return new Response(metaText, {
      status: metaRes.ok ? 200 : 502,
      headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
    });
  },
};
