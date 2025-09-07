// /api/chat.js (Next.js API Route style)

Access-Control-Allow-Origin: *
import cors from "cors";
app.use(cors());

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { messages } = req.body;
    const systemPrompt = process.env.SYSTEM_PROMPT ?? "Ты — медицинский консультант.";
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "OPENAI_API_KEY is not set" });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          ...(Array.isArray(messages) ? messages : []),
        ],
      }),
    });

    const data = await response.json();
    return res.status(200).json({ reply: data.choices?.[0]?.message?.content });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
