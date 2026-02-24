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
        throw new Error(error || "Failed to generate research.");
    }
};

export const refineResearch = async (rawContent, feedback = "") => {
    try {
    const systemInstruction = `
      You are a world-class Technical Editor and Anti-AI specialist.
      Your goal is to take raw research and make it sound human, authoritative, and concise.
      RULES:
      1. Eliminate common AI clichés: 'delve', 'unlock', 'tapestry', 'testament', 'vibrant'.
      2. Use active voice and short, punchy sentences.
      3. If user feedback is provided, prioritize those specific instructions above all else.
      4. Maintain the original facts; do not hallucinate new data.
      5. Output ONLY the refined Markdown content.
    `.trim();
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview', 
            systemInstruction: systemInstruction,
            contents: [
                {
                    role: 'user',
                    parts: [{text: `
              RAW CONTENT TO REFINE:
              ---
              ${rawContent}
              ---
              USER FEEDBACK: ${feedback || "None. Just standard cleanup."}
            `.trim()
                    }]
                }
            ],
            config: {
                temperature: 0.7,
            }
        });

        return response.text;
    } catch (error) {
        console.error("Refiner Agent Error:", error);
        throw new Error(error || "Failed to refine the content.");
    }
};

export const createPost = async (content, requirements = "") => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            systemInstruction: `
                You are a social media strategist. Your ONLY job is to convert research into ONE high-converting LinkedIn post.
                
                STRICT OUTPUT RULE: 
                - Output ONLY the Markdown text of the post. 
                - Zero preamble (no "Here is your post"). 
                - Zero post-amble (no "I hope this helps"). 
                - Do NOT provide multiple variations.
                
                STYLE:
                - Hook -> Punchy Body -> Question -> Call-to-Action.
                - Conversational tone, short sentences, no AI clichés.
            `.trim(),
            contents: [
                {
                    role: 'user',
                    parts: [{ text: `Transform this content into exactly ONE LinkedIn post: \n\n${content}\n\nREQUIREMENTS: ${requirements}` }]
                }
            ],
            generationConfig: {
                temperature: 0.3
            }
        });
        return response.text;
    } catch (error) {
        console.error("Post Creator Agent Error:", error);
        throw new Error(error || "Failed to create the post.");
    }
};