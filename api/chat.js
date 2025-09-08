// server.ts
import express from "express";
import fetch from "node-fetch";
import rateLimit from "express-rate-limit";

const app = express();
app.use(express.json());

// простая защита от DDOS/спама
app.use("/api/chat", rateLimit({ windowMs: 30_000, max: 30 }));

const SYSTEM_PROMPT = process.env.SYSTEM_PROMPT ?? "Ты — вежливый консультант...";
const LLM_API_BASE = process.env.LLM_API_BASE ?? "https://api.openai.com/v1";
const LLM_API_KEY  = process.env.LLM_API_KEY!;

app.post("/api/chat", async (req, res) => {
  try {
    const { messages, meta } = req.body;

    // жёстко фиксируем системный промпт на бэкенде
    const fullMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...(Array.isArray(messages) ? messages : []),
    ];

    const r = await fetch(`${LLM_API_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LLM_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.LLM_MODEL ?? "gpt-4o-mini",
        temperature: 0.2,
        messages: fullMessages,
        // можно включить стриминг: stream: true (потребует SSE-обработчик)
      })
    });

    if (!r.ok) {
      const txt = await r.text();
      return res.status(r.status).json({ error: txt });
    }

    const data = await r.json();
    const answer = data.choices?.[0]?.message?.content ?? "";
    res.json({ answer });
  } catch (e:any) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

const port = process.env.PORT ?? 3000;
app.listen(port, () => console.log(`API listening on :${port}`));
