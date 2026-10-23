import React, { FormEvent, useCallback, useEffect, useState } from 'react';
import { apiRequest, CurrentUser, Protocol, ProtocolMessage, TeamUser } from '../lib/api';

interface SchoolStaffViewProps {
  user: CurrentUser;
  onLogout: () => void;
  onSwitchToStudentView: () => void;
  onNavigateTab: (tab: 'inicio' | 'relatar' | 'protocolos' | 'guia') => void;
}

const statuses = ['Recebida', 'Em triagem', 'Em tratativa', 'Encaminhada', 'Concluída'];

export const SchoolStaffView: React.FC<SchoolStaffViewProps> = ({ user, onLogout, onSwitchToStudentView, onNavigateTab }) => {
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [team, setTeam] = useState<TeamUser[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ProtocolMessage[]>([]);
  const [reply, setReply] = useState('');
  const [notes, setNotes] = useState('');
  const [createUser, setCreateUser] = useState({ username: '', display_name: '', password: '' });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const loadProtocols = useCallback(async () => {
    const result = await apiRequest<{ protocols: Protocol[] }>('/api/protocols');
    setProtocols(result.protocols);
    setSelectedId((current) => current && result.protocols.some((item) => item.id === current) ? current : result.protocols[0]?.id ?? null);
  }, []);
  const loadTeam = useCallback(async () => {
    if (user.role === 'admin') {
      const result = await apiRequest<{ users: TeamUser[] }>('/api/users');
      setTeam(result.users);
    }
  }, [user.role]);

  useEffect(() => {
    void Promise.all([loadProtocols(), loadTeam()])
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : 'Não foi possível carregar os dados.'))
      .finally(() => setLoading(false));
  }, [loadProtocols, loadTeam]);

  const selected = protocols.find((item) => item.id === selectedId) ?? null;
  useEffect(() => {
    setNotes(selected?.treatment_notes ?? '');
    if (!selected) {
      setMessages([]);
      return;
    }
    void apiRequest<{ messages: ProtocolMessage[] }>(`/api/protocols/${selected.id}/messages`)
      .then((result) => setMessages(result.messages))
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : 'Não foi possível carregar as mensagens.'));
  }, [selected?.id, selected?.treatment_notes]);

  const updateProtocol = async (values: Record<string, string | number | null>) => {
    if (!selected) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await apiRequest(`/api/protocols/${selected.id}`, { method: 'PATCH', body: JSON.stringify(values) });
      setNotice('Protocolo atualizado.');
      await loadProtocols();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Não foi possível atualizar o protocolo.');
    } finally {
      setBusy(false);
    }
  };

  const sendMessage = async (event: FormEvent) => {
    event.preventDefault();
    if (!selected || !reply.trim()) return;
    setBusy(true);
    setError('');
    try {
      await apiRequest(`/api/protocols/${selected.id}/messages`, {
        method: 'POST',
        body: JSON.stringify({ message: reply.trim() }),
      });
      setReply('');
      const result = await apiRequest<{ messages: ProtocolMessage[] }>(`/api/protocols/${selected.id}/messages`);
      setMessages(result.messages);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Não foi possível enviar a mensagem.');
    } finally {
      setBusy(false);
    }
  };

  const handleCreateUser = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await apiRequest('/api/users', { method: 'POST', body: JSON.stringify(createUser) });
      setCreateUser({ username: '', display_name: '', password: '' });
      setNotice('Usuário cadastrado.');
      await loadTeam();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Não foi possível cadastrar o usuário.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0d1c2e] pb-20">
      <header className="sticky top-0 z-40 bg-white border-b border-[#dce9ff]">
        <div className="max-w-6xl mx-auto min-h-16 px-4 py-2 flex flex-wrap items-center justify-between gap-2">
          <div><h1 className="font-bold text-[#00685f]">Gestão de protocolos</h1><p className="text-xs text-slate-600">{user.display_name} · {user.role === 'admin' ? 'Administrador' : 'Responsável'}</p></div>
          <div className="flex gap-2">
            <button type="button" onClick={onSwitchToStudentView} className="px-3 py-2 rounded-lg bg-[#eff4ff] text-sm font-semibold">Tela inicial</button>
            <button type="button" onClick={onLogout} className="px-3 py-2 rounded-lg bg-slate-100 text-sm font-semibold">Sair</button>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto p-4 space-y-4">
        {(error || notice) && <p role={error ? 'alert' : 'status'} className={`p-3 rounded-xl text-sm ${error ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'}`}>{error || notice}</p>}
        {user.role === 'admin' && <details className="bg-white rounded-2xl border border-[#dce9ff] p-4">
          <summary className="font-bold cursor-pointer">Cadastrar usuário responsável</summary>
          <form onSubmit={handleCreateUser} className="grid sm:grid-cols-4 gap-3 mt-4">
            <input required value={createUser.display_name} onChange={(event) => setCreateUser({ ...createUser, display_name: event.target.value })} placeholder="Nome" aria-label="Nome completo" className="rounded-lg border p-2" />
            <input required value={createUser.username} onChange={(event) => setCreateUser({ ...createUser, username: event.target.value })} placeholder="Usuário" aria-label="Nome de usuário" className="rounded-lg border p-2" />
            <input required minLength={12} type="password" value={createUser.password} onChange={(event) => setCreateUser({ ...createUser, password: event.target.value })} placeholder="Senha (mínimo 12 caracteres)" aria-label="Senha temporária" className="rounded-lg border p-2" />
            <button disabled={busy} className="rounded-lg bg-[#00685f] text-white font-semibold p-2 disabled:opacity-50">Cadastrar</button>
          </form>
          {!!team.length && <p className="text-xs text-slate-500 mt-3">Equipe cadastrada: {team.map((member) => member.display_name).join(', ')}</p>}
        </details>}
        <div className="grid lg:grid-cols-[minmax(270px,0.8fr)_minmax(0,1.7fr)] gap-4 items-start">
          <section className="bg-white rounded-2xl border border-[#dce9ff] overflow-hidden">
            <div className="px-4 py-3 border-b flex items-center justify-between"><h2 className="font-bold">Protocolos</h2><span className="text-xs text-slate-500">{protocols.length}</span></div>
            {loading ? <p className="p-4 text-sm text-slate-500">Carregando…</p> : protocols.length ? <div className="max-h-[72vh] overflow-auto divide-y">
              {protocols.map((protocol) => <button key={protocol.id} type="button" onClick={() => setSelectedId(protocol.id)} className={`w-full text-left p-4 hover:bg-[#f8f9ff] ${selectedId === protocol.id ? 'bg-[#eff8f6]' : ''}`}>
                <div className="flex justify-between gap-2"><strong className="font-mono text-sm">{protocol.protocol_code}</strong><span className="text-[11px] text-[#00685f]">{protocol.status}</span></div>
                <p className="text-xs text-slate-600 mt-1">{protocol.aggression_type} · {protocol.occurred_date}</p>
                <p className="text-[11px] text-slate-500 mt-1">{protocol.assigned_name ? `Responsável: ${protocol.assigned_name}` : 'Sem responsável atribuído'}</p>
              </button>)}
            </div> : <p className="p-4 text-sm text-slate-500">Nenhum protocolo disponível para sua conta.</p>}
          </section>

          {selected ? <section className="bg-white rounded-2xl border border-[#dce9ff] p-4 space-y-4 min-w-0">
            <div className="flex flex-wrap justify-between gap-3"><div><p className="text-xs text-slate-500">Protocolo</p><h2 className="font-mono font-bold">{selected.protocol_code}</h2></div><span className="self-start px-3 py-1 rounded-full bg-teal-50 text-[#00685f] text-xs font-bold">{selected.status}</span></div>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <p><span className="block text-xs text-slate-500">Tipo de agressão</span>{selected.aggression_type}</p>
              <p><span className="block text-xs text-slate-500">Data e hora</span>{selected.occurred_date} · {selected.occurred_time}</p>
              <p><span className="block text-xs text-slate-500">Local / turma</span>{selected.location || 'Não informado'} · {selected.class_series || 'Não informada'}</p>
              <p><span className="block text-xs text-slate-500">Relato por</span>{selected.privacy === 'anon' ? 'Anônimo' : selected.reporter_name || 'Identificado'}</p>
            </div>
            <div className="bg-[#f8f9ff] rounded-xl p-3"><h3 className="font-semibold text-sm mb-1">Relato</h3><p className="text-sm whitespace-pre-wrap break-words">{selected.report}</p></div>
            {selected.privacy === 'identified' && (selected.reporter_email || selected.reporter_phone) && <p className="text-xs text-slate-600">Contato informado: {[selected.reporter_email, selected.reporter_phone].filter(Boolean).join(' · ')}</p>}
            <div className="grid sm:grid-cols-2 gap-3">
              <label className="text-sm font-semibold">Status<select disabled={busy} value={selected.status} onChange={(event) => void updateProtocol({ status: event.target.value })} className="block w-full mt-1 rounded-lg border p-2">{statuses.map((status) => <option key={status}>{status}</option>)}</select></label>
              {user.role === 'admin' && <label className="text-sm font-semibold">Encaminhar para<select disabled={busy} value={selected.assigned_to ?? ''} onChange={(event) => void updateProtocol({ assigned_to: event.target.value ? Number(event.target.value) : null })} className="block w-full mt-1 rounded-lg border p-2"><option value="">Não atribuído</option>{team.filter((member) => member.active && member.role === 'operator').map((member) => <option key={member.id} value={member.id}>{member.display_name}</option>)}</select></label>}
            </div>
            <div><label className="block text-sm font-semibold" htmlFor="treatment-notes">Notas internas de tratativa</label><textarea id="treatment-notes" value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={10000} rows={3} className="w-full mt-1 rounded-lg border p-2" /><button type="button" disabled={busy || notes === selected.treatment_notes} onClick={() => void updateProtocol({ treatment_notes: notes })} className="mt-2 px-4 py-2 rounded-lg bg-[#00685f] text-white text-sm font-semibold disabled:opacity-50">Salvar notas</button></div>
            {selected.attachments.length > 0 && <div><h3 className="font-semibold text-sm mb-2">Evidências</h3><div className="flex flex-wrap gap-2">{selected.attachments.map((attachment) => <a key={attachment.id} href={`/api/protocols/${selected.id}/attachments/${attachment.id}`} className="text-sm text-[#00685f] underline break-all">{attachment.file_name}</a>)}</div></div>}
            {selected.treatment_steps?.length ? <details><summary className="font-semibold text-sm cursor-pointer">Histórico de tratativa ({selected.treatment_steps.length})</summary><div className="mt-2 space-y-2">{selected.treatment_steps.map((step, index) => <div key={`${step.created_at}-${index}`} className="border-l-2 border-teal-200 pl-3 text-xs"><strong>{step.status}</strong> · {step.actor_name || 'Equipe'} · {new Date(step.created_at).toLocaleString('pt-BR')}<p>{step.notes}</p></div>)}</div></details> : null}
            <div className="border-t pt-3"><h3 className="font-semibold text-sm">Mensagens do protocolo</h3><div className="max-h-52 overflow-auto space-y-2 my-2">
              {messages.map((message, index) => <div key={`${message.created_at}-${index}`} className={`rounded-lg p-3 text-sm ${message.sender_role === 'staff' ? 'bg-[#eff4ff] mr-6' : 'bg-teal-50 ml-6'}`}><p className="whitespace-pre-wrap break-words">{message.message}</p><time className="block text-[10px] text-slate-500 mt-1">{message.sender_role === 'staff' ? 'Equipe' : 'Denunciante'} · {new Date(message.created_at).toLocaleString('pt-BR')}</time></div>)}
              {!messages.length && <p className="text-xs text-slate-500">Nenhuma mensagem até o momento.</p>}
            </div><form onSubmit={sendMessage} className="flex gap-2"><input value={reply} onChange={(event) => setReply(event.target.value)} maxLength={2000} placeholder="Mensagem para o denunciante" className="flex-1 min-w-0 rounded-lg border p-2 text-sm" /><button disabled={busy || !reply.trim()} className="px-4 rounded-lg bg-[#00685f] text-white text-sm font-semibold disabled:opacity-50">Enviar</button></form></div>
          </section> : <div className="bg-white rounded-2xl border border-[#dce9ff] p-8 text-center text-slate-500">{loading ? 'Carregando protocolo…' : 'Selecione um protocolo para ver os detalhes.'}</div>}
        </div>
      </main>
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 border-t border-slate-200"><div className="max-w-lg mx-auto flex h-14">{(['inicio', 'relatar', 'protocolos', 'guia'] as const).map((tab) => <button type="button" key={tab} onClick={() => { onSwitchToStudentView(); onNavigateTab(tab); }} className={`flex-1 text-xs font-semibold ${tab === 'protocolos' ? 'text-[#00685f]' : 'text-slate-600'}`}>{tab === 'inicio' ? 'Início' : tab === 'relatar' ? 'Relatar' : tab === 'protocolos' ? 'Protocolos' : 'Guia'}</button>)}</div></nav>
    </div>
  );
};
