import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

app.post("/api/chat", async (req, res) => {
  const { messages } = req.body;

  const response = await fetch("https://api.vsegpt.ru/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.LLM_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        { role: "system", content: process.env.SYSTEM_PROMPT },
        ...(messages || [])
      ]
    })
  });

  const data = await response.json();
  res.json({ answer: data.choices?.[0]?.message?.content || "Ошибка" });
});

export default app;

