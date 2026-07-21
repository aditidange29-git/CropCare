// AI Chat Router — POST /api/v1/ai-chat
// Used for both "Ask AI" (general) and "Consult AI" (post-diagnosis)
import { Router } from 'express';
import type { Request } from 'express';
import { authenticate, AuthenticatedRequest } from '../../common/auth.middleware.js';
import { asyncHandler } from '../../common/asyncHandler.js';
import { sendSuccess } from '../../common/response.js';
import { aiChatService, ChatMessage } from './ai-chat.service.js';
import { supabase } from '../../config/supabase.js';
import { config } from '../../config/env.js';

const router = Router();

// POST /api/v1/ai-chat
// Body: { message: string, history?: ChatMessage[], diagnosis_id?: string }
router.post('/', authenticate, asyncHandler(async (req: Request, res) => {
  const { message, history = [], diagnosis_id } = req.body as {
    message: string;
    history?: ChatMessage[];
    diagnosis_id?: string;
  };

  if (!message?.trim()) {
    return res.status(400).json({ success: false, data: null, error: { code: 'VALIDATION_ERROR', message: 'message is required' } });
  }

  // If diagnosis_id provided, fetch context from DB
  let diagnosisContext: any = undefined;
  if (diagnosis_id) {
    const { data: diag } = await supabase
      .from('diagnoses')
      .select('matched_disease_code, disease_library!diagnoses_matched_disease_code_fkey(name_translations, treatment_protocol)')
      .eq('id', diagnosis_id)
      .single();
    if (diag && (diag as any).disease_library) {
      const dl = (diag as any).disease_library;
      diagnosisContext = {
        disease_name: dl.name_translations?.en ?? diag.matched_disease_code,
        disease_code: diag.matched_disease_code,
        treatment_organic: dl.treatment_protocol?.organic ?? [],
        treatment_chemical: dl.treatment_protocol?.chemical ?? [],
      };
    }
  }

  // Use mock only when key is literally a placeholder value
  // Both AIzaSy... (old format) and AQ. (new format) are valid Google AI Studio keys
  const useMock = config.geminiApiKey.startsWith('PASTE') ||
    config.geminiApiKey.includes('your-gemini') ||
    config.geminiApiKey.length < 20;

  const reply = useMock
    ? await aiChatService.chatMock(message, diagnosisContext)
    : await aiChatService.chat(message, history as ChatMessage[], diagnosisContext);

  sendSuccess(res, { reply, role: 'assistant' });
}));

export default router;
