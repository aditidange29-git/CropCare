import { api } from './api.ts';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function sendChatMessage(
  message: string,
  history: ChatMessage[] = [],
  diagnosisId?: string
): Promise<{ reply: string; role: string }> {
  return api.post('/ai-chat', { message, history, diagnosis_id: diagnosisId });
}
