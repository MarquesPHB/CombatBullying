import React, { FormEvent, useEffect, useState } from 'react';
import { apiRequest, ProtocolMessage } from '../lib/api';

interface PublicProtocol {
  protocol_code: string;
  aggression_type: string;
  occurred_date: string;
  occurred_time: string;
  status: string;
  created_at: string;
  updated_at: string;
  messages: ProtocolMessage[];
}

interface StudentTrackingViewProps {
  initialCredentials?: { code: string; pin: string } | null;
  onOpenDisguise: () => void;
  onOpenSos: () => void;
  onNavigateTab: (tab: 'inicio' | 'relatar' | 'protocolos' | 'guia') => void;
  onOpenStaffView: () => void;
}

function localDate(value: string) {
  return new Date(value).toLocaleString('pt-BR');
}

export const StudentTrackingView: React.FC<StudentTrackingViewProps> = ({
  initialCredentials,
  onOpenDisguise,
  onOpenSos,
  onNavigateTab,
  onOpenStaffView,
}) => {
  const [code, setCode] = useState(initialCredentials?.code ?? '');
  const [pin, setPin] = useState(initialCredentials?.pin ?? '');
  const [protocol, setProtocol] = useState<PublicProtocol | null>(null);
  const [reply, setReply] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const loadProtocol = async (protocolCode: string, protocolPin: string) => {
    setError('');
    setIsLoading(true);
    try {
      const result = await apiRequest<{ protocol: PublicProtocol }>('/api/protocols/track', {
        method: 'POST',
        body: JSON.stringify({ code: protocolCode.trim(), pin: protocolPin.trim() }),
      });
      setProtocol(result.protocol);
      setCode(protocolCode.trim());
      setPin(protocolPin.trim());
    } catch (requestError) {
      setProtocol(null);
      setError(requestError instanceof Error ? requestError.message : 'Não foi possível consultar o protocolo.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialCredentials?.code && initialCredentials.pin) {
      void loadProtocol(initialCredentials.code, initialCredentials.pin);
    }
  }, [initialCredentials?.code, initialCredentials?.pin]);

  const handleSearch = async (event: FormEvent) => {
    event.preventDefault();
    if (!code.trim() || !/^\d{8}$/.test(pin.trim())) {
      setError('Informe o protocolo e o PIN de 8 números.');
      return;
    }
    await loadProtocol(code, pin);
  };

  const handleSend = async (event: FormEvent) => {
    event.preventDefault();
    if (!protocol || !reply.trim()) return;
    setIsSending(true);
    setError('');
    try {
      await apiRequest('/api/protocols/track/messages', {
        method: 'POST',
        body: JSON.stringify({ code, pin, message: reply.trim() }),
      });
      setReply('');
      await loadProtocol(code, pin);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Não foi possível enviar a mensagem.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-[#f8f9ff] font-sans text-[#0d1c2e] min-h-screen flex flex-col pb-20">
      <header className="sticky top-0 z-40 bg-white/95 border-b border-[#dce9ff]">
        <div className="max-w-lg mx-auto h-14 px-4 flex items-center justify-between">
          <div><strong className="text-[#00685f]">Combatbullying</strong><p className="text-[11px] text-slate-600">Acompanhamento seguro</p></div>
          <div className="flex gap-2">
            <button type="button" aria-label="Abrir calculadora camuflada" onClick={onOpenDisguise} className="w-9 h-9 rounded-full bg-[#dce9ff]"><span className="material-symbols-outlined">visibility_off</span></button>
            <button type="button" onClick={onOpenSos} className="px-3 rounded-full bg-red-50 text-red-800 font-bold">S.O.S</button>
            <button type="button" onClick={onOpenStaffView} aria-label="Acesso da equipe" className="w-9 h-9 rounded-full bg-[#eff4ff] text-[#00685f]"><span className="material-symbols-outlined">person</span></button>
          </div>
        </div>
      </header>
      <main className="w-full max-w-lg mx-auto p-4 pb-24 space-y-4">
        <section className="bg-white p-4 rounded-2xl border border-[#dce9ff]">
          <h1 className="text-xl font-bold">Acompanhar protocolo</h1>
          <p className="text-sm text-slate-600 mt-1">Para proteger seu relato, informe o protocolo e o PIN recebidos no envio.</p>
        </section>

        <form onSubmit={handleSearch} className="bg-white p-4 rounded-2xl border border-[#dce9ff] space-y-3">
          <label className="block text-sm font-semibold" htmlFor="protocol-code">Protocolo</label>
          <input id="protocol-code" autoComplete="off" value={code} onChange={(event) => setCode(event.target.value)} placeholder="#STN-AAAA-000000000000" className="w-full rounded-xl border border-slate-200 p-3" />
          <label className="block text-sm font-semibold" htmlFor="protocol-pin">PIN de 8 números</label>
          <input id="protocol-pin" autoComplete="off" inputMode="numeric" pattern="[0-9]{8}" maxLength={8} value={pin} onChange={(event) => setPin(event.target.value.replace(/\D/g, '').slice(0, 8))} placeholder="00000000" className="w-full rounded-xl border border-slate-200 p-3" />
          <button disabled={isLoading} className="w-full p-3 rounded-xl bg-[#00685f] text-white font-bold disabled:opacity-50">{isLoading ? 'Consultando…' : 'Consultar protocolo'}</button>
        </form>

        {error && <p className="bg-red-50 text-red-800 p-3 rounded-xl text-sm" role="alert">{error}</p>}
        {protocol && (
          <section className="bg-white p-4 rounded-2xl border border-[#dce9ff] space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div><p className="text-[11px] uppercase text-slate-500">Protocolo</p><strong className="font-mono">{protocol.protocol_code}</strong></div>
              <span className="px-3 py-1 rounded-full bg-teal-50 text-[#00685f] text-xs font-bold">{protocol.status}</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="block text-xs text-slate-500">Tipo</span>{protocol.aggression_type}</div>
              <div><span className="block text-xs text-slate-500">Ocorrido em</span>{protocol.occurred_date} às {protocol.occurred_time}</div>
              <div><span className="block text-xs text-slate-500">Recebido</span>{localDate(protocol.created_at)}</div>
              <div><span className="block text-xs text-slate-500">Atualizado</span>{localDate(protocol.updated_at)}</div>
            </div>
            <div className="border-t border-slate-100 pt-3">
              <h2 className="font-bold">Mensagens reservadas</h2>
              <div className="mt-2 max-h-64 overflow-y-auto space-y-2">
                {protocol.messages.map((message, index) => <div key={`${message.created_at}-${index}`} className={`p-3 rounded-xl text-sm ${message.sender_role === 'reporter' ? 'bg-teal-50 ml-6' : 'bg-[#eff4ff] mr-6'}`}>
                  <p>{message.message}</p><time className="block text-[10px] text-slate-500 mt-1">{localDate(message.created_at)}</time>
                </div>)}
                {!protocol.messages.length && <p className="text-sm text-slate-500">Ainda não há mensagens neste protocolo.</p>}
              </div>
              <form onSubmit={handleSend} className="flex gap-2 mt-3">
                <input value={reply} onChange={(event) => setReply(event.target.value)} maxLength={2000} placeholder="Escreva uma mensagem" className="min-w-0 flex-1 rounded-xl border border-slate-200 p-3" />
                <button disabled={isSending || !reply.trim()} className="px-4 rounded-xl bg-[#00685f] text-white font-semibold disabled:opacity-50">{isSending ? '…' : 'Enviar'}</button>
              </form>
            </div>
            <p className="text-xs text-slate-500">O PIN protege esta consulta. Não compartilhe seus dados de acesso.</p>
          </section>
        )}
      </main>
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 border-t border-slate-200">
        <div className="max-w-lg mx-auto flex h-14">{(['inicio', 'relatar', 'protocolos', 'guia'] as const).map((tab) => <button key={tab} type="button" onClick={() => onNavigateTab(tab)} className={`flex-1 text-xs font-semibold ${tab === 'protocolos' ? 'text-[#00685f]' : 'text-slate-600'}`}>{tab === 'inicio' ? 'Início' : tab === 'relatar' ? 'Relatar' : tab === 'protocolos' ? 'Protocolos' : 'Guia'}</button>)}</div>
      </nav>
    </div>
  );
};
