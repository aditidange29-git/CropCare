// Gemini Vision AI client — isolated per architecture/07_Architecture.md §2.3.
//
// The mobile app NEVER calls Gemini directly; all Vision API calls go through here.
// This module is the only place that knows about @google/generative-ai.
//
// Prompt engineering forces structured JSON output constrained to the
// disease_library.disease_code taxonomy (05_Database.md §2.4).
// Raw Gemini output is always returned so callers can store it for auditing.

import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/env.js';

const PROMPT_TEMPLATE = `You are an expert agricultural plant disease diagnostic AI.

Analyze this crop image and identify any disease present.

You MUST respond with ONLY valid JSON in this exact format:
{
  "disease_code": "string",  // use snake_case, e.g. "cotton_leaf_curl", "tomato_early_blight"
  "confidence": number,      // 0.0 to 1.0
  "reasoning": "string"      // brief explanation of what you see
}

If you cannot identify a specific disease or the image is unclear, set confidence below 0.6 and use "unknown" as the disease_code.

Known disease codes you should map to when applicable:
cotton_leaf_curl, tomato_early_blight, tomato_late_blight, wheat_rust, wheat_blast,
rice_blast, cotton_bollworm, tomato_leaf_miner, wheat_powdery_mildew, rice_sheath_blight,
cotton_fusarium_wilt, tomato_bacterial_wilt, wheat_yellow_rust, rice_brown_spot, cotton_aphid

Respond with ONLY the JSON object, no markdown, no explanation.`;

export interface GeminiDiagnosisResult {
  disease_code: string;
  confidence_score: number;
  raw_response: unknown;
}

/**
 * Send an image buffer to Gemini Vision and return a structured diagnosis.
 * Parses the JSON response and normalises it into GeminiDiagnosisResult.
 * Falls back to { disease_code: 'unknown', confidence_score: 0.0 } on any
 * parse failure so callers always get a well-typed result.
 */
export async function analyzeImage(
  imageBuffer: Buffer,
  mimeType: 'image/jpeg' | 'image/png'
): Promise<GeminiDiagnosisResult> {
  const genAI = new GoogleGenerativeAI(config.geminiApiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const imagePart = {
    inlineData: {
      data: imageBuffer.toString('base64'),
      mimeType,
    },
  };

  const result = await model.generateContent([PROMPT_TEMPLATE, imagePart]);
  const text = result.response.text().trim();

  // Parse JSON response — strip markdown code fences if Gemini added them
  let parsed: { disease_code: string; confidence: number; reasoning: string };
  try {
    const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
    parsed = JSON.parse(cleaned);
  } catch {
    // Gemini returned non-JSON — treat as low confidence unknown
    return {
      disease_code: 'unknown',
      confidence_score: 0.0,
      raw_response: { raw_text: text },
    };
  }

  return {
    disease_code: parsed.disease_code ?? 'unknown',
    confidence_score: typeof parsed.confidence === 'number' ? parsed.confidence : 0.0,
    raw_response: parsed,
  };
}

/**
 * Mock fallback for local development / CI when a real Gemini API key is not set.
 * Called by diagnoses.service.ts when the key starts with 'PASTE' or 'AQ.' —
 * those are placeholder values commonly seen in .env.example files.
 */
export async function analyzeImageMock(): Promise<GeminiDiagnosisResult> {
  return {
    disease_code: 'cotton_leaf_curl',
    confidence_score: 0.87,
    raw_response: { mock: true, disease_code: 'cotton_leaf_curl', confidence: 0.87 },
  };
}
