// Gemini Vision AI client — production-grade crop disease detection
// architecture/07_Architecture.md §2.3
import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/env.js';

const SYSTEM_PROMPT = `You are an expert plant pathologist and agricultural disease diagnostic AI with deep knowledge of Indian crop diseases. You have been trained on thousands of disease images and have expert-level knowledge of visual disease symptoms across cotton, tomato, wheat, and rice crops.

CRITICAL INSTRUCTIONS:
1. Analyze the image systematically: first identify the crop type, then examine leaf/stem/fruit symptoms carefully
2. Look for specific visual markers: lesion shape, color patterns, distribution on the plant, presence of spores/pustules/mold
3. Consider the disease progression stage visible in the image
4. You MUST return ONLY valid JSON — no markdown, no explanation, no extra text

VISUAL DIAGNOSTIC GUIDE:
- cotton_leaf_curl: Upward leaf curling + vein thickening + dark green + stunting. Transmitted by whitefly.
- cotton_bollworm: Holes in bolls/fruits, caterpillar frass, entry holes with brown staining
- cotton_fusarium_wilt: Yellowing starting from lower leaves, brown vascular tissue inside stem
- cotton_aphid: Dense colonies of tiny insects, downward leaf curl, sticky honeydew, sooty mold
- tomato_early_blight: Concentric ring spots (target board pattern) on lower/older leaves, yellow halo
- tomato_late_blight: Large irregular dark/brown water-soaked lesions, white cottony mold undersides
- tomato_bacterial_wilt: Complete sudden wilting, no yellowing initially, bacterial ooze in water test
- tomato_yellow_leaf_curl: Upward + inward curling, interveinal yellowing, stunted growth
- tomato_leaf_miner: Serpentine white/brown trails (mines) on leaf surface from larvae tunneling
- wheat_rust: Orange-red (stem rust) or yellow-stripe (yellow rust) pustules on leaves/stems
- wheat_yellow_rust: Yellow stripes of pustules along leaf veins, cool weather crop
- wheat_powdery_mildew: White powdery coating on leaf surface, easily rubbed off
- wheat_blast: Bleached/white spike with partial grain fill, dark lesion at base of spike
- rice_blast: Diamond-shaped lesions gray center brown border on leaves, neck rot at panicle base

RESPONSE FORMAT (JSON only):
{
  "disease_code": "exact_code_from_list_or_unknown",
  "confidence": 0.0-1.0,
  "crop_identified": "cotton|tomato|wheat|rice|other|unclear",
  "symptoms_observed": ["list", "of", "visual", "symptoms", "you", "see"],
  "reasoning": "detailed explanation of diagnosis"
}`;

const VALID_CODES = new Set([
  'cotton_leaf_curl','cotton_bollworm','cotton_fusarium_wilt','cotton_aphid',
  'tomato_early_blight','tomato_late_blight','tomato_bacterial_wilt',
  'tomato_yellow_leaf_curl','tomato_leaf_miner',
  'wheat_rust','wheat_yellow_rust','wheat_powdery_mildew','wheat_blast',
  'rice_blast','unknown'
]);

export interface GeminiDiagnosisResult {
  disease_code: string;
  confidence_score: number;
  raw_response: unknown;
}

export async function analyzeImage(
  imageBuffer: Buffer,
  mimeType: 'image/jpeg' | 'image/png'
): Promise<GeminiDiagnosisResult> {
  const genAI = new GoogleGenerativeAI(config.geminiApiKey);
  // Use gemini-2.0-flash for better accuracy and speed
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: { temperature: 0.1, topP: 0.8, maxOutputTokens: 512 }
  });

  const imagePart = { inlineData: { data: imageBuffer.toString('base64'), mimeType } };

  try {
    const result = await model.generateContent([SYSTEM_PROMPT, imagePart]);
    const text = result.response.text().trim();
    const cleaned = text.replace(/```json\n?|\n?```/g, '').replace(/^[^{]*/, '').replace(/[^}]*$/, '');
    const parsed = JSON.parse(cleaned) as {
      disease_code: string; confidence: number; crop_identified: string; symptoms_observed: string[]; reasoning: string;
    };

    // Validate disease_code against known taxonomy
    const disease_code = VALID_CODES.has(parsed.disease_code) ? parsed.disease_code : 'unknown';
    const confidence_score = typeof parsed.confidence === 'number'
      ? Math.max(0, Math.min(1, parsed.confidence))
      : 0.0;

    // If code is unknown but confidence was high, lower it
    const finalConfidence = disease_code === 'unknown' ? Math.min(confidence_score, 0.45) : confidence_score;

    return { disease_code, confidence_score: finalConfidence, raw_response: parsed };
  } catch (err) {
    console.error('[Gemini] Analysis error:', err);
    return { disease_code: 'unknown', confidence_score: 0.0, raw_response: { error: String(err) } };
  }
}

// Mock for development when no valid Gemini API key is configured
export async function analyzeImageMock(): Promise<GeminiDiagnosisResult> {
  return {
    disease_code: 'cotton_leaf_curl',
    confidence_score: 0.87,
    raw_response: { mock: true, note: 'Replace GEMINI_API_KEY in .env with a valid AIzaSy... key from aistudio.google.com' },
  };
}
