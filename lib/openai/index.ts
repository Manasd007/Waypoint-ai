import {
  batch1Schema,
  batch2Schema,
  batch3Schema
} from "./schemas";

import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY;
const openai = apiKey ? new OpenAI({ apiKey }) : null;

const promptSuffix = `generate travel data according to the schema and in json format,
do not return anything in your response outside of curly braces,
generate response as per the function schema provided. Dates given,
activity preference and travelling with may influence like 50% while generating plan.`;

const callOpenAIApi = async (prompt: string, schema: any, description: string) => {
  if (!openai) {
    console.error("OpenAI API key not configured");
    throw new Error("OpenAI API key not configured");
  }

  if (!prompt || prompt.trim().length === 0) {
    console.error("Empty prompt provided to OpenAI API");
    throw new Error("Empty prompt provided to OpenAI API");
  }

  console.log("Calling OpenAI API with prompt:", prompt.substring(0, 100) + "...");

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a helpful travel assistant." },
        { role: "user", content: prompt },
      ],
      functions: [{ name: "set_travel_details", parameters: schema, description }],
      function_call: { name: "set_travel_details" },
      temperature: 0.7, // Add some creativity while keeping it focused
      max_tokens: 2000, // Limit response size
    });

    if (!completion?.choices?.[0]?.message?.function_call?.arguments) {
      console.error("OpenAI API returned empty completion");
      throw new Error("OpenAI API returned empty completion");
    }

    console.log("Successfully received completion from OpenAI API");
    return completion;
  } catch (error: any) {
    console.error("OpenAI API call failed:", {
      error: error.message,
      code: error.code,
      type: error.type,
      status: error.status
    });

    // Handle specific OpenAI API errors
    if (error.code === 'invalid_api_key') {
      throw new Error("Invalid OpenAI API key");
    } else if (error.code === 'rate_limit_exceeded') {
      throw new Error("OpenAI API rate limit exceeded. Please try again in a few minutes.");
    } else if (error.code === 'context_length_exceeded') {
      throw new Error("Prompt too long for OpenAI API. Please try a shorter prompt.");
    } else if (error.code === 'timeout') {
      throw new Error("OpenAI API request timed out. Please try again.");
    }

    throw new Error(`OpenAI API call failed: ${error.message}`);
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

  return callOpenAIApi(prompt, batch1Schema, description);
};

type OpenAIInputType = {
  userPrompt: string;
  activityPreferences?: string[] | undefined;
  fromDate?: number | undefined;
  toDate?: number | undefined;
  companion?: string | undefined;
};

export const generatebatch2 = (inputParams: OpenAIInputType) => {
  const description = `Generate a description of recommendations for an adventurous trip according to the following schema:

- Top Adventures Activities:
  - An array listing top adventure activities to do, including at least 5 activities.
  - Each activity should be specified along with its location.

- Local Cuisine Recommendations:
  - An array providing recommendations for local cuisine to try during the trip.

- Packing Checklist:
  - An array containing items that should be included in the packing checklist for the trip.

Ensure that the function response adheres to the schema provided and is in JSON format. The response should not contain anything outside of the defined schema.`;

  return callOpenAIApi(getPrompt(inputParams), batch2Schema, description);
};

export const generatebatch3 = (inputParams: OpenAIInputType) => {
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

  return callOpenAIApi(getPrompt(inputParams), batch3Schema, description);
};

const getPrompt = ({ userPrompt, activityPreferences, companion, fromDate, toDate }: OpenAIInputType) => {
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
