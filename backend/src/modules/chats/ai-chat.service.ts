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
      model: 'gemini-2.0-flash',
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
    if (diagnosisContext) {
      return `I can help you with questions about **${diagnosisContext.disease_name}**.\n\nThis is a demo response. Add a valid Gemini API key to get real agricultural advice.\n\nYour question: "${userMessage}"`;
    }
    return `Thank you for your question: "${userMessage}"\n\nThis is a demo response. Add a valid Gemini API key to get real agricultural advice from CropCare AI.`;
  }
}

export const aiChatService = new AiChatService();
