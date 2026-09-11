import React, { useState, useEffect } from 'react';
import { EvidenceItem } from '../types';

interface EvidenceModalProps {
  item: EvidenceItem | null;
  onClose: () => void;
}

export const EvidenceModal: React.FC<EvidenceModalProps> = ({ item, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(25);

  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 5;
        });
      }, 500);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-200">
        <div className="px-4 py-3 bg-[#f8f9fc] border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="material-symbols-outlined text-primary text-[20px]">
              {item.type === 'image' ? 'image' : 'graphic_eq'}
            </span>
            <div className="truncate">
              <h4 className="text-xs font-bold text-gray-900 truncate">{item.name}</h4>
              <span className="text-[11px] text-gray-500">{item.size}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-gray-200/80 hover:bg-gray-300 text-gray-600 flex items-center justify-center transition-colors shrink-0"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>

        <div className="p-4">
          {item.type === 'image' ? (
            <div className="space-y-3">
              <div className="relative rounded-xl overflow-hidden bg-gray-100 border border-gray-200 aspect-[4/3] flex items-center justify-center">
                {/* Simulated screenshot of WhatsApp offensive group or user uploaded image */}
                <div className="p-4 w-full h-full flex flex-col justify-between bg-slate-900 text-slate-100 text-xs font-mono">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                    <span className="text-emerald-400 font-bold">[METADADOS EXIF REMOVIDOS]</span>
                    <span className="text-[10px] text-slate-400">ID Seguro #STN-8942-A1</span>
                  </div>
                  <div className="space-y-2 my-auto bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                    <div className="text-[11px] text-slate-300 italic">
                      "Print da conversa com mensagens pejorativas e figurinhas compartilhadas sem autorização da vítima."
                    </div>
                    <div className="text-[10px] text-teal-400 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">verified</span>
                      Higienizado digitalmente contra identificação de remetente
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-400 text-right">
                    Registro sob custódia pedagógica protegida
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-primary">shield</span>
                  Proteção por sigilo escolar
                </span>
                <span className="font-mono text-[11px]">SHA256 validado</span>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <div className="bg-teal-50 border border-teal-100 p-4 rounded-xl flex flex-col items-center justify-center gap-3 text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-md">
                  <span className="material-symbols-outlined text-[24px]">graphic_eq</span>
                </div>
                <div>
                  <div className="font-semibold text-sm text-gray-900">Depoimento em Áudio Criptografado</div>
                  <div className="text-xs text-teal-800">Filtro de voz anti-identificação ativo (Voz modificada)</div>
                </div>

                {/* Waveform graphic */}
                <div className="flex items-center gap-1 h-8 w-full justify-center px-4">
                  {[40, 75, 30, 90, 60, 45, 100, 80, 50, 70, 35, 85, 60, 40, 95, 55, 30, 70, 85, 45].map((h, i) => (
                    <div
                      key={i}
                      className={`w-1.5 rounded-full transition-all duration-300 ${
                        (i / 20) * 100 <= progress ? 'bg-primary' : 'bg-teal-200'
                      }`}
                      style={{ height: isPlaying ? `${Math.max(20, (h * (Math.sin(i + progress) + 1.2)) / 2)}%` : `${h}%` }}
                    />
                  ))}
                </div>

                {/* Progress bar & Controls */}
                <div className="w-full space-y-2">
                  <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-primary h-full transition-all duration-200"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-gray-500 font-mono">
                    <span>0:{Math.floor((progress * 42) / 100).toString().padStart(2, '0')}</span>
                    <span>0:42</span>
                  </div>
                </div>

                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="px-5 py-2 rounded-full bg-primary hover:bg-[#00524b] text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {isPlaying ? 'pause' : 'play_arrow'}
                  </span>
                  <span>{isPlaying ? 'Pausar Áudio' : 'Reproduzir com Voz Modificada'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-semibold transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
