import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

app.post("/api/chat", async (req, res) => {
  try {
    const r = await fetch("https://api.vsegpt.ru/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.VSEGPT_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Ты — медицинский консультант. Дай советы простым языком, но обязательно добавь, что нужно обратиться к врачу для точного диагноза." },
          ...req.body.messages
        ]
      })
    });

    const data = await r.json();
    res.json({ answer: data.choices?.[0]?.message?.content || "Нет ответа" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка на сервере" });
  }
});

app.listen(3000, () => console.log("API запущено"));

