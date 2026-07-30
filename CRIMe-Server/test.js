// testFlash.js
import "./src/config/env.js";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function run() {
    const models = ["gemini-flash-latest", "gemini-flash-lite-latest", "gemini-2.5-flash"];

    for (const model of models) {
        try {
            const res = await ai.models.generateContent({
                model,
                contents: "Reply with just the word: OK"
            });
            console.log(`✅ ${model} →`, res.text);
        } catch (err) {
            console.log(`❌ ${model} →`, err.message);
        }
    }
}

run();