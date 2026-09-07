import { useEffect, useRef, useState } from 'react';
import * as aiApi from '../../api/ai';
import { useToast } from '../../hooks/useToast';
import { Spinner } from '../../components/States';

const SUGGESTIONS = [
  'What skills am I missing for an AI engineer role?',
  'What should I learn next?',
  'Find internships suitable for me.',
  'How can I improve my resume?',
];

export default function StudentAssistant() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const { push } = useToast();
  const bottomRef = useRef(null);

  useEffect(() => {
    aiApi
      .chatHistory()
      .then((history) => setMessages(history.map((h) => ({ role: h.role, content: h.content }))))
      .catch(() => {})
      .finally(() => setLoadingHistory(false));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text) => {
    const message = (text ?? input).trim();
    if (!message || sending) return;
    setMessages((m) => [...m, { role: 'user', content: message }]);
    setInput('');
    setSending(true);
    try {
      const result = await aiApi.chat(message);
      setMessages((m) => [...m, { role: 'assistant', content: result.reply }]);
    } catch (err) {
      push(err.message, 'error');
      setMessages((m) => [...m, { role: 'assistant', content: "Sorry, I couldn't reach the AI service just now. Please try again." }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-slate-900">AI Career Assistant</h1>
        <p className="text-sm text-slate-500">Grounded in your real profile, skills and application data.</p>
      </div>

      <div className="flex-1 card p-4 overflow-y-auto space-y-3">
        {loadingHistory ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-3xl mb-2">✨</p>
            <p className="text-sm text-slate-500 mb-4">Ask me anything about your career, skills or applications.</p>
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)} className="badge bg-brand-50 text-brand-700 hover:bg-brand-100">
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm ${
                  m.role === 'user' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-800'
                }`}
              >
                {m.content}
              </div>
            </div>
          ))
        )}
        {sending && (
          <div className="flex justify-start">
            <div className="bg-slate-100 rounded-xl px-4 py-2.5 text-sm text-slate-500 flex items-center gap-2">
              <Spinner /> Thinking…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="mt-3 flex gap-2"
      >
        <input className="input" placeholder="Ask about your skills, gaps, or applications…" value={input} onChange={(e) => setInput(e.target.value)} />
        <button className="btn-primary" disabled={sending}>
          Send
        </button>
      </form>
    </div>
  );
}
