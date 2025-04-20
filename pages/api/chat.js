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
  
  // Log API key status (without exposing the actual key)
  console.log("API-nøkkel status:", {
    exists: !!apiKey,
    length: apiKey ? apiKey.length : 0,
    startsWith: apiKey ? apiKey.substring(0, 4) + "..." : "none",
    environment: process.env.NODE_ENV
  });
  
  if (!apiKey) {
    console.error("OPENROUTER_API_KEY mangler i miljøvariablene");
    return res.status(500).json({ 
      error: "API-nøkkel mangler. Vennligst kontakt administrator.",
      details: process.env.NODE_ENV === 'development' ? "OPENROUTER_API_KEY er ikke satt i .env.local" : "API-nøkkel mangler i produksjonsmiljøet"
    });
  }

  try {
    console.log("Starter API-kall til OpenRouter...");
    
    // Trim the API key to remove any whitespace
    const trimmedApiKey = apiKey.trim();
    
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": trimmedApiKey,
        "HTTP-Referer": "http://localhost:3003",
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

    console.log("API-respons status:", response.status);
    console.log("API-respons headers:", Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      let errorData;
      try {
        const text = await response.text();
        try {
          errorData = JSON.parse(text);
        } catch (e) {
          console.error("Kunne ikke parse error response som JSON:", text);
          errorData = { error: { message: text } };
        }
      } catch (e) {
        console.error("Kunne ikke lese error response:", e);
        errorData = { error: { message: "Kunne ikke lese feilmelding" } };
      }

      console.error("OpenRouter API feil:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        headers: Object.fromEntries(response.headers.entries())
      });

      // Spesifikk håndtering av 401-feil
      if (response.status === 401) {
        return res.status(401).json({ 
          error: "Autentiseringsfeil med API-nøkkel",
          details: "API-nøkkelen er enten ugyldig eller utløpt. Vennligst kontakt administrator."
        });
      }

      return res.status(response.status).json({ 
        error: "Feil ved kommunikasjon med AI-tjenesten",
        details: process.env.NODE_ENV === 'development' ? errorData : undefined
      });
    }

    let data;
    try {
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("Kunne ikke parse response som JSON:", text);
        return res.status(500).json({ error: "Ugyldig svar fra AI-tjenesten" });
      }
    } catch (e) {
      console.error("Kunne ikke lese response:", e);
      return res.status(500).json({ error: "Kunne ikke lese svar fra AI-tjenesten" });
    }

    console.log("API-respons mottatt:", { 
      hasChoices: !!data.choices,
      firstChoice: data.choices?.[0]?.message ? "finnes" : "mangler"
    });

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
