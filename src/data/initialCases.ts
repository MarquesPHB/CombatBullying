import { BullyingCase } from '../types';

export const HELENA_AVATAR = "https://lh3.googleusercontent.com/aida-public/AB6AXuDkx-XTnuUktlu1Y3lmxY7UhvzTP1AdPUT48HFrqaDAa2vYbJitouqrOYztBffPu1ZF3cNwS8yVLnO-DFXWDcwJsdmg6PgZzcs7_LZjlbFGbYF3DGQCAQA2F5-uQNiWKUijfm5x-w1pcW7evf1qF5Cs3hY10_hJyHTRDfJOt7dIUDC3yfHYsZB72iVVBn7COw7wUlbwzS_3fFhibBMSIPi5WnsLcgay1bNaPiERTQzvTKUHbvK4rZtT8w";
export const COMBATBULLYING_LOGO = "https://lh3.googleusercontent.com/aida/AEtjO1XTWnA1eFVjwh9nbS_EJ8jlE5uiBiC-7mWsYDtTZ9XM8Rrh_dNO0TiQC8Qk0ZwTgP-Fa9bsAacT2wMJkHJYhqmjS7h8VWyv1hgJ2Z9JoTJPM8S-_Q4NZALqDAcQPNLru4DsOSLRy97rwEtAFAkT6hXM8QDfj7E01phQDXwHhcIipHQvI_Da0Ukvxhm29Vg1M9tt1E5zIE9GFcyNjIPwqaFOih7LD9VvvhY3F0dnv5tMP8krpH8szY2BAUz7";

export const INITIAL_CASES: BullyingCase[] = [
  {
    id: "STN-2024-8942",
    title: "Cyberbullying & Exposição Não Autorizada",
    category: "cyberbullying",
    categoryLabel: "Virtual / Cyberbullying",
    summary: "Montagens ofensivas compartilhadas em grupo de aplicativo...",
    details: "Estou fazendo esse relato como testemunha porque a situação com meu amigo de sala está passando do limite. Desde semana passada criaram um grupo paralelo no WhatsApp com quase metade da sala do 9º B com o objetivo de fazer figurinhas ofensivas e montagens da foto dele tirada durante o intervalo sem permissão. Ele já faltou três dias de aula e me disse que tem vergonha de vir para a escola. Peço que a direção não fale que alguém da sala relatou para evitar que fiquem caçando quem falou.",
    createdAtFormatted: "23/10/2024 às 16:40",
    updatedAtFormatted: "Atualizado hoje às 10:42",
    timeAgo: "há 35 min",
    urgency: "moderada",
    status: "triagem",
    statusLabel: "Em Triagem Pedagógica",
    role: "testemunha",
    roleLabel: "Testemunha",
    classOrGrade: "9º Ano B",
    channel: "Digital (WhatsApp)",
    isAnonymous: true,
    location: "Sala 9 e WhatsApp",
    dateOfIncident: "Semana passada e últimos 3 dias",
    evidence: [
      {
        id: "ev-1",
        name: "print_evidencia_chat.png",
        size: "1.4 MB • Metadados limpos",
        type: "image",
        url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80"
      },
      {
        id: "ev-2",
        name: "audio_depoimento.m4a",
        size: "0:42 • Voz descaracterizada",
        type: "audio",
        duration: "0:42"
      }
    ],
    history: [
      {
        id: "hist-1",
        title: "Relato Recebido e Anonimizado",
        date: "Ontem 16:40",
        note: "Higienização criptográfica executada com sucesso."
      },
      {
        id: "hist-2",
        title: "Encaminhamento Psicológico",
        date: "Hoje 08:30",
        author: "Dr. Rafael",
        note: "Roda restaurativa preventiva agendada com a turma sobre empatia digital sem exposição individual."
      }
    ],
    messages: [
      {
        id: "msg-1",
        sender: "staff",
        text: "Olá! Recebemos seu relato e já estamos acompanhando com total discrição e cuidado. Fique tranquilo(a).",
        time: "10:28",
        read: true
      },
      {
        id: "msg-2",
        sender: "student",
        text: "Obrigado pelo retorno seguro.",
        time: "10:35",
        read: true
      }
    ]
  },
  {
    id: "STN-2024-8940",
    title: "Intimidação Verbal e Ameaça de Agressão",
    category: "agressao",
    categoryLabel: "Agressão ou Ameaça",
    summary: "Grupo cercou estudante no portão lateral da saída...",
    details: "No portão lateral, ao final das aulas de terça-feira, três alunos cercaram a saída impedindo a passagem e proferiram ameaças sobre o dia seguinte se não entregasse o celular. O vigia interveio, mas o clima permaneceu de medo.",
    createdAtFormatted: "23/10/2024 às 15:10",
    updatedAtFormatted: "Atualizado hoje às 11:00",
    timeAgo: "há 1h",
    urgency: "alta",
    status: "triagem",
    statusLabel: "Alta Prioridade",
    role: "vitima",
    roleLabel: "Eu sou a vítima",
    classOrGrade: "Ensino Médio",
    channel: "Portão Lateral",
    isAnonymous: false,
    authorName: "Lucas V.",
    location: "Portão lateral de saída",
    dateOfIncident: "Terça-feira às 12:30",
    evidence: [
      {
        id: "ev-3",
        name: "foto_portao.jpg",
        size: "2.1 MB • Metadados limpos",
        type: "image",
        url: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=600&q=80"
      }
    ],
    history: [
      {
        id: "hist-3",
        title: "Acionamento de Segurança Escolar",
        date: "Hoje 09:15",
        author: "Coordenação",
        note: "Reforço no portão lateral e chamada discreta dos responsáveis para conversa pedagógica individualizada."
      }
    ],
    messages: [
      {
        id: "msg-3",
        sender: "staff",
        text: "Lucas, acolhemos sua denúncia e acionamos a equipe de apoio. Você está seguro.",
        time: "10:15",
        read: true
      }
    ]
  },
  {
    id: "STN-2024-8938",
    title: "Isolamento Constante & Exclusão Deliberada",
    category: "exclusao",
    categoryLabel: "Exclusão Social",
    summary: "Estudante relata choro e recusa repetida em trabalhos em grupo...",
    details: "Uma aluna novata foi sistematicamente excluída dos trabalhos escolares e senta sozinha em todos os intervalos. Quando tenta se aproximar, os colegas mudam de lugar ou riem.",
    createdAtFormatted: "23/10/2024 às 13:20",
    updatedAtFormatted: "Atualizado hoje às 09:30",
    timeAgo: "há 3h",
    urgency: "moderada",
    status: "acolhimento",
    statusLabel: "Em Acolhimento",
    role: "testemunha",
    roleLabel: "Testemunha",
    classOrGrade: "1º Ano EM",
    channel: "Presencial",
    isAnonymous: true,
    location: "Sala de aula e Pátio",
    dateOfIncident: "Durante as últimas duas semanas",
    evidence: [],
    history: [
      {
        id: "hist-4",
        title: "Atendimento Psico-pedagógico",
        date: "Hoje 09:00",
        author: "Profa. Helena",
        note: "Iniciadas dinâmicas integrativas em sala de aula focadas em cooperação mútua."
      }
    ],
    messages: [
      {
        id: "msg-4",
        sender: "staff",
        text: "Agradecemos o aviso sensível. Já estamos atuando com o corpo docente da turma.",
        time: "09:35",
        read: true
      }
    ]
  },
  {
    id: "STN-2024-8935",
    title: "Comentários Discriminatórios em Vestiário",
    category: "verbal",
    categoryLabel: "Verbal / Apelidos",
    summary: "Apelidos pejorativos frequentes nos intervalos das aulas...",
    details: "Durante o término das aulas de Educação Física, no vestiário masculino, apelidos pejorativos ligados a características físicas foram repetidos com risadas de deboche.",
    createdAtFormatted: "22/10/2024 às 17:00",
    updatedAtFormatted: "Ontem às 18:20",
    timeAgo: "Ontem",
    urgency: "baixa",
    status: "concluido",
    statusLabel: "Respondido",
    role: "vitima",
    roleLabel: "Eu sou a vítima",
    classOrGrade: "Ginásio",
    channel: "Vestiário Escolar",
    isAnonymous: true,
    location: "Vestiário da Quadra de Esportes",
    dateOfIncident: "Ontem após a aula de Ed. Física",
    evidence: [],
    history: [
      {
        id: "hist-5",
        title: "Conversa com Professor de Ed. Física",
        date: "Ontem 17:45",
        author: "Coordenação",
        note: "Orientações passadas aos docentes para monitoramento contínuo das áreas de transição."
      }
    ],
    messages: [
      {
        id: "msg-5",
        sender: "staff",
        text: "A conduta inadequada foi advertida aos envolvidos e o espaço está com supervisão ativa.",
        time: "18:15",
        read: true
      }
    ]
  }
];
