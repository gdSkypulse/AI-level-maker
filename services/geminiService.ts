import { GoogleGenAI, Type, Schema } from "@google/genai";
import { SegmentType, LevelSegment, Difficulty } from '../types';

export const generateLevelDesign = async (difficulty: Difficulty, theme: string): Promise<LevelSegment[]> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }

  const ai = new GoogleGenAI({ apiKey });

  // Define the schema for strict JSON output
  const schema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        type: {
          type: Type.STRING,
          enum: Object.values(SegmentType),
          description: "The type of gameplay segment."
        },
        count: {
          type: Type.INTEGER,
          description: "Repetition count or specific intensity param."
        },
        yOffset: {
          type: Type.INTEGER,
          description: "Vertical offset for platforms (0-5)."
        }
      },
      required: ["type"]
    }
  };

  const prompt = `
    You are a professional Geometry Dash level creator.
    Create a level design with a duration of roughly 20 seconds.
    The level should have a coherent flow and rhythm.
    
    Difficulty: ${difficulty}
    Theme/Style description: ${theme}
    
    Rules:
    1. A 20-second level needs about 15-25 segments.
    2. Ensure the level is playable. Do not put impossible triple spikes if difficulty is Easy.
    3. Use 'REST_AREA' for pacing breaks.
    4. Use 'SHIP_GATE' or 'SHIP_STRAIGHT' to add variety, but keep them short.
    5. 'STAIRS_UP' and 'STAIRS_DOWN' create vertical movement.
    
    Return ONLY the JSON array of segments.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema,
        temperature: 0.7, // Some creativity
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const segments = JSON.parse(text) as LevelSegment[];
    return segments;

  } catch (error) {
    console.error("Gemini Generation Error:", error);
    // Fallback simple level if AI fails
    return [
      { type: SegmentType.START_PAD },
      { type: SegmentType.BASIC_SPIKE },
      { type: SegmentType.BASIC_SPIKE },
      { type: SegmentType.PLATFORM_JUMP, yOffset: 1 },
      { type: SegmentType.STAIRS_UP },
      { type: SegmentType.REST_AREA },
      { type: SegmentType.SHIP_GATE },
      { type: SegmentType.REST_AREA },
    ];
  }
};
