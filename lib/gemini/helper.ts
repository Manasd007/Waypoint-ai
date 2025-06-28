export async function callGeminiAPI(prompt: string): Promise<string> {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GOOGLE_GEMINI_API_KEY environment variable is not set");
  }

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: prompt }
          ]
        }
      ]
    })
  });

  if (!response.ok) {
    const err = await response.text();
    console.error("Gemini API error:", err);
    throw new Error("Gemini API failed: " + response.status);
  }

  const data = await response.json();
  const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

  return generatedText;
}

// Example usage function
export const generateItinerary = async (promptText: string) => {
  const prompt = `Generate a 3-day travel itinerary for ${promptText} in JSON format only. Do not return anything else.`;

  try {
    const output = await callGeminiAPI(prompt);
    const parsed = JSON.parse(output); // if JSON response is guaranteed
    return parsed;
  } catch (err) {
    console.error("Failed to generate itinerary:", err);
    throw err;
  }
}; 