import React, { useState } from 'react';
import { BullyingCase, EvidenceItem } from '../types';
import { COMBATBULLYING_LOGO } from '../data/initialCases';

interface SchoolStaffViewProps {
  cases: BullyingCase[];
  selectedCaseId: string;
  onSelectCase: (id: string) => void;
  onUpdateStatus: (caseId: string, newStatus: BullyingCase['status']) => void;
  onAddHistoryNote: (caseId: string, note: string) => void;
  onStaffSendMessage: (caseId: string, text: string) => void;
  onViewEvidence: (item: EvidenceItem) => void;
  onSwitchToStudentView: () => void;
}

export const SchoolStaffView: React.FC<SchoolStaffViewProps> = ({
  cases,
  selectedCaseId,
  onSelectCase,
  onUpdateStatus,
  onAddHistoryNote,
  onStaffSendMessage,
  onViewEvidence,
  onSwitchToStudentView,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'todas' | 'urgentes' | 'cyberbullying' | 'anonimas'>('todas');
  const [sidebarMenu, setSidebarMenu] = useState('ocorrencias-e-triagem');
  const [pedagogicalNote, setPedagogicalNote] = useState('');
  const [staffMessage, setStaffMessage] = useState('');
  const [exportNotice, setExportNotice] = useState(false);

  const currentCase = cases.find((c) => c.id === selectedCaseId) || cases[0];

  // Filtering cases
  const filteredCases = cases.filter((item) => {
    const matchesSearch =
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.classOrGrade.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (activeFilter === 'urgentes') return item.urgency === 'alta';
    if (activeFilter === 'cyberbullying') return item.category === 'cyberbullying';
    if (activeFilter === 'anonimas') return item.isAnonymous;

    return true;
  });

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pedagogicalNote.trim()) return;
    onAddHistoryNote(currentCase.id, pedagogicalNote.trim());
    setPedagogicalNote('');
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffMessage.trim()) return;
    onStaffSendMessage(currentCase.id, staffMessage.trim());
    setStaffMessage('');
  };

  const handleExport = () => {
    setExportNotice(true);
    setTimeout(() => setExportNotice(false), 3000);
  };

  return (
    <div className="bg-[#f8f9ff] text-[#0d1c2e] font-sans antialiased min-h-screen flex">
      {/* Sidebar de Gestão Escolar */}
      <aside className="fixed left-0 top-0 h-full w-72 bg-white z-50 flex flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-r border-[#e6eeff]">
        <div className="flex flex-col">
          {/* Logo Brand */}
          <div className="h-16 px-6 flex items-center gap-3 bg-white border-b border-[#e6eeff]">
            <img
              alt="Combatbullying Logo"
              className="h-8 w-auto object-contain"
              src={COMBATBULLYING_LOGO}
              referrerPolicy="no-referrer"
            />
            <div className="flex flex-col">
              <span className="text-[17px] font-bold text-[#00685f] leading-tight tracking-tight">
                Combatbullying
              </span>
              <span className="text-[11px] text-[#3d4947] font-medium tracking-wide uppercase">
                Gestão Escolar
              </span>
            </div>
          </div>

          {/* Criptografia Badge */}
          <div className="px-4 py-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#eff4ff] rounded-xl text-[#00685f] text-[11px]">
              <span className="material-symbols-outlined text-[16px] text-[#00685f]">lock</span>
              <span className="font-semibold">Canal Criptografado Ponta a Ponta</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1 px-3 mt-1">
            <button
              onClick={() => setSidebarMenu('painel-geral')}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[14px] font-medium transition-colors text-left ${
                sidebarMenu === 'painel-geral'
                  ? 'bg-[#008378] text-[#f4fffc] font-semibold'
                  : 'text-[#3d4947] hover:bg-[#dce9ff] hover:text-[#0d1c2e]'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">space_dashboard</span>
              <span>Painel Geral</span>
            </button>

            <button
              onClick={() => setSidebarMenu('ocorrencias-e-triagem')}
              className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-[14px] font-medium transition-colors text-left ${
                sidebarMenu === 'ocorrencias-e-triagem'
                  ? 'bg-[#008378] text-[#f4fffc] font-semibold'
                  : 'text-[#3d4947] hover:bg-[#dce9ff] hover:text-[#0d1c2e]'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px]">inbox</span>
                <span>Ocorrências e Triagem</span>
              </div>
              <span className="flex items-center justify-center px-2 py-0.5 rounded-full bg-[#ba1a1a] text-white text-[12px] font-bold">
                {cases.length}
              </span>
            </button>

            <button
              onClick={() => setSidebarMenu('orientacoes-e-mensagens')}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[14px] font-medium transition-colors text-left ${
                sidebarMenu === 'orientacoes-e-mensagens'
                  ? 'bg-[#008378] text-[#f4fffc] font-semibold'
                  : 'text-[#3d4947] hover:bg-[#dce9ff] hover:text-[#0d1c2e]'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">chat_bubble</span>
              <span>Orientações e Mensagens</span>
            </button>

            <button
              onClick={() => setSidebarMenu('relatorios-estatisticos')}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[14px] font-medium transition-colors text-left ${
                sidebarMenu === 'relatorios-estatisticos'
                  ? 'bg-[#008378] text-[#f4fffc] font-semibold'
                  : 'text-[#3d4947] hover:bg-[#dce9ff] hover:text-[#0d1c2e]'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">analytics</span>
              <span>Relatórios Estatísticos</span>
            </button>

            <button
              onClick={() => setSidebarMenu('cartilhas-e-recursos')}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[14px] font-medium transition-colors text-left ${
                sidebarMenu === 'cartilhas-e-recursos'
                  ? 'bg-[#008378] text-[#f4fffc] font-semibold'
                  : 'text-[#3d4947] hover:bg-[#dce9ff] hover:text-[#0d1c2e]'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">menu_book</span>
              <span>Cartilhas e Recursos</span>
            </button>

            <button
              onClick={() => setSidebarMenu('configuracoes-auditoria')}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[14px] font-medium transition-colors text-left ${
                sidebarMenu === 'configuracoes-auditoria'
                  ? 'bg-[#008378] text-[#f4fffc] font-semibold'
                  : 'text-[#3d4947] hover:bg-[#dce9ff] hover:text-[#0d1c2e]'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">verified_user</span>
              <span>Configurações / Auditoria</span>
            </button>
          </nav>
        </div>

        {/* Bottom sidebar info & Switch button */}
        <div className="p-4 flex flex-col gap-2.5 border-t border-[#e6eeff]">
          <button
            onClick={onSwitchToStudentView}
            className="w-full py-2 px-3 rounded-xl bg-[#00685f]/10 hover:bg-[#00685f]/20 text-[#00685f] font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">smartphone</span>
            <span>Ver Visão do Aluno (Tela 1/2)</span>
          </button>

          <div className="p-3 bg-[#eff4ff] rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00685f] animate-pulse"></span>
              <span className="text-[12px] font-bold text-[#0d1c2e]">Protocolo Ativo</span>
            </div>
            <span className="text-[11px] text-[#6d7a77] font-semibold">LGPD + ECA</span>
          </div>
        </div>
      </aside>

      {/* Main Content Body */}
      <div className="pl-72 flex-1 flex flex-col min-w-0">
        {/* Topbar Gestão Escolar */}
        <header className="sticky top-0 h-16 bg-[#f8f9ff]/85 backdrop-blur-xl z-40 shadow-[0_1px_8px_rgba(0,0,0,0.04)] px-6 flex items-center justify-between border-b border-[#e6eeff]">
          <div className="flex items-center gap-3">
            <span className="text-[18px] text-[#0d1c2e] font-bold">Combatbullying</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#6df5e1]/40 text-[#006f64] text-[12px] font-medium">
              <span className="material-symbols-outlined text-[14px]">verified</span>
              Ambiente Seguro &amp; Sigiloso
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:flex flex-col">
                <span className="text-[13px] text-[#0d1c2e] font-semibold leading-snug">
                  Profa. Helena
                </span>
                <span className="text-[11px] text-[#6d7a77]">Orientação Pedagógica</span>
              </div>
              <div className="w-9 h-9 rounded-full bg-[#00685f]/10 text-[#00685f] flex items-center justify-center font-semibold text-sm ring-1 ring-[#00685f]/20">
                <span className="material-symbols-outlined text-[20px]">account_circle</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Workspace */}
        <main className="p-6 flex flex-col gap-6">
          {/* Top Stat Counters Bar (Exatamente como em Image 9.png) */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-xs border border-[#e6eeff] flex flex-col justify-between">
              <span className="text-[11px] text-[#6d7a77] font-semibold tracking-wide uppercase">
                Em Aberto
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-[26px] text-[#0d1c2e] font-bold leading-none">14</span>
                <span className="text-[11px] text-[#6d7a77]">casos</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-xs border border-[#e6eeff] flex flex-col justify-between">
              <span className="text-[11px] text-[#ba1a1a] font-semibold tracking-wide uppercase">
                Alta Prioridade
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-[26px] text-[#ba1a1a] font-bold leading-none">3</span>
                <span className="text-[11px] text-[#ba1a1a]/80">requer atenção</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-xs border border-[#e6eeff] flex flex-col justify-between">
              <span className="text-[11px] text-[#6d7a77] font-semibold tracking-wide uppercase">
                Em Acompanhamento
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-[26px] text-[#0d1c2e] font-bold leading-none">8</span>
                <span className="text-[11px] text-[#6d7a77]">em escuta</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-xs border border-[#e6eeff] flex flex-col justify-between">
              <span className="text-[11px] text-[#6d7a77] font-semibold tracking-wide uppercase">
                Resolvidas no Mês
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-[26px] text-[#00685f] font-bold leading-none">29</span>
                <span className="text-[11px] text-[#00685f]/80">concluídas</span>
              </div>
            </div>
          </section>

          {/* Main Split Architecture: List/Filter (Left) vs Detail/Actions (Right) */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            {/* LEFT PANEL: UC06 Visualizar e Filtrar Ocorrências (5 Cols) */}
            <aside className="xl:col-span-5 flex flex-col gap-4">
              <div className="bg-white p-4 rounded-xl shadow-xs border border-[#e6eeff] flex flex-col gap-3.5">
                {/* Search */}
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#6d7a77] text-[18px]">
                    search
                  </span>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar protocolo, série ou termo..."
                    className="w-full pl-9 pr-4 py-2 bg-[#eff4ff] rounded-lg text-[#0d1c2e] text-[13px] placeholder:text-[#6d7a77] focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#00685f] transition-all"
                  />
                </div>

                {/* Filter chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
                  <button
                    onClick={() => setActiveFilter('todas')}
                    className={`px-3 py-1 rounded-full text-[12px] font-semibold transition-colors cursor-pointer shrink-0 ${
                      activeFilter === 'todas'
                        ? 'bg-[#00685f] text-white'
                        : 'bg-[#eff4ff] text-[#3d4947] hover:bg-[#e6eeff]'
                    }`}
                  >
                    Todas ({cases.length})
                  </button>
                  <button
                    onClick={() => setActiveFilter('urgentes')}
                    className={`px-3 py-1 rounded-full text-[12px] font-semibold transition-colors cursor-pointer shrink-0 ${
                      activeFilter === 'urgentes'
                        ? 'bg-[#00685f] text-white'
                        : 'bg-[#eff4ff] text-[#3d4947] hover:bg-[#e6eeff]'
                    }`}
                  >
                    Urgentes (3)
                  </button>
                  <button
                    onClick={() => setActiveFilter('cyberbullying')}
                    className={`px-3 py-1 rounded-full text-[12px] font-semibold transition-colors cursor-pointer shrink-0 ${
                      activeFilter === 'cyberbullying'
                        ? 'bg-[#00685f] text-white'
                        : 'bg-[#eff4ff] text-[#3d4947] hover:bg-[#e6eeff]'
                    }`}
                  >
                    Cyberbullying
                  </button>
                  <button
                    onClick={() => setActiveFilter('anonimas')}
                    className={`px-3 py-1 rounded-full text-[12px] font-semibold transition-colors cursor-pointer shrink-0 ${
                      activeFilter === 'anonimas'
                        ? 'bg-[#00685f] text-white'
                        : 'bg-[#eff4ff] text-[#3d4947] hover:bg-[#e6eeff]'
                    }`}
                  >
                    Anônimas
                  </button>
                </div>

                {/* List of cases */}
                <div className="flex flex-col gap-1.5 mt-1">
                  {filteredCases.map((item) => {
                    const isSelected = item.id === currentCase.id;
                    const isHighPriority = item.urgency === 'alta';

                    return (
                      <div
                        key={item.id}
                        onClick={() => onSelectCase(item.id)}
                        className={`p-3.5 rounded-xl cursor-pointer transition-all border ${
                          isSelected
                            ? 'bg-[#eff4ff]/80 border-l-4 border-l-[#00685f] border-t-transparent border-r-transparent border-b-transparent shadow-xs'
                            : 'hover:bg-[#eff4ff]/50 border-transparent'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-[13px] font-bold ${isSelected ? 'text-[#00685f]' : 'text-[#0d1c2e]'}`}>
                            {item.id}
                          </span>
                          <span className="text-[11px] text-[#6d7a77]">{item.timeAgo}</span>
                        </div>

                        <h3 className="text-[14px] font-semibold text-[#0d1c2e] mt-1 leading-snug">
                          {item.title}
                        </h3>

                        <p className="text-[13px] text-[#3d4947] line-clamp-2 mt-1 leading-relaxed">
                          {item.summary}
                        </p>

                        <div className="mt-2.5 flex items-center justify-between text-[#3d4947] text-[11px] pt-1">
                          <span className="text-[#6d7a77]">
                            {item.classOrGrade} • {item.isAnonymous ? 'Anônimo' : item.authorName}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full font-medium text-[11px] ${
                              isHighPriority
                                ? 'bg-[#ffdad6] text-[#93000a]'
                                : item.status === 'triagem'
                                ? 'bg-[#6df5e1]/40 text-[#006f64]'
                                : 'bg-[#e6eeff] text-[#3d4947]'
                            }`}
                          >
                            {isHighPriority ? 'Alta Prioridade' : item.statusLabel}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                <div className="pt-2 flex items-center justify-between text-[11px] text-[#6d7a77] border-t border-[#d5e3fc]/60">
                  <span>{cases.length} relatos ativos</span>
                  <div className="flex items-center gap-1">
                    <button className="w-6 h-6 rounded flex items-center justify-center hover:bg-[#e6eeff] cursor-pointer">
                      <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                    </button>
                    <span className="font-semibold text-[#00685f] px-1">1 / 4</span>
                    <button className="w-6 h-6 rounded flex items-center justify-center hover:bg-[#e6eeff] cursor-pointer">
                      <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                    </button>
                  </div>
                </div>
              </div>
            </aside>

            {/* RIGHT PANEL: Detailed Active Case Panel (STN-2024-8942) (7 Cols) */}
            <section className="xl:col-span-7 flex flex-col gap-4">
              <div className="bg-white p-6 rounded-xl shadow-xs border border-[#e6eeff] flex flex-col gap-6">
                {/* Header Case Details */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#dce9ff] pb-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-[20px] text-[#0d1c2e] font-bold">
                        Protocolo #{currentCase.id}
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#6df5e1]/30 text-[#006f64] text-[12px] font-medium">
                        {currentCase.isAnonymous ? '100% Anônimo' : 'Identificado'}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#6d7a77]">
                      Registrado em {currentCase.createdAtFormatted} • Urgência{' '}
                      {currentCase.urgency === 'alta' ? 'Alta' : 'Moderada/Alta'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <select
                        value={currentCase.status}
                        onChange={(e) => onUpdateStatus(currentCase.id, e.target.value as any)}
                        className="appearance-none bg-[#eff4ff] py-1.5 pl-3 pr-8 rounded-lg text-[13px] font-semibold text-[#00685f] focus:outline-none focus:ring-1 focus:ring-[#00685f] cursor-pointer"
                      >
                        <option value="triagem">Em Triagem Pedagógica</option>
                        <option value="acolhimento">Em Acolhimento</option>
                        <option value="concluido">Finalizado com Segurança</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[18px] text-[#00685f] pointer-events-none">
                        expand_more
                      </span>
                    </div>

                    <button
                      onClick={handleExport}
                      className="px-3 py-1.5 rounded-lg bg-[#eff4ff] hover:bg-[#e6eeff] text-[#0d1c2e] text-[12px] font-medium transition-colors flex items-center gap-1 cursor-pointer"
                      title="Exportar dossiê pedagógico anônimo em PDF"
                    >
                      <span className="material-symbols-outlined text-[16px] text-[#6d7a77]">
                        picture_as_pdf
                      </span>
                      Exportar
                    </button>

                    <button
                      onClick={() => onUpdateStatus(currentCase.id, 'acolhimento')}
                      className="px-3 py-1.5 rounded-lg bg-[#eff4ff] hover:bg-[#e6eeff] text-[#0d1c2e] text-[12px] font-medium transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px] text-[#6d7a77]">group</span>
                      Acolhimento
                    </button>
                  </div>
                </div>

                {exportNotice && (
                  <div className="p-2.5 bg-teal-50 border border-teal-200 text-[#00685f] rounded-lg text-xs flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    <span>Dossiê pedagógico seguro #{currentCase.id} gerado com metadados anonimizados.</span>
                  </div>
                )}

                {/* Transcrição do Relato */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-bold text-[#0d1c2e] uppercase tracking-wide">
                      Transcrição do Relato
                    </span>
                    <span className="text-[11px] text-[#6d7a77]">Protegido por sigilo escolar</span>
                  </div>

                  <div className="p-4 bg-[#eff4ff]/50 rounded-xl text-[#0d1c2e] text-[15px] leading-relaxed border border-[#e6eeff]/60">
                    <p className="italic text-[#3d4947]">"{currentCase.details}"</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-[#3d4947] pt-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#6d7a77]">Papel:</span>
                      <span className="font-semibold text-[#0d1c2e]">{currentCase.roleLabel}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#6d7a77]">Turma:</span>
                      <span className="font-semibold text-[#0d1c2e]">{currentCase.classOrGrade}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#6d7a77]">Canal:</span>
                      <span className="font-semibold text-[#0d1c2e]">{currentCase.channel}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#6d7a77]">Identidade:</span>
                      <span className="font-semibold text-[#00685f]">
                        {currentCase.isAnonymous ? 'Criptografada' : currentCase.authorName}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Evidências Anexadas */}
                <div className="flex flex-col gap-2">
                  <span className="text-[13px] font-bold text-[#0d1c2e] uppercase tracking-wide">
                    Evidências Anexadas ({currentCase.evidence.length})
                  </span>

                  {currentCase.evidence.length === 0 ? (
                    <div className="p-3 bg-[#eff4ff]/40 rounded-xl text-xs text-[#6d7a77] italic">
                      Nenhuma evidência digital anexada a este relato.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {currentCase.evidence.map((ev) => (
                        <div
                          key={ev.id}
                          className="p-3 bg-[#eff4ff]/60 rounded-xl flex items-center justify-between gap-3 hover:bg-[#eff4ff] transition-colors border border-[#e6eeff]/70"
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <span className="w-9 h-9 rounded-lg bg-[#e6eeff] flex items-center justify-center text-[#00685f]">
                              <span className="material-symbols-outlined text-[20px]">
                                {ev.type === 'image' ? 'image' : 'graphic_eq'}
                              </span>
                            </span>
                            <div className="flex flex-col truncate">
                              <span className="text-[12px] font-semibold text-[#0d1c2e] truncate">
                                {ev.name}
                              </span>
                              <span className="text-[11px] text-[#6d7a77]">{ev.size}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => onViewEvidence(ev)}
                            className="text-[12px] font-bold text-[#00685f] hover:underline px-2 cursor-pointer shrink-0"
                            type="button"
                          >
                            {ev.type === 'image' ? 'Ver' : 'Ouvir'}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Histórico Pedagógico */}
                <div className="flex flex-col gap-3 border-t border-[#dce9ff] pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-bold text-[#0d1c2e] uppercase tracking-wide">
                      Histórico Pedagógico
                    </span>
                    <span className="text-[11px] text-[#6d7a77]">Acesso restrito</span>
                  </div>

                  <div className="relative pl-5 flex flex-col gap-3 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-px before:bg-[#d5e3fc]">
                    {currentCase.history.map((hist) => (
                      <div key={hist.id} className="relative flex flex-col">
                        <span className="absolute -left-5 top-1.5 w-3 h-3 rounded-full bg-[#00685f] flex items-center justify-center ring-2 ring-white"></span>
                        <div className="flex items-baseline justify-between">
                          <span className="text-[12px] font-bold text-[#0d1c2e]">{hist.title}</span>
                          <span className="text-[11px] text-[#6d7a77]">{hist.date}</span>
                        </div>
                        <p className="text-[13px] text-[#3d4947] mt-0.5">
                          {hist.author && <strong className="text-[#0d1c2e] font-semibold">{hist.author}: </strong>}
                          {hist.note}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Add note */}
                  <form onSubmit={handleSaveNote} className="flex flex-col gap-2 mt-1">
                    <textarea
                      value={pedagogicalNote}
                      onChange={(e) => setPedagogicalNote(e.target.value)}
                      placeholder="Registrar nova anotação ou providência pedagógica..."
                      rows={2}
                      className="w-full p-2.5 bg-[#eff4ff] rounded-lg text-[#0d1c2e] text-[13px] placeholder:text-[#6d7a77] focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#00685f] transition-all resize-none border border-transparent focus:border-[#00685f]/30"
                    ></textarea>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-3.5 py-1.5 rounded-lg bg-[#00685f] text-white text-[12px] font-semibold hover:bg-[#008378] transition-colors shadow-xs cursor-pointer"
                      >
                        Salvar Parecer
                      </button>
                    </div>
                  </form>
                </div>

                {/* Comunicação Segura com o Aluno */}
                <div className="flex flex-col gap-3 border-t border-[#dce9ff] pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-bold text-[#0d1c2e] uppercase tracking-wide">
                      Comunicação Segura com o Aluno
                    </span>
                    <span className="text-[11px] text-[#6d7a77] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px] text-[#00685f]">lock</span>
                      Ponta a ponta
                    </span>
                  </div>

                  <div className="flex flex-col gap-2 p-3 bg-[#eff4ff]/50 rounded-xl border border-[#e6eeff]">
                    {currentCase.messages.map((m) => {
                      const isStaff = m.sender === 'staff';
                      return isStaff ? (
                        <div key={m.id} className="flex flex-col gap-1 max-w-[85%] self-end">
                          <div className="p-3 rounded-2xl rounded-tr-xs bg-[#00685f] text-white text-[13px] leading-relaxed shadow-xs">
                            {m.text}
                          </div>
                          <span className="text-[10px] text-[#6d7a77] self-end">{m.time} • Entregue em sigilo</span>
                        </div>
                      ) : (
                        <div key={m.id} className="flex flex-col gap-1 max-w-[85%] self-start">
                          <div className="p-3 rounded-2xl rounded-tl-xs bg-white text-[#0d1c2e] text-[13px] leading-relaxed shadow-xs border border-[#e6eeff]">
                            {m.text}
                          </div>
                          <span className="text-[10px] text-[#6d7a77]">{m.time}</span>
                        </div>
                      );
                    })}
                  </div>

                  <form onSubmit={handleSendMessage} className="relative">
                    <textarea
                      value={staffMessage}
                      onChange={(e) => setStaffMessage(e.target.value)}
                      placeholder="Enviar mensagem segura ao aluno..."
                      rows={2}
                      className="w-full p-2.5 pr-12 bg-[#eff4ff] rounded-xl text-[#0d1c2e] text-[13px] placeholder:text-[#6d7a77] focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#00685f] transition-all resize-none border border-transparent focus:border-[#00685f]/30"
                    ></textarea>
                    <button
                      type="submit"
                      title="Enviar"
                      className="absolute right-2.5 bottom-2.5 p-1.5 rounded-lg bg-[#00685f] text-white hover:bg-[#008378] transition-colors flex items-center justify-center cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">send</span>
                    </button>
                  </form>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};
