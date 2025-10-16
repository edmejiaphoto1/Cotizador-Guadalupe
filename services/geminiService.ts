
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const generateDescription = async (prompt: string, language: 'es' | 'en'): Promise<string> => {
  if (!API_KEY) {
    return "Error: API_KEY for Gemini is not configured.";
  }

  const languageInstruction = language === 'es' 
    ? "Escribe en español formal y profesional." 
    : "Write in professional, formal English.";

  const fullPrompt = `
    Based on the following key points for a construction/renovation proposal, write a compelling and professional project description. 
    The description should be well-structured, clear, and persuasive.
    ${languageInstruction}

    Key Points:
    ---
    ${prompt}
    ---
  `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: fullPrompt
    });
    return response.text;
  } catch (error) {
    console.error("Error generating description with Gemini:", error);
    return language === 'es' ? "Ocurrió un error al generar la descripción." : "An error occurred while generating the description.";
  }
};
