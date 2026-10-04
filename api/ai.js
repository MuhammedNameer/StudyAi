export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { messages } = req.body || {};
  if (!Array.isArray(messages) || messages.length > 30) return res.status(400).json({ error: "bad request" });
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";
  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: String(m.content) }],
  }));
  const r = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY },
      body: JSON.stringify({ contents }),
    }
  );
  const d = await r.json();
  if (!r.ok) return res.status(r.status).json({ error: d.error?.message || "AI error" });
  const text = (d.candidates?.[0]?.content?.parts || []).map((p) => p.text || "").join("");
  res.json({ text });
}
