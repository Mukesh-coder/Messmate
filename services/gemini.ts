
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getMenuInsights(lunch: string[], dinner: string[]) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        Analyze this daily mess menu and provide a very brief "Chef's Health Insight" (max 30 words).
        Lunch: ${lunch.join(', ')}
        Dinner: ${dinner.join(', ')}
      `,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Balanced meal planned for today. Enjoy!";
  }
}
