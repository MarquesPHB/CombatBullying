import React, { useState } from 'react';

interface StudentGuideViewProps {
  onNavigateTab: (tab: 'inicio' | 'relatar' | 'protocolos' | 'guia') => void;
  onOpenDisguise: () => void;
  onOpenSos: () => void;
}

export const StudentGuideView: React.FC<StudentGuideViewProps> = ({
  onNavigateTab,
  onOpenDisguise,
  onOpenSos,
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Minha identidade pode ser descoberta se eu relatar como anônimo?',
      a: 'Não. O sistema Combatbullying remove automaticamente endereços IP, dados de localização geográfica e metadados EXIF de qualquer imagem ou documento anexado. Nem mesmo a escola terá acesso aos seus dados de conexão.'
    },
    {
      q: 'O que a escola faz depois que envio o relato?',
      a: 'A equipe de Orientação Pedagógica analisa a situação com sigilo absoluto. Não há confrontos em público. São tomadas medidas restaurativas com a turma, mediação individual discreta e apoio psicológico quando necessário.'
    },
    {
      q: 'E se eu for apenas testemunha de algo contra um colega?',
      a: 'Você pode relatar como testemunha! Muitas vezes quem sofre o bullying tem medo ou vergonha de falar. Seu relato ajuda a proteger um colega sem que ninguém saiba quem fez o aviso.'
    },
    {
      q: 'O que diz a Lei Brasileira sobre Bullying e Cyberbullying?',
      a: 'A Lei nº 13.185/2015 e a recente Lei nº 14.811/2024 classificam o bullying e o cyberbullying como infrações graves, exigindo que as instituições de ensino tenham medidas ativas e sigilosas de prevenção e combate à violência escolar.'
    }
  ];

  return (
    <div className="bg-[#f8f9fc] font-sans text-[#0d1c2e] min-h-screen flex flex-col pb-20">
      {/* Topbar */}
      <header className="sticky top-0 w-full z-40 bg-[#f8f9fc]/90 backdrop-blur-md border-b border-[#bcc9c6]/30">
        <div className="h-14 px-4 flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#00685f]/10 flex items-center justify-center text-[#00685f] shadow-xs ring-1 ring-[#00685f]/20">
              <span className="material-symbols-outlined text-[20px]">menu_book</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[15px] font-bold text-[#00685f] tracking-tight leading-none">
                Guia &amp; Direitos
              </span>
              <span className="text-[11px] text-[#4a5957] font-medium mt-0.5">Informações e Amparo Legal</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenDisguise}
              className="h-8 px-2.5 rounded-full bg-[#dce9ff]/60 hover:bg-[#dce9ff] text-[#3d4947] flex items-center gap-1 active:scale-95 transition-all text-xs font-semibold"
            >
              <span className="material-symbols-outlined text-[15px]">calculate</span>
              <span>Camuflar</span>
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
        {/* Banner */}
        <div className="p-4 bg-teal-50 rounded-2xl border border-teal-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#00685f] text-white flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[22px]">policy</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0d1c2e]">Você tem direito a um ambiente seguro</h3>
            <p className="text-xs text-[#4a5957] mt-0.5 leading-relaxed">
              O ambiente escolar deve ser um espaço de aprendizado, respeito e dignidade para todas as pessoas.
            </p>
          </div>
        </div>

        {/* Tipos de condutas que configuram bullying */}
        <div className="bg-white p-4 rounded-2xl border border-[#d2dedb]/40 shadow-xs space-y-3">
          <h4 className="text-xs font-bold text-[#0d1c2e] uppercase tracking-wider flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-[#00685f]">category</span>
            Formas Comuns de Bullying
          </h4>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-[#f0f4fc]">
              <div className="font-bold text-[#00685f]">Verbal e Moral</div>
              <div className="text-[#4a5957] text-[11px] mt-0.5">Apelidos pejorativos, xingamentos, piadas discriminatórias e boatos espalhados.</div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#f0f4fc]">
              <div className="font-bold text-[#00685f]">Exclusão Social e Psicológica</div>
              <div className="text-[#4a5957] text-[11px] mt-0.5">Ignorar intencionalmente, isolar de grupos de trabalho ou proibir colegas de conversarem.</div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#f0f4fc]">
              <div className="font-bold text-[#00685f]">Cyberbullying</div>
              <div className="text-[#4a5957] text-[11px] mt-0.5">Montagens, figurinhas depreciativas em grupos de WhatsApp, ataques em redes sociais ou vazamento de conversas particulares.</div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#f0f4fc]">
              <div className="font-bold text-[#ba1a1a]">Ameaça e Intimidação Física</div>
              <div className="text-[#4a5957] text-[11px] mt-0.5">Cercar na saída da escola, empurrões, danos a materiais escolares ou exigência de dinheiro/bens.</div>
            </div>
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="bg-white p-4 rounded-2xl border border-[#d2dedb]/40 shadow-xs space-y-2">
          <h4 className="text-xs font-bold text-[#0d1c2e] uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-[#00685f]">help</span>
            Dúvidas Frequentes sobre o Sigilo
          </h4>

          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="border border-[#e6eeff] rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-3 text-left font-semibold text-xs text-[#0d1c2e] flex items-center justify-between bg-[#f8f9ff] hover:bg-[#eff4ff] transition-colors"
                >
                  <span>{faq.q}</span>
                  <span className="material-symbols-outlined text-[16px] text-[#00685f]">
                    {isOpen ? 'expand_less' : 'expand_more'}
                  </span>
                </button>
                {isOpen && (
                  <div className="p-3 text-xs text-[#4a5957] leading-relaxed bg-white border-t border-[#e6eeff]">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* CTA to report */}
        <div className="text-center pt-2">
          <button
            onClick={() => onNavigateTab('relatar')}
            className="w-full py-3 rounded-xl bg-[#00685f] text-white font-bold text-xs shadow-sm hover:bg-[#005a4e] active:scale-98 transition-all flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">edit_document</span>
            <span>Registrar um Relato Protegido</span>
          </button>
        </div>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 w-full z-40 bg-[#f8f9fc]/95 backdrop-blur-lg border-t border-[#bcc9c6]/30">
        <div className="max-w-lg mx-auto flex items-center justify-around h-14 px-2">
          <button
            onClick={() => onNavigateTab('inicio')}
            className="flex flex-col items-center justify-center flex-1 py-1 text-[#4a5957] hover:text-[#0d1c2e] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[21px]">shield_with_heart</span>
            <span className="text-[11px] font-medium mt-0.5">Início</span>
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
            aria-current="page"
            className="flex flex-col items-center justify-center flex-1 py-1 text-[#00685f] font-bold transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[21px] fill-1">menu_book</span>
            <span className="text-[11px] mt-0.5">Guia</span>
          </button>
        </div>
      </nav>
    </div>
  );
};
