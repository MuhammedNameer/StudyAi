// Vercel serverless function. Keeps your API key secret on the server.
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { messages } = req.body || {};
  if (!Array.isArray(messages) || messages.length > 30) return res.status(400).json({ error: "bad request" });
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({ model: "claude-sonnet-5-5", max_tokens: 4000, messages }),
  });
  const d = await r.json();
  res.json({ text: (d.content || []).map((c) => c.text || "").join("") });
}
