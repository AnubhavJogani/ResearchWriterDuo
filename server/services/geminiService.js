import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const generateResearch = async (topic) => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [{ role: 'user', parts: [{ text: `Conduct deep research on: ${topic}` }] }],
        });

        return response.text;
    } catch (error) {
        console.error("Gemini Error:", error);
        return "Error generating research.";
    }
};