export interface EvidenceItem {
  id: string;
  name: string;
  size: string;
  type: 'image' | 'audio';
  url?: string;
  duration?: string;
}

export interface PedagogicalHistoryEntry {
  id: string;
  title: string;
  date: string;
  author?: string;
  note: string;
}

export interface CaseMessage {
  id: string;
  sender: 'student' | 'staff';
  text: string;
  time: string;
  read?: boolean;
}

export interface BullyingCase {
  id: string; // e.g. "STN-2024-8942"
  title: string;
  category: 'verbal' | 'exclusao' | 'cyberbullying' | 'agressao' | 'outro';
  categoryLabel: string;
  summary: string;
  details: string;
  createdAtFormatted: string;
  updatedAtFormatted: string;
  timeAgo: string;
  urgency: 'baixa' | 'moderada' | 'alta';
  status: 'recebido' | 'triagem' | 'acolhimento' | 'concluido';
  statusLabel: string;
  role: 'vitima' | 'testemunha';
  roleLabel: string;
  classOrGrade: string;
  channel: string;
  isAnonymous: boolean;
  authorName?: string;
  dateOfIncident?: string;
  location?: string;
  evidence: EvidenceItem[];
  history: PedagogicalHistoryEntry[];
  messages: CaseMessage[];
}

export type ActiveTab = 'inicio' | 'relatar' | 'protocolos' | 'guia';
export type AppMode = 'student-tracking' | 'student-report' | 'school-staff';
