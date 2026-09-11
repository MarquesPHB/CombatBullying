import React, { useState } from 'react';
import { BullyingCase } from '../types';
import { HELENA_AVATAR } from '../data/initialCases';

interface StudentTrackingViewProps {
  currentCase: BullyingCase;
  onSendMessage: (caseId: string, text: string) => void;
  onOpenDisguise: () => void;
  onOpenSos: () => void;
  onNavigateTab: (tab: 'inicio' | 'relatar' | 'protocolos' | 'guia') => void;
  onOpenStaffView?: () => void;
}

export const StudentTrackingView: React.FC<StudentTrackingViewProps> = ({
  currentCase,
  onSendMessage,
  onOpenDisguise,
  onOpenSos,
  onNavigateTab,
  onOpenStaffView,
}) => {
  const [copied, setCopied] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showSentAlert, setShowSentAlert] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(`#${currentCase.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!replyText.trim()) return;

    onSendMessage(currentCase.id, replyText.trim());
    setReplyText('');
    setShowSentAlert(true);
    setTimeout(() => setShowSentAlert(false), 3500);
  };

  return (
    <div className="bg-[#f8f9ff] font-sans text-[#0d1c2e] flex flex-col min-h-screen relative pb-20">
      {/* Topbar com Identidade Combatbullying, Camuflar/SOS e Perfil */}
      <header className="sticky top-0 w-full z-40 bg-[#f8f9ff]/90 backdrop-blur-md border-b border-[#dce9ff]/60">
        <div className="h-14 px-4 flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#00685f]/10 flex items-center justify-center text-[#00685f]">
              <span className="material-symbols-outlined text-[20px]">shield_with_heart</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-[#00685f] leading-tight">Combatbullying</span>
              <span className="text-[11px] text-[#3d4947] leading-none">Acompanhamento Seguro</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Botão Camuflar Rápido */}
            <button
              onClick={onOpenDisguise}
              aria-label="Camuflar tela"
              className="flex items-center gap-1 bg-[#dce9ff]/60 hover:bg-[#dce9ff] text-[#3d4947] px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all active:scale-95 cursor-pointer"
              id="quick-disguise-btn"
            >
              <span className="material-symbols-outlined text-[15px]">calculate</span>
              <span>Camuflar</span>
            </button>

            {/* SOS Discreto */}
            <button
              onClick={onOpenSos}
              aria-label="S.O.S Emergência"
              className="h-7 px-2.5 rounded-full bg-[#ffdad6] text-[#ba1a1a] flex items-center gap-1 text-[12px] font-bold active:scale-95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px] fill-1">emergency</span>
              <span>S.O.S</span>
            </button>

            {/* Perfil Anônimo */}
            <div
              title="Identidade 100% Anônima"
              className="w-7 h-7 rounded-full bg-[#00685f]/15 text-[#00685f] flex items-center justify-center shrink-0 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[17px]">person</span>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex flex-col w-full max-w-lg mx-auto pt-3 pb-24 px-4">
        <div className="flex flex-col gap-3 py-1">
          {/* 1. Card de Protocolo Ativo Conciso */}
          <div className="bg-white rounded-xl p-3.5 border border-[#e6eeff] shadow-xs flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#00685f] text-[18px]">verified</span>
                <span className="text-[11px] uppercase tracking-wider text-[#6d7a77] font-bold">Protocolo</span>
                <span className="text-[13px] font-bold text-[#0d1c2e] ml-0.5">#{currentCase.id}</span>
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#eff4ff] hover:bg-[#e6eeff] text-[#00685f] text-[11px] font-semibold transition-colors cursor-pointer"
                id="copy-protocol-btn"
              >
                <span className="material-symbols-outlined text-[14px]">
                  {copied ? 'check' : 'content_copy'}
                </span>
                <span>{copied ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#6df5e1]/40 text-[#00685f] text-[12px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00685f] animate-pulse"></span>
                {currentCase.statusLabel}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#eff4ff] text-[#3d4947] text-[11px]">
                <span className="material-symbols-outlined text-[13px] text-[#00685f]">lock</span>
                Identidade Blindada • 100% Anônimo
              </span>
            </div>
          </div>

          {/* 2. Linha do Tempo Minimalista */}
          <div className="bg-white rounded-xl p-3.5 border border-[#e6eeff] shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-bold text-[#0d1c2e]">Progresso do Caso</span>
              <span className="text-[11px] text-[#3d4947]">{currentCase.updatedAtFormatted}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 relative">
              {/* Etapa 1 */}
              <div className="flex flex-col items-center text-center gap-1.5">
                <div className="w-6 h-6 rounded-full bg-[#00685f] text-white flex items-center justify-center z-10 shadow-xs">
                  <span className="material-symbols-outlined text-[13px] font-bold">check</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-[#0d1c2e] leading-tight">1. Relato Recebido</span>
                  <span className="text-[10px] text-[#00685f] font-medium mt-0.5">Concluído</span>
                </div>
              </div>

              {/* Linha conectora 1 -> 2 */}
              <div className="absolute left-[20%] right-[52%] top-3 h-0.5 bg-[#00685f] -z-0"></div>

              {/* Etapa 2 */}
              <div className="flex flex-col items-center text-center gap-1.5">
                <div className="w-6 h-6 rounded-full bg-[#006b5f] text-white flex items-center justify-center z-10 ring-4 ring-[#6df5e1]/40">
                  <span className="material-symbols-outlined text-[13px]">pending</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-[#00685f] leading-tight">2. Triagem Ativa</span>
                  <span className="text-[10px] text-[#a36700] font-semibold mt-0.5">Em andamento</span>
                </div>
              </div>

              {/* Linha conectora 2 -> 3 */}
              <div className="absolute left-[52%] right-[20%] top-3 h-0.5 bg-[#dce9ff] -z-0"></div>

              {/* Etapa 3 */}
              <div className="flex flex-col items-center text-center gap-1.5 opacity-60">
                <div className="w-6 h-6 rounded-full bg-[#dce9ff] text-[#6d7a77] flex items-center justify-center z-10">
                  <span className="material-symbols-outlined text-[13px]">shield</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-medium text-[#0d1c2e] leading-tight">3. Ações e Apoio</span>
                  <span className="text-[10px] text-[#6d7a77] mt-0.5">A seguir</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Canal de Mensagens Sigilosas com a Equipe Escolar */}
          <div className="bg-white rounded-xl border border-[#e6eeff] shadow-xs flex flex-col overflow-hidden">
            {/* Cabeçalho do Chat */}
            <div className="px-3.5 py-2.5 bg-[#eff4ff]/70 border-b border-[#e6eeff] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full overflow-hidden ring-1 ring-[#00685f]/20 bg-[#e6eeff]">
                    <img
                      alt="Foto da Profa. Helena"
                      className="w-full h-full object-cover"
                      src={HELENA_AVATAR}
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-[#00685f] ring-1 ring-white"></span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <span className="text-[12px] font-bold text-[#0d1c2e]">Profa. Helena</span>
                    <span className="material-symbols-outlined text-[#00685f] text-[13px]">verified</span>
                  </div>
                  <span className="text-[11px] text-[#3d4947] leading-tight">Orientação Pedagógica</span>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] text-[#00685f] bg-[#00685f]/10 px-2 py-0.5 rounded-full font-medium">
                <span className="material-symbols-outlined text-[12px]">lock</span>
                Reservado
              </span>
            </div>

            {/* Conversação */}
            <div className="p-3.5 flex flex-col gap-3 bg-[#f8f9ff] min-h-[160px]" id="messages-container">
              {currentCase.messages.map((msg) => {
                const isStudent = msg.sender === 'student';
                return isStudent ? (
                  <div key={msg.id} className="flex flex-col items-end max-w-[80%] self-end animate-fadeIn">
                    <div className="bg-[#00685f] text-white p-2.5 rounded-2xl rounded-br-xs shadow-2xs">
                      <p className="text-[13px] leading-relaxed text-white">{msg.text}</p>
                    </div>
                    <div className="flex items-center gap-1 mt-1 mr-1">
                      <span className="text-[10px] text-[#6d7a77]">{msg.time}</span>
                      <span className="material-symbols-outlined text-[12px] text-[#00685f] font-bold">done_all</span>
                    </div>
                  </div>
                ) : (
                  <div key={msg.id} className="flex items-end gap-2 max-w-[85%] self-start animate-fadeIn">
                    <div className="w-6 h-6 rounded-full overflow-hidden shrink-0">
                      <img
                        alt="Helena"
                        className="w-full h-full object-cover"
                        src={HELENA_AVATAR}
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex flex-col">
                      <div className="bg-[#eff4ff] text-[#0d1c2e] p-2.5 rounded-2xl rounded-bl-xs border border-[#e6eeff]/60 shadow-2xs">
                        <p className="text-[13px] leading-relaxed">{msg.text}</p>
                      </div>
                      <span className="text-[10px] text-[#6d7a77] mt-1 ml-1">{msg.time}</span>
                    </div>
                  </div>
                );
              })}

              {/* Alerta de confirmação de nova mensagem enviada */}
              {showSentAlert && (
                <div className="self-center bg-[#6df5e1]/40 text-[#006f64] px-3 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 transition-all">
                  <span className="material-symbols-outlined text-[14px] text-[#00685f]">check_circle</span>
                  <span>Mensagem enviada em sigilo para a orientação</span>
                </div>
              )}
            </div>

            {/* Campo de Envio de Nova Mensagem Sigilosa */}
            <form onSubmit={handleSend} className="p-2.5 bg-white border-t border-[#e6eeff] flex items-center gap-1.5">
              <button
                type="button"
                aria-label="Anexar comprovante sigiloso"
                className="w-9 h-9 rounded-full text-[#6d7a77] hover:text-[#00685f] hover:bg-[#eff4ff] flex items-center justify-center shrink-0 transition-colors"
                title="Anexar comprovação em sigilo"
              >
                <span className="material-symbols-outlined text-[20px]">attach_file</span>
              </button>
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Escreva sua mensagem com calma..."
                  className="w-full bg-[#eff4ff] text-[#0d1c2e] placeholder:text-[#6d7a77] px-3.5 py-2 rounded-full border border-transparent focus:border-[#00685f]/40 focus:bg-white focus:outline-none transition-all text-[13px]"
                />
              </div>
              <button
                type="submit"
                aria-label="Enviar mensagem"
                className="w-9 h-9 rounded-full bg-[#00685f] hover:bg-[#008378] text-white flex items-center justify-center shrink-0 shadow-sm transition-transform active:scale-95 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">send</span>
              </button>
            </form>
          </div>

          {/* 4. Botão de Apoio Rápido Discreto no Rodapé */}
          <div className="bg-[#eff4ff]/70 rounded-xl px-3.5 py-2.5 flex items-center justify-between border border-[#e6eeff]/60">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[16px]">support_agent</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[12px] font-semibold text-[#0d1c2e] leading-tight">Precisa de ajuda imediata?</span>
                <span className="text-[11px] text-[#3d4947] leading-none">Ligue 188 - CVV (Gratuito e 24h)</span>
              </div>
            </div>
            <a
              href="tel:188"
              className="bg-white hover:bg-[#e6eeff] text-[#00685f] text-[12px] px-3 py-1 rounded-full font-bold border border-[#00685f]/20 shrink-0 transition-colors"
            >
              Ligar 188
            </a>
          </div>

          {/* Quick link to Portal Gestão Escolar */}
          {onOpenStaffView && (
            <div className="text-center pt-2">
              <button
                onClick={onOpenStaffView}
                className="text-xs text-[#00685f] hover:underline font-semibold flex items-center justify-center gap-1 mx-auto py-1"
              >
                <span className="material-symbols-outlined text-[15px]">admin_panel_settings</span>
                <span>Acessar Painel da Equipe Pedagógica (Tela 3)</span>
              </button>
            </div>
          )}
        </div>
      </main>

      {/* 5. Barra Inferior de Navegação Limpa */}
      <nav className="fixed bottom-0 left-0 right-0 w-full z-40 bg-[#f8f9ff]/95 backdrop-blur-xl border-t border-[#dce9ff]/60">
        <div className="flex justify-around items-center h-14 max-w-lg mx-auto px-4">
          <button
            onClick={() => onNavigateTab('inicio')}
            className="flex flex-col items-center justify-center gap-0.5 text-[#3d4947] hover:text-[#0d1c2e] transition-colors cursor-pointer flex-1"
          >
            <span className="material-symbols-outlined text-[20px]">home</span>
            <span className="text-[11px] leading-tight">Início</span>
          </button>

          <button
            onClick={() => onNavigateTab('relatar')}
            className="flex flex-col items-center justify-center gap-0.5 text-[#3d4947] hover:text-[#0d1c2e] transition-colors cursor-pointer flex-1"
          >
            <span className="material-symbols-outlined text-[20px]">edit_document</span>
            <span className="text-[11px] leading-tight">Relatar</span>
          </button>

          <button
            onClick={() => onNavigateTab('protocolos')}
            aria-current="page"
            className="flex flex-col items-center justify-center gap-0.5 text-[#00685f] font-bold transition-colors cursor-pointer flex-1"
          >
            <span className="material-symbols-outlined text-[20px] font-bold fill-1">verified</span>
            <span className="text-[11px] leading-tight">Protocolos</span>
          </button>

          <button
            onClick={() => onNavigateTab('guia')}
            className="flex flex-col items-center justify-center gap-0.5 text-[#3d4947] hover:text-[#0d1c2e] transition-colors cursor-pointer flex-1"
          >
            <span className="material-symbols-outlined text-[20px]">menu_book</span>
            <span className="text-[11px] leading-tight">Guia</span>
          </button>
        </div>
      </nav>
    </div>
  );
};
