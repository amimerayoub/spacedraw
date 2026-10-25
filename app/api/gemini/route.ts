import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured' }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });
    const { action, difficulty, theme } = await req.json();

    if (action === 'generate_words') {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Generate 5 creative, drawing-game words suitable for drawing and guessing. Difficulty: ${difficulty || 'medium'}, Theme: ${theme || 'space'}. Return ONLY a JSON array of 5 plain lower-case word strings (1-2 words max each), e.g. ["astronaut", "space station", "meteor", "alien ship", "black hole"].`,
      });

      const text = response.text || '[]';
      const cleanJson = text.replace(/```json|```/g, '').trim();
      const words = JSON.parse(cleanJson);

      return NextResponse.json({ words });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Gemini API Error:', error);
    return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 });
  }
}
