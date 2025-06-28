import {
  batch1Schema,
  batch2Schema,
  batch3Schema
} from "../../lib/schemas";

const HF_API_URL = "https://api-inference.huggingface.co/models/tiiuae/falcon-7b-instruct";

// Function to get Hugging Face API key - avoids top-level process.env access
function getHFAPIKey() {
  const apiKey = process.env.HF_API_KEY;
  if (!apiKey) {
    throw new Error("HF_API_KEY environment variable is not set");
  }
  return apiKey;
}

const promptSuffix = `generate travel data according to the schema and in json format,
do not return anything in your response outside of curly braces,
generate response as per the function schema provided. Dates given,
activity preference and travelling with may influence like 50% while generating plan.`;

const callHuggingFaceAPI = async (prompt: string, schema: any, description: string) => {
  if (!prompt || prompt.trim().length === 0) {
    console.error("Empty prompt provided to Hugging Face API");
    throw new Error("Empty prompt provided to Hugging Face API");
  }

  console.log("Calling Hugging Face API with prompt:", prompt.substring(0, 100) + "...");

  try {
    const apiKey = getHFAPIKey();
    
    // Instruction-style prompt for flan-t5-base
    const structuredPrompt = `You are a helpful travel assistant.\n\n${description}\n\nUser request: ${prompt}\n\nRespond ONLY in valid JSON.`;

    const response = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: structuredPrompt,
        parameters: {
          max_new_tokens: 1000,
          temperature: 0.7,
          do_sample: true
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Hugging Face API request failed:", {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`Hugging Face API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.error) {
      console.error("Hugging Face API returned error:", data.error);
      throw new Error(`Hugging Face API error: ${data.error}`);
    }

    if (!data || !Array.isArray(data) || !data[0]?.generated_text) {
      console.error("Hugging Face API returned invalid response:", data);
      throw new Error("Hugging Face API returned invalid response");
    }

    const generatedText = data[0].generated_text;
    console.log("Successfully received completion from Hugging Face API");

    // Try to extract JSON from the response
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON found in Hugging Face response:", generatedText);
      throw new Error("No valid JSON found in Hugging Face response");
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
    console.error("Hugging Face API call failed:", {
      error: error.message,
      type: error.type,
      status: error.status
    });

    // Handle specific Hugging Face API errors
    if (error.message.includes('401')) {
      throw new Error("Invalid Hugging Face API key");
    } else if (error.message.includes('429')) {
      throw new Error("Hugging Face API rate limit exceeded. Please try again in a few minutes.");
    } else if (error.message.includes('timeout')) {
      throw new Error("Hugging Face API request timed out. Please try again.");
    }

    throw new Error(`Hugging Face API call failed: ${error.message}`);
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

  return callHuggingFaceAPI(prompt, batch1Schema, description);
};

type HuggingFaceInputType = {
  userPrompt: string;
  activityPreferences?: string[] | undefined;
  fromDate?: number | undefined;
  toDate?: number | undefined;
  companion?: string | undefined;
};

export const generatebatch2 = (inputParams: HuggingFaceInputType) => {
  const description = `Generate a description of recommendations for an adventurous trip according to the following schema:

- Top Adventures Activities:
  - An array listing top adventure activities to do, including at least 5 activities.
  - Each activity should be specified along with its location.

- Local Cuisine Recommendations:
  - An array providing recommendations for local cuisine to try during the trip.

- Packing Checklist:
  - An array containing items that should be included in the packing checklist for the trip.

Ensure that the function response adheres to the schema provided and is in JSON format. The response should not contain anything outside of the defined schema.`;

  return callHuggingFaceAPI(getPrompt(inputParams), batch2Schema, description);
};

export const generatebatch3 = (inputParams: HuggingFaceInputType) => {
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

  return callHuggingFaceAPI(getPrompt(inputParams), batch3Schema, description);
};

const getPrompt = ({ userPrompt, activityPreferences, companion, fromDate, toDate }: HuggingFaceInputType) => {
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