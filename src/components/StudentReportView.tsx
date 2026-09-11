import React, { useState } from 'react';
import { BullyingCase } from '../types';

interface StudentReportViewProps {
  onNewReport: (newCase: Omit<BullyingCase, 'id' | 'createdAtFormatted' | 'updatedAtFormatted' | 'timeAgo' | 'status' | 'statusLabel' | 'history' | 'messages'>) => string;
  onOpenDisguise: () => void;
  onOpenSos: () => void;
  onNavigateTab: (tab: 'inicio' | 'relatar' | 'protocolos' | 'guia') => void;
  onOpenStaffView?: () => void;
}

export const StudentReportView: React.FC<StudentReportViewProps> = ({
  onNewReport,
  onOpenDisguise,
  onOpenSos,
  onNavigateTab,
  onOpenStaffView,
}) => {
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [authorName, setAuthorName] = useState('');
  const [role, setRole] = useState<'vitima' | 'testemunha'>('vitima');
  const [category, setCategory] = useState<'verbal' | 'exclusao' | 'cyberbullying' | 'agressao' | 'outro'>('verbal');
  const [details, setDetails] = useState('');
  const [location, setLocation] = useState('');
  const [dateOfIncident, setDateOfIncident] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<Array<{ name: string; size: string }>>([]);

  // Modal confirmation
  const [createdProtocol, setCreatedProtocol] = useState<string | null>(null);

  const categories = [
    { id: 'verbal', label: 'Verbal / Apelidos' },
    { id: 'exclusao', label: 'Exclusão Social' },
    { id: 'cyberbullying', label: 'Virtual / Cyberbullying' },
    { id: 'agressao', label: 'Agressão ou Ameaça' },
    { id: 'outro', label: 'Outro tipo' },
  ] as const;

  const handleAttachMock = () => {
    // Simulated upload of evidence without EXIF
    const sampleFiles = [
      { name: 'print_conversa_sigilosa.png', size: '1.2 MB' },
      { name: 'gravacao_audio_intervalo.m4a', size: '0:35' },
    ];
    const pick = sampleFiles[attachedFiles.length % sampleFiles.length];
    setAttachedFiles([...attachedFiles, pick]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.trim()) {
      alert('Por favor, descreva brevemente o que aconteceu no campo de detalhes.');
      return;
    }

    const catObj = categories.find((c) => c.id === category);

    const generatedId = onNewReport({
      title: `${catObj?.label || 'Ocorrência'} - ${location || 'Ambiente Escolar'}`,
      category,
      categoryLabel: catObj?.label || 'Geral',
      summary: details.length > 80 ? details.slice(0, 80) + '...' : details,
      details: details.trim(),
      urgency: category === 'agressao' ? 'alta' : 'moderada',
      role,
      roleLabel: role === 'vitima' ? 'Eu sou a vítima' : 'Testemunha',
      classOrGrade: location || 'Não especificada',
      channel: category === 'cyberbullying' ? 'Digital (Redes/Apps)' : 'Presencial',
      isAnonymous,
      authorName: isAnonymous ? undefined : authorName || 'Aluno Identificado',
      location,
      dateOfIncident,
      evidence: attachedFiles.map((f, i) => ({
        id: `att-${Date.now()}-${i}`,
        name: f.name,
        size: `${f.size} • Metadados limpos`,
        type: f.name.includes('.m4a') ? 'audio' : 'image',
      })),
    });

    setCreatedProtocol(generatedId);
  };

  return (
    <div className="bg-[#f8f9fc] font-sans text-[#0d1c2e] antialiased flex flex-col min-h-screen relative pb-20">
      {/* Header Superior Limpo e Seguro */}
      <header className="sticky top-0 w-full z-40 bg-[#f8f9fc]/90 backdrop-blur-md border-b border-[#bcc9c6]/30">
        <div className="h-14 px-4 flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#00685f]/10 flex items-center justify-center text-[#00685f] shadow-xs ring-1 ring-[#00685f]/20">
              <span className="material-symbols-outlined text-[20px]">shield_person</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[15px] font-bold text-[#00685f] tracking-tight leading-none">Combatbullying</span>
              <span className="text-[11px] text-[#4a5957] font-medium mt-0.5">Canal Seguro &amp; Sigiloso</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenDisguise}
              className="h-8 px-2.5 rounded-full bg-[#dce9ff]/60 hover:bg-[#dce9ff] text-[#3d4947] flex items-center gap-1 active:scale-95 transition-all text-xs font-semibold"
              title="Camuflar com Calculadora"
            >
              <span className="material-symbols-outlined text-[15px]">calculate</span>
              <span className="hidden sm:inline">Camuflar</span>
            </button>

            <button
              type="button"
              onClick={onOpenSos}
              aria-label="Camuflar / S.O.S"
              className="h-8 px-2.5 rounded-full bg-red-50 text-[#ba1a1a] flex items-center gap-1 border border-red-100 hover:bg-red-100 active:scale-95 transition-all text-xs font-semibold cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px] fill-1">emergency</span>
              <span>S.O.S</span>
            </button>

            <button
              type="button"
              aria-label="Perfil do usuário"
              className="w-8 h-8 rounded-full bg-[#f0f4fc] text-[#4a5957] flex items-center justify-center ring-1 ring-[#d2dedb]/40 active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-[18px]">person</span>
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal do Formulário */}
      <main className="flex-1 w-full max-w-lg mx-auto pt-3 pb-24 px-4 flex flex-col space-y-4">
        {/* Card de Boas-vindas / Acolhimento */}
        <div className="bg-gradient-to-br from-teal-50/80 to-white p-4 rounded-2xl border border-teal-100/60 shadow-[0_2px_8px_-2px_rgba(0,104,95,0.06)] flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-[#00685f] text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
            <span className="material-symbols-outlined text-[18px]">favorite</span>
          </div>
          <div>
            <h1 className="text-[17px] font-bold text-[#0d1c2e] leading-snug">Você não está só</h1>
            <p className="text-[13px] text-[#4a5957] mt-0.5 leading-relaxed">
              Relate com tranquilidade. Toda informação recebida é tratada com sigilo absoluto e cuidado humanizado.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Seção 1: Privacidade e Identificação */}
          <section className="bg-white p-4 rounded-2xl border border-[#d2dedb]/40 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[13px] font-bold text-[#0d1c2e] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#00685f] text-[17px]">verified_user</span>
                Como prefere se apresentar?
              </label>
            </div>

            {/* Seletor em formato de 2 botões elegantes */}
            <div className="grid grid-cols-2 gap-2" id="privacy-group">
              <button
                type="button"
                onClick={() => setIsAnonymous(true)}
                className={`p-3 rounded-xl flex flex-col items-start transition-all active:scale-[0.98] cursor-pointer text-left ${
                  isAnonymous
                    ? 'border-2 border-[#00685f] bg-[#00685f]/5'
                    : 'border border-[#d2dedb]/60 bg-white text-[#4a5957] hover:border-[#7a8a87]'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`text-[13px] font-bold ${isAnonymous ? 'text-[#00685f]' : 'text-[#0d1c2e]'}`}>
                    Anônimo
                  </span>
                  {isAnonymous && (
                    <span className="material-symbols-outlined text-[18px] text-[#00685f]">check_circle</span>
                  )}
                </div>
                <span className="text-[11px] text-teal-800/80 font-medium mt-0.5 leading-tight">
                  Recomendado • Sem rastros
                </span>
              </button>

              <button
                type="button"
                onClick={() => setIsAnonymous(false)}
                className={`p-3 rounded-xl flex flex-col items-start transition-all active:scale-[0.98] cursor-pointer text-left ${
                  !isAnonymous
                    ? 'border-2 border-[#00685f] bg-[#00685f]/5'
                    : 'border border-[#d2dedb]/60 bg-white text-[#4a5957] hover:border-[#7a8a87]'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`text-[13px] font-semibold ${!isAnonymous ? 'text-[#00685f] font-bold' : 'text-[#0d1c2e]'}`}>
                    Identificado
                  </span>
                  {!isAnonymous && (
                    <span className="material-symbols-outlined text-[18px] text-[#00685f]">check_circle</span>
                  )}
                </div>
                <span className="text-[11px] text-[#4a5957] mt-0.5 leading-tight">Para contato de retorno</span>
              </button>
            </div>

            {!isAnonymous && (
              <div className="pt-1">
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Seu nome completo e turma para contato..."
                  className="w-full bg-[#f0f4fc] text-[#0d1c2e] text-[13px] rounded-lg p-2.5 border border-[#d2dedb]/60 focus:border-[#00685f] outline-none"
                />
              </div>
            )}

            <p className="text-[11.5px] text-[#4a5957]/90 leading-normal flex items-center gap-1.5 pt-0.5">
              <span className="material-symbols-outlined text-[14px] text-[#00685f] shrink-0">lock</span>
              <span>Garantia de proteção legal e sigilo profissional pedagógico.</span>
            </p>

            {/* Papel no Acontecimento */}
            <div className="pt-2 border-t border-[#d2dedb]/30 space-y-2">
              <span className="text-[12px] font-semibold text-[#4a5957] block">Seu papel no ocorrido:</span>
              <div className="grid grid-cols-2 gap-2" id="role-group">
                <button
                  type="button"
                  onClick={() => setRole('vitima')}
                  className={`py-2.5 px-3 rounded-xl font-medium text-[13px] flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer ${
                    role === 'vitima'
                      ? 'bg-[#00685f] text-white shadow-xs'
                      : 'bg-[#f0f4fc] text-[#0d1c2e] border border-[#d2dedb]/40 hover:bg-[#e6eeff]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[17px]">person</span>
                  <span>Eu sou a vítima</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('testemunha')}
                  className={`py-2.5 px-3 rounded-xl font-medium text-[13px] flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
                    role === 'testemunha'
                      ? 'bg-[#00685f] text-white shadow-xs'
                      : 'bg-[#f0f4fc] text-[#0d1c2e] border border-[#d2dedb]/40 hover:bg-[#e6eeff]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[17px] text-[#4a5957]">visibility</span>
                  <span>Sou testemunha</span>
                </button>
              </div>
            </div>
          </section>

          {/* Seção 2: Tipo de Ocorrência (Chips Modernos) */}
          <section className="bg-white p-4 rounded-2xl border border-[#d2dedb]/40 shadow-xs space-y-2.5">
            <label className="text-[13px] font-bold text-[#0d1c2e] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#00685f] text-[17px]">label</span>
              O que aconteceu? <span className="text-[11px] font-normal text-[#4a5957]">(Selecione o tipo)</span>
            </label>
            <div className="flex flex-wrap gap-2 pt-0.5" id="tags-container">
              {categories.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#e0f2ee] text-[#004d44] ring-1 ring-[#00685f]/20 font-semibold'
                        : 'bg-[#f0f4fc] text-[#4a5957] hover:text-[#0d1c2e]'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Seção 3: Relato Detalhado e Convidativo */}
          <section className="bg-white p-4 rounded-2xl border border-[#d2dedb]/40 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[13px] font-bold text-[#0d1c2e] flex items-center gap-1.5" htmlFor="desc-field">
                <span className="material-symbols-outlined text-[#00685f] text-[17px]">edit_note</span>
                Conte os detalhes
              </label>
              <span className="text-[11px] text-[#4a5957]/80 font-medium" id="char-counter">
                {details.length}/1500
              </span>
            </div>

            <div className="relative">
              <textarea
                id="desc-field"
                rows={4}
                maxLength={1500}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Conte com calma o que aconteceu, quem estava envolvido ou como você se sentiu..."
                className="w-full bg-[#f0f4fc]/70 text-[#0d1c2e] placeholder:text-[#4a5957]/60 text-[13.5px] rounded-xl p-3 border border-[#d2dedb]/40 focus:border-[#00685f] focus:bg-white focus:ring-1 focus:ring-[#00685f] outline-none transition-all resize-none"
              ></textarea>
            </div>

            {/* Onde e Quando Compactos (Linha Única) */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <label className="text-[11px] font-medium text-[#4a5957] block mb-1" htmlFor="local-input">
                  Local ou Turma (opcional)
                </label>
                <div className="relative">
                  <input
                    id="local-input"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Ex: Sala 9, Recreio"
                    className="w-full bg-[#f0f4fc]/60 text-[#0d1c2e] text-[12.5px] rounded-lg py-2 px-2.5 border border-[#d2dedb]/40 focus:border-[#00685f] focus:bg-white outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-[#4a5957] block mb-1" htmlFor="date-input">
                  Quando foi? (opcional)
                </label>
                <div className="relative">
                  <input
                    id="date-input"
                    type="text"
                    value={dateOfIncident}
                    onChange={(e) => setDateOfIncident(e.target.value)}
                    placeholder="Ex: Ontem no intervalo"
                    className="w-full bg-[#f0f4fc]/60 text-[#0d1c2e] text-[12.5px] rounded-lg py-2 px-2.5 border border-[#d2dedb]/40 focus:border-[#00685f] focus:bg-white outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Seção 4: Anexos Compactos (Fotos/Áudios) */}
          <section className="bg-white p-3.5 rounded-2xl border border-[#d2dedb]/40 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12.5px] font-semibold text-[#0d1c2e] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#00685f] text-[17px]">attach_file</span>
                Evidências ou Prints <span className="text-[11px] font-normal text-[#4a5957]">(opcional)</span>
              </span>
              <span className="text-[11px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">shield</span> Sem EXIF
              </span>
            </div>

            <button
              type="button"
              onClick={handleAttachMock}
              className="w-full py-3 px-3 rounded-xl border border-dashed border-[#00685f]/40 bg-teal-50/40 hover:bg-teal-50 text-[#00685f] flex items-center justify-center gap-2 transition-colors active:scale-[0.99] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[19px]">add_photo_alternate</span>
              <span className="text-[12.5px] font-semibold">Toque para anexar prints, áudio ou fotos</span>
            </button>

            {attachedFiles.length > 0 && (
              <div className="mt-2 space-y-1.5">
                {attachedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-[#f0f4fc] text-xs text-[#0d1c2e]"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="material-symbols-outlined text-[16px] text-[#00685f]">check_circle</span>
                      <span className="truncate">{file.name}</span>
                    </div>
                    <span className="text-[11px] text-gray-500">{file.size}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Botão de Envio e Aviso de Confirmação */}
          <div className="pt-1 pb-2 space-y-2.5">
            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl bg-[#00685f] hover:bg-[#005a4e] text-white font-bold text-[14.5px] shadow-[0_4px_16px_rgba(0,104,95,0.25)] flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">send</span>
              <span>Enviar Relato Seguro</span>
            </button>

            <p className="text-center text-[11.5px] text-[#4a5957] flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-[15px] text-teal-700">pin</span>
              <span>Você receberá um código de protocolo para acompanhar a resposta.</span>
            </p>
          </div>
        </form>

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
      </main>

      {/* Modal de Confirmação & Protocolo (exatamente como em Image 7.png) */}
      {createdProtocol && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl p-5 max-w-xs w-full shadow-2xl space-y-4 text-center border border-[#d2dedb]/30">
            <div className="w-12 h-12 rounded-full bg-teal-50 text-[#00685f] flex items-center justify-center mx-auto ring-8 ring-teal-50/50">
              <span className="material-symbols-outlined text-[26px]">task_alt</span>
            </div>
            <div className="space-y-1">
              <h3 className="text-[17px] font-bold text-[#0d1c2e]">Relato Registrado!</h3>
              <p className="text-[12.5px] text-[#4a5957] leading-relaxed">
                Seu relato está sob custódia segura. Guarde seu protocolo único:
              </p>
            </div>
            <div className="bg-[#f0f4fc] p-3 rounded-xl border border-[#d2dedb]/40">
              <div className="text-[18px] font-bold text-[#00685f] tracking-widest font-mono">
                #{createdProtocol}
              </div>
              <span className="text-[10px] font-semibold text-[#00685f] uppercase tracking-wider block mt-0.5">
                Salvo e Protegido
              </span>
            </div>
            <button
              onClick={() => {
                setCreatedProtocol(null);
                onNavigateTab('protocolos');
              }}
              className="w-full py-2.5 rounded-xl bg-[#00685f] text-white text-[13px] font-semibold active:scale-95 transition-transform cursor-pointer"
            >
              Acompanhar Protocolo
            </button>
          </div>
        </div>
      )}

      {/* Barra de Navegação Inferior Padrão (4 abas) */}
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
            aria-current="page"
            className="flex flex-col items-center justify-center flex-1 py-1 text-[#00685f] font-bold transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[21px] fill-1">edit_document</span>
            <span className="text-[11px] mt-0.5">Relatar</span>
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
