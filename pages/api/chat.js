import axios from 'axios';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Melding mangler" });
  }

  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    
    // Debug: Sjekk om API-nøkkelen er tilgjengelig
    console.log('API Key exists:', !!apiKey);
    console.log('API Key length:', apiKey ? apiKey.length : 0);
    console.log('API Key start:', apiKey ? apiKey.substring(0, 10) + '...' : 'none');
    
    if (!apiKey) {
      throw new Error("API-nøkkel mangler i miljøvariablene");
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://coremind.no',
      'X-Title': 'CoreMind App'
    };

    // Debug: Skriv ut headers
    console.log('Request headers:', headers);

    const response = await axios({
      method: 'post',
      url: 'https://openrouter.ai/api/v1/chat/completions',
      headers: headers,
      data: {
        model: "openai/gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: message.toLowerCase().includes("ernæring") || message.toLowerCase().includes("kosthold")
              ? "Du er en erfaren ernæringsekspert og kostholdsekspert. Svar i HTML-format."
              : message.toLowerCase().includes("drøm") 
                ? "Du er en erfaren drømmetyder og psykolog. Svar i HTML-format."
                : "Du er en erfaren treningsinstruktør og personlig trener. Svar i HTML-format."
          },
          {
            role: "user",
            content: message
          }
        ]
      }
    });

    if (!response.data?.choices?.[0]?.message?.content) {
      throw new Error("Ugyldig respons format fra OpenRouter");
    }

    return res.status(200).json({ result: response.data.choices[0].message.content });

  } catch (error) {
    // Forbedret feillogging
    console.error("API Error Details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers,
      config: {
        url: error.config?.url,
        headers: error.config?.headers,
        method: error.config?.method
      }
    });
    
    return res.status(500).json({
      error: "Serverfeil ved generering av svar",
      details: {
        message: error.message,
        type: error.name,
        status: error.response?.status,
        data: error.response?.data
      }
    });
  }
}
