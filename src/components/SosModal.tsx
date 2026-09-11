import React from 'react';

interface SosModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SosModal: React.FC<SosModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl space-y-4 border border-red-100">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <div className="flex items-center gap-2 text-red-600">
            <span className="material-symbols-outlined text-[24px]">emergency</span>
            <h3 className="font-bold text-lg text-gray-900">Apoio &amp; S.O.S Imediato</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <p className="text-xs text-gray-600 leading-relaxed">
          Se você ou alguém estiver em risco iminente ou precisando de acolhimento emocional imediato, utilize os canais gratuitos e sigilosos abaixo:
        </p>

        <div className="space-y-2.5">
          {/* CVV */}
          <a
            href="tel:188"
            className="flex items-center justify-between p-3 rounded-xl bg-red-50 hover:bg-red-100/80 border border-red-200 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">support_agent</span>
              </div>
              <div>
                <div className="text-sm font-bold text-gray-900">CVV - Apoio Emocional</div>
                <div className="text-xs text-gray-600">Gratuito, sigiloso e 24h</div>
              </div>
            </div>
            <span className="px-3 py-1 bg-red-600 text-white rounded-full font-bold text-xs shadow-xs group-hover:scale-105 transition-transform">
              Ligue 188
            </span>
          </a>

          {/* Polícia Militar */}
          <a
            href="tel:190"
            className="flex items-center justify-between p-3 rounded-xl bg-amber-50 hover:bg-amber-100/80 border border-amber-200 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">local_police</span>
              </div>
              <div>
                <div className="text-sm font-bold text-gray-900">Polícia Militar</div>
                <div className="text-xs text-gray-600">Emergência física imediata</div>
              </div>
            </div>
            <span className="px-3 py-1 bg-amber-600 text-white rounded-full font-bold text-xs shadow-xs group-hover:scale-105 transition-transform">
              Ligue 190
            </span>
          </a>

          {/* Disque 100 */}
          <a
            href="tel:100"
            className="flex items-center justify-between p-3 rounded-xl bg-teal-50 hover:bg-teal-100/80 border border-teal-200 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">child_care</span>
              </div>
              <div>
                <div className="text-sm font-bold text-gray-900">Disque 100 (ECA)</div>
                <div className="text-xs text-gray-600">Direitos de Crianças e Jovens</div>
              </div>
            </div>
            <span className="px-3 py-1 bg-teal-700 text-white rounded-full font-bold text-xs shadow-xs group-hover:scale-105 transition-transform">
              Ligue 100
            </span>
          </a>
        </div>

        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/80 text-[11px] text-gray-600 space-y-1">
          <div className="font-semibold text-gray-800 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-teal-700">shield</span>
            Dica de proteção rápida:
          </div>
          <div>Procure um adulto de confiança na escola (orientador, professor ou inspetor) ou utilize o botão <strong>Camuflar</strong> caso alguém se aproxime.</div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-gray-900 text-white text-xs font-semibold hover:bg-black transition-colors"
        >
          Fechar
        </button>
      </div>
    </div>
  );
};
