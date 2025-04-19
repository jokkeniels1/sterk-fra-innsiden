export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Melding mangler" });
  }

  if (!process.env.OPENROUTER_API_KEY) {
    return res.status(500).json({ error: "API-nøkkel mangler i miljøvariabler (.env.local)" });
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Du er en erfaren og pedagogisk personlig trener. Svar i HTML-format med overskrifter, punktlister og bilder (bruk <img> med lenker fra Unsplash hvis relevant)."
          },
          {
            role: "user",
            content: message
          }
        ],
      }),
    });

    const data = await response.json();

    if (!data.choices || !data.choices[0]?.message?.content) {
      console.error("Ugyldig svar fra OpenRouter:", data);
      return res.status(500).json({ error: "Ugyldig svar fra AI-modellen." });
    }

    const reply = data.choices[0].message.content;
    return res.status(200).json({ result: reply });

  } catch (error) {
    console.error("Feil i /api/chat:", error);
    return res.status(500).json({ error: "Serverfeil. Se loggen for mer info." });
  }
}
