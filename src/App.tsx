import { useState } from 'react';
import { BullyingCase, EvidenceItem, AppMode, ActiveTab } from './types';
import { INITIAL_CASES } from './data/initialCases';
import { StudentTrackingView } from './components/StudentTrackingView';
import { StudentReportView } from './components/StudentReportView';
import { SchoolStaffView } from './components/SchoolStaffView';
import { StudentHomeView } from './components/StudentHomeView';
import { StudentGuideView } from './components/StudentGuideView';
import { DisguiseCalculator } from './components/DisguiseCalculator';
import { SosModal } from './components/SosModal';
import { EvidenceModal } from './components/EvidenceModal';
import { TopModeBar } from './components/TopModeBar';

export default function App() {
  const [cases, setCases] = useState<BullyingCase[]>(INITIAL_CASES);
  const [selectedCaseId, setSelectedCaseId] = useState<string>('STN-2024-8942');
  const [appMode, setAppMode] = useState<AppMode>('student-tracking');
  const [studentTab, setStudentTab] = useState<ActiveTab>('protocolos');
  const [isDisguised, setIsDisguised] = useState<boolean>(false);
  const [isSosOpen, setIsSosOpen] = useState<boolean>(false);
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceItem | null>(null);

  const currentCase = cases.find((c) => c.id === selectedCaseId) || cases[0];

  // Send message from student
  const handleStudentSendMessage = (caseId: string, text: string) => {
    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: 'student' as const,
      text,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      read: true,
    };

    setCases((prev) =>
      prev.map((c) => (c.id === caseId ? { ...c, messages: [...c.messages, newMsg] } : c))
    );
  };

  // Send message from staff
  const handleStaffSendMessage = (caseId: string, text: string) => {
    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: 'staff' as const,
      text,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      read: true,
    };

    setCases((prev) =>
      prev.map((c) => (c.id === caseId ? { ...c, messages: [...c.messages, newMsg] } : c))
    );
  };

  // Update case status
  const handleUpdateStatus = (caseId: string, newStatus: BullyingCase['status']) => {
    const statusLabels: Record<BullyingCase['status'], string> = {
      recebido: 'Relato Recebido',
      triagem: 'Em Triagem Pedagógica',
      acolhimento: 'Em Acolhimento',
      concluido: 'Finalizado com Segurança',
    };

    setCases((prev) =>
      prev.map((c) =>
        c.id === caseId
          ? {
              ...c,
              status: newStatus,
              statusLabel: statusLabels[newStatus],
              updatedAtFormatted: `Atualizado hoje às ${new Date().toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
              })}`,
            }
          : c
      )
    );
  };

  // Add history entry
  const handleAddHistoryNote = (caseId: string, note: string) => {
    const newHist = {
      id: `hist-${Date.now()}`,
      title: 'Parecer Pedagógico Registrado',
      date: `Hoje ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
      author: 'Profa. Helena',
      note,
    };

    setCases((prev) =>
      prev.map((c) => (c.id === caseId ? { ...c, history: [...c.history, newHist] } : c))
    );
  };

  // New report creation from student
  const handleNewReport = (
    newCaseData: Omit<
      BullyingCase,
      'id' | 'createdAtFormatted' | 'updatedAtFormatted' | 'timeAgo' | 'status' | 'statusLabel' | 'history' | 'messages'
    >
  ) => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newId = `STN-2024-${randomSuffix}`;

    const createdCase: BullyingCase = {
      ...newCaseData,
      id: newId,
      createdAtFormatted: `${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      })}`,
      updatedAtFormatted: `Hoje às ${new Date().toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      })}`,
      timeAgo: 'Agora mesmo',
      status: 'triagem',
      statusLabel: 'Em Triagem Pedagógica',
      history: [
        {
          id: `hist-${Date.now()}`,
          title: 'Relato Recebido e Anonimizado',
          date: 'Agora mesmo',
          note: 'Higienização de dados e proteção da fonte ativadas.',
        },
      ],
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: 'staff',
          text: 'Olá! Recebemos seu relato e já estamos acompanhando com total discrição e cuidado. Fique tranquilo(a).',
          time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          read: true,
        },
      ],
    };

    setCases((prev) => [createdCase, ...prev]);
    setSelectedCaseId(newId);
    return newId;
  };

  const handleSelectMode = (mode: AppMode) => {
    setAppMode(mode);
    if (mode === 'student-tracking') {
      setStudentTab('protocolos');
    } else if (mode === 'student-report') {
      setStudentTab('relatar');
    }
  };

  const handleStudentNavigateTab = (tab: ActiveTab) => {
    setStudentTab(tab);
    if (tab === 'protocolos') {
      setAppMode('student-tracking');
    } else if (tab === 'relatar') {
      setAppMode('student-report');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0d1c2e]">
      {/* Top mode bar for reviewer/user convenience */}
      <TopModeBar
        currentMode={appMode}
        onSelectMode={handleSelectMode}
        onOpenDisguise={() => setIsDisguised(true)}
        onOpenSos={() => setIsSosOpen(true)}
      />

      {/* Disguise screen (functional secret calculator) */}
      {isDisguised && (
        <DisguiseCalculator onClose={() => setIsDisguised(false)} />
      )}

      {/* Emergency SOS modal */}
      <SosModal
        isOpen={isSosOpen}
        onClose={() => setIsSosOpen(false)}
      />

      {/* Evidence preview modal */}
      <EvidenceModal
        item={selectedEvidence}
        onClose={() => setSelectedEvidence(null)}
      />

      {/* Render Main App Views */}
      {appMode === 'school-staff' ? (
        <SchoolStaffView
          cases={cases}
          selectedCaseId={selectedCaseId}
          onSelectCase={setSelectedCaseId}
          onUpdateStatus={handleUpdateStatus}
          onAddHistoryNote={handleAddHistoryNote}
          onStaffSendMessage={handleStaffSendMessage}
          onViewEvidence={setSelectedEvidence}
          onSwitchToStudentView={() => handleSelectMode('student-tracking')}
        />
      ) : studentTab === 'inicio' ? (
        <StudentHomeView
          onNavigateTab={handleStudentNavigateTab}
          onOpenDisguise={() => setIsDisguised(true)}
          onOpenSos={() => setIsSosOpen(true)}
          onOpenStaffView={() => setAppMode('school-staff')}
          activeProtocolId={selectedCaseId}
        />
      ) : studentTab === 'guia' ? (
        <StudentGuideView
          onNavigateTab={handleStudentNavigateTab}
          onOpenDisguise={() => setIsDisguised(true)}
          onOpenSos={() => setIsSosOpen(true)}
        />
      ) : studentTab === 'relatar' || appMode === 'student-report' ? (
        <StudentReportView
          onNewReport={handleNewReport}
          onOpenDisguise={() => setIsDisguised(true)}
          onOpenSos={() => setIsSosOpen(true)}
          onNavigateTab={handleStudentNavigateTab}
          onOpenStaffView={() => setAppMode('school-staff')}
        />
      ) : (
        <StudentTrackingView
          currentCase={currentCase}
          onSendMessage={handleStudentSendMessage}
          onOpenDisguise={() => setIsDisguised(true)}
          onOpenSos={() => setIsSosOpen(true)}
          onNavigateTab={handleStudentNavigateTab}
          onOpenStaffView={() => setAppMode('school-staff')}
        />
      )}
    </div>
  );
}
