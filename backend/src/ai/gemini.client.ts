// Gemini Vision AI client — production-grade crop disease detection
import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/env.js';

const SYSTEM_PROMPT = `You are an expert plant pathologist and agricultural disease diagnostic AI with deep knowledge of Indian crop diseases.

CRITICAL INSTRUCTIONS:
1. Analyze the image systematically: identify the crop type first, then examine symptoms carefully
2. Look for specific visual markers: lesion shape, color, distribution, insects, spores/pustules/mold
3. You MUST return ONLY valid JSON — no markdown, no explanation, no extra text
4. Be generous with confidence — if you can identify the crop and see clear disease symptoms, set confidence >= 0.75

VISUAL DIAGNOSTIC GUIDE (map to these exact codes):
- cotton_leaf_curl: Upward leaf curling, vein thickening, dark green leaves, stunted growth, whitefly present
- cotton_bollworm: Pink/brown caterpillar inside boll, entry holes, frass/excrement near entry points  
- cotton_pink_bollworm: Pink larvae inside cotton boll, seed damage, webbing inside boll
- cotton_fusarium_wilt: Lower leaf yellowing, brown vascular tissue when stem cut
- cotton_aphid: Tiny insect colonies on leaf underside, downward curl, sticky honeydew deposits
- tomato_early_blight: Concentric ring (target-board) brown spots on older lower leaves, yellow halo
- tomato_late_blight: Large dark water-soaked lesions, white cottony mold on leaf undersides
- tomato_bacterial_wilt: Sudden complete wilting with no yellowing, bacterial ooze
- tomato_yellow_leaf_curl: Upward inward curling, interveinal yellowing, stunted
- tomato_leaf_miner: Serpentine white/brown mines/trails on leaf surface
- wheat_rust: Orange-red pustules (stem rust) or yellow stripes (yellow rust) on leaves/stems
- wheat_yellow_rust: Yellow-orange stripe pustules along leaf veins
- wheat_powdery_mildew: White powdery coating on leaf surface
- wheat_blast: Bleached spike, dark lesion at spike base, empty grains
- rice_blast: Diamond-shaped gray-centered lesions on leaves, neck rot

RESPONSE FORMAT (strict JSON only, no other text):
{
  "disease_code": "use_exact_code_from_guide_or_unknown",
  "confidence": 0.0,
  "crop_identified": "cotton|tomato|wheat|rice|other|unclear",
  "symptoms_observed": ["symptom1", "symptom2"],
  "reasoning": "brief explanation"
}

If the image is clearly a crop with visible disease symptoms, confidence should be 0.7-0.95.
Only use "unknown" if the image is not a crop, is too blurry, or shows no disease symptoms at all.`;

const VALID_CODES = new Set([
  'cotton_leaf_curl', 'cotton_bollworm', 'cotton_pink_bollworm',
  'cotton_fusarium_wilt', 'cotton_aphid',
  'tomato_early_blight', 'tomato_late_blight', 'tomato_bacterial_wilt',
  'tomato_yellow_leaf_curl', 'tomato_leaf_miner',
  'wheat_rust', 'wheat_yellow_rust', 'wheat_powdery_mildew', 'wheat_blast',
  'rice_blast', 'unknown',
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
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: { temperature: 0.1, topP: 0.85, maxOutputTokens: 512 },
  });

  const imagePart = { inlineData: { data: imageBuffer.toString('base64'), mimeType } };

  try {
    const result = await model.generateContent([SYSTEM_PROMPT, imagePart]);
    const text = result.response.text().trim();
    // Strip any markdown wrapper Gemini adds
    const cleaned = text
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim();
    // Extract just the JSON object
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in Gemini response');
    const parsed = JSON.parse(jsonMatch[0]) as {
      disease_code: string; confidence: number;
      crop_identified: string; symptoms_observed: string[]; reasoning: string;
    };

    const disease_code = VALID_CODES.has(parsed.disease_code) ? parsed.disease_code : 'unknown';
    const confidence_score = typeof parsed.confidence === 'number'
      ? Math.max(0, Math.min(1, parsed.confidence)) : 0.0;
    const finalConfidence = disease_code === 'unknown' ? Math.min(confidence_score, 0.45) : confidence_score;

    return { disease_code, confidence_score: finalConfidence, raw_response: parsed };
  } catch (err) {
    console.error('[Gemini] Analysis error:', String(err));
    return { disease_code: 'unknown', confidence_score: 0.0, raw_response: { error: String(err) } };
  }
}

// Mock — cycles through diseases for demo/testing when no valid Gemini key
const MOCK_DISEASES = [
  { disease_code: 'cotton_pink_bollworm', confidence_score: 0.89 },
  { disease_code: 'cotton_bollworm', confidence_score: 0.85 },
  { disease_code: 'tomato_early_blight', confidence_score: 0.82 },
  { disease_code: 'wheat_rust', confidence_score: 0.78 },
  { disease_code: 'cotton_leaf_curl', confidence_score: 0.91 },
];
let mockIndex = 0;

export async function analyzeImageMock(): Promise<GeminiDiagnosisResult> {
  const mock = MOCK_DISEASES[mockIndex % MOCK_DISEASES.length];
  mockIndex++;
  return {
    disease_code: mock.disease_code,
    confidence_score: mock.confidence_score,
    raw_response: { mock: true, disease_code: mock.disease_code, confidence: mock.confidence_score },
  };
}
