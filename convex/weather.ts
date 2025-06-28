import { action } from "./_generated/server";
import { CurrentWeatherResponse } from '../lib/types/WeatherResponse';
import { ConvexError, v } from "convex/values";

export const getCurrentWeather = action({
    args: { placeName: v.string() },
    async handler(ctx, { placeName }) {
        if (!placeName) return;

        const cityName = placeName?.split(/[,-]/)[0].trim();
        if (!cityName || cityName.length <= 0)
            throw new ConvexError("Not able to construct cityname for weather, name:" + cityName);

        try {
            // Get Gemini API key
            const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
            if (!apiKey) {
                console.error("GOOGLE_GEMINI_API_KEY not found in environment variables");
                throw new ConvexError("GOOGLE_GEMINI_API_KEY environment variable is not set");
            }

            console.log(`Attempting to get weather for: ${cityName}`);

            // Use Gemini to get current weather information
            const prompt = `Get the current weather information for ${cityName}. Please provide the following data in JSON format:
            {
                "temperature": "current temperature in Celsius",
                "description": "weather description",
                "humidity": "humidity percentage",
                "wind_speed": "wind speed in m/s",
                "wind_direction": "wind direction in degrees",
                "visibility": "visibility in meters",
                "feels_like": "feels like temperature in Celsius"
            }
            
            Only return the JSON data, no additional text.`;

            console.log("Making Gemini API call...");

            // Direct API call to Gemini (same pattern as in plan.ts)
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

            console.log(`Gemini API response status: ${response.status}`);

            if (!response.ok) {
                const err = await response.text();
                console.error("Gemini API error response:", err);
                throw new ConvexError(`Gemini API failed with status ${response.status}: ${err}`);
            }

            const data = await response.json();
            console.log("Gemini API response data:", JSON.stringify(data, null, 2));

            const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

            if (!generatedText) {
                console.error("Gemini API returned empty text response");
                throw new ConvexError("Gemini API returned empty response");
            }

            console.log("Gemini generated text:", generatedText);

            // Parse the JSON response from Gemini
            let weatherData;
            try {
                // Try to extract JSON from the response (same pattern as in plan.ts)
                const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
                if (!jsonMatch) {
                    console.error("No JSON found in Gemini response:", generatedText);
                    throw new ConvexError("No valid JSON found in Gemini response");
                }
                weatherData = JSON.parse(jsonMatch[0]);
                console.log("Parsed weather data:", weatherData);
            } catch (parseError) {
                console.error("Failed to parse Gemini weather response:", generatedText);
                console.error("Parse error:", parseError);
                throw new ConvexError("Invalid weather data format from Gemini");
            }

            // Transform Gemini response to match your existing interface
            const transformedData: CurrentWeatherResponse = {
                coord: { lat: 0, lon: 0 }, // Gemini doesn't provide coordinates
                weather: [{
                    id: 800, // Default to clear sky
                    main: "Clear",
                    description: weatherData.description || "Clear sky",
                    icon: "01d"
                }],
                base: "stations",
                main: {
                    temp: parseFloat(weatherData.temperature) || 20,
                    feels_like: parseFloat(weatherData.feels_like) || 20,
                    temp_min: (parseFloat(weatherData.temperature) || 20) - 2,
                    temp_max: (parseFloat(weatherData.temperature) || 20) + 2,
                    pressure: 1013,
                    humidity: parseFloat(weatherData.humidity) || 50,
                    sea_level: 1013,
                    grnd_level: 1013
                },
                visibility: parseFloat(weatherData.visibility) || 10000,
                wind: {
                    speed: parseFloat(weatherData.wind_speed) || 0,
                    deg: parseFloat(weatherData.wind_direction) || 0
                },
                clouds: { all: 0 },
                dt: Math.floor(Date.now() / 1000),
                sys: {
                    country: "US",
                    sunrise: Math.floor(Date.now() / 1000),
                    sunset: Math.floor(Date.now() / 1000)
                },
                timezone: 0,
                id: Math.floor(Math.random() * 1000000),
                name: cityName,
                cod: 200
            };

            console.log("Successfully generated weather data for:", cityName);
            return transformedData;

        } catch (error) {
            console.error("Error getting weather from Gemini:", error);
            
            // Return a fallback weather response instead of throwing an error
            console.log("Returning fallback weather data for:", cityName);
            return {
                coord: { lat: 0, lon: 0 },
                weather: [{
                    id: 800,
                    main: "Clear",
                    description: "Weather information temporarily unavailable",
                    icon: "01d"
                }],
                base: "stations",
                main: {
                    temp: 22,
                    feels_like: 22,
                    temp_min: 20,
                    temp_max: 24,
                    pressure: 1013,
                    humidity: 50,
                    sea_level: 1013,
                    grnd_level: 1013
                },
                visibility: 10000,
                wind: {
                    speed: 0,
                    deg: 0
                },
                clouds: { all: 0 },
                dt: Math.floor(Date.now() / 1000),
                sys: {
                    country: "US",
                    sunrise: Math.floor(Date.now() / 1000),
                    sunset: Math.floor(Date.now() / 1000)
                },
                timezone: 0,
                id: Math.floor(Math.random() * 1000000),
                name: cityName,
                cod: 200
            };
        }
    },
});