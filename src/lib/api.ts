export interface TeamUser {
  id: number;
  username: string;
  display_name: string;
  role: 'admin' | 'operator';
  active: boolean;
}

export interface ProtocolAttachment {
  id: number;
  file_name: string;
  content_type: string;
  file_size: number;
  created_at: string;
}

export interface ProtocolMessage {
  sender_role: 'reporter' | 'staff';
  message: string;
  created_at: string;
}

export interface TreatmentStep {
  status: string;
  notes: string;
  created_at: string;
  actor_name: string | null;
  assigned_name: string | null;
}

export interface Protocol {
  id: number;
  protocol_code: string;
  privacy: 'anon' | 'identified';
  reporter_name: string | null;
  reporter_email: string | null;
  reporter_phone: string | null;
  role: 'victim' | 'witness';
  aggression_type: string;
  occurred_date: string;
  occurred_time: string;
  location: string;
  class_series: string;
  report: string;
  status: string;
  assigned_to: number | null;
  assigned_name: string | null;
  treatment_notes: string;
  created_at: string;
  updated_at: string;
  attachments: ProtocolAttachment[];
  treatment_steps?: TreatmentStep[];
}

export interface ReportSubmission {
  privacy: 'anon' | 'identified';
  role: 'victim' | 'witness';
  aggression_type: string;
  occurred_date: string;
  occurred_time: string;
  location: string;
  class_series: string;
  report: string;
  reporter_name: string;
  reporter_email: string;
  reporter_phone: string;
}

export interface CurrentUser {
  id: number;
  username: string;
  display_name: string;
  role: 'admin' | 'operator';
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  headers.set('Accept', 'application/json');
  const response = await fetch(path, {
    ...options,
    headers,
    credentials: 'same-origin',
  });
  const text = await response.text();
  let data: Record<string, unknown> = {};
  if (text) {
    try {
      data = JSON.parse(text) as Record<string, unknown>;
    } catch {
      throw new Error('O servidor retornou uma resposta inválida.');
    }
  }
  if (!response.ok) {
    throw new Error(
      typeof data.error === 'string'
        ? data.error
        : `Não foi possível concluir a solicitação (HTTP ${response.status}).`,
    );
  }
  return data as T;
}
