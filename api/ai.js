// FREE Gemini backend (CommonJS, works on Vercel without extra setup).
module.exports = async function handler(req, res) {
  const key = process.env.GEMINI_API_KEY;
  if (req.method !== "POST") {
    // Open yoursite.vercel.app/api/ai in a browser to check setup
    return res.status(200).json({ working: true, keyFound: Boolean(key) });
  }
  if (!key) return res.status(500).json({ error: "GEMINI_API_KEY is missing in Vercel" });
  try {
    const { messages } = req.body || {};
    if (!Array.isArray(messages)) return res.status(400).json({ error: "bad request" });
    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";
    const contents = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: String(m.content) }],
    }));
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: { "content-type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify({ contents }),
      }
    );
    const d = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: (d.error && d.error.message) || "Google AI error" });
    const text = ((d.candidates && d.candidates[0] && d.candidates[0].content.parts) || [])
      .map((p) => p.text || "").join("");
    res.status(200).json({ text });
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
};
