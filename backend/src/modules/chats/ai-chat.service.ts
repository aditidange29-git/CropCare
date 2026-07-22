// AI Chat Service — KisanMitra agricultural advisor
// Uses Groq (Llama 3.3 70B) for fast, free text chat
// Falls back to smart keyword-based mock when Groq is unavailable
import Groq from 'groq-sdk';
import { config } from '../../config/env.js';

const SYSTEM_PROMPT = `You are KisanMitra, an expert agricultural advisor for Indian farmers. You have deep knowledge of:
- Crop diseases, symptoms, prevention, and treatment for Indian crops
- Fertilizers, pesticides, herbicides and their safe usage and dosage
- Organic farming methods and natural pest control
- Irrigation techniques suited for Indian farming conditions
- Soil health, nutrients, and crop nutrition
- Seasonal farming advice (Kharif, Rabi, Zaid seasons)
- Major crops: cotton, tomato, wheat, rice, sugarcane, soybean, and more

RULES:
1. Give practical, actionable advice suited for small and medium farmers in India
2. Always mention safety precautions when discussing chemicals/pesticides
3. Recommend both organic and chemical options where relevant
4. If asked about a specific disease, mention specific product names available in Indian markets with dosage
5. Keep responses concise but complete — use bullet points
6. Always respond in the same language the user writes in (Hindi, Marathi, or English)
7. If question is not agriculture-related, politely say you specialize in farming topics`;

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export class AiChatService {
  private getGroqClient(): Groq | null {
    if (!config.groqApiKey || config.groqApiKey.length < 10) return null;
    return new Groq({ apiKey: config.groqApiKey });
  }

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
    const groq = this.getGroqClient();
    if (!groq) return this.chatSmartMock(userMessage, diagnosisContext);

    let systemPrompt = SYSTEM_PROMPT;
    if (diagnosisContext) {
      systemPrompt += `\n\nCURRENT DIAGNOSIS CONTEXT:
Disease detected: ${diagnosisContext.disease_name} (code: ${diagnosisContext.disease_code})
Current organic treatments: ${diagnosisContext.treatment_organic.join(', ')}
Current chemical treatments: ${diagnosisContext.treatment_chemical.join(', ')}
The farmer is asking follow-up questions about this specific disease. Keep answers focused on this disease.`;
    }

    const messages: Groq.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...history.map(msg => ({ role: msg.role as 'user' | 'assistant', content: msg.content })),
      { role: 'user', content: userMessage },
    ];

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      max_tokens: 1024,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content ?? 'Sorry, I could not generate a response.';
  }

  async chatMock(userMessage: string, diagnosisContext?: { disease_name: string }): Promise<string> {
    return this.chatSmartMock(userMessage, diagnosisContext);
  }

  async chatSmartMock(userMessage: string, diagnosisContext?: { disease_name: string }): Promise<string> {
    const msg = userMessage.toLowerCase();
    const disease = diagnosisContext?.disease_name ?? '';

    if (diagnosisContext && disease) {
      if (msg.includes('symptom') || msg.includes('signs') || msg.includes('लक्षण') || msg.includes('लक्षणे')) {
        return `**${disease} — Symptoms**\n\n- Visible discoloration or lesions on leaves/stems\n- Wilting or stunted growth\n- Abnormal spots, pustules, or powdery coating\n- In pest diseases: insect presence, entry holes, or frass\n\nConsult your local Krishi Vigyan Kendra (KVK) for field verification.`;
      }
      if (msg.includes('fertilizer') || msg.includes('खाद') || msg.includes('खते') || msg.includes('nutrient')) {
        return `**Fertilizer advice for crops with ${disease}:**\n\n- Avoid excess nitrogen during active disease\n- Apply balanced NPK as per soil test\n- Potassium improves disease resistance\n- Add micronutrients (Zinc, Boron) as per crop need\n- Organic compost boosts plant immunity`;
      }
      if (msg.includes('pesticide') || msg.includes('spray') || msg.includes('कीटनाशक') || msg.includes('कीटकनाशक')) {
        return `**Treatment for ${disease}:**\n\n- Spray in early morning or evening\n- Wear gloves, mask, and protective clothing\n- Do not spray near water bodies\n- Rotate chemicals to prevent resistance\n- Maintain pre-harvest interval (PHI) strictly`;
      }
      if (msg.includes('irrigation') || msg.includes('water') || msg.includes('सिंचन') || msg.includes('पानी')) {
        return `**Irrigation advice for ${disease}:**\n\n- Use drip or furrow irrigation — avoid overhead watering\n- Water in the morning so foliage dries by evening\n- Reduce frequency to avoid waterlogging\n- Good drainage prevents fungal spread`;
      }
      return `**KisanMitra — ${disease} Advice:**\n\n- Act early — disease spreads fast when ignored\n- Remove and destroy infected plant parts\n- Consult your nearest dealer for the right product\n\n*For real-time personalized advice, KisanMitra is powered by Groq AI.*`;
    }

    if (msg.includes('cotton') || msg.includes('कपास') || msg.includes('कापूस')) {
      return `**Cotton Farming Tips:**\n\n- Sowing: June–July (Kharif)\n- Common diseases: Leaf Curl Virus, Bollworm, Fusarium Wilt\n- Use Bt cotton for bollworm resistance\n- Monitor for whitefly weekly (Leaf Curl vector)\n- Critical irrigation: flowering and boll development`;
    }
    if (msg.includes('tomato') || msg.includes('टमाटर') || msg.includes('टोमॅटो')) {
      return `**Tomato Farming Tips:**\n\n- Transplant 25–30 day old seedlings\n- Common diseases: Early Blight, Late Blight, Bacterial Wilt\n- Use drip irrigation — avoid wetting leaves\n- Apply fungicide preventively in humid weather`;
    }
    if (msg.includes('wheat') || msg.includes('गेहूं') || msg.includes('गहू')) {
      return `**Wheat Farming Tips:**\n\n- Sowing: November–December (Rabi)\n- Common diseases: Rust, Powdery Mildew, Blast\n- Apply Propiconazole at first sign of rust\n- Critical irrigation: crown root initiation and grain filling`;
    }
    if (msg.includes('organic') || msg.includes('जैविक') || msg.includes('सेंद्रिय')) {
      return `**Organic Methods:**\n\n- Neem oil 5ml/litre: controls most pests\n- Jeevamrit: boosts soil health naturally\n- Trichoderma: biological fungicide\n- Pheromone traps: for bollworm and fruit fly\n- Crop rotation breaks pest cycles`;
    }

    return `**Namaste! I am KisanMitra.**\n\nYou asked: "${userMessage}"\n\nI can help with:\n- Crop disease identification and treatment\n- Fertilizer and pesticide recommendations\n- Irrigation and farming best practices\n- Organic farming methods\n- Season-wise crop advice\n\nAsk me anything about your crop!`;
  }
}

export const aiChatService = new AiChatService();
