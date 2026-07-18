// CropCare — AI Chat Page
// Route: /ai-chat (general Ask AI) and /ai-chat/:diagnosisId (Consult AI post-diagnosis)
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeftIcon } from '../../components/icons/index.tsx';
import { sendChatMessage, ChatMessage } from '../../services/aiChatService.ts';

export default function AiChatPage(): React.JSX.Element {
  const navigate = useNavigate();
  const { diagnosisId } = useParams<{ diagnosisId?: string }>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const isConsultMode = !!diagnosisId;
  const title = isConsultMode ? 'Consult AI' : 'Ask AI';
  const placeholder = isConsultMode
    ? 'Ask about this disease, treatment, fertilizers...'
    : 'Ask any farming question...';

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Add welcome message on first load
  useEffect(() => {
    const welcome: ChatMessage = {
      role: 'assistant',
      content: isConsultMode
        ? 'I have your diagnosis context. Ask me anything about this disease — symptoms, treatment, recommended fertilizers, pesticides, or irrigation advice.'
        : 'Namaste! I am CropCare AI. Ask me anything about crop diseases, fertilizers, pesticides, irrigation, or farming advice.',
    };
    setMessages([welcome]);
  }, [isConsultMode]);

  async function handleSend(): Promise<void> {
    const msg = input.trim();
    if (!msg || loading) return;
    setInput('');
    setError(null);

    const userMsg: ChatMessage = { role: 'user', content: msg };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setLoading(true);

    try {
      // Send history excluding the welcome message (it's not real context)
      const historyToSend = newMessages.filter(
        (m, i) => !(i === 0 && m.role === 'assistant')
      ).slice(-8); // keep last 8 for context window

      const result = await sendChatMessage(msg, historyToSend, diagnosisId);
      setMessages((prev) => [...prev, { role: 'assistant', content: result.reply }]);
    } catch {
      setError('Failed to get response. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function renderMessage(msg: ChatMessage, index: number): React.JSX.Element {
    const isUser = msg.role === 'user';
    // Simple markdown: **bold** → <strong>, *italic* → <em>, bullet list
    const formatted = msg.content
      .split('\n')
      .map((line, i) => {
        const bold = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        const italic = bold.replace(/\*(.*?)\*/g, '<em>$1</em>');
        if (line.startsWith('- ') || line.startsWith('• ')) {
          return `<div style="margin: 2px 0; padding-left: 12px;">• ${italic.slice(2)}</div>`;
        }
        return italic ? `<div style="margin: 2px 0">${italic}</div>` : '<div style="margin: 2px 0">&nbsp;</div>';
      })
      .join('');

    return (
      <div
        key={index}
        style={{
          display: 'flex',
          justifyContent: isUser ? 'flex-end' : 'flex-start',
          marginBottom: '12px',
          padding: '0 16px',
        }}
      >
        {!isUser && (
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, #1a936f, #114b5f)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginRight: '8px', marginTop: '2px',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M17 8C8 10 5.9 16.17 3.82 19.34" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M17 8c2-4 5-6 5-6s-2 5-5 12c-2.5 5.5-7 8-7 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        )}
        <div
          style={{
            maxWidth: '78%',
            padding: '10px 14px',
            borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
            backgroundColor: isUser ? '#1a936f' : '#ffffff',
            color: isUser ? '#ffffff' : '#1f2937',
            fontSize: '14px', lineHeight: 1.55,
            boxShadow: isUser ? 'none' : '0 1px 4px rgba(0,0,0,0.08)',
          }}
          dangerouslySetInnerHTML={{ __html: formatted }}
        />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f5f5f0', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 16px', background: 'linear-gradient(135deg, #1a936f 0%, #114b5f 100%)', flexShrink: 0 }}>
        <button onClick={() => navigate(-1)} style={{ minWidth: '44px', minHeight: '44px', background: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }} aria-label="Go back">
          <ChevronLeftIcon size={24} color="#ffffff" />
        </button>
        <div>
          <h1 style={{ fontSize: '17px', fontWeight: 700, color: '#ffffff', margin: 0 }}>{title}</h1>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)', margin: 0 }}>
            {isConsultMode ? 'Asking about detected disease' : 'Agricultural AI Assistant'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', paddingTop: '16px', paddingBottom: '8px' }}>
        {messages.map((msg, i) => renderMessage(msg, i))}
        {loading && (
          <div style={{ padding: '0 16px', marginBottom: '12px', display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '40px' }}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#1a936f', animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
              ))}
            </div>
          </div>
        )}
        {error && (
          <div style={{ margin: '0 16px 12px', padding: '10px 14px', backgroundColor: '#fee2e2', borderRadius: '8px', fontSize: '13px', color: '#991b1b' }}>
            {error}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '12px 16px 24px', backgroundColor: '#ffffff', borderTop: '1px solid #e5e7eb', display: 'flex', gap: '10px', alignItems: 'flex-end', flexShrink: 0 }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder={placeholder}
          rows={1}
          style={{ flex: 1, padding: '12px 14px', border: '2px solid #e5e7eb', borderRadius: '12px', fontSize: '15px', resize: 'none', outline: 'none', fontFamily: 'system-ui, -apple-system, sans-serif', lineHeight: 1.5, maxHeight: '120px', overflowY: 'auto' }}
          onFocus={(e) => { e.currentTarget.style.borderColor = '#1a936f'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || loading}
          style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: input.trim() && !loading ? '#1a936f' : '#e5e7eb', border: 'none', cursor: input.trim() && !loading ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background-color 0.15s ease' }}
          aria-label="Send message"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M22 2L11 13" stroke={input.trim() && !loading ? '#ffffff' : '#9ca3af'} strokeWidth="2" strokeLinecap="round" />
            <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke={input.trim() && !loading ? '#ffffff' : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <style>{`
        @keyframes bounce { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-8px); } }
      `}</style>
    </div>
  );
}
