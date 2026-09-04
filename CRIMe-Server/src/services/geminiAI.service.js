import { GoogleGenAI } from "@google/genai";

let ai;
function getClient() {
    if (!ai) {
        ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }
    return ai;
}

class geminiAIService {

    static async callGemini(prompt) {

        const models = [
            process.env.GEMINI_MODEL || "gemini-flash-latest",
            "gemini-flash-lite-latest",
            "gemini-3.5-flash",
            "gemini-3.1-flash-lite"
        ];

        for (const model of models) {
            try {
                const response = await getClient().models.generateContent({
                    model,
                    contents: prompt
                });

                const text = response.text;
                if (!text) throw new Error("Empty response from model");
                return text;

            } catch (error) {
                console.log(`Failed with model ${model}:`, error?.message || error);
            }
        }

        throw new Error("All Gemini models failed");
    }
    static async generateCrimeAnalysis(description, crimeType, locationLabel = "") {

        try {

            const prompt = `
You are an AI assistant for a Crime Reporting System.

Analyze the crime report below.

Description:
${description}

Crime Type:
${crimeType}

Location:
${locationLabel}

Instructions:

1. Generate a concise professional summary.
2. Determine the severity level.
3. Severity MUST ONLY be one of:
   - LOW
   - MEDIUM
   - HIGH
   - CRITICAL

Return ONLY valid JSON.

{
    "summary":"",
    "severity":""
}

Do not return markdown.
Do not return explanations.
`;

            const result = await this.callGemini(prompt);

            const cleanedResult = result
                ?.replace(/```json/g, "")
                ?.replace(/```/g, "")
                ?.trim();

            const parsedResult = JSON.parse(cleanedResult);

            const validSeverity = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

            return {
                summary:
                    parsedResult.summary?.trim() ||
                    description.slice(0, 150),

                severity:
                    validSeverity.includes(
                        parsedResult.severity?.trim()?.toUpperCase()
                    )
                        ? parsedResult.severity.trim().toUpperCase()
                        : "MEDIUM"
            };

        } catch (error) {

            console.error(
                "Gemini AI Error:",
                error.response?.data || error.message
            );

            // FALLBACK RESPONSE
            return {
                summary:
                    description.length > 150
                        ? `${description.slice(0, 150)}...`
                        : description,

                severity: "MEDIUM"
            };
        }
    }
}

export default geminiAIService;