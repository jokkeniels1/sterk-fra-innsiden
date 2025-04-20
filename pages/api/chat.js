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
    
    if (!apiKey) {
      throw new Error("API-nøkkel mangler i miljøvariablene");
    }

    const response = await axios({
      method: 'post',
      url: 'https://openrouter.ai/api/v1/chat/completions',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://coremind.no',
        'X-Title': 'CoreMind App'
      },
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
    console.error("API Error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
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
