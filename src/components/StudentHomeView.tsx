import React from 'react';

interface StudentHomeViewProps {
  onNavigateTab: (tab: 'inicio' | 'relatar' | 'protocolos' | 'guia') => void;
  onOpenDisguise: () => void;
  onOpenSos: () => void;
  onOpenStaffView: () => void;
}

export const StudentHomeView: React.FC<StudentHomeViewProps> = ({
  onNavigateTab,
  onOpenDisguise,
  onOpenSos,
  onOpenStaffView,
}) => {
  return (
    <div className="bg-[#f8f9fc] font-sans text-[#0d1c2e] min-h-screen flex flex-col pb-20">
      {/* Topbar */}
      <header className="sticky top-0 w-full z-40 bg-[#f8f9fc]/90 backdrop-blur-md border-b border-[#bcc9c6]/30">
        <div className="h-14 px-4 flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#00685f]/10 flex items-center justify-center text-[#00685f] shadow-xs ring-1 ring-[#00685f]/20">
              <span className="material-symbols-outlined text-[20px]">shield_person</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[15px] font-bold text-[#00685f] tracking-tight leading-none">
                Combatbullying
              </span>
              <span className="text-[11px] text-[#4a5957] font-medium mt-0.5">Espaço Seguro de Acolhimento</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenDisguise}
              aria-label="Abrir calculadora camuflada"
              className="w-9 h-9 rounded-full bg-[#dce9ff]/60 hover:bg-[#dce9ff] text-[#3d4947] flex items-center justify-center active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[19px]">visibility_off</span>
            </button>
            <button
              onClick={onOpenSos}
              className="h-8 px-2.5 rounded-full bg-red-50 text-[#ba1a1a] flex items-center gap-1 border border-red-100 active:scale-95 transition-all text-xs font-semibold"
            >
              <span className="material-symbols-outlined text-[15px] fill-1">emergency</span>
              <span>S.O.S</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-lg mx-auto p-4 space-y-4">
        {/* Welcome card */}
        <div className="bg-gradient-to-br from-[#00685f] to-[#004d44] text-white p-5 rounded-2xl shadow-md space-y-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 text-xs backdrop-blur-xs font-semibold">
            <span className="material-symbols-outlined text-[15px] text-teal-200">lock</span>
            Relato com identificação opcional
          </div>
          <h2 className="text-xl font-bold leading-tight">
            Ninguém deve passar por intimidação ou sofrimento sozinho.
          </h2>
          <p className="text-xs text-teal-100 leading-relaxed">
            Seja você a vítima ou alguém que presenciou uma situação injusta, este canal existe para acolher, proteger e resolver sem te expor.
          </p>
          <div className="pt-1 flex gap-2">
            <button
              onClick={() => onNavigateTab('relatar')}
              className="py-2.5 px-4 rounded-xl bg-white text-[#00685f] font-bold text-xs shadow-sm hover:bg-teal-50 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[17px]">edit_document</span>
              <span>Fazer Relato Seguro</span>
            </button>
            <button
              onClick={() => onNavigateTab('protocolos')}
              className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs backdrop-blur-xs active:scale-95 transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[17px]">verified</span>
              <span>Ver Protocolos</span>
            </button>
          </div>
        </div>

        {/* Private follow-up guidance */}
        <div className="bg-white p-4 rounded-2xl border border-[#d2dedb]/50 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#0d1c2e] uppercase tracking-wider">
                Acompanhe seu relato
              </span>
            </div>
          </div>
          <p className="text-xs text-[#4a5957]">
            Após enviar um relato, guarde o protocolo e o PIN exibidos. Eles serão necessários para consultar atualizações e enviar mensagens.
          </p>
          <button
            onClick={() => onNavigateTab('protocolos')}
            className="w-full py-2 px-3 rounded-xl bg-[#eff4ff] hover:bg-[#e6eeff] text-[#00685f] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Informar protocolo e PIN</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>

        {/* 3 Pillars */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-3.5 rounded-xl border border-[#d2dedb]/40 shadow-xs space-y-1">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#00685f] flex items-center justify-center mb-2">
              <span className="material-symbols-outlined text-[18px]">verified_user</span>
            </div>
            <h4 className="text-xs font-bold text-[#0d1c2e]">Identificação opcional</h4>
            <p className="text-[11px] text-[#4a5957] leading-relaxed">
              Você pode enviar o relato sem informar nome ou contato. Compartilhe apenas o necessário.
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-[#d2dedb]/40 shadow-xs space-y-1">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#00685f] flex items-center justify-center mb-2">
              <span className="material-symbols-outlined text-[18px]">favorite</span>
            </div>
            <h4 className="text-xs font-bold text-[#0d1c2e]">Acolhimento Humano</h4>
            <p className="text-[11px] text-[#4a5957] leading-relaxed">
              Equipe pedagógica preparada para mediar sem causar retaliações.
            </p>
          </div>
        </div>

        {/* Quick Portal Switch */}
        <div className="p-3.5 bg-[#eff4ff]/80 rounded-2xl border border-[#dce9ff] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#00685f]/15 text-[#00685f] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">shield</span>
            </div>
            <div>
              <div className="text-xs font-bold text-[#0d1c2e]">Portal Gestão Escolar</div>
              <div className="text-[11px] text-[#4a5957]">Painel para professores e coordenação</div>
            </div>
          </div>
          <button
            onClick={onOpenStaffView}
            className="px-3 py-1.5 rounded-lg bg-[#00685f] text-white text-xs font-semibold shadow-xs hover:bg-[#008378] transition-colors"
          >
            Abrir Painel
          </button>
        </div>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 w-full z-40 bg-[#f8f9fc]/95 backdrop-blur-lg border-t border-[#bcc9c6]/30">
        <div className="max-w-lg mx-auto flex items-center justify-around h-14 px-2">
          <button
            onClick={() => onNavigateTab('inicio')}
            aria-current="page"
            className="flex flex-col items-center justify-center flex-1 py-1 text-[#00685f] font-bold transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[21px] fill-1">shield_with_heart</span>
            <span className="text-[11px] mt-0.5">Início</span>
          </button>
          <button
            onClick={() => onNavigateTab('relatar')}
            className="flex flex-col items-center justify-center flex-1 py-1 text-[#4a5957] hover:text-[#0d1c2e] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[21px]">edit_document</span>
            <span className="text-[11px] font-medium mt-0.5">Relatar</span>
          </button>
          <button
            onClick={() => onNavigateTab('protocolos')}
            className="flex flex-col items-center justify-center flex-1 py-1 text-[#4a5957] hover:text-[#0d1c2e] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[21px]">verified</span>
            <span className="text-[11px] font-medium mt-0.5">Protocolos</span>
          </button>
          <button
            onClick={() => onNavigateTab('guia')}
            className="flex flex-col items-center justify-center flex-1 py-1 text-[#4a5957] hover:text-[#0d1c2e] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[21px]">menu_book</span>
            <span className="text-[11px] font-medium mt-0.5">Guia</span>
          </button>
        </div>
      </nav>
    </div>
  );
};
