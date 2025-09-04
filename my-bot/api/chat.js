export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const response = await fetch("https://api.vsegpt.ru/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.VSEGPT_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Ты медицинский консультант. Отвечай простыми словами и всегда добавляй предупреждение: 'Для точного диагноза обратитесь к врачу'."
          },
          ...(req.body.messages || [])
        ]
      })
    });

    const data = await response.json();
    res.status(200).json({
      answer: data?.choices?.[0]?.message?.content || "Нет ответа"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка соединения с vsegpt.ru" });
  }
}

