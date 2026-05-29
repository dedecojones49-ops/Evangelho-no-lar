'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Clock, 
  Users, 
  CheckCircle2, 
  Home, 
  ArrowLeft, 
  ArrowRight, 
  BookOpen, 
  Compass, 
  Droplets, 
  Heart, 
  Calendar, 
  Plus, 
  Trash2, 
  AArrowUp, 
  AArrowDown, 
  HelpCircle, 
  Check, 
  Volume1,
  Book,
  Moon,
  Sun,
  Flame,
  UserCheck,
  Video,
  VideoOff,
  Mic,
  MicOff,
  MessageSquare,
  Send,
  Share2,
  LogOut,
  Tv
} from 'lucide-react';
import { getAudioManager } from '@/lib/audio';
import { useWebRTCPure } from '@/hooks/use-webrtc';
import Landing from '@/components/Landing';
import { useAuth } from '@/_core/hooks/useAuth';

// Static Chapter Names for Allan Kardec's "O Evangelho Segundo o Espiritismo"
const GOSPEL_CHAPTERS = [
  { num: 1, title: "Não vim destruir a lei" },
  { num: 2, title: "Meu Reino não é deste mundo" },
  { num: 3, title: "Há muitas moradas na casa de meu Pai" },
  { num: 4, title: "Ninguém pode ver o Reino de Deus se não nascer de novo" },
  { num: 5, title: "Bem-aventurados os aflitos" },
  { num: 6, title: "O Cristo Consolador" },
  { num: 7, title: "Bem-aventurados os pobres de espírito" },
  { num: 8, title: "Bem-aventurados os puros de coração" },
  { num: 9, title: "Bem-aventurados os que são brandos e pacíficos" },
  { num: 10, title: "Bem-aventurados os que são misericordiosos" },
  { num: 11, title: "Amar o próximo como a si mesmo" },
  { num: 12, title: "Amai os vossos inimigos" },
  { num: 13, title: "Não saiba a vossa mão esquerda o que faz a vossa direita" },
  { num: 14, title: "Honrai a vosso pai e a vossa mãe" },
  { num: 15, title: "Fora da caridade não há salvação" },
  { num: 16, title: "Não se pode servir a Deus e a Mamon" },
  { num: 17, title: "Sede perfeitos" },
  { num: 18, title: "Muitos os chamados, poucos os escolhidos" },
  { num: 19, title: "A fé transporta montanhas" },
  { num: 20, title: "Os trabalhadores da última hora" },
  { num: 21, title: "Haverá falsos Cristos e falsos profetas" },
  { num: 22, title: "Não separeis o que Deus juntou" },
  { num: 23, title: "Estranha moral" },
  { num: 24, title: "Não coloqueis a candeia debaixo do alqueire" },
  { num: 25, title: "Buscai e achareis" },
  { num: 26, title: "Dai de graça o que de graça recebestes" },
  { num: 27, title: "Pedi e obtereis" },
  { num: 28, title: "Coletânea de preces espíritas" }
];

// Curated beautiful offline passages from "O Evangelho Segundo o Espiritismo" (Cap 5, Cap 11, Cap 17)
const STATIC_PASSAGES = [
  {
    chapter: 5,
    chapterTitle: "Bem-aventurados os aflitos",
    sectionTitle: "O Cristo Consolador",
    text: "Vinde a mim, todos vós que estais fadigados e sobrecarregados, e eu vos aliviarei. Tomai sobre vós o meu jugo e aprendei de mim que sou manso e humilde de coração, e achareis descanso para as vossas almas. Porque o meu jugo é suave e o meu fardo é leve. (Mateus, 11:28-30)",
    commentary: "Essas palavras do Mestre Jesus nos recordam de que a aflição terrena é uma oportunidade valiosa de burilamento espiritual quando tomada com resignação e fé no futuro. O 'jugo' de Jesus é o Seu amor e as Suas leis morais, que aliviam a carga de nosso egoísmo e orgulho. Ao sintonizarmos com Sua humildade, encontramos o verdadeiro descanso para as tribulações diárias do lar.",
    reflections: [
      "De que maneira as dificuldades e aflições atuais em nossa família podem nos unir e nos ajudar a exercitar a paciência ativa?",
      "O que significa, na prática direta, buscar alívio nos ensinamentos de Jesus diante das preocupações materiais?",
      "Como podemos cultivar a humildade e a brandura nos momentos de cansaço ou irritação diária?"
    ]
  },
  {
    chapter: 11,
    chapterTitle: "Amar o próximo como a si mesmo",
    sectionTitle: "A lei de amor e caridade",
    text: "O amor resume toda a doutrina de Jesus, toda a doutrina espírita, porque é o sentimento por excelência, e os sentimentos são os instintos elevados à altura do progresso realizado. Amar, no sentido profundo, é dar-se sem egoísmo, ver no outro um real irmão de aprendizado físico e espiritual.",
    commentary: "A lei de amor é a maior de todas as leis divinas. No ambiente íntimo do lar, o amor se expressa nos pequenos atos de compreensão, na palavra mansa que evita a discórdia, e no amparo mútuo diante das fraquezas alheias. O Evangelho no Lar é a oficina onde polimos as arestas do orgulho para aprender a amar a nós mesmos e aos que convivem conosco.",
    reflections: [
      "Quais pequenos gestos espontâneos de caridade podemos praticar uns com os outros dentro de nossa própria residência?",
      "Como podemos transformar a incompreensão momentânea em desculpismo e tolerância fraterna nos diálogos de família?",
      "Como nossa família pode agir ativamente para irradiar simpatia e caridade espiritual para com a nossa vizinhança?"
    ]
  },
  {
    chapter: 17,
    chapterTitle: "Sede perfeitos",
    sectionTitle: "O Homem de Bem",
    text: "O verdadeiro homem de bem é aquele que pratica a lei de justiça, de amor e de caridade, na sua maior pureza. Ele interroga a sua própria consciência sobre os seus atos; pergunta se não violou essa lei, se não fez o mal, se fez todo o bem que podia, se não deixou perder voluntariamente uma ocasião de ser útil.",
    commentary: "Ser perfeito, nos moldes do ensinamento de Jesus, é lutar continuamente pelo progresso íntimo — ou seja, sermos hoje um pouco melhores do que fomos ontem. O homem de bem não julga o erro alheio; ao contrário, perdoa as ofensas e se esforça para se desvencilhar de seus defeitos. No aconchego do lar, este esforço contínuo cria um escudo vibracional protetor.",
    reflections: [
      "Dedicando um olhar sincero ao dia de hoje, conseguimos perceber se fizemos todo o bem razoavelmente ao nosso alcance?",
      "Como o perdão imediato às pequenas falhas evita o acúmulo de mágoas e melhora a egrégora do nosso lar?",
      "Qual hábito mental ou orgulhoso desejamos nos esforçar mais ativamente para suavizar durante esta semana?"
    ]
  }
];

// Traditional beautiful Spiritist opening/closing prayers
const STANDARD_OPENING_PRAYER = {
  title: "Prece de Abertura Fraterna",
  content: `Querido Deus, Criador Amantíssimo, amado Mestre Jesus, e benfeitores espirituais de nosso lar.

Reunimo-nos em família e em vibração de paz para realizar este momento santo de convívio com Teus ensinamentos através do Evangelho no Lar. Rogamos que a Tua luz penetre cada fresta desta casa, dissipando as preocupações materiais, os desgastes do dia a dia e as energias dissonantes.

Pedimos a presença bendita de nossos anjos da guarda e mentores espirituais, para que inspirem nossa leitura, tragam discernimento aos nossos comentários e sustentem nossos propósitos de reforma íntima.

Sintonizamos nossos corações na vibração do amor cristão, colocando em Tua guarda este copo de água, suplicando que sobre ele sejam depositados os fluidos medicamentosos necessários para o equilíbrio de nossas almas e corpos físicos.

Que a Tua harmonia permaneça conosco neste estudo. Em Teu Santo Nome, iniciamos nossa reunião sob a Tua bênção. Que assim seja.`
};

const STANDARD_CLOSING_PRAYER = {
  title: "Prece de Encerramento e Gratidão",
  content: `Amado Mestre Jesus, queridos amigos da espiritualidade benfeitora de nosso lar.

Com o coração repleto de paz, agradecemos pelas sublimes lições estudadas hoje. Sentimos a brisa reconfortante do Teu consolo acalmando as inquietações de nossas almas.

Agradecemos imensamente pela proteção dispensada ao nosso ambiente residencial, por fortificar nossos laços com o plano superior e por manter distantes as influências negativas de desânimo ou discórdia.

Abençoe esta água fluidificada que agora tomaremos, que nela estejam as vitaminas da fé, a vacina da paciência e o remédio renovador para nossas células corporais.

Rogamos que as vibrações de amor produzidas nesta reunião se expandam, alcançando os lares vizinhos, os hospitais, os corações que sofrem em solidão e todos os espíritos necessitados de esclarecimento e afeto.

Que a Tua paz nos acompanhe nos próximos dias de nossa jornada. Com gratidão divina, encerramos nosso Evangelho no Lar de hoje. Que assim seja.`
};

// Intention Options
const INTENTION_PRESETS = [
  { value: "harmonia", label: "Harmonização e União Familiar", text: "Harmonização completa do lar, união entre familiares e dissolução de desavenças espirituais ou mentais." },
  { value: "saude", label: "Cura Física e Equilíbrio Espiritual", text: "Amparo aos doentes físicos e fortalecimento das energias de reabilitação e bem-estar físico." },
  { value: "agradecimento", label: "Agradecimento e Louvor", text: "Gratidão sublime pelas bênçãos recebidas, pela saúde, pelo pão de cada dia e pelas oportunidades de aprendizado." },
  { value: "paz_planetaria", label: "Paz Mundial e Consoladores", text: "Paz para o planeta Terra, amparo aos espíritos que sofrem em guerras, catástrofes ou solidão." },
];

const HEALING_AFFIRMATIONS = [
  "Benfeitores espirituais trazendo calmantes para o sistema nervoso.",
  "Bons fluidos desintegrando toxinas mentais de ansiedade.",
  "A egrégora do lar sendo preenchida com o bálsamo da paciência divina.",
  "Correntes salutares ativando o equilíbrio das defesas biológicas.",
  "Amor e desculpismo restaurando a harmonia nos canais de respiração.",
  "A água recebe partículas cristalinas de coragem e esperança espiritual."
];

export default function GospelAtHomeApp() {
  // Session Step States: 
  // 0 - Dashboard / Setup
  // 1 - Prece de Abertura (Opening)
  // 2 - Leitura do Evangelho (Gospel Study)
  // 3 - Diálogo e Reflexão (Countdown & Prompts)
  // 4 - Vibrações (Guided interaction)
  // 5 - Fluidificação (Water interactive progress)
  // 6 - Prece de Encerramento (Closing)
  // 7 - Session Finished Summary
  const [step, setStep] = useState(0);
  const [view, setView] = useState<'landing' | 'session'>('landing');

  // Setup inputs
  const [participants, setParticipants] = useState('');
  const [intentionType, setIntentionType] = useState('harmonia');
  const [customIntention, setCustomIntention] = useState('');
  const [durationComments, setDurationComments] = useState(5); // minutes
  const [soundType, setSoundType] = useState<'none' | '432hz' | 'ocean'>('none');
  const [soundVolume, setSoundVolume] = useState(0.4);

  // WebRTC Virtual Family Circle inputs
  const { user } = useAuth();
  const [isGroupMode, setIsGroupMode] = useState(false);
  const [groupIdInput, setGroupIdInput] = useState('egregora-prece');
  const [myNameInput, setMyNameInput] = useState(() => user?.name || '');
  const [showChatDrawer, setShowChatDrawer] = useState(false);
  const [userChatInputValue, setUserChatInputValue] = useState('');
  const [codeCopied, setCodeCopied] = useState(false);

  // Sync inputs with user object when it updates
  useEffect(() => {
    if (user?.name && !myNameInput) {
      const timer = setTimeout(() => {
        setMyNameInput(user.name);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [user, myNameInput]);

  // Auto fallback name if empty
  const activeMyName = myNameInput.trim() || (participants.split(',')[0]?.trim()) || 'Anfitrião';

  // Setup WebRTC Hook
  const {
    localStream,
    setLocalVideoElement,
    remoteStreams,
    isAudioEnabled,
    isVideoEnabled,
    activeParticipants,
    chatMessages,
    isJoining,
    isJoined,
    connectionError,
    connect: webrtcConnect,
    toggleAudio,
    toggleVideo,
    sendChatMessage,
    disconnect: webrtcDisconnect,
  } = useWebRTCPure(
    isGroupMode ? groupIdInput.trim().toLowerCase() : '',
    activeMyName
  );

  // General controls active state
  const [fontSize, setFontSize] = useState(16); // in px
  const [history, setHistory] = useState<any[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Interactive step execution states:
  // Step 1: Opening Prayer
  const [openingPrayer, setOpeningPrayer] = useState(STANDARD_OPENING_PRAYER);
  const [loadingPrayer, setLoadingPrayer] = useState(false);

  // Step 2: Gospel selection
  const [gospelMethod, setGospelMethod] = useState<'random' | 'chapter' | 'manual'>('random');
  const [selectedChapter, setSelectedChapter] = useState(5);
  const [customGospelText, setCustomGospelText] = useState('');
  const [gospelData, setGospelData] = useState<any>(STATIC_PASSAGES[0]);
  const [loadingGospel, setLoadingGospel] = useState(false);

  // Step 3: Discussion Timer
  const [timerSecondsLeft, setTimerSecondsLeft] = useState(300);
  const [timerActive, setTimerActive] = useState(false);

  // Step 4: Vibration Checks
  const [vibrationsSet, setVibrationsSet] = useState({
    humanity: false,
    hospitals: false,
    friends: false,
    home: false,
    forgiveness: false,
  });

  // Step 5: Fluidification progress
  const [waterProgress, setWaterProgress] = useState(0);
  const [waterActive, setWaterActive] = useState(false);
  const [activeAffirmationIndex, setActiveAffirmationIndex] = useState(0);

  // Step 6: Closing Prayer
  const [closingPrayer, setClosingPrayer] = useState(STANDARD_CLOSING_PRAYER);
  const [loadingClosing, setLoadingClosing] = useState(false);

  // Audio Managers
  const soundRef = useRef(soundType);

  // Audio control trigger
  useEffect(() => {
    soundRef.current = soundType;
    if (typeof window !== 'undefined') {
      const audio = getAudioManager();
      if (soundType === 'none') {
        audio.stop();
      } else if (soundType === '432hz') {
        audio.play432Hz();
      } else if (soundType === 'ocean') {
        audio.playOcean();
      }
    }
  }, [soundType]);

  useEffect(() => {
    if (typeof window !== 'undefined' && soundType !== 'none') {
      getAudioManager().setVolume(soundVolume);
    }
  }, [soundVolume, soundType]);

  // Load History from Local Storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('gospel_at_home_session_history');
        if (stored) {
          setTimeout(() => {
            setHistory(JSON.parse(stored));
          }, 0);
        }
      } catch (e) {
        console.error("Could not parse history", e);
      }
    }
  }, []);

  // Sync view from URL parameters (if conference=true or similar)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('conference') === 'true' || window.location.pathname.includes('/conference')) {
        const timer = setTimeout(() => {
          setView('session');
        }, 0);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleStart = (groupMode?: boolean) => {
    if (groupMode !== undefined) {
      setIsGroupMode(groupMode);
    }
    setView('session');
    setStep(0);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('conference', 'true');
      window.history.pushState(null, '', url.pathname + url.search);
    }
  };

  // Save session to history helper
  const saveSessionToJournal = () => {
    const activeIntentionText = customIntention || 
      (INTENTION_PRESETS.find(p => p.value === intentionType)?.text) || 
      "Sintonia e paz familiar";

    const newRecord = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('pt-BR'),
      timestamp: Date.now(),
      participants: participants || "Individual",
      chapterNum: gospelData?.chapter || selectedChapter,
      chapterTitle: gospelData?.chapterTitle || "Estudo Escolhido",
      sectionTitle: gospelData?.sectionTitle || "Reflexões Livres",
      intention: activeIntentionText,
    };

    const updated = [newRecord, ...history];
    setHistory(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('gospel_at_home_session_history', JSON.stringify(updated));
    }
  };

  const deleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = history.filter(item => item.id !== id);
    setHistory(filtered);
    if (typeof window !== 'undefined') {
      localStorage.setItem('gospel_at_home_session_history', JSON.stringify(filtered));
    }
  };

  // Step 3 Timer Core Logic
  const clockIntervalRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (timerActive) {
      clockIntervalRef.current = setInterval(() => {
        setTimerSecondsLeft(prev => {
          if (prev <= 1) {
            setTimerActive(false);
            // Play a gentle chime when the session timer ends
            if (typeof window !== 'undefined') {
              try {
                const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(528, audioCtx.currentTime); // 528Hz love chime frequency
                gain.gain.setValueAtTime(0, audioCtx.currentTime);
                gain.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + 0.1);
                gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 2.5);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start();
                osc.stop(audioCtx.currentTime + 3.0);
              } catch (e) {}
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (clockIntervalRef.current) clearInterval(clockIntervalRef.current);
    }
    return () => {
      if (clockIntervalRef.current) clearInterval(clockIntervalRef.current);
    };
  }, [timerActive]);

  // Step 5 Fluidification Core Logic (Fluidifica em 45 segundos)
  const fluidificationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (waterActive) {
      fluidificationIntervalRef.current = setInterval(() => {
        setWaterProgress(prev => {
          if (prev >= 100) {
            setWaterActive(false);
            return 100;
          }
          // Cycle healing affirmations every 15% progress
          const percentageDone = prev + 2.22; // 45 seconds roughly
          const nextAffIndex = Math.min(
            Math.floor((percentageDone / 100) * HEALING_AFFIRMATIONS.length),
            HEALING_AFFIRMATIONS.length - 1
          );
          setActiveAffirmationIndex(nextAffIndex);
          return Math.min(percentageDone, 100);
        });
      }, 1000);
    } else {
      if (fluidificationIntervalRef.current) clearInterval(fluidificationIntervalRef.current);
    }
    return () => {
      if (fluidificationIntervalRef.current) clearInterval(fluidificationIntervalRef.current);
    };
  }, [waterActive]);

  // Start a fresh session
  const startSession = async () => {
    // Reset session parameters
    setStep(1);
    setTimerSecondsLeft(durationComments * 60);
    setTimerActive(false);
    setVibrationsSet({
      humanity: false,
      hospitals: false,
      friends: false,
      home: false,
      forgiveness: false,
    });
    setWaterProgress(0);
    setWaterActive(false);
    setActiveAffirmationIndex(0);

    // Auto load standard prayers
    setOpeningPrayer(STANDARD_OPENING_PRAYER);
    setClosingPrayer(STANDARD_CLOSING_PRAYER);

    // Call server API proactively to generate AI Opening Prayer based on intention
    const targetIntention = customIntention || 
      (INTENTION_PRESETS.find(p => p.value === intentionType)?.text) || 
      "harmonização e amparo espiritual para todos os presentes";

    try {
      setLoadingPrayer(true);
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_prayer',
          intention: { type: 'abertura', custom: targetIntention }
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.content) {
          setOpeningPrayer({ title: data.title || "Prece de Abertura sugerida por IA", content: data.content });
        }
      }
    } catch (e) {
      console.error("AI Prayer generating error, using offline prayer fallback", e);
    } finally {
      setLoadingPrayer(false);
    }
  };

  // Dynamically load Gospel Passage (server-side Gemini)
  const fetchGospelSelection = async () => {
    setLoadingGospel(true);

    try {
      let body: any = { action: 'get_passage' };
      if (gospelMethod === 'chapter') {
        body.chapter = selectedChapter;
      } else if (gospelMethod === 'manual' && customGospelText) {
        body = { action: 'explain_custom', customText: customGospelText };
      }

      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        const data = await res.json();
        if (gospelMethod === 'manual') {
          setGospelData({
            chapter: 0,
            chapterTitle: "Gospel Reflection",
            sectionTitle: data.title || "Reflexão sobre Texto Livre",
            text: customGospelText,
            commentary: data.commentary,
            reflections: data.reflections
          });
        } else if (data && data.text) {
          setGospelData(data);
        } else {
          // Use random fallback
          const fallback = STATIC_PASSAGES[Math.floor(Math.random() * STATIC_PASSAGES.length)];
          setGospelData(fallback);
        }
      } else {
        // HTTP Error fallback
        const fallback = STATIC_PASSAGES[Math.floor(Math.random() * STATIC_PASSAGES.length)];
        setGospelData(fallback);
      }
    } catch (e) {
      console.error("Gemini failed, using highly inspiring static offline fallback.", e);
      const fallback = STATIC_PASSAGES[Math.floor(Math.random() * STATIC_PASSAGES.length)];
      setGospelData(fallback);
    } finally {
      setLoadingGospel(false);
    }
  };

  // Generate a customized Closing Prayer with Gemini API
  const generateAIClosePrayer = async () => {
    try {
      setLoadingClosing(true);
      const targetIntention = customIntention || 
        (INTENTION_PRESETS.find(p => p.value === intentionType)?.text) || 
        "gratidão pelas bênçãos recebidas";

      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_prayer',
          intention: { type: 'encerramento', custom: targetIntention + `. Incluir no encerramento as reflexões do estudo sobre o tema espiritual: ${gospelData?.sectionTitle}` }
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.content) {
          setClosingPrayer({ title: data.title || "Prece de Encerramento por IA", content: data.content });
        }
      }
    } catch (e) {
      console.error("AI Closing prayer error, using offline closing prayer fallback", e);
    } finally {
      setLoadingClosing(false);
    }
  };

  // Render Header Component
  const renderNavHeader = () => {
    return (
      <header id="app-nav-header" className="w-full border-b border-[#E6DEC9] bg-[#FAF8F5]/80 backdrop-blur-md sticky top-0 z-30 py-4 px-6 md:px-12 flex justify-between items-center">
        <div className="flex items-center gap-3 animate-fadeIn">
          <div className="bg-amber-100 p-2 rounded-full text-amber-800">
            <Flame className="w-5 h-5 flex-shrink-0 animate-pulse text-amber-600" />
          </div>
          <div>
            <span className="font-serif tracking-tight text-lg font-bold text-[#3B342C]">Evangelho no Lar</span>
            <span className="hidden md:inline-block ml-3 px-2 py-0.5 rounded text-[10px] font-mono tracking-widest bg-amber-50 border border-amber-200 uppercase font-bold text-amber-800">
              Sessão de Paz
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            id="btn-home"
            onClick={() => {
              setView('landing');
              if (typeof window !== 'undefined') {
                const url = new URL(window.location.href);
                url.searchParams.delete('conference');
                window.history.pushState(null, '', url.pathname + url.search);
              }
            }}
            className="p-2 text-[#6D655A] hover:text-[#3B342C] hover:bg-[#F5EFE6] rounded-full transition-all focus:outline-none flex items-center gap-1.5 text-xs font-serif font-bold cursor-pointer"
            title="Voltar para a Página Inicial"
          >
            <Home className="w-4 h-4 text-amber-900" />
            <span className="hidden sm:inline">Início</span>
          </button>

          <button 
            id="btn-help"
            onClick={() => setShowHelpModal(true)}
            className="p-2 text-[#6D655A] hover:text-[#3B342C] hover:bg-stone-100 rounded-full transition-all focus:outline-none cursor-pointer"
            title="Como realizar o Evangelho no Lar?"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
          
          <button 
            id="btn-history"
            onClick={() => setShowHistoryModal(true)}
            className="p-2 text-[#6D655A] hover:text-[#3B342C] hover:bg-stone-100 rounded-full transition-all focus:outline-none flex items-center gap-2 text-sm font-medium pr-3 cursor-pointer"
          >
            <Calendar className="w-5 h-5" />
            <span className="hidden sm:inline">Diário ({history.length})</span>
          </button>
        </div>
      </header>
    );
  };

  if (view === 'landing') {
    return <Landing onStart={handleStart} />;
  }

  return (
    <div id="evangelho-app-root" className="min-h-screen flex flex-col selection:bg-amber-100 selection:text-amber-900">
      
      {/* Dynamic Header */}
      {renderNavHeader()}

      {/* Main Container */}
      <main className="flex-grow flex flex-col max-w-4xl w-full mx-auto px-6 py-8 md:py-16 justify-center">
        
        {/* Active WebRTC Group Dock inside Session */}
        {step > 0 && step < 7 && isGroupMode && isJoined && (
          <div className="w-full bg-[#FCFBFA]/85 backdrop-blur-md rounded-2xl border border-[#E6DEC9]/70 p-3 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm animate-fadeIn">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <span className="font-serif font-bold text-xs text-[#3B342C] block">Círculo Virtual Ativo</span>
                <span className="text-[10px] text-stone-500 font-mono tracking-widest uppercase">Sala: {groupIdInput}</span>
              </div>
            </div>

            {/* Miniature camera circles row */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Local webcam preview */}
              <div className="relative group flex items-center gap-1.5 bg-white border border-[#E6DEC9] pl-1.5 pr-2.5 py-1 rounded-full shadow-xs">
                <div className="w-6 h-6 rounded-full overflow-hidden bg-stone-900 border border-amber-600/30 flex items-center justify-center">
                  {localStream && isVideoEnabled ? (
                    <video
                      ref={(el) => {
                        if (el && localStream) {
                          el.srcObject = localStream;
                        }
                      }}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover scale-x-[-1]"
                    />
                  ) : (
                    <div className="w-full h-full bg-amber-100 flex items-center justify-center font-bold text-[8px] text-amber-900 uppercase">
                      {(myNameInput || 'Vc').substring(0, 2)}
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-serif font-bold text-stone-700">Você</span>
                
                {/* Controls */}
                <div className="flex gap-1.5 ml-1">
                  <button onClick={toggleAudio} className={`p-0.5 rounded-full text-stone-500 hover:text-stone-800 ${!isAudioEnabled && "text-red-500"}`}>
                    {isAudioEnabled ? <Mic className="w-3 h-3" /> : <MicOff className="w-3 h-3" />}
                  </button>
                  <button onClick={toggleVideo} className={`p-0.5 rounded-full text-stone-500 hover:text-stone-800 ${!isVideoEnabled && "text-red-500"}`}>
                    {isVideoEnabled ? <Video className="w-3 h-3" /> : <VideoOff className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              {/* Remote webcams */}
              {remoteStreams.map((peer) => (
                <div key={peer.id} className="relative flex items-center gap-1.5 bg-white border border-[#E6DEC9] pl-1.5 pr-2.5 py-1 rounded-full shadow-xs">
                  <div className="w-6 h-6 rounded-full overflow-hidden bg-stone-900 border border-amber-600/30 flex items-center justify-center">
                    <video
                      ref={(el) => {
                        if (el && peer.stream) {
                          el.srcObject = peer.stream;
                        }
                      }}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover scale-x-[-1]"
                    />
                  </div>
                  <span className="text-[10px] font-serif font-bold text-stone-700">{peer.name}</span>
                </div>
              ))}

              {/* Chat Toggle button */}
              <button
                onClick={() => setShowChatDrawer(!showChatDrawer)}
                className="relative p-1.5 bg-[#3B342C] text-white rounded-full hover:bg-amber-800 transition-all cursor-pointer flex items-center justify-center"
                title="Mensagens do círculo"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                {chatMessages.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[7px] font-bold w-3 h-3 rounded-full flex items-center justify-center animate-bounce">
                    {chatMessages.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Shared Chat Drawer Overlay */}
        {isGroupMode && isJoined && showChatDrawer && (
          <div className="fixed bottom-6 right-6 w-80 max-w-full bg-[#FCFBFA] border border-[#E6DEC9] rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col h-96 animate-fadeIn">
            {/* Chat Header */}
            <div className="bg-[#FAF8F5] border-b border-[#E6DEC9] px-4 py-3 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-700 animate-pulse" />
                <span className="font-serif font-bold text-sm text-[#3B342C]">Vibrações e Pedidos de Prece</span>
              </div>
              <button
                onClick={() => setShowChatDrawer(false)}
                className="text-stone-400 hover:text-stone-700 font-bold text-xs cursor-pointer"
              >
                Fechar
              </button>
            </div>

            {/* Chat Messages Log */}
            <div className="flex-grow overflow-y-auto p-4 space-y-3 font-sans text-xs">
              {chatMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-stone-400 italic">
                  <span>Nenhum pedido enviado ainda. Irradie energias positivas enviando mensagens!</span>
                </div>
              ) : (
                chatMessages.map((msg) => (
                  <div key={msg.id} className={`space-y-0.5 ${msg.isSystem ? "text-center py-1 bg-amber-50/20 rounded" : "text-left"}`}>
                    {msg.isSystem ? (
                      <span className="text-[10px] text-amber-700/80 italic font-medium">
                        {msg.text}
                      </span>
                    ) : (
                      <div>
                        <div className="flex justify-between items-center text-[10px] text-stone-500 font-mono">
                          <span className="font-bold text-amber-900">{msg.senderName}</span>
                          <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="p-2 bg-stone-50 rounded-lg text-stone-700 mt-1 shadow-2xs border border-[#FAF8F5]">
                          {msg.text}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Chat Input form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (userChatInputValue.trim()) {
                  sendChatMessage(userChatInputValue.trim());
                  setUserChatInputValue('');
                }
              }}
              className="p-3 border-t border-[#E6DEC9] bg-[#FAF8F5] flex gap-2"
            >
              <input
                type="text"
                value={userChatInputValue}
                onChange={(e) => setUserChatInputValue(e.target.value)}
                placeholder="Ex: Vibração pela saúde do tio..."
                className="flex-grow bg-white border border-[#DCD3C1] focus:ring-1 focus:ring-amber-500 focus:border-amber-500 rounded-lg py-1.5 px-3 text-xs focus:outline-none"
              />
              <button
                type="submit"
                className="p-1.5 bg-amber-800 text-white rounded-lg hover:bg-amber-700 transition-all flex items-center justify-center cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}

        <AnimatePresence mode="wait">
          
          {/* STEP 0: Setup & Dashboard */}
          {step === 0 && (
            <motion.div 
              key="step-setup"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              <div className="text-center max-w-2xl mx-auto space-y-4">
                <span className="font-serif italic text-amber-700 font-medium">Allan Kardec & Mestre Jesus</span>
                <h1 className="font-serif text-3xl md:text-5xl font-bold tracking-tight text-[#3B342C] leading-tight">
                  Traga a Luz do Evangelho <br/>para Dentro do seu Lar
                </h1>
                <p className="text-stone-600 max-w-lg mx-auto text-base">
                  Reuna sua família ou monte seu espaço meditativo individual. Guiaremos você passo a passo com preces, leituras e sintonias de luz.
                </p>
              </div>

              {/* Meeting Mode Selector (Aesthetic Cards of Choice) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                <button
                  onClick={() => {
                    setIsGroupMode(false);
                    webrtcDisconnect();
                  }}
                  className={`flex items-center gap-4 p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    !isGroupMode 
                      ? "bg-amber-50/70 border-amber-600 ring-2 ring-amber-600/20 text-[#3B342C]" 
                      : "bg-white border-[#E6DEC9] hover:bg-stone-50 text-stone-700"
                  }`}
                >
                  <div className="bg-amber-100 p-2.5 rounded-full text-amber-800">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-serif font-bold text-sm block">Presencial ou Individual</span>
                    <span className="text-xs text-stone-500">Reunião local com quem está fisicamente no lar</span>
                  </div>
                </button>

                <button
                  onClick={() => setIsGroupMode(true)}
                  className={`flex items-center gap-4 p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    isGroupMode 
                      ? "bg-amber-50/70 border-amber-600 ring-2 ring-amber-600/20 text-[#3B342C]" 
                      : "bg-white border-[#E6DEC9] hover:bg-stone-50 text-stone-700"
                  }`}
                >
                  <div className="bg-amber-100 p-2.5 rounded-full text-amber-800">
                    <Video className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <span className="font-serif font-bold text-sm block">Grupo Virtual (Vídeochamada)</span>
                    <span className="text-xs text-stone-500">Sintonize com familiares de distantes por vídeo e áudio</span>
                  </div>
                </button>
              </div>

              {/* WebRTC Video call panel if isGroupMode is true */}
              {isGroupMode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-[#FCFBFA] border border-[#E6DEC9] rounded-2xl p-6 shadow-sm overflow-hidden space-y-5"
                >
                  <div className="flex items-center gap-2 border-b border-[#F5F2EB] pb-3">
                    <Tv className="w-5 h-5 text-amber-700 animate-bounce" />
                    <div>
                      <h3 className="font-serif font-bold text-lg text-[#3B342C]">Sintonia do Círculo Familiar Virtual</h3>
                      <p className="text-xs text-stone-500">Reúna familiares e amigos do plano físico em prece por vídeo e áudio</p>
                    </div>
                  </div>

                  {!isJoined ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-end">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-stone-500">Seu Nome / Apelido no Vídeo</label>
                        <input
                          type="text"
                          value={myNameInput}
                          onChange={(e) => setMyNameInput(e.target.value)}
                          placeholder="Ex: Tio Roberto"
                          className="w-full bg-[#FAF8F5] border border-[#DCD3C1] focus:ring-1 focus:ring-amber-500 focus:border-amber-500 rounded-lg py-2.5 px-3 text-sm transition-all focus:outline-none"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-stone-500">Código de Acesso da Sala</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={groupIdInput}
                            onChange={(e) => setGroupIdInput(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                            placeholder="Ex: grupo-familia"
                            className="w-full bg-[#FAF8F5] border border-[#DCD3C1] focus:ring-1 focus:ring-amber-500 focus:border-amber-500 rounded-lg py-2.5 px-3 text-sm transition-all focus:outline-none font-mono"
                          />
                          <button
                            onClick={() => {
                              const rnd = Math.random().toString(36).substring(2, 7);
                              setGroupIdInput(`paz-${rnd}`);
                            }}
                            className="px-3 bg-white hover:bg-stone-50 text-stone-600 rounded-lg text-xs font-mono border border-[#DCD3C1] transition-all cursor-pointer"
                            title="Gerar código aleatório"
                          >
                            Gerar
                          </button>
                        </div>
                      </div>

                      <div className="md:col-span-2 flex justify-between items-center pt-2 flex-wrap gap-3">
                        {connectionError ? (
                          <span className="text-xs text-red-600 bg-red-50 border border-red-100 py-1 px-3 rounded-md">
                            {connectionError}
                          </span>
                        ) : (
                          <span className="text-[11px] text-stone-400 max-w-sm italic">
                            *Certifique-se de liberar o microfone e a câmera para participar do círculo de irradiações virtuais.
                          </span>
                        )}
                        <button
                          onClick={webrtcConnect}
                          disabled={isJoining}
                          className="px-6 py-2.5 bg-amber-800 hover:bg-amber-700 text-white font-serif rounded-lg border border-transparent shadow-xs transition-all text-sm font-bold flex items-center gap-2 cursor-pointer disabled:opacity-55 ml-auto"
                        >
                          {isJoining ? "Irradiando sintonia..." : "Conectar ao Círculo Virtual"}
                          <Sparkles className="w-4 h-4 flex-shrink-0 animate-pulse text-amber-200" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex flex-wrap justify-between items-center gap-3 bg-amber-50/50 border border-amber-200/40 p-3 rounded-xl">
                        <div className="flex items-center gap-2 text-xs text-amber-900">
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                          <span className="font-semibold">Sua egrégora está conectada!</span>
                          <span className="font-mono bg-amber-100/55 px-2 py-0.5 rounded border border-amber-200 font-bold ml-1 uppercase">
                            SALA: {groupIdInput}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              if (typeof navigator !== "undefined" && navigator.clipboard) {
                                navigator.clipboard.writeText(groupIdInput);
                                setCodeCopied(true);
                                setTimeout(() => setCodeCopied(false), 2000);
                              }
                            }}
                            className="p-1 px-2.5 bg-white border border-stone-200 hover:bg-stone-50 rounded text-xs text-stone-600 transition-all cursor-pointer flex items-center gap-1.5"
                          >
                            <Share2 className="w-3.5 h-3.5" /> 
                            {codeCopied ? "Copiado!" : "Compartilhar Código"}
                          </button>
                          
                          <button
                            onClick={webrtcDisconnect}
                            className="p-1 px-2.5 bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-800 rounded text-xs transition-all cursor-pointer flex items-center gap-1.5 border border-red-200/45"
                          >
                            <LogOut className="w-3.5 h-3.5" /> Desconectar
                          </button>
                        </div>
                      </div>

                      {/* Display live streams in Step 0 */}
                      <div className="bg-stone-50 p-4 rounded-xl border border-[#F5F2EB] space-y-4">
                        <span className="text-xs font-semibold tracking-wider uppercase text-stone-500 block">Sintonias Conectadas no Lar ({activeParticipants.length})</span>
                        
                        <div className="flex flex-wrap justify-center gap-6 py-2">
                          {/* Local participant video circle */}
                          <div className="relative flex flex-col items-center">
                            <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-amber-700/20 shadow-lg bg-stone-950 flex items-center justify-center">
                              {localStream && isVideoEnabled ? (
                                <video
                                  ref={(el) => {
                                    if (el && localStream) {
                                      el.srcObject = localStream;
                                    }
                                  }}
                                  autoPlay
                                  playsInline
                                  muted
                                  className="w-full h-full object-cover scale-x-[-1]"
                                />
                              ) : (
                                <div className="absolute inset-0 bg-gradient-to-br from-amber-700/20 via-orange-900/10 to-amber-900/40 flex flex-col items-center justify-center">
                                  <VideoOff className="w-6 h-6 text-stone-400 mb-1" />
                                  <span className="text-[10px] text-stone-500 font-mono">Vídeo Desativado</span>
                                </div>
                              )}
                              <div className="absolute inset-0 border-2 border-amber-500/20 rounded-full pointer-events-none animate-pulse" />
                            </div>
                            <span className="text-xs font-serif font-bold mt-2 text-stone-700 bg-white px-2 py-0.5 rounded-full shadow-xs border border-stone-200 flex items-center gap-1">
                              {myNameInput || 'Você'} (Você)
                            </span>
                            
                            {/* Local toggles */}
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={toggleAudio}
                                className={`p-1.5 rounded-full border transition-all cursor-pointer ${
                                  isAudioEnabled 
                                    ? "bg-white border-stone-200 hover:bg-stone-50 text-stone-700" 
                                    : "bg-red-50 border-red-200 text-red-600"
                                }`}
                                title={isAudioEnabled ? "Mutar microfone" : "Ativar microfone"}
                              >
                                {isAudioEnabled ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                              </button>
                              <button
                                onClick={toggleVideo}
                                className={`p-1.5 rounded-full border transition-all cursor-pointer ${
                                  isVideoEnabled 
                                    ? "bg-white border-stone-200 hover:bg-stone-50 text-stone-700" 
                                    : "bg-red-50 border-red-200 text-red-600"
                                }`}
                                title={isVideoEnabled ? "Desativar câmera" : "Ativar câmera"}
                              >
                                {isVideoEnabled ? <Video className="w-3.5 h-3.5" /> : <VideoOff className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>

                          {/* Remote participants video circles */}
                          {remoteStreams.map((peer) => (
                            <div key={peer.id} className="relative flex flex-col items-center">
                              <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-amber-700/20 shadow-lg bg-stone-950 flex items-center justify-center">
                                <video
                                  ref={(el) => {
                                    if (el && peer.stream) {
                                      el.srcObject = peer.stream;
                                    }
                                  }}
                                  autoPlay
                                  playsInline
                                  className="w-full h-full object-cover scale-x-[-1]"
                                />
                                <div className="absolute inset-0 border-2 border-emerald-500/20 rounded-full pointer-events-none animate-pulse" />
                              </div>
                              <span className="text-xs font-serif font-bold mt-2 text-stone-700 bg-white px-2 py-0.5 rounded-full shadow-xs border border-stone-200">
                                {peer.name}
                              </span>
                            </div>
                          ))}

                          {remoteStreams.length === 0 && (
                            <div className="w-full flex flex-col items-center justify-center py-4 text-center">
                              <p className="text-xs text-stone-500 italic max-w-sm">
                                Compartilhe o código &ldquo;{groupIdInput}&rdquo; com familiares! Assim que eles entrarem, vocês se verão neste círculo.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Bento Grid Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                
                {/* Left Side settings */}
                <div className="bg-[#FCFBFA] rounded-2xl border border-[#E6DEC9] p-6 space-y-6 shadow-sm">
                  <div className="flex items-center gap-2 border-b border-[#F5F2EB] pb-3">
                    <Users className="w-5 h-5 text-amber-700" />
                    <h3 className="font-serif font-bold text-lg text-[#3B342C]">Quem está participando?</h3>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-stone-500">Participantes</label>
                    <input 
                      id="input-participants"
                      type="text"
                      value={participants}
                      onChange={(e) => setParticipants(e.target.value)}
                      placeholder="Ex: Pedro, Maria, Sofia (ou vazio para individual)"
                      className="w-full bg-[#FAF8F5] border border-[#DCD3C1] focus:ring-1 focus:ring-amber-500 focus:border-amber-500 rounded-lg py-2.5 px-3 text-sm transition-all focus:outline-none"
                    />
                    <p className="text-[11px] text-stone-500">Os nomes farão parte das vibrações de luz e do diário de reuniões.</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-stone-500">Intenção Vibracional</label>
                    <div className="grid grid-cols-1 gap-2">
                      {INTENTION_PRESETS.map((preset) => (
                        <button
                          key={preset.value}
                          onClick={() => {
                            setIntentionType(preset.value);
                            setCustomIntention('');
                          }}
                          className={`flex items-start text-left p-3 rounded-lg border text-xs transition-all ${
                            intentionType === preset.value && !customIntention
                              ? "bg-amber-50/50 border-amber-600 ring-1 ring-amber-600 text-amber-900" 
                              : "bg-white border-[#E6DEC9] hover:bg-stone-50 text-stone-700"
                          }`}
                        >
                          <div className="space-y-1">
                            <span className="font-semibold block">{preset.label}</span>
                            <span className="text-[11px] text-stone-500 font-normal leading-relaxed">{preset.text}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-stone-500">Ou digite uma Intenção Customizada</label>
                    <textarea 
                      id="input-custom-intention"
                      rows={2}
                      value={customIntention}
                      onChange={(e) => {
                        setCustomIntention(e.target.value);
                        setIntentionType('');
                      }}
                      placeholder="Quero vibrar pelo reestabelecimento emocional de..."
                      className="w-full bg-[#FAF8F5] border border-[#DCD3C1] focus:ring-1 focus:ring-amber-500 focus:border-amber-500 rounded-lg py-2 px-3 text-sm transition-all focus:outline-none resize-none"
                    />
                  </div>
                </div>

                {/* Right Side Settings */}
                <div className="bg-[#FCFBFA] rounded-2xl border border-[#E6DEC9] p-6 space-y-6 shadow-sm">
                  
                  <div className="flex items-center gap-2 border-b border-[#F5F2EB] pb-3">
                    <Compass className="w-5 h-5 text-amber-700" />
                    <h3 className="font-serif font-bold text-lg text-[#3B342C]">Sintonia Ambiental</h3>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 block">Sons para Meditação</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setSoundType('none')}
                        className={`py-2 px-3 border rounded-lg text-xs font-semibold transition-all ${
                          soundType === 'none' 
                            ? "bg-[#3B342C] text-white border-transparent" 
                            : "bg-white border-[#E6DEC9] hover:bg-stone-50 text-[#6D655A]"
                        }`}
                      >
                        Silêncio
                      </button>
                      <button
                        onClick={() => setSoundType('432hz')}
                        className={`py-2 px-3 border rounded-lg text-xs font-semibold transition-all ${
                          soundType === '432hz' 
                            ? "bg-[#3B342C] text-white border-transparent" 
                            : "bg-white border-[#E6DEC9] hover:bg-stone-50 text-[#6D655A]"
                        }`}
                      >
                        432 Hz
                      </button>
                      <button
                        onClick={() => setSoundType('ocean')}
                        className={`py-2 px-3 border rounded-lg text-xs font-semibold transition-all ${
                          soundType === 'ocean' 
                            ? "bg-[#3B342C] text-white border-transparent" 
                            : "bg-white border-[#E6DEC9] hover:bg-stone-50 text-[#6D655A]"
                        }`}
                      >
                        Oceano
                      </button>
                    </div>

                    {soundType !== 'none' && (
                      <div className="flex items-center gap-3 bg-stone-50 px-3 py-2 rounded-lg border border-[#F5F2EB] animate-fadeIn">
                        <Volume1 className="w-4 h-4 text-stone-500" />
                        <input 
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={soundVolume}
                          onChange={(e) => setSoundVolume(parseFloat(e.target.value))}
                          className="w-full h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-amber-700"
                        />
                        <span className="text-[10px] font-mono text-stone-500 w-6 text-right">
                          {Math.round(soundVolume * 100)}%
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold uppercase tracking-wider text-stone-500">Tempo de Diálogo / Reflexão</label>
                      <span className="text-xs font-semibold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-amber-800 font-mono">
                        {durationComments} min
                      </span>
                    </div>
                    <input 
                      type="range"
                      min="1"
                      max="20"
                      step="1"
                      value={durationComments}
                      onChange={(e) => setDurationComments(parseInt(e.target.value))}
                      className="w-full h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-amber-700"
                    />
                    <p className="text-[11px] text-stone-500 leading-normal">
                      Sugerimos 5 a 10 minutos para manter o foco e respeitar o cronograma do Evangelho no Lar sem exaustão.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-50/40 border border-[#E6DEC9]/60 flex gap-3 items-start">
                    <Droplets className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5 animate-bounce" />
                    <div>
                      <span className="font-serif font-bold text-sm block text-amber-900">Prepare seu copo de água</span>
                      <p className="text-xs text-stone-600 leading-relaxed mt-1">
                        Coloque um copo ou garrafa de água pura perto de você antes de começar, para receber a fluidificação benéfica dos benfeitores e mentores durante a vibração.
                      </p>
                    </div>
                  </div>

                  <button 
                    id="btn-start-session"
                    onClick={startSession}
                    className="w-full bg-amber-800 hover:bg-amber-700 text-white font-serif py-3.5 px-6 rounded-xl shadow-md font-bold transition-all text-base focus:outline-none flex justify-center items-center gap-2 text-shadow cursor-pointer hover:shadow-lg active:scale-[0.98]"
                  >
                    Iniciar Evangelho no Lar
                    <ArrowRight className="w-5 h-5 flex-shrink-0" />
                  </button>

                </div>

              </div>
              
              {/* Session History Mini Card */}
              {history.length > 0 && (
                <div className="bg-[#FCFBFA] rounded-2xl border border-[#E6DEC9] p-6 shadow-sm">
                  <div className="flex justify-between items-center border-b border-[#F5F2EB] pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-amber-700" />
                      <h3 className="font-serif font-bold text-lg text-[#3B342C]">Últimas Reuniões no Lar</h3>
                    </div>
                    <button 
                      onClick={() => setShowHistoryModal(true)}
                      className="text-xs font-semibold text-amber-800 hover:text-amber-700 hover:underline"
                    >
                      Ver todos
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {history.slice(0, 3).map((item) => (
                      <div 
                        key={item.id} 
                        className="p-3 bg-white border border-[#E6DEC9] rounded-xl text-xs space-y-1.5 hover:border-amber-300 transition-all cursor-pointer relative group"
                        onClick={() => {
                          setStep(0);
                          setShowHistoryModal(true);
                        }}
                      >
                        <div className="flex justify-between items-center text-[10px] text-stone-500 font-mono">
                          <span>{item.date}</span>
                          <span className="bg-amber-50 group-hover:bg-amber-100 px-1.5 py-0.5 rounded transition-all">
                            Cap. {item.chapterNum}
                          </span>
                        </div>
                        <h4 className="font-serif font-bold text-[#3B342C] line-clamp-1">{item.chapterTitle}</h4>
                        <p className="text-stone-500 line-clamp-1 text-[11px] italic">{item.intention}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 1: Prece de Abertura */}
          {step === 1 && (
            <motion.div 
              key="step-opening-prayer"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Stepper bar */}
              {renderProgressBar(1)}

              <div className="bg-[#FCFBFA] rounded-2xl border border-[#E6DEC9] p-6 md:p-10 space-y-6 shadow-sm">
                
                <div className="flex justify-between items-start border-b border-[#F5F2EB] pb-4">
                  <div>
                    <span className="text-xs font-mono tracking-widest text-amber-700 uppercase font-semibold">Passo 1 de 6</span>
                    <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#3B342C] mt-1">{openingPrayer.title}</h2>
                  </div>
                  
                  {/* Font Adjuster */}
                  <div className="flex gap-1.5 bg-stone-100 p-1 rounded-lg">
                    <button onClick={() => setFontSize(Math.max(12, fontSize - 2))} className="p-1 px-2 text-xs font-bold font-mono hover:bg-white rounded transition" title="Diminuir Fonte">
                      <AArrowDown className="w-4 h-4 text-stone-600" />
                    </button>
                    <button onClick={() => setFontSize(Math.min(26, fontSize + 2))} className="p-1 px-2 text-xs font-bold font-mono hover:bg-white rounded transition" title="Aumentar Fonte">
                      <AArrowUp className="w-4 h-4 text-stone-600" />
                    </button>
                  </div>
                </div>

                {loadingPrayer ? (
                  <div className="py-16 text-center space-y-4">
                    <div className="inline-block animate-spin text-amber-700">
                      <Sparkles className="w-8 h-8" />
                    </div>
                    <p className="text-sm font-medium italic text-stone-500 animate-pulse">Sintonizando vibrações do plano espiritual para inspirar a oração do seu lar...</p>
                  </div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="font-serif leading-relaxed text-stone-800 whitespace-pre-line tracking-wide bg-amber-50/20 p-6 rounded-xl border border-amber-200/50"
                    style={{ fontSize: `${fontSize}px` }}
                  >
                    {openingPrayer.content}
                  </motion.div>
                )}

                <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-[#F5F2EB] gap-3">
                  <button 
                    id="btn-regenerate-prayer"
                    disabled={loadingPrayer}
                    onClick={startSession} // Recalls the setup/generate flow
                    className="w-full sm:w-auto text-xs py-2 px-4 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4 text-amber-600 animate-pulse" />
                    Inspirar Nova Oração por IA
                  </button>

                  <button 
                    id="btn-to-gospel"
                    onClick={() => {
                      setStep(2);
                      fetchGospelSelection(); // Pregenerate the gospel passage
                    }}
                    className="w-full sm:w-auto bg-[#3B342C] hover:bg-[#2C2721] text-white font-serif py-3 px-8 rounded-xl shadow font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Realizar Leitura do Evangelho
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            </motion.div>
          )}

          {/* STEP 2: Leitura do Evangelho */}
          {step === 2 && (
            <motion.div 
              key="step-gospel-reading"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {renderProgressBar(2)}

              <div className="bg-[#FCFBFA] rounded-2xl border border-[#E6DEC9] p-6 md:p-10 space-y-6 shadow-sm">
                
                <div className="flex justify-between items-start border-b border-[#F5F2EB] pb-4">
                  <div>
                    <span className="text-xs font-mono tracking-widest text-amber-700 uppercase font-semibold">Passo 2 de 6</span>
                    <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#3B342C] mt-1">Caridade e Estudo do Evangelho</h2>
                  </div>
                  
                  {/* Font Adjuster */}
                  <div className="flex gap-1.5 bg-stone-100 p-1 rounded-lg">
                    <button onClick={() => setFontSize(Math.max(12, fontSize - 2))} className="p-1 px-2 text-xs font-bold font-mono hover:bg-white rounded transition">
                      <AArrowDown className="w-3.5 h-3.5 text-stone-600" />
                    </button>
                    <button onClick={() => setFontSize(Math.min(26, fontSize + 2))} className="p-1 px-2 text-xs font-bold font-mono hover:bg-white rounded transition">
                      <AArrowUp className="w-3.5 h-3.5 text-stone-600" />
                    </button>
                  </div>
                </div>

                {/* Sub-selector of reading style */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-stone-100/60 p-1.5 rounded-lg border border-stone-200">
                  <button 
                    onClick={() => setGospelMethod('random')}
                    className={`py-2 px-3 rounded-md text-xs font-semibold tracking-wide transition-all ${
                      gospelMethod === 'random' 
                        ? "bg-[#3B342C] text-white shadow" 
                        : "text-stone-600 hover:text-[#3B342C]"
                    }`}
                  >
                    🌟 Abrir ao Acaso (IA)
                  </button>
                  <button 
                    onClick={() => setGospelMethod('chapter')}
                    className={`py-2 px-3 rounded-md text-xs font-semibold tracking-wide transition-all ${
                      gospelMethod === 'chapter' 
                        ? "bg-[#3B342C] text-white shadow" 
                        : "text-stone-600 hover:text-[#3B342C]"
                    }`}
                  >
                    📚 Escolher Capítulo
                  </button>
                  <button 
                    onClick={() => setGospelMethod('manual')}
                    className={`py-2 px-3 rounded-md text-xs font-semibold tracking-wide transition-all ${
                      gospelMethod === 'manual' 
                        ? "bg-[#3B342C] text-white shadow" 
                        : "text-stone-600 hover:text-[#3B342C]"
                    }`}
                  >
                    ✍️ Usar Livro Físico
                  </button>
                </div>

                {/* Inline control display for methodologies */}
                {gospelMethod === 'chapter' && (
                  <div className="flex flex-col sm:flex-row items-center gap-3 bg-[#FAF8F5] p-3 rounded-xl border border-[#E6DEC9]/60">
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-500 flex-shrink-0">Selecione o Capítulo:</span>
                    <select
                      id="select-chapter"
                      value={selectedChapter}
                      onChange={(e) => setSelectedChapter(parseInt(e.target.value))}
                      className="w-full sm:w-auto bg-white border border-[#DCD3C1] focus:ring-1 focus:ring-amber-500 rounded-lg py-1.5 px-3 text-sm focus:outline-none"
                    >
                      {GOSPEL_CHAPTERS.map(ch => (
                        <option key={ch.num} value={ch.num}>
                          Cap. {ch.num} — {ch.title}
                        </option>
                      ))}
                    </select>
                    <button 
                      onClick={fetchGospelSelection}
                      className="w-full sm:w-auto text-xs py-2 px-4 rounded-lg bg-amber-800 text-white font-bold tracking-wide hover:bg-amber-700 transition"
                    >
                      Carregar
                    </button>
                  </div>
                )}

                {gospelMethod === 'manual' && (
                  <div className="space-y-2 bg-[#FAF8F5] p-4 rounded-xl border border-[#E6DEC9]/60">
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-500 block">Escreva o trecho ou assunto que está lendo do seu livro:</span>
                    <textarea 
                      id="input-manual-gospel"
                      rows={3}
                      value={customGospelText}
                      onChange={(e) => setCustomGospelText(e.target.value)}
                      placeholder="Ex: Leia em voz alta do seu livro e digite o assunto ou o trecho de um versículo aqui para que a IA gere reflexões espirituais..."
                      className="w-full bg-white border border-[#DCD3C1] focus:ring-1 focus:ring-amber-500 rounded-lg py-2 px-3 text-sm focus:outline-none resize-none"
                    />
                    <button 
                      onClick={fetchGospelSelection}
                      disabled={!customGospelText}
                      className="text-xs py-2 px-4 rounded-lg bg-amber-800 text-white font-bold tracking-wide hover:bg-amber-700 transition disabled:opacity-50"
                    >
                      Gerar Reflexões Espíritas
                    </button>
                  </div>
                )}

                {/* Output reading pane */}
                {loadingGospel ? (
                  <div className="py-20 text-center space-y-3">
                    <div className="inline-block animate-spin text-amber-700">
                      <Sparkles className="w-8 h-8" />
                    </div>
                    <div className="text-stone-500 text-sm space-y-1">
                      <p className="font-semibold animate-pulse">Sintonizando o ensinamento do mestre...</p>
                      <p className="text-xs text-stone-400 italic">&ldquo;Buscai e achareis portas confortáveis de consolo espiritual.&rdquo;</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Chapter & section header */}
                    <div className="bg-amber-50/40 p-3 px-5 rounded-xl border-l-4 border-amber-600">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#BA5635]">O Evangelho Segundo o Espiritismo</span>
                      <h4 className="font-serif font-extrabold text-[#3B342C] text-lg">
                        {gospelData?.chapter > 0 && `Capítulo ${gospelData.chapter}: `}
                        {gospelData?.chapterTitle || "Estudo Escolhido"}
                      </h4>
                      {gospelData?.sectionTitle && (
                        <p className="text-xs text-stone-600 font-medium italic mt-0.5">{gospelData.sectionTitle}</p>
                      )}
                    </div>

                    {/* True Verse block */}
                    <blockquote 
                      id="text-gospel-verse"
                      className="font-serif italic leading-relaxed text-stone-800 border-l-2 border-[#DCD3C1] pl-6 py-1 whitespace-pre-wrap"
                      style={{ fontSize: `${fontSize}px` }}
                    >
                      &ldquo;{gospelData?.text}&rdquo;
                    </blockquote>

                  </div>
                )}

                {/* Footer Controls */}
                <div className="flex flex-col sm:flex-row justify-between items-center pt-6 border-t border-[#F5F2EB] gap-3">
                  <button 
                    onClick={fetchGospelSelection}
                    disabled={loadingGospel || gospelMethod === 'manual'}
                    className="w-full sm:w-auto text-xs py-2.5 px-4 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Sortear Outra Passagem
                  </button>

                  <div className="flex gap-3 w-full sm:w-auto">
                    <button 
                      onClick={() => setStep(1)}
                      className="flex-1 sm:flex-none py-3 px-5 rounded-xl border border-[#DCD3C1] hover:bg-stone-50 text-[#6D655A] font-serif font-semibold text-sm flex items-center justify-center gap-2 transition"
                    >
                      Voltar
                    </button>
                    <button 
                      onClick={() => {
                        setStep(3);
                        setTimerSecondsLeft(durationComments * 60);
                        setTimerActive(true); // Autostart comments timer
                      }}
                      className="flex-1 sm:flex-none bg-[#3B342C] hover:bg-[#2C2721] text-white font-serif py-3 px-8 rounded-xl shadow font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      Iniciar Comentários
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* STEP 3: Diálogo e Reflexão */}
          {step === 3 && (
            <motion.div 
              key="step-dialogue"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {renderProgressBar(3)}

              <div className="bg-[#FCFBFA] rounded-2xl border border-[#E6DEC9] p-6 md:p-10 space-y-6 shadow-sm">
                
                {/* Step header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-[#F5F2EB] pb-4 gap-4">
                  <div>
                    <span className="text-xs font-mono tracking-widest text-amber-700 uppercase font-semibold">Passo 3 de 6</span>
                    <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#3B342C] mt-1">Reflexões e Diálogo Familiar</h2>
                  </div>
                  
                  {/* Timer UI Component */}
                  <div className="flex items-center gap-3 bg-stone-100/80 px-4 py-2 rounded-xl border border-stone-200 flex-shrink-0">
                    <Clock className={`w-5 h-5 text-amber-700 ${timerActive ? 'animate-pulse' : ''}`} />
                    <span className="font-mono text-base font-bold tracking-tight text-stone-800">
                      {Math.floor(timerSecondsLeft / 60)}:{(timerSecondsLeft % 60).toString().padStart(2, '0')}
                    </span>
                    <button 
                      onClick={() => setTimerActive(!timerActive)}
                      className={`p-1 rounded bg-white hover:bg-stone-50 border border-stone-300 transition-all text-xs font-bold leading-none ${
                        timerActive ? 'text-red-700' : 'text-green-700'
                      }`}
                    >
                      {timerActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    </button>
                    <button 
                      onClick={() => {
                        setTimerSecondsLeft(durationComments * 60);
                        setTimerActive(false);
                      }}
                      className="p-1 rounded bg-white hover:bg-stone-50 border border-stone-200 transition text-stone-600"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Subheading alert */}
                <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#E6DEC9] text-xs leading-relaxed text-stone-600 space-y-2">
                  <span className="font-bold text-amber-800 uppercase block tracking-wider">Como realizar este momento?</span>
                  <p>Cada participante pode tecer breves comentários de 1 a 2 minutos sobre o trecho lido, compartilhando impressões espontâneas sem discussões teológicas demoradas.</p>
                </div>

                {/* Bento Grid: Left Column AI Commentary, Right Column 3 questions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  
                  {/* AI Commentary Card */}
                  <div className="bg-white rounded-xl border border-[#E6DEC9] p-5 space-y-3.5 shadow-sm">
                    <div className="flex items-center gap-2 text-amber-900 border-b border-stone-50 pb-2">
                      <Sparkles className="w-4 h-4 text-amber-700" />
                      <span className="font-serif font-bold text-sm">O Bálsamo da IA Espírita</span>
                    </div>
                    <p className="text-stone-700 leading-relaxed text-xs leading-relaxed font-serif tracking-wide bg-amber-50/10 p-4 rounded-lg border border-amber-200/20 whitespace-normal">
                      {gospelData?.commentary || "Use o amor e o diálogo fraterno para expor como essa mensagem nos ajuda no cotidiano. O espírito Consolador sempre sopra pensamentos de luz e resignação caridosa."}
                    </p>
                  </div>

                  {/* 3 Reflection Prompts Card */}
                  <div className="bg-[#FCFBFA] rounded-xl border border-[#E6DEC9] p-5 space-y-4 shadow-sm">
                    <div className="flex items-center gap-2 text-stone-700 border-b border-stone-100 pb-2">
                      <Compass className="w-4 h-4 text-stone-500" />
                      <span className="font-serif font-bold text-sm">Perguntas para Diálogo</span>
                    </div>

                    <div className="space-y-3">
                      {(gospelData?.reflections || STATIC_PASSAGES[0].reflections).map((promptText: string, idx: number) => (
                        <div 
                          key={idx} 
                          className="p-3 bg-white border border-[#E6DEC9] rounded-lg text-xs leading-relaxed text-[#3B342C] hover:border-amber-400 transition-all leading-normal flex items-start gap-2"
                        >
                          <span className="bg-amber-100 text-amber-800 text-[10px] py-0.5 px-1.5 rounded font-bold mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="font-medium">{promptText}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Core passage reference inside Dialogue step just in case */}
                <details className="text-xs text-[#6D655A] hover:text-[#3B342C] transition-all cursor-pointer bg-stone-50/50 rounded-lg p-3 border border-stone-200">
                  <summary className="font-semibold select-none">Ver trecho original de apoio</summary>
                  <blockquote className="mt-2 pl-4 border-l-2 border-[#DCD3C1] italic py-1 leading-relaxed whitespace-pre-line font-serif">
                    {gospelData?.text}
                  </blockquote>
                </details>

                <div className="flex justify-end gap-3 pt-4 border-t border-[#F5F2EB]">
                  <button 
                    onClick={() => {
                      setTimerActive(false);
                      setStep(2);
                    }}
                    className="py-3 px-5 rounded-xl border border-[#DCD3C1] hover:bg-stone-50 text-[#6D655A] font-serif font-semibold text-sm flex items-center justify-center gap-2 transition"
                  >
                    Voltar
                  </button>
                  <button 
                    onClick={() => {
                      setTimerActive(false);
                      setStep(4);
                    }}
                    className="bg-[#3B342C] hover:bg-[#2C2721] text-white font-serif py-3 px-8 rounded-xl shadow font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Ir para Vibrações
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            </motion.div>
          )}

          {/* STEP 4: Vibrações */}
          {step === 4 && (
            <motion.div 
              key="step-vibrations"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {renderProgressBar(4)}

              <div className="bg-[#FCFBFA] rounded-2xl border border-[#E6DEC9] p-6 md:p-10 space-y-6 shadow-sm">
                
                <div className="border-b border-[#F5F2EB] pb-4 text-center max-w-lg mx-auto space-y-1">
                  <span className="text-xs font-mono tracking-widest text-[#BA5635] uppercase font-semibold">Passo 4 de 6</span>
                  <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#3B342C]">Irradiações e Vibrações de Luz</h2>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Vibrar é orar com sentimento, projetando ondas mentais de paz, cura e harmonia sobre as pessoas doentes, necessitadas e sobre o nosso próprio ambiente.
                  </p>
                </div>

                {/* Dynamic Checklist panels for vibrations */}
                <div className="space-y-3.5 max-w-xl mx-auto">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-500 block">Envie vibrações para cada campo chave:</span>

                  {[
                    { key: "humanity", title: "Pela Humanidade e Planeta Terra", desc: "Pela harmonização mundial, diminuição das violências e amparo em guerras ou desastres físicos." },
                    { key: "hospitals", title: "Pelos Sofredores, Hospitais e Presídios", desc: "Amparo espiritual para almas em momentos de dor extrema, transição biológica ou obsessão complexa." },
                    { key: "friends", title: "Por Parentes, Amigos e Necessitados", desc: "Sintonize os nomes das pessoas com as quais convivemos direta ou indiretamente." },
                    { key: "home", title: "Pelo Nosso Lar e Vizinhos", desc: "Proteção fluídica da residência espiritual para que a harmonia, saúde e paz imperem no teto." },
                    { key: "forgiveness", title: "Por Nossos Afetos e Desafetos", desc: "Pelo autoperdão, tolerância e pela paz com aqueles com quem temos atritos morais." }
                  ].map((vib) => {
                    const active = (vibrationsSet as any)[vib.key];
                    return (
                      <button
                        key={vib.key}
                        onClick={() => {
                          setVibrationsSet(prev => {
                            const next = { ...prev, [vib.key]: !active };
                            // Sound gentle pulse when checks occur
                            if (typeof window !== 'undefined') {
                              try {
                                const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
                                const osc = audioCtx.createOscillator();
                                const gain = audioCtx.createGain();
                                osc.type = 'sine';
                                osc.frequency.setValueAtTime(320 + (active ? -40 : +40), audioCtx.currentTime);
                                gain.gain.setValueAtTime(0, audioCtx.currentTime);
                                gain.gain.linearRampToValueAtTime(0.06, audioCtx.currentTime + 0.05);
                                gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);
                                osc.connect(gain);
                                gain.connect(audioCtx.destination);
                                osc.start();
                                osc.stop(audioCtx.currentTime + 1.5);
                              } catch (e) {}
                            }
                            return next;
                          });
                        }}
                        className={`w-full text-left p-4 rounded-xl border flex items-start gap-4 transition-all relative overflow-hidden group ${
                          active 
                            ? "bg-amber-50/10 border-amber-600 ring-1 ring-amber-600 shadow-sm" 
                            : "bg-white border-[#E6DEC9] hover:bg-stone-50"
                        }`}
                      >
                        {/* Golden/pinkish glow ripple if active */}
                        {active && (
                          <div className="absolute inset-0 bg-radial-gradient from-amber-200/20 to-transparent pointer-events-none" />
                        )}

                        <div className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          active 
                            ? "bg-amber-600 border-amber-600 text-white" 
                            : "border-[#DCD3C1] group-hover:border-amber-400"
                        }`}>
                          <Check className="w-3.5 h-3.5" />
                        </div>

                        <div className="space-y-1 z-10">
                          <span className={`font-serif font-bold text-sm block ${active ? 'text-amber-900' : 'text-[#3B342C]'}`}>
                            {vib.title}
                          </span>
                          <p className="text-xs text-stone-500 leading-normal font-sans">
                            {vib.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-between items-center pt-6 border-t border-[#F5F2EB]">
                  <button 
                    onClick={() => setStep(3)}
                    className="py-3 px-5 rounded-xl border border-[#DCD3C1] hover:bg-stone-50 text-[#6D655A] font-serif font-semibold text-sm flex items-center justify-center gap-2 transition"
                  >
                    Voltar
                  </button>
                  <button 
                    onClick={() => {
                      setStep(5);
                      setWaterProgress(0);
                      setWaterActive(true); // Auto fluidification start
                    }}
                    className="bg-[#3B342C] hover:bg-[#2C2721] text-white font-serif py-3 px-8 rounded-xl shadow font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Fluidificar Água
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            </motion.div>
          )}

          {/* STEP 5: Fluidificação da Água */}
          {step === 5 && (
            <motion.div 
              key="step-fluidification"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {renderProgressBar(5)}

              <div className="bg-[#FCFBFA] rounded-2xl border border-[#E6DEC9] p-6 md:p-10 space-y-8 shadow-sm">
                
                <div className="border-b border-[#F5F2EB] pb-4 text-center max-w-lg mx-auto space-y-1">
                  <span className="text-xs font-mono tracking-widest text-amber-700 uppercase font-semibold">Passo 5 de 6</span>
                  <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#3B342C]">Fluídos Espirituais na Água</h2>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Benfeitores espirituais de alta frequência amorosa vertem seus bálsamos restauradores sobre o copo d&apos;água neste momento solene.
                  </p>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-center gap-10 max-w-2xl mx-auto py-4">
                  
                  {/* Stylized Energizing Glass with waving water droplets */}
                  <div className="flex-shrink-0 relative w-44 h-44 flex items-center justify-center bg-stone-50 rounded-2xl border border-stone-200 shadow-inner">
                    
                    {/* Floating gold bubbles/sparkles of energy */}
                    {waterActive && (
                      <div className="absolute inset-0">
                        <span className="absolute text-amber-500 text-sm animate-ping" style={{ top: '15%', left: '30%', animationDuration: '3s' }}>✦</span>
                        <span className="absolute text-amber-400 text-xs animate-ping" style={{ top: '35%', right: '25%', animationDuration: '4.5s' }}>✦</span>
                        <span className="absolute text-amber-600 text-[10px] animate-ping" style={{ bottom: '25%', left: '20%', animationDuration: '2.5s' }}>✦</span>
                      </div>
                    )}

                    <svg viewBox="0 0 100 100" className="w-32 h-32 text-stone-300 drop-shadow">
                      {/* Glass structure outline */}
                      <path d="M 25 10 L 30 85 Q 31 92 38 92 L 62 92 Q 69 92 70 85 L 75 10 Z" fill="none" stroke="#DCD3C1" strokeWidth="2.5" />
                      
                      {/* Water interior representation */}
                      <clipPath id="glass-clip">
                        <path d="M 25 10 L 30 85 Q 31 92 38 92 L 62 92 Q 69 92 70 85 L 75 10 Z" />
                      </clipPath>

                      {/* Moving water body wave */}
                      <g clipPath="url(#glass-clip)">
                        <rect 
                          x="0" 
                          y={100 - waterProgress * 0.8} // Fills up to 80% of glass height
                          width="100" 
                          height="100" 
                          fill="url(#glass-water-gradient)" 
                          className="transition-all duration-1000"
                        />
                        {/* Animated undulating top wave */}
                        {waterActive && (
                          <path 
                            d="M 0 45 Q 25 42 50 45 T 100 45" 
                            fill="none" 
                            stroke="#A5D8FF" 
                            strokeWidth="1.5"
                            className="translate-y-[-10px]"
                          />
                        )}
                      </g>

                      {/* Glass Base highlight */}
                      <path d="M 33 85 L 67 85" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" opacity="0.4" />

                      <defs>
                        <linearGradient id="glass-water-gradient" x1="0" y1="1" x2="0" y2="0">
                          {/* Rich spiritual gold/cyan color gradient representing magnetized water */}
                          <stop offset="0%" stopColor="#1C7ED6" stopOpacity="0.45" />
                          <stop offset="70%" stopColor="#228BE6" stopOpacity="0.30" />
                          <stop offset="100%" stopColor="#FCC419" stopOpacity="0.5" />
                        </linearGradient>
                      </defs>
                    </svg>

                    {/* Progress percentage centring */}
                    <div className="absolute inset-x-0 bottom-4 text-center">
                      <span className="font-mono text-xs font-bold bg-[#FAF8F5] border border-[#E6DEC9] px-2 py-0.5 rounded text-[#2D2B2A]">
                        Magnetizando {Math.round(waterProgress)}%
                      </span>
                    </div>

                  </div>

                  {/* Progressive Spiritual Affirmatives panel */}
                  <div className="flex-grow space-y-4 text-center md:text-left max-w-sm">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#BA5635] block">Magnetização Ativa:</span>
                    
                    <div className="min-h-[100px] flex items-center justify-center md:justify-start bg-amber-50/10 p-5 rounded-2xl border border-amber-200/20">
                      <AnimatePresence mode="wait">
                        <motion.p
                          key={activeAffirmationIndex}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.5 }}
                          className="font-serif italic text-stone-700 text-sm md:text-base leading-relaxed"
                        >
                          &ldquo;{HEALING_AFFIRMATIONS[activeAffirmationIndex]}&rdquo;
                        </motion.p>
                      </AnimatePresence>
                    </div>

                    <div className="flex items-center gap-2 justify-center md:justify-start">
                      <span className="text-[11px] text-stone-500 font-mono">
                        {waterActive ? "Aguarde finalização dos passes..." : "Pronto para tomar do copo!"}
                      </span>
                    </div>

                  </div>

                </div>

                <div className="flex justify-between items-center pt-4 border-t border-[#F5F2EB]">
                  <button 
                    onClick={() => {
                      setWaterActive(false);
                      setStep(4);
                    }}
                    className="py-3 px-5 rounded-xl border border-[#DCD3C1] hover:bg-stone-50 text-[#6D655A] font-serif font-semibold text-sm flex items-center justify-center gap-2 transition"
                  >
                    Voltar
                  </button>

                  <div className="flex gap-2">
                    {waterActive && (
                      <button 
                        onClick={() => {
                          setWaterActive(false);
                          setWaterProgress(100);
                        }}
                        className="py-2.5 px-3 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-500 font-bold text-xs"
                      >
                        Pular passes
                      </button>
                    )}
                    <button 
                      onClick={() => {
                        setWaterActive(false);
                        setStep(6);
                        generateAIClosePrayer(); // Pre-trigger AI closing prayer
                      }}
                      className="bg-[#3B342C] hover:bg-[#2C2721] text-white font-serif py-3 px-8 rounded-xl shadow font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      Prece de Encerramento
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* STEP 6: Prece de Encerramento */}
          {step === 6 && (
            <motion.div 
              key="step-closing-prayer"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {renderProgressBar(6)}

              <div className="bg-[#FCFBFA] rounded-2xl border border-[#E6DEC9] p-6 md:p-10 space-y-6 shadow-sm">
                
                <div className="flex justify-between items-start border-b border-[#F5F2EB] pb-4">
                  <div>
                    <span className="text-xs font-mono tracking-widest text-[#BA5635] uppercase font-semibold">Passo 6 de 6</span>
                    <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#3B342C] mt-1">{closingPrayer.title}</h2>
                  </div>
                  
                  {/* Font Adjuster */}
                  <div className="flex gap-1.5 bg-stone-100 p-1 rounded-lg">
                    <button onClick={() => setFontSize(Math.max(12, fontSize - 2))} className="p-1 px-2 text-xs font-bold font-mono hover:bg-white rounded transition">
                      <AArrowDown className="w-4 h-4 text-stone-600" />
                    </button>
                    <button onClick={() => setFontSize(Math.min(26, fontSize + 2))} className="p-1 px-2 text-xs font-bold font-mono hover:bg-white rounded transition">
                      <AArrowUp className="w-4 h-4 text-stone-600" />
                    </button>
                  </div>
                </div>

                {loadingClosing ? (
                  <div className="py-16 text-center space-y-4">
                    <div className="inline-block animate-spin text-amber-700">
                      <Sparkles className="w-8 h-8" />
                    </div>
                    <p className="text-sm font-medium italic text-stone-500 animate-pulse">Sintonizando vibrações elevadas de gratidão e caridade espiritual do lar...</p>
                  </div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="font-serif leading-relaxed text-stone-800 whitespace-pre-line tracking-wide bg-amber-50/20 p-6 rounded-xl border border-amber-200/50"
                    style={{ fontSize: `${fontSize}px` }}
                  >
                    {closingPrayer.content}
                  </motion.div>
                )}

                <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-[#F5F2EB] gap-3">
                  <button 
                    id="btn-regenerate-close"
                    disabled={loadingClosing}
                    onClick={generateAIClosePrayer}
                    className="w-full sm:w-auto text-xs py-2 px-4 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4 text-amber-700 animate-pulse" />
                    Inspirar Novo Encerramento por IA
                  </button>

                  <div className="flex gap-3 w-full sm:w-auto">
                    <button 
                      onClick={() => setStep(5)}
                      className="flex-1 sm:flex-none py-3 px-5 rounded-xl border border-[#DCD3C1] hover:bg-stone-50 text-[#6D655A] font-serif font-semibold text-sm flex items-center justify-center gap-2 transition"
                    >
                      Voltar
                    </button>
                    <button 
                      id="btn-finish"
                      onClick={() => {
                        saveSessionToJournal();
                        setStep(7);
                      }}
                      className="flex-1 sm:flex-none bg-amber-800 hover:bg-amber-700 text-white font-serif py-3 px-8 rounded-xl shadow font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer hover:shadow-lg"
                    >
                      Concluir Estudo
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* STEP 7: Completed Summary screen */}
          {step === 7 && (
            <motion.div 
              key="step-completed-summary"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center space-y-8 py-8"
            >
              <div className="inline-flex bg-amber-50 p-5 rounded-full border-2 border-amber-500/30 text-amber-800 animate-pulse">
                <CheckCircle2 className="w-12 h-12 text-amber-600" />
              </div>

              <div className="space-y-3 max-w-lg mx-auto">
                <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-[#3B342C]">Estudo Concluído com Sucesso!</h1>
                <p className="text-stone-600 text-sm leading-relaxed">
                  &ldquo;Onde houver duas ou mais pessoas reunidas em meu nome, ali eu estarei no meio delas.&rdquo; <br/>
                  <span className="font-mono text-[10px] text-amber-700 uppercase block mt-1 tracking-widest font-bold">Mateus 18:20</span>
                </p>
                <p className="text-[#6D655A] text-sm leading-relaxed font-serif bg-amber-50/20 p-5 rounded-xl border border-[#E6DEC9] mt-4">
                  Que os eflúvios de harmonia, equilíbrio físico, fluidos medicamentosos e saúde consolidada derramados em seu lar acompanhem você e seus familiares durante toda a semana.
                </p>
              </div>

              {/* Action Buttons to wrap up */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                <button 
                  id="btn-goto-history"
                  onClick={() => setShowHistoryModal(true)}
                  className="bg-white border border-[#DCD3C1] hover:bg-stone-50 text-[#3B342C] font-semibold text-sm py-3 px-6 rounded-xl transition flex justify-center items-center gap-2 cursor-pointer"
                >
                  <Calendar className="w-4 h-4 text-amber-700 animate-bounce" />
                  Ver Diário de Estudos
                </button>
                <button 
                  id="btn-back-home"
                  onClick={() => setStep(0)}
                  className="bg-amber-800 hover:bg-amber-700 text-white font-serif font-bold text-sm py-3 px-8 rounded-xl shadow transition-all flex justify-center items-center gap-2 cursor-pointer"
                >
                  <Home className="w-4 h-4" />
                  Voltar ao Painel Principal
                </button>
              </div>

            </motion.div>
          )}

        </AnimatePresence>

      </main>

      {/* FOOTER */}
      <footer id="app-footer" className="w-full text-center py-6 border-t border-[#E6DEC9]/60 text-stone-500 text-xs">
        <p className="font-serif italic font-medium">&ldquo;Fora da caridade não há salvação.&rdquo;</p>
        <p className="text-[10px] mt-1 tracking-wide font-mono">Espiritismo ✦ Allan Kardec Codificação</p>
      </footer>

      {/* MODERN HISTORY DIARY MODAL */}
      {showHistoryModal && (
        <div id="modal-history" className="fixed inset-0 bg-[#3B342CBD]/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-[#FCFBFA] rounded-2xl border border-[#E6DEC9] max-w-2xl w-full max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
            
            <div className="p-5 border-b border-[#F5F2EB] flex justify-between items-center bg-[#FAF8F5]">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-700" />
                <h3 className="font-serif font-bold text-lg text-[#3B342C]">Diário do Evangelho</h3>
              </div>
              <button 
                id="close-history"
                onClick={() => setShowHistoryModal(false)}
                className="p-1 px-3 text-xs bg-stone-100 font-bold tracking-wider rounded-lg border hover:bg-stone-200 transition text-[#6D655A]"
              >
                Fechar
              </button>
            </div>

            <div className="flex-grow overflow-y-auto p-6 space-y-4">
              {history.length === 0 ? (
                <div className="text-center py-12 space-y-2">
                  <Calendar className="w-8 h-8 text-stone-300 mx-auto" />
                  <p className="text-stone-500 text-sm">Nenhum estudo arquivado ainda no diário.</p>
                  <p className="text-xs text-stone-400">Complete seu primeiro estudo guiado para gerar registros!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((record) => (
                    <div key={record.id} className="p-4 bg-white border border-[#E6DEC9] rounded-xl hover:border-amber-400 transition flex justify-between items-start gap-3">
                      <div className="space-y-1.5 flex-grow">
                        <div className="flex items-center gap-2 text-[10px] font-mono font-bold tracking-wide text-[#BA5635]">
                          <span>{record.date}</span>
                          <span className="bg-amber-100 text-amber-800 py-0.5 px-2 rounded-full font-sans">
                            Capítulo {record.chapterNum}
                          </span>
                        </div>
                        <h4 className="font-serif font-bold text-sm text-[#3B342C]">
                          {record.chapterTitle}
                        </h4>
                        {record.sectionTitle && (
                          <p className="text-xs text-stone-500 italic mt-0.5">{record.sectionTitle}</p>
                        )}
                        <p className="text-xs text-stone-600 font-sans leading-relaxed">
                          <span className="font-semibold text-stone-500">Intenção:</span> {record.intention}
                        </p>
                        <p className="text-[10px] text-stone-500 font-mono">
                          Participantes: {record.participants}
                        </p>
                      </div>
                      <button 
                        onClick={(e) => deleteHistoryItem(record.id, e)}
                        className="p-2 text-stone-400 hover:text-red-700 hover:bg-stone-50 rounded-lg transition-all"
                        title="Deletar registro"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* MODERN BRIGHT HELP MODAL */}
      {showHelpModal && (
        <div id="modal-help" className="fixed inset-0 bg-[#3B342CBD]/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-[#FCFBFA] rounded-2xl border border-[#E6DEC9] max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            
            <div className="p-5 border-b border-[#F5F2EB] flex justify-between items-center bg-[#FAF8F5]">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-amber-700" />
                <h3 className="font-serif font-bold text-lg text-[#3B342C]">Como Funciona o Evangelho no Lar?</h3>
              </div>
              <button 
                id="close-help"
                onClick={() => setShowHelpModal(false)}
                className="p-1 px-3 text-xs bg-stone-100 font-bold tracking-wider rounded-lg border hover:bg-stone-200 transition text-[#6D655A]"
              >
                Fechar
              </button>
            </div>

            <div className="flex-grow overflow-y-auto p-6 space-y-6 text-sm leading-relaxed text-stone-600">
              
              <div className="space-y-2">
                <span className="font-serif font-bold text-base text-[#3B342C] block">O que é o Evangelho no Lar?</span>
                <p>O Evangelho no Lar é uma reunião fraterna de prece e reflexão realizada periódicamente (geralmente uma vez por semana) sob os moldes cristãos, objetivando higienizar espiritualmente o ambiente doméstico, pacificar relações familiares e atrair a presença caridosa do plano espiritual superior.</p>
              </div>

              <div className="space-y-4">
                <span className="font-serif font-bold text-base text-[#3B342C] block">Recomendações e Boas Práticas:</span>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-white border border-[#E6DEC9] rounded-xl space-y-1">
                    <span className="font-serif font-bold text-[#BA5635] text-xs block">Pontualidade Cristã</span>
                    <p className="text-xs">Escolha um dia da semana e um horário fixos e respeite-o. A pontualidade permite agendamento e preparo dos mentores do lar.</p>
                  </div>
                  <div className="p-4 bg-white border border-[#E6DEC9] rounded-xl space-y-1">
                    <span className="font-serif font-bold text-[#BA5635] text-xs block">Simplicidade</span>
                    <p className="text-xs">Não exige paramentos, velas ou rituais místicos. O estudo ocorre com diálogo franco, preces simples e sintonias sinceras do coração.</p>
                  </div>
                  <div className="p-4 bg-white border border-[#E6DEC9] rounded-xl space-y-1">
                    <span className="font-serif font-bold text-[#BA5635] text-xs block">Respeito Mútuo</span>
                    <p className="text-xs">Não é espaço para lavar roupa suja ou debater teorias complexas. Use-o para promover concórdia, compaixão e caridade ativa.</p>
                  </div>
                  <div className="p-4 bg-white border border-[#E6DEC9] rounded-xl space-y-1">
                    <span className="font-serif font-bold text-[#BA5635] text-xs block">Copo de Água</span>
                    <p className="text-xs">A água é alterada molecularmente pelos fluidos medicinais aplicados pelos mentores durante o passe espiritual. Tome-a ao final.</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/50 border border-[#E6DEC9] space-y-1 text-xs">
                <span className="font-serif font-bold text-amber-900 block">Duração Recomendada</span>
                <p>O estudo do Evangelho no Lar deve ser breve — girando ao redor de 15 a 30 minutos totais, para que as crianças e os participantes mantenham alegria e sintonias unificadas.</p>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );

  // Helper inside loop function to render standard visual progres bar
  function renderProgressBar(current: number) {
    const stepsInfo = [
      { step: 1, label: "Abertura" },
      { step: 2, label: "Leitura" },
      { step: 3, label: "Diálogo" },
      { step: 4, label: "Vibrações" },
      { step: 5, label: "Água" },
      { step: 6, label: "Fechamento" },
    ];

    return (
      <div className="w-full space-y-2">
        {/* Progress labels row */}
        <div className="flex justify-between items-center text-[10px] sm:text-[11px] font-semibold text-stone-500 tracking-wide font-sans">
          <span>{stepsInfo[current - 1].label} ativo</span>
          <span className="font-mono text-amber-800">{current} / 6 Passos</span>
        </div>

        {/* Visual progress bars */}
        <div className="flex gap-1">
          {stepsInfo.map((s) => (
            <div 
              key={s.step} 
              className={`h-1.5 flex-1 rounded transition-all duration-500 ${
                s.step === current 
                  ? "bg-amber-600 scale-y-110" 
                  : s.step < current 
                    ? "bg-[#3B342C]" 
                    : "bg-[#E6DEC9]"
              }`}
            />
          ))}
        </div>
      </div>
    );
  }
}
