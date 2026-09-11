import React from 'react';
import { AppMode } from '../types';

interface TopModeBarProps {
  currentMode: AppMode;
  onSelectMode: (mode: AppMode) => void;
  onOpenDisguise: () => void;
  onOpenSos: () => void;
}

export const TopModeBar: React.FC<TopModeBarProps> = ({
  currentMode,
  onSelectMode,
  onOpenDisguise,
  onOpenSos,
}) => {
  return (
    <div className="bg-[#0f172a] text-white text-xs px-3 py-1.5 flex flex-wrap items-center justify-between border-b border-slate-700 shadow-sm z-[60] sticky top-0">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 font-semibold text-teal-400">
          <span className="material-symbols-outlined text-[15px]">sync_alt</span>
          <span className="hidden sm:inline">Modo de Visualização:</span>
        </div>

        {/* View buttons */}
        <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-lg border border-slate-700">
          <button
            onClick={() => onSelectMode('student-tracking')}
            className={`px-2 py-1 rounded-md transition-all font-medium flex items-center gap-1 cursor-pointer ${
              currentMode === 'student-tracking'
                ? 'bg-[#00685f] text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
            title="Tela 1 - Acompanhar Protocolo (Aluno)"
          >
            <span className="material-symbols-outlined text-[14px]">smartphone</span>
            <span>Tela 1: Protocolo</span>
          </button>

          <button
            onClick={() => onSelectMode('student-report')}
            className={`px-2 py-1 rounded-md transition-all font-medium flex items-center gap-1 cursor-pointer ${
              currentMode === 'student-report'
                ? 'bg-[#00685f] text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
            title="Tela 2 - Registrar Relato Seguro (Aluno)"
          >
            <span className="material-symbols-outlined text-[14px]">edit_document</span>
            <span>Tela 2: Relatar</span>
          </button>

          <button
            onClick={() => onSelectMode('school-staff')}
            className={`px-2 py-1 rounded-md transition-all font-medium flex items-center gap-1 cursor-pointer ${
              currentMode === 'school-staff'
                ? 'bg-[#00685f] text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
            title="Tela 3 - Gestão Escolar (Pedagógico)"
          >
            <span className="material-symbols-outlined text-[14px]">dashboard</span>
            <span>Tela 3: Gestão Escolar</span>
          </button>
        </div>
      </div>

      {/* Quick shortcuts */}
      <div className="flex items-center gap-2 mt-1 sm:mt-0">
        <button
          onClick={onOpenDisguise}
          className="flex items-center gap-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-teal-300 px-2 py-0.5 rounded border border-slate-700 transition-colors"
          title="Modo camuflado com calculadora"
        >
          <span className="material-symbols-outlined text-[13px]">calculate</span>
          <span>Camuflar</span>
        </button>

        <button
          onClick={onOpenSos}
          className="flex items-center gap-1 text-[11px] bg-red-950/80 hover:bg-red-900 text-red-300 px-2 py-0.5 rounded border border-red-800 transition-colors"
        >
          <span className="material-symbols-outlined text-[13px] text-red-400">emergency</span>
          <span>S.O.S (188)</span>
        </button>
      </div>
    </div>
  );
};
