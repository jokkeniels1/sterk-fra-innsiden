export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Melding mangler" });
  }

  // Check for API key with better error message
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.error("OPENROUTER_API_KEY mangler i miljøvariablene");
    return res.status(500).json({ 
      error: "API-nøkkel mangler. Vennligst kontakt administrator.",
      details: process.env.NODE_ENV === 'development' ? "OPENROUTER_API_KEY er ikke satt i .env.local" : "API-nøkkel mangler i produksjonsmiljøet"
    });
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://coremind.vercel.app",
        "X-Title": "CoreMind App"
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

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("OpenRouter API feil:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      return res.status(response.status).json({ 
        error: "Feil ved kommunikasjon med AI-tjenesten",
        details: process.env.NODE_ENV === 'development' ? errorData : undefined
      });
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0]?.message?.content) {
      console.error("Ugyldig svar fra OpenRouter:", data);
      return res.status(500).json({ error: "Ugyldig svar fra AI-modellen." });
    }

    const reply = data.choices[0].message.content;
    return res.status(200).json({ result: reply });

  } catch (error) {
    console.error("Feil i /api/chat:", error);
    return res.status(500).json({ 
      error: "Serverfeil ved generering av svar",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
