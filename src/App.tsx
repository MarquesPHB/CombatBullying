import { FormEvent, useEffect, useState } from 'react';
import { DisguiseCalculator } from './components/DisguiseCalculator';
import { SchoolStaffView } from './components/SchoolStaffView';
import { SosModal } from './components/SosModal';
import { StudentGuideView } from './components/StudentGuideView';
import { StudentHomeView } from './components/StudentHomeView';
import { StudentReportView } from './components/StudentReportView';
import { StudentTrackingView } from './components/StudentTrackingView';
import { apiRequest, CurrentUser, ReportSubmission } from './lib/api';

type ActiveTab = 'inicio' | 'relatar' | 'protocolos' | 'guia';

export default function App() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [tab, setTab] = useState<ActiveTab>('inicio');
  const [isStaffLoginOpen, setIsStaffLoginOpen] = useState(false);
  const [isDisguised, setIsDisguised] = useState(false);
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [receipt, setReceipt] = useState<{ code: string; pin: string } | null>(null);
  const [login, setLogin] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [appError, setAppError] = useState('');
  const [loading, setLoading] = useState(true);
  const [loggingIn, setLoggingIn] = useState(false);

  useEffect(() => {
    void apiRequest<{ user: CurrentUser | null }>('/api/me')
      .then((result) => setUser(result.user))
      .catch((error: unknown) => setAppError(error instanceof Error ? error.message : 'Não foi possível conectar ao servidor.'))
      .finally(() => setLoading(false));
  }, []);

  const navigateTab = (nextTab: ActiveTab) => {
    setTab(nextTab);
    setAppError('');
  };

  const handleReport = async (report: ReportSubmission) => {
    const result = await apiRequest<{ protocol: string; pin: string }>('/api/protocols', {
      method: 'POST',
      body: JSON.stringify(report),
    });
    setReceipt({ code: result.protocol, pin: result.pin });
    return result;
  };

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setLoginError('');
    setLoggingIn(true);
    try {
      const result = await apiRequest<{ user: CurrentUser }>('/api/login', {
        method: 'POST',
        body: JSON.stringify(login),
      });
      setUser(result.user);
      setIsStaffLoginOpen(false);
      setLogin({ username: '', password: '' });
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Não foi possível entrar.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await apiRequest('/api/logout', { method: 'POST' });
      setUser(null);
      setIsStaffLoginOpen(false);
      setTab('inicio');
      setAppError('');
    } catch (error) {
      setAppError(error instanceof Error ? error.message : 'Não foi possível encerrar a sessão.');
    }
  };

  const openStaff = () => {
    setLoginError('');
    setIsStaffLoginOpen(true);
  };

  if (loading) return <div className="min-h-screen grid place-items-center text-[#00685f]">Carregando…</div>;
  if (user) {
    return (
      <>
        <SchoolStaffView
          user={user}
          onLogout={() => void handleLogout()}
          onSwitchToStudentView={() => {
            setUser(null);
            setTab('inicio');
          }}
          onNavigateTab={navigateTab}
        />
        {isDisguised && <DisguiseCalculator onClose={() => setIsDisguised(false)} />}
        <SosModal isOpen={isSosOpen} onClose={() => setIsSosOpen(false)} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0d1c2e]">
      {appError && <div role="alert" className="mx-auto max-w-lg p-3 text-sm text-red-800 bg-red-50">{appError}</div>}
      {isStaffLoginOpen ? (
        <div className="min-h-screen pb-20 flex flex-col">
          <header className="bg-white border-b border-[#dce9ff] p-4">
            <div className="max-w-lg mx-auto flex justify-between items-center"><strong className="text-[#00685f]">Acesso da equipe</strong><button type="button" onClick={() => setIsStaffLoginOpen(false)} className="text-sm text-[#00685f] font-semibold">Voltar</button></div>
          </header>
          <main className="w-full max-w-lg mx-auto p-4 flex-1">
            <form onSubmit={handleLogin} className="bg-white p-5 rounded-2xl border border-[#dce9ff] space-y-4">
              <div><h1 className="text-xl font-bold">Entrar na gestão</h1><p className="text-sm text-slate-600 mt-1">Use a conta cadastrada pelo administrador.</p></div>
              {loginError && <p role="alert" className="bg-red-50 text-red-800 p-3 rounded-xl text-sm">{loginError}</p>}
              <label className="block text-sm font-semibold">Usuário<input required autoComplete="username" value={login.username} onChange={(event) => setLogin({ ...login, username: event.target.value })} className="block w-full mt-1 rounded-xl border p-3" /></label>
              <label className="block text-sm font-semibold">Senha<input required type="password" autoComplete="current-password" value={login.password} onChange={(event) => setLogin({ ...login, password: event.target.value })} className="block w-full mt-1 rounded-xl border p-3" /></label>
              <button disabled={loggingIn} className="w-full p-3 rounded-xl bg-[#00685f] text-white font-bold disabled:opacity-50">{loggingIn ? 'Entrando…' : 'Entrar'}</button>
            </form>
          </main>
          <BottomNav selected={tab} onNavigate={navigateTab} />
        </div>
      ) : tab === 'inicio' ? (
        <StudentHomeView
          onNavigateTab={navigateTab}
          onOpenDisguise={() => setIsDisguised(true)}
          onOpenSos={() => setIsSosOpen(true)}
          onOpenStaffView={openStaff}
        />
      ) : tab === 'guia' ? (
        <StudentGuideView
          onNavigateTab={navigateTab}
          onOpenDisguise={() => setIsDisguised(true)}
          onOpenSos={() => setIsSosOpen(true)}
          onOpenStaffView={openStaff}
        />
      ) : tab === 'relatar' ? (
        <StudentReportView
          onNewReport={handleReport}
          onOpenDisguise={() => setIsDisguised(true)}
          onOpenSos={() => setIsSosOpen(true)}
          onNavigateTab={navigateTab}
          onOpenStaffView={openStaff}
        />
      ) : (
        <StudentTrackingView
          initialCredentials={receipt}
          onOpenDisguise={() => setIsDisguised(true)}
          onOpenSos={() => setIsSosOpen(true)}
          onNavigateTab={navigateTab}
          onOpenStaffView={openStaff}
        />
      )}
      {isDisguised && <DisguiseCalculator onClose={() => setIsDisguised(false)} />}
      <SosModal isOpen={isSosOpen} onClose={() => setIsSosOpen(false)} />
    </div>
  );
}

function BottomNav({ selected, onNavigate }: { selected: ActiveTab; onNavigate: (tab: ActiveTab) => void }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 border-t border-slate-200">
      <div className="max-w-lg mx-auto flex h-14">{(['inicio', 'relatar', 'protocolos', 'guia'] as const).map((tab) => (
        <button type="button" key={tab} aria-current={selected === tab ? 'page' : undefined} onClick={() => onNavigate(tab)} className={`flex-1 text-xs font-semibold ${selected === tab ? 'text-[#00685f]' : 'text-slate-600'}`}>
          {tab === 'inicio' ? 'Início' : tab === 'relatar' ? 'Relatar' : tab === 'protocolos' ? 'Protocolos' : 'Guia'}
        </button>
      ))}</div>
    </nav>
  );
}
