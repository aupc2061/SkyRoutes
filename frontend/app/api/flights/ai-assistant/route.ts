import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

// Read system prompt
const systemPrompt = fs.readFileSync(
  path.join(process.cwd(), 'src', 'aiprompt.txt'),
  'utf-8'
);

export async function POST(request: Request) {
  try {
    const { query } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-preview-05-20",
      generationConfig: {
        temperature: 0.3,
      },
      systemInstruction: systemPrompt
    });

    const result = await model.generateContent(query);
    const text = result.response.text();

    return NextResponse.json({ response: text });
  } catch (error: any) {
    console.error("AI Assistant error:", error.message);
    return NextResponse.json(
      {
        error: "Failed to process query with AI assistant",
        details: error.message
      },
      { status: 500 }
    );
  }
}