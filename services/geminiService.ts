import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
let ai: GoogleGenAI | null = null;

// Initialize AI client safely
try {
  if (apiKey) {
    ai = new GoogleGenAI({ apiKey });
  }
} catch (error) {
  console.error("Failed to initialize Gemini client", error);
}

export const getAiCommentary = async (score: number): Promise<string> => {
  if (!ai) {
    return "Gemini API Key is missing. I can't judge your skills properly!";
  }

  try {
    const prompt = `
      I just played Flappy Bird and scored ${score}. 
      You are a sarcastic, witty, slightly mean but funny game coach.
      
      If the score is low (0-5): Roast me hard for being terrible.
      If the score is medium (6-20): Give a backhanded compliment.
      If the score is high (21+): Act surprised but attribute it to luck or say I have no life.
      
      Keep the response short (max 1 sentence).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 1.2, // High creativity for humor
        maxOutputTokens: 60,
      }
    });

    return response.text || "Speechless...";
  } catch (error) {
    console.error("Error fetching AI commentary:", error);
    return "I'm currently offline, but assume I'm unimpressed.";
  }
};