import {
  batch1Schema,
  batch2Schema,
  batch3Schema
} from "../../lib/schemas";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Function to get Gemini API key - avoids top-level process.env access
function getGeminiAPIKey() {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_GEMINI_API_KEY environment variable is not set");
  }
  return apiKey;
}

const promptSuffix = `generate travel data according to the schema and in json format,
do not return anything in your response outside of curly braces,
generate response as per the function schema provided. Dates given,
activity preference and travelling with may influence like 50% while generating plan.`;

const callGeminiAPI = async (prompt: string, schema: any, description: string) => {
  if (!prompt || prompt.trim().length === 0) {
    console.error("Empty prompt provided to Gemini API");
    throw new Error("Empty prompt provided to Gemini API");
  }

  console.log("Calling Gemini API with prompt:", prompt.substring(0, 100) + "...");

  try {
    const apiKey = getGeminiAPIKey();
    
    // Create a structured prompt for Gemini
    const structuredPrompt = `You are a helpful travel assistant.

${description}

Please generate a response in the following JSON schema:
${JSON.stringify(schema, null, 2)}

User request: ${prompt}

Please respond with ONLY the JSON object, no additional text or explanations.`;

    // Direct API call to the working endpoint
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: structuredPrompt }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Gemini API error:", err);
      throw new Error(`Gemini API failed: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!generatedText) {
      console.error("Gemini API returned empty response");
      throw new Error("Gemini API returned empty response");
    }

    console.log("Successfully received completion from Gemini API");

    // Try to extract JSON from the response
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON found in Gemini response:", generatedText);
      throw new Error("No valid JSON found in Gemini response");
    }

    // Parse the JSON response
    const parsedResponse = JSON.parse(jsonMatch[0]);
    
    // Create a mock OpenAI-like response structure for compatibility
    return {
      choices: [{
        message: {
          function_call: {
            arguments: JSON.stringify(parsedResponse)
          }
        }
      }]
    };

  } catch (error: any) {
    console.error("Gemini API call failed:", {
      error: error.message,
      type: error.type,
      status: error.status
    });

    // Handle specific Gemini API errors
    if (error.message.includes('API_KEY_INVALID') || error.message.includes('403')) {
      throw new Error("Invalid Gemini API key");
    } else if (error.message.includes('QUOTA_EXCEEDED') || error.message.includes('429')) {
      throw new Error("Gemini API quota exceeded. Please try again later.");
    } else if (error.message.includes('timeout')) {
      throw new Error("Gemini API request timed out. Please try again.");
    } else if (error.message.includes('404') || error.message.includes('not found')) {
      throw new Error("Gemini model not found. Please check your API key has access to Gemini API.");
    }

    throw new Error(`Gemini API call failed: ${error.message}`);
  }
};

export const generatebatch1 = (promptText: string) => {
  const prompt = `${promptText}, ${promptSuffix}`;
  const description = `Generate a description of information about a place or location according to the following schema:

- About the Place:
  - A string containing information about the place, comprising at least 50 words.

- Best Time to Visit:
  - A string specifying the best time to visit the place.

Ensure that the function response adheres to the schema provided and is in JSON format. The response should not contain anything outside of the defined schema.`;

  return callGeminiAPI(prompt, batch1Schema, description);
};

type GeminiInputType = {
  userPrompt: string;
  activityPreferences?: string[] | undefined;
  fromDate?: number | undefined;
  toDate?: number | undefined;
  companion?: string | undefined;
};

export const generatebatch2 = (inputParams: GeminiInputType) => {
  const description = `Generate a description of recommendations for an adventurous trip according to the following schema:

- Top Adventures Activities:
  - An array listing top adventure activities to do, including at least 5 activities.
  - Each activity should be specified along with its location.

- Local Cuisine Recommendations:
  - An array providing recommendations for local cuisine to try during the trip.

- Packing Checklist:
  - An array containing items that should be included in the packing checklist for the trip.

Ensure that the function response adheres to the schema provided and is in JSON format. The response should not contain anything outside of the defined schema.`;

  return callGeminiAPI(getPrompt(inputParams), batch2Schema, description);
};

export const generatebatch3 = (inputParams: GeminiInputType) => {
  const description = `Generate a description of a travel itinerary and top places to visit according to the following schema:

- Itinerary:
  - An array containing details of the itinerary for the specified number of days.
  - Each day's itinerary includes a title and activities for morning, afternoon, and evening.
  - Activities are described as follows:
    - Morning, Afternoon, Evening:
      - Each includes an array of itinerary items, where each item has a description and a brief description.

- Top Places to Visit:
  - An array listing the top places to visit along with their coordinates.
  - Each place includes a name and coordinates (latitude and longitude).

Ensure that the function response adheres to the schema provided and is in JSON format. The response should not contain anything outside of the defined schema.`;

  return callGeminiAPI(getPrompt(inputParams), batch3Schema, description);
};

const getPrompt = ({ userPrompt, activityPreferences, companion, fromDate, toDate }: GeminiInputType) => {
  let prompt = `${userPrompt}, from date-${fromDate} to date-${toDate}`;

  if (companion && companion.length > 0) {
    prompt += `, travelling with-${companion}`;
  }

  if (activityPreferences && activityPreferences.length > 0) {
    prompt += `, activity preferences-${activityPreferences.join(",")}`;
  }

  prompt += `, ${promptSuffix}`;
  return prompt;
}; 