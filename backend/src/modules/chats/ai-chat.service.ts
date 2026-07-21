// AI Chat Service — handles agricultural Q&A via Gemini text API
// Used by: Home "Ask AI" and Diagnosis "Consult AI" features
import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../../config/env.js';
import { supabase } from '../../config/supabase.js';

const FARM_ADVISOR_PROMPT = `You are CropCare AI, an expert agricultural advisor for Indian farmers. You have deep knowledge of:
- Crop diseases, symptoms, prevention, and treatment
- Fertilizers, pesticides, herbicides, and their safe usage
- Organic farming methods
- Irrigation techniques
- Soil health and nutrients
- Seasonal farming advice for Indian conditions (Kharif, Rabi, Zaid seasons)
- Crops: cotton, tomato, wheat, rice, and other major Indian crops

RULES:
1. Give practical, actionable advice suited for small and medium farmers in India
2. Always mention safety precautions when discussing chemicals/pesticides
3. Recommend both organic and chemical options where relevant
4. If asked about a specific disease, give specific product names available in Indian markets
5. Keep responses concise but complete — use bullet points for lists
6. If the question is not agriculture-related, politely redirect to agricultural topics
7. Respond in the same language the user writes in (Hindi/Marathi/English)`;

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export class AiChatService {
  async chat(
    userMessage: string,
    history: ChatMessage[] = [],
    diagnosisContext?: {
      disease_name: string;
      disease_code: string;
      treatment_organic: string[];
      treatment_chemical: string[];
    }
  ): Promise<string> {
    // Build system context
    let systemContext = FARM_ADVISOR_PROMPT;
    if (diagnosisContext) {
      systemContext += `\n\nCURRENT DIAGNOSIS CONTEXT:
Disease detected: ${diagnosisContext.disease_name} (code: ${diagnosisContext.disease_code})
Current organic treatments: ${diagnosisContext.treatment_organic.join(', ')}
Current chemical treatments: ${diagnosisContext.treatment_chemical.join(', ')}
The farmer is asking follow-up questions about this specific diagnosis. Keep your answers relevant to this disease.`;
    }

    const genAI = new GoogleGenerativeAI(config.geminiApiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
      systemInstruction: systemContext,
    });

    // Build chat history for Gemini
    const geminiHistory = history.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({ history: geminiHistory });
    const result = await chat.sendMessage(userMessage);
    return result.response.text();
  }

  async chatMock(userMessage: string, diagnosisContext?: { disease_name: string }): Promise<string> {
    return this.chatSmartMock(userMessage, diagnosisContext);
  }

  async chatSmartMock(userMessage: string, diagnosisContext?: { disease_name: string }): Promise<string> {
    const msg = userMessage.toLowerCase();
    const disease = diagnosisContext?.disease_name ?? '';

    // Disease-specific context responses
    if (diagnosisContext && disease) {
      if (msg.includes('symptom') || msg.includes('signs') || msg.includes('लक्षण') || msg.includes('लक्षणे')) {
        return `**${disease} — Symptoms**\n\n- Visible discoloration or lesions on leaves/stems\n- Wilting or stunted growth\n- Abnormal spots, pustules, or powdery coating\n- In pest diseases: insect presence, entry holes, or frass\n\nFor detailed symptoms specific to your field, consult your local Krishi Vigyan Kendra (KVK).`;
      }
      if (msg.includes('fertilizer') || msg.includes('खाद') || msg.includes('खते') || msg.includes('nutrient')) {
        return `**Fertilizer advice for crops affected by ${disease}:**\n\n- Avoid excess nitrogen which promotes lush growth attractive to pests\n- Apply balanced NPK as per soil test results\n- Potassium strengthens cell walls and improves disease resistance\n- Use micronutrients (Zinc, Boron) as per crop requirement\n- Organic compost improves overall plant immunity\n\nRecommended: Get a soil test from your nearest agriculture office before fertilizer application.`;
      }
      if (msg.includes('pesticide') || msg.includes('spray') || msg.includes('कीटनाशक') || msg.includes('कीटकनाशक') || msg.includes('chemical')) {
        return `**Chemical treatment for ${disease}:**\n\n- Always read label instructions before use\n- Spray in early morning or evening to reduce evaporation\n- Wear protective gear (gloves, mask, glasses)\n- Do not spray near water bodies or on windy days\n- Rotate chemicals to prevent resistance buildup\n- Maintain pre-harvest interval (PHI) strictly\n\nConsult the product card from your nearest dealer for correct dosage.`;
      }
      if (msg.includes('irrigation') || msg.includes('water') || msg.includes('सिंचन') || msg.includes('पानी')) {
        return `**Irrigation advice when ${disease} is detected:**\n\n- Avoid overhead irrigation — use drip or furrow irrigation\n- Water in the morning so foliage dries before evening\n- Reduce irrigation frequency to avoid waterlogging\n- Good drainage is critical to prevent fungal spread\n- Maintain adequate soil moisture — neither too dry nor too wet`;
      }
      return `**KisanMitra advice on ${disease}:**\n\nYour question: "${userMessage}"\n\n- Act early — disease spreads faster when ignored\n- Remove and destroy infected plant parts immediately\n- Consult your nearest Krishi Sevak or Dealer for the right product\n- Keep records of what you apply and when\n\nFor real-time AI advice, a valid Gemini API key (AIzaSy... format from aistudio.google.com) is needed.`;
    }

    // General farming questions
    if (msg.includes('cotton') || msg.includes('कपास') || msg.includes('कापूस')) {
      return `**Cotton Farming Tips:**\n\n- Sowing time: June–July (Kharif season)\n- Spacing: 60×30 cm for medium varieties\n- Critical irrigation stages: flowering and boll development\n- Common diseases: Leaf Curl Virus, Bollworm, Fusarium Wilt\n- Use Bt cotton varieties for bollworm resistance\n- Monitor for whitefly (Leaf Curl vector) weekly`;
    }
    if (msg.includes('tomato') || msg.includes('टमाटर') || msg.includes('टोमॅटो')) {
      return `**Tomato Farming Tips:**\n\n- Transplanting: 25–30 day old seedlings\n- Spacing: 60×45 cm\n- Common diseases: Early Blight, Late Blight, Bacterial Wilt\n- Key: avoid overhead irrigation, use drip irrigation\n- Apply staking for indeterminate varieties\n- Regular monitoring for leaf curl virus (whitefly-transmitted)`;
    }
    if (msg.includes('wheat') || msg.includes('गेहूं') || msg.includes('गहू')) {
      return `**Wheat Farming Tips:**\n\n- Sowing: November–December (Rabi season)\n- Seed rate: 100–125 kg/hectare\n- Critical irrigation: at crown root initiation, tillering, jointing, grain filling\n- Common diseases: Rust (yellow/brown/stem), Powdery Mildew, Blast\n- Apply fungicide at first sign of rust — acts fast in humid weather`;
    }
    if (msg.includes('organic') || msg.includes('जैविक') || msg.includes('सेंद्रिय')) {
      return `**Organic Farming Methods:**\n\n- Neem oil spray (5ml/litre): effective against most sucking pests\n- Jeevamrit: fermented cow dung + urine solution for soil health\n- Trichoderma: biological fungicide for soil-borne diseases\n- Pheromone traps: for bollworm, fruit fly monitoring\n- Crop rotation: breaks pest/disease cycles naturally\n- Intercropping with marigold repels many pests`;
    }

    return `**Namaste! KisanMitra here.**\n\nYou asked: "${userMessage}"\n\nI can help you with:\n- Crop disease identification and treatment\n- Fertilizer and pesticide recommendations\n- Irrigation and farming best practices\n- Organic farming methods\n- Season-wise crop advice for Indian conditions\n\nAsk me anything specific about your crop or farming challenge!`;
  }
}

export const aiChatService = new AiChatService();
