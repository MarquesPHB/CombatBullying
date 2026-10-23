import React, { FormEvent, useState } from 'react';
import { upload } from '@vercel/blob/client';
import { ReportSubmission } from '../lib/api';

interface StudentReportViewProps {
  onNewReport: (report: ReportSubmission) => Promise<{ protocol: string; pin: string }>;
  onOpenDisguise: () => void;
  onOpenSos: () => void;
  onNavigateTab: (tab: 'inicio' | 'relatar' | 'protocolos' | 'guia') => void;
  onOpenStaffView: () => void;
}

const MAX_FILES = 8;
const MAX_TOTAL_SIZE = 2_000_000_000;
const FILE_LIMITS: Record<string, number> = {
  'video/3gpp': 1_000_000_000,
  'video/mp4': 1_000_000_000,
  'video/mpeg': 1_000_000_000,
  'video/quicktime': 1_000_000_000,
  'video/webm': 1_000_000_000,
  'video/x-matroska': 1_000_000_000,
  'video/x-msvideo': 1_000_000_000,
  'audio/3gpp': 100_000_000,
  'audio/aac': 100_000_000,
  'audio/flac': 100_000_000,
  'audio/midi': 100_000_000,
  'audio/mp4': 100_000_000,
  'audio/mpeg': 100_000_000,
  'audio/ogg': 100_000_000,
  'audio/wav': 100_000_000,
  'audio/webm': 100_000_000,
  'audio/x-m4a': 100_000_000,
  'audio/x-ms-wma': 100_000_000,
  'audio/x-wav': 100_000_000,
  'image/avif': 50_000_000,
  'image/bmp': 50_000_000,
  'image/gif': 50_000_000,
  'image/heic': 50_000_000,
  'image/heif': 50_000_000,
  'image/jpeg': 50_000_000,
  'image/png': 50_000_000,
  'image/tiff': 50_000_000,
  'image/webp': 50_000_000,
  'application/msword': 25_000_000,
  'application/pdf': 25_000_000,
  'application/rtf': 25_000_000,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 25_000_000,
  'text/csv': 25_000_000,
  'text/plain': 25_000_000,
  'text/rtf': 25_000_000,
};

const categories = [
  'Bullying',
  'Agressão física',
  'Ameaça',
  'Cyberbullying',
  'Agressão verbal / ofensas',
  'Exclusão social / isolamento',
  'Assédio ou discriminação',
  'Outro',
];

async function validateFiles(files: File[]) {
  if (files.length > MAX_FILES) throw new Error(`Selecione no máximo ${MAX_FILES} arquivos.`);
  if (files.reduce((total, file) => total + file.size, 0) > MAX_TOTAL_SIZE) {
    throw new Error('O conjunto de anexos pode ter no máximo 2 GB.');
  }
  for (const file of files) {
    const maxSize = FILE_LIMITS[file.type];
    if (!maxSize) {
      throw new Error(`O formato de “${file.name}” não é aceito.`);
    }
    if (file.size < 1 || file.size > maxSize) {
      throw new Error(`“${file.name}” excede o limite de ${(maxSize / 1_000_000).toLocaleString('pt-BR')} MB.`);
    }
    if (file.type.startsWith('video/')) {
      await new Promise<void>((resolve, reject) => {
        const video = document.createElement('video');
        const url = URL.createObjectURL(file);
        const timeout = window.setTimeout(() => finish(new Error(`Não foi possível verificar a duração de “${file.name}”.`)), 15_000);
        const finish = (error?: Error) => {
          window.clearTimeout(timeout);
          URL.revokeObjectURL(url);
          video.removeAttribute('src');
          video.load();
          if (error) reject(error);
          else resolve();
        };
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
          if (!Number.isFinite(video.duration) || video.duration <= 0) {
            finish(new Error(`Não foi possível verificar a duração de “${file.name}”.`));
          } else if (video.duration > 10 * 60) {
            finish(new Error(`O vídeo “${file.name}” ultrapassa o limite de 10 minutos.`));
          } else {
            finish();
          }
        };
        video.onerror = () => finish(new Error(`Não foi possível ler o vídeo “${file.name}”.`));
        video.src = url;
      });
    }
  }
}

async function uploadEvidence(
  files: File[],
  credentials: { code: string; pin: string },
  onProgress: (message: string) => void,
) {
  const code = credentials.code.replace(/[^A-Za-z0-9_-]/g, '');
  for (const [index, file] of files.entries()) {
    const extension = file.name.includes('.')
      ? `.${file.name.split('.').pop()?.replace(/[^A-Za-z0-9]/g, '').toLowerCase()}`
      : '';
    const pathname = `evidence/${code}/${crypto.randomUUID()}${extension}`;
    onProgress(`Enviando anexo ${index + 1} de ${files.length}: ${file.name}`);
    await upload(pathname, file, {
      access: 'private',
      handleUploadUrl: '/api/attachments/upload',
      clientPayload: JSON.stringify({
        code: credentials.code,
        pin: credentials.pin,
        file_name: file.name,
        content_type: file.type,
        file_size: file.size,
      }),
    });
  }
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
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'victim' | 'witness'>('victim');
  const [category, setCategory] = useState(categories[0]);
  const [details, setDetails] = useState('');
  const [location, setLocation] = useState('');
  const [classSeries, setClassSeries] = useState('');
  const [dateOfIncident, setDateOfIncident] = useState('');
  const [timeOfIncident, setTimeOfIncident] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<{ code: string; pin: string } | null>(null);
  const [failedFiles, setFailedFiles] = useState<File[]>([]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!details.trim() || !dateOfIncident || !timeOfIncident) {
      setError('Informe o relato, a data e a hora do ocorrido.');
      return;
    }
    if (!isAnonymous && !email.trim() && !phone.trim()) {
      setError('Informe e-mail ou telefone/WhatsApp para receber atualizações.');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      await validateFiles(files);
      if (files.length) {
        const status = await fetch('/api/attachments/status', { headers: { Accept: 'application/json' } });
        if (!status.ok) {
          const data = await status.json();
          throw new Error(data.error || 'O armazenamento seguro de anexos não está disponível.');
        }
      }
      const created = await onNewReport({
        privacy: isAnonymous ? 'anon' : 'identified',
        role,
        aggression_type: category,
        occurred_date: dateOfIncident,
        occurred_time: timeOfIncident,
        location: location.trim(),
        class_series: classSeries.trim(),
        report: details.trim(),
        reporter_name: isAnonymous ? '' : authorName.trim(),
        reporter_email: isAnonymous ? '' : email.trim(),
        reporter_phone: isAnonymous ? '' : phone.trim(),
      });
      const savedReceipt = { code: created.protocol, pin: created.pin };
      setReceipt(savedReceipt);
      setFiles([]);
      setUploadStatus('');
      if (files.length) {
        try {
          await uploadEvidence(files, savedReceipt, setUploadStatus);
          setUploadStatus('Todos os anexos foram enviados com segurança.');
        } catch (uploadError) {
          setFailedFiles(files);
          setError(
            uploadError instanceof Error
              ? `O relato foi recebido, mas não foi possível enviar todos os anexos: ${uploadError.message}`
              : 'O relato foi recebido, mas houve uma falha ao enviar os anexos.',
          );
        }
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Não foi possível enviar o relato.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const retryEvidence = async () => {
    if (!receipt || !failedFiles.length) return;
    setIsSubmitting(true);
    setError('');
    try {
      await uploadEvidence(failedFiles, receipt, setUploadStatus);
      setFailedFiles([]);
      setUploadStatus('Todos os anexos foram enviados com segurança.');
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Não foi possível enviar os anexos.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#f8f9fc] font-sans text-[#0d1c2e] antialiased flex flex-col min-h-screen relative pb-20">
      <header className="sticky top-0 w-full z-40 bg-[#f8f9fc]/95 backdrop-blur-md border-b border-[#bcc9c6]/30">
        <div className="h-14 px-4 flex items-center justify-between max-w-lg mx-auto">
          <div>
            <strong className="text-[15px] text-[#00685f]">Combatbullying</strong>
            <p className="text-[11px] text-[#4a5957]">Registro confidencial</p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" aria-label="Abrir calculadora camuflada" onClick={onOpenDisguise} className="w-9 h-9 rounded-full bg-[#dce9ff] text-[#3d4947]">
              <span className="material-symbols-outlined">visibility_off</span>
            </button>
            <button type="button" onClick={onOpenSos} className="px-3 py-2 rounded-full bg-red-50 text-[#ba1a1a] font-bold">S.O.S</button>
            <button type="button" onClick={onOpenStaffView} className="w-9 h-9 rounded-full bg-[#eff4ff] text-[#00685f]" aria-label="Acesso da equipe">
              <span className="material-symbols-outlined">person</span>
            </button>
          </div>
        </div>
      </header>

      <main className="w-full max-w-lg mx-auto px-4 py-4 pb-24 space-y-4">
        <section className="bg-white p-4 rounded-2xl border border-[#d2dedb]/50">
          <h1 className="text-lg font-bold">Fale com tranquilidade</h1>
          <p className="text-sm text-[#4a5957] mt-1">Descreva o ocorrido. A equipe autorizada poderá analisar o relato; evite incluir informações que não sejam necessárias.</p>
        </section>

        {receipt ? (
          <section className="bg-white p-5 rounded-2xl border border-[#d2dedb]/50 space-y-3" aria-live="polite">
            <h2 className="font-bold text-lg">Relato recebido</h2>
            <p className="text-sm text-[#4a5957]">Guarde o protocolo e o PIN. Eles são necessários para acompanhar este relato. O PIN será exibido somente agora.</p>
            <div className="bg-[#eff4ff] rounded-xl p-3"><b>Protocolo:</b> <code>{receipt.code}</code></div>
            <div className="bg-[#eff4ff] rounded-xl p-3"><b>PIN:</b> <code>{receipt.pin}</code></div>
            {uploadStatus && <p className="text-sm text-[#00685f]" role="status">{uploadStatus}</p>}
            {error && <p className="text-sm text-red-700" role="alert">{error}</p>}
            {failedFiles.length > 0 && <button type="button" disabled={isSubmitting} onClick={retryEvidence} className="w-full p-3 rounded-xl bg-[#00685f] text-white font-semibold disabled:opacity-50">Tentar enviar anexos novamente</button>}
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={async () => {
                try {
                  await navigator.clipboard.writeText(`Protocolo: ${receipt.code}\nPIN: ${receipt.pin}`);
                  setUploadStatus('Protocolo e PIN copiados.');
                } catch {
                  setError('Não foi possível copiar. Anote os dados exibidos.');
                }
              }} className="p-3 rounded-xl bg-[#eff4ff] text-[#00685f] font-semibold">Copiar dados</button>
              <button type="button" onClick={() => onNavigateTab('protocolos')} className="p-3 rounded-xl bg-[#00685f] text-white font-semibold">Acompanhar</button>
            </div>
          </section>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <section className="bg-white p-4 rounded-2xl border border-[#d2dedb]/50 space-y-3">
              <h2 className="font-bold">Como prefere se apresentar?</h2>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setIsAnonymous(true)} className={`p-3 rounded-xl border ${isAnonymous ? 'border-[#00685f] bg-teal-50' : 'border-slate-200'}`}>Anônimo</button>
                <button type="button" onClick={() => setIsAnonymous(false)} className={`p-3 rounded-xl border ${!isAnonymous ? 'border-[#00685f] bg-teal-50' : 'border-slate-200'}`}>Identificado</button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setRole('victim')} className={`p-3 rounded-xl border ${role === 'victim' ? 'border-[#00685f] bg-teal-50' : 'border-slate-200'}`}>Eu sou a vítima</button>
                <button type="button" onClick={() => setRole('witness')} className={`p-3 rounded-xl border ${role === 'witness' ? 'border-[#00685f] bg-teal-50' : 'border-slate-200'}`}>Sou testemunha</button>
              </div>
              {!isAnonymous && <div className="space-y-2">
                <input value={authorName} onChange={(event) => setAuthorName(event.target.value)} maxLength={160} placeholder="Nome (opcional)" className="w-full rounded-xl border border-slate-200 p-3" />
                <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} maxLength={254} placeholder="E-mail para contato (opcional)" className="w-full rounded-xl border border-slate-200 p-3" />
                <input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} maxLength={30} placeholder="Telefone/WhatsApp (opcional)" className="w-full rounded-xl border border-slate-200 p-3" />
                <p className="text-xs text-slate-600">Informe e-mail ou telefone/WhatsApp para que a equipe possa retornar.</p>
              </div>}
            </section>

            <section className="bg-white p-4 rounded-2xl border border-[#d2dedb]/50 space-y-3">
              <label className="block font-bold" htmlFor="aggression-type">Tipo de agressão</label>
              <select id="aggression-type" value={category} onChange={(event) => setCategory(event.target.value)} className="w-full rounded-xl border border-slate-200 p-3">
                {categories.map((item) => <option key={item}>{item}</option>)}
              </select>
              <label className="block font-bold" htmlFor="report-location">Onde aconteceu?</label>
              <input id="report-location" value={location} onChange={(event) => setLocation(event.target.value)} maxLength={255} placeholder="Local (opcional)" className="w-full rounded-xl border border-slate-200 p-3" />
              <label className="block font-bold" htmlFor="report-class">Turma / série (opcional)</label>
              <input id="report-class" value={classSeries} onChange={(event) => setClassSeries(event.target.value)} maxLength={80} placeholder="Ex.: 8º B" className="w-full rounded-xl border border-slate-200 p-3" />
              <div className="grid grid-cols-2 gap-2">
                <div><label className="block font-bold" htmlFor="occurred-date">Data</label><input id="occurred-date" type="date" value={dateOfIncident} onChange={(event) => setDateOfIncident(event.target.value)} required className="w-full rounded-xl border border-slate-200 p-3" /></div>
                <div><label className="block font-bold" htmlFor="occurred-time">Hora (24 horas)</label><input id="occurred-time" type="time" value={timeOfIncident} onChange={(event) => setTimeOfIncident(event.target.value)} required className="w-full rounded-xl border border-slate-200 p-3" /></div>
              </div>
              <label className="block font-bold" htmlFor="report-details">Conte o que aconteceu</label>
              <textarea id="report-details" value={details} onChange={(event) => setDetails(event.target.value)} required maxLength={5000} rows={6} placeholder="Descreva o ocorrido com suas palavras..." className="w-full rounded-xl border border-slate-200 p-3" />
              <div className="flex justify-between text-xs text-slate-500"><span>Evite incluir dados pessoais de outras pessoas, se não forem necessários.</span><span>{details.length}/5000</span></div>
            </section>

            <section className="bg-white p-4 rounded-2xl border border-[#d2dedb]/50">
              <label className="block font-bold" htmlFor="report-files">Anexar evidências (opcional)</label>
              <input id="report-files" type="file" multiple accept="audio/*,video/*,image/*,.pdf,.doc,.docx,.rtf,.txt,.csv" onChange={(event) => setFiles(Array.from(event.target.files ?? []))} className="w-full rounded-xl border border-slate-200 p-3" />
              <ul className="mt-2 text-xs text-slate-600 space-y-1">{files.map((file) => <li key={`${file.name}-${file.size}`}>{file.name} · {(file.size / 1024 / 1024).toFixed(2)} MB</li>)}</ul>
              <p className="text-xs text-slate-600 mt-2">Até 8 arquivos e 2 GB no total. Vídeos: até 10 minutos e 1 GB; áudios: 100 MB; imagens: 50 MB; documentos: 25 MB. Os arquivos originais não são comprimidos.</p>
            </section>

            {error && <p className="bg-red-50 text-red-800 p-3 rounded-xl text-sm" role="alert">{error}</p>}
            {uploadStatus && <p className="text-sm text-[#00685f]" role="status">{uploadStatus}</p>}
            <button type="submit" disabled={isSubmitting} className="w-full p-3.5 rounded-xl bg-[#00685f] text-white font-bold disabled:opacity-50">{isSubmitting ? 'Enviando com segurança…' : 'Enviar relato com segurança'}</button>
          </form>
        )}

        <button type="button" onClick={onOpenStaffView} className="w-full text-sm text-[#00685f] font-semibold py-2">Acesso da equipe</button>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 border-t border-slate-200">
        <div className="max-w-lg mx-auto flex h-14">{(['inicio', 'relatar', 'protocolos', 'guia'] as const).map((tab) => <button key={tab} type="button" onClick={() => onNavigateTab(tab)} className={`flex-1 text-xs font-semibold ${tab === 'relatar' ? 'text-[#00685f]' : 'text-slate-600'}`}>{tab === 'inicio' ? 'Início' : tab === 'relatar' ? 'Relatar' : tab === 'protocolos' ? 'Protocolos' : 'Guia'}</button>)}</div>
      </nav>
    </div>
  );
};
