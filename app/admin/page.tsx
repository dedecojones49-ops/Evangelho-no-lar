'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Trash2, 
  Settings, 
  Video, 
  Calendar, 
  Clock, 
  Plus, 
  Tv, 
  ShieldAlert, 
  RefreshCw, 
  CheckCircle, 
  Sparkles, 
  Flame, 
  BookOpen, 
  LogOut,
  Sliders,
  Share2,
  Activity
} from 'lucide-react';
import Link from 'next/link';

interface ActiveRoom {
  roomId: string;
  participants: Array<{ id: string; name: string; lastSeen: number }>;
  messageCount: number;
}

interface ScheduledMeeting {
  id: string;
  title: string;
  time: string;
  date: string;
  roomId: string;
  description: string;
}

export default function AdminDashboardPage() {
  const [activeRooms, setActiveRooms] = useState<ActiveRoom[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [scheduledMeetings, setScheduledMeetings] = useState<ScheduledMeeting[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('gospel_at_home_scheduled_meetings');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }
      
      const initialList: ScheduledMeeting[] = [
        {
          id: '1',
          title: 'Irradiação Especial e Culto Dominical',
          time: '20:00',
          date: '2026-05-31',
          roomId: 'evangelho-familia',
          description: 'Sintonia consoladora para enfermos físicos e harmonia domiciliar.'
        },
        {
          id: '2',
          title: 'Círculo de Oração - Mensagens Kardequianas',
          time: '19:00',
          date: '2026-06-03',
          roomId: 'egregora-prece',
          description: 'Leitura comentada sobre o capítulo "Bem-aventurados os puros de coração".'
        }
      ];
      localStorage.setItem('gospel_at_home_scheduled_meetings', JSON.stringify(initialList));
      return initialList;
    }
    return [];
  });
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newRoomId, setNewRoomId] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'rooms' | 'meetings' | 'resources'>('rooms');
  
  // Custom prayer tuner state
  const [customIntention, setCustomIntention] = useState('paz global, harmonia e cura moral');
  const [tuningPrayer, setTuningPrayer] = useState(false);
  const [tunedPrayer, setTunedPrayer] = useState<{ title: string; content: string } | null>(null);

  const triggerNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Fetch true live rooms from active signaling server
  const fetchLiveRooms = async () => {
    setLoadingRooms(true);
    try {
      const res = await fetch('/api/signaling');
      if (res.ok) {
        const data = await res.json();
        if (data && data.rooms) {
          setActiveRooms(data.rooms);
        }
      }
    } catch (e) {
      console.error("Could not fetch active signaling rooms", e);
    } finally {
      setLoadingRooms(false);
    }
  };

  // Delete live room from active server (Real Admin Control)
  const handleDeleteRoom = async (roomId: string) => {
    if (!window.confirm(`Tem certeza que deseja encerrar a sala ${roomId}? Todos os participantes serão desconectados.`)) return;
    try {
      const res = await fetch('/api/signaling', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'admin_delete_room', roomId })
      });
      if (res.ok) {
        triggerNotification(`A sala ${roomId} foi encerrada com sucesso no servidor.`);
        fetchLiveRooms();
      }
    } catch (e) {
      console.error("Error deleting room", e);
    }
  };

  // Kick direct participant from active WebRTC room on server (Real Admin Control)
  const handleKickParticipant = async (roomId: string, targetParticipantId: string, participantName: string) => {
    if (!window.confirm(`Tem certeza que deseja desconectar o participante ${participantName}?`)) return;
    try {
      const res = await fetch('/api/signaling', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'admin_kick_participant',
          roomId,
          targetParticipantId
        })
      });
      if (res.ok) {
        triggerNotification(`${participantName} foi desconectado e irradiado fora do círculo.`);
        fetchLiveRooms();
      }
    } catch (e) {
      console.error("Error kicking participant", e);
    }
  };

  // Tuning / Pre-generating custom prayers using Gemini
  const handleTunePrayer = async () => {
    if (!customIntention.trim()) return;
    setTuningPrayer(true);
    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_prayer',
          intention: { type: 'abertura', custom: customIntention }
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.content) {
          setTunedPrayer({ title: data.title, content: data.content });
          triggerNotification("Nova prece inspirada com sucesso!");
        }
      }
    } catch (e) {
      console.error("Gemini tuning error", e);
      triggerNotification("Erro ao sintonizar prece pela IA.");
    } finally {
      setTuningPrayer(false);
    }
  };

  // Handle scheduled meetings
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLiveRooms();
    }, 100);
    
    // Poll active rooms list every 7 seconds for live updates
    const interval = setInterval(fetchLiveRooms, 7000);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  const handleAddMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newTime || !newDate || !newRoomId) {
      triggerNotification("Preencha todos os campos obrigatórios.");
      return;
    }
    const newItem: ScheduledMeeting = {
      id: Date.now().toString(),
      title: newTitle,
      time: newTime,
      date: newDate,
      roomId: newRoomId.toLowerCase().replace(/\s+/g, '-'),
      description: newDesc || 'Reunião fraterna de prece e reflexão espiritual no lar.'
    };
    const updated = [...scheduledMeetings, newItem];
    setScheduledMeetings(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('gospel_at_home_scheduled_meetings', JSON.stringify(updated));
    }
    setNewTitle('');
    setNewTime('');
    setNewDate('');
    setNewRoomId('');
    setNewDesc('');
    setShowAddForm(false);
    triggerNotification("Nova reunião programada e agendada online!");
  };

  const handleDeleteMeeting = (id: string) => {
    const filtered = scheduledMeetings.filter(m => m.id !== id);
    setScheduledMeetings(filtered);
    if (typeof window !== 'undefined') {
      localStorage.setItem('gospel_at_home_scheduled_meetings', JSON.stringify(filtered));
    }
    triggerNotification("Programação removida com sucesso.");
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex flex-col font-sans selection:bg-amber-100 selection:text-amber-900">
      
      {/* Navigation Header */}
      <header className="w-full bg-[#FCFBFA]/90 backdrop-blur-md border-b border-[#E6DEC9] py-4 px-6 md:px-12 flex justify-between items-center sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="bg-amber-100 p-2 rounded-full text-amber-850 animate-pulse">
            <Sliders className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <h1 className="font-serif font-bold text-base sm:text-lg text-[#3B342C]">Painel de Controle Administrador</h1>
            <p className="text-[10px] text-stone-500 font-mono tracking-wider uppercase">Gerenciamento de Rede e Recursos Online</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-serif font-bold bg-[#FAF8F5] border border-[#E6DEC9] text-[#6D655A] hover:text-[#3B342C] hover:bg-[#F5EFE6] rounded-full transition-all cursor-pointer"
          >
            ← Voltar ao Início
          </Link>
        </div>
      </header>

      {/* Main Grid Wrapper */}
      <main className="flex-grow max-w-6xl w-full mx-auto px-6 py-8 md:py-12 space-y-8">
        
        {/* Decorative Status Banner */}
        <div className="bg-gradient-to-r from-[#3B342C] to-amber-905 p-6 rounded-2xl text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping inline-block" />
              <span className="text-[10px] uppercase tracking-wider font-mono font-bold text-emerald-300">Servidores Ativos & Online</span>
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold">Administração de Egrégoras e Círculos Espíritas</h2>
            <p className="text-white/80 text-xs">Monitore salas de WebRTC videochat ao vivo, configure preces online e gerencie agendas de oração.</p>
          </div>
          <button 
            onClick={fetchLiveRooms} 
            className="bg-white/10 hover:bg-white/15 px-4 py-2 border border-white/20 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingRooms ? 'animate-spin' : ''}`} />
            Sincronizar Rede
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-[#E6DEC9] gap-4">
          <button
            onClick={() => setActiveTab('rooms')}
            className={`pb-3 text-xs uppercase tracking-wider font-bold transition-all relative cursor-pointer ${
              activeTab === 'rooms' ? 'text-amber-800' : 'text-stone-400 hover:text-stone-700'
            }`}
          >
            Salas WebRTC Ativas ({activeRooms.length})
            {activeTab === 'rooms' && <span className="absolute bottom-0 inset-x-0 h-0.5 bg-amber-800" />}
          </button>
          <button
            onClick={() => setActiveTab('meetings')}
            className={`pb-3 text-xs uppercase tracking-wider font-bold transition-all relative cursor-pointer ${
              activeTab === 'meetings' ? 'text-amber-800' : 'text-stone-400 hover:text-stone-700'
            }`}
          >
            Agenda de Estudos ({scheduledMeetings.length})
            {activeTab === 'meetings' && <span className="absolute bottom-0 inset-x-0 h-0.5 bg-amber-800" />}
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`pb-3 text-xs uppercase tracking-wider font-bold transition-all relative cursor-pointer ${
              activeTab === 'resources' ? 'text-amber-800' : 'text-stone-400 hover:text-stone-700'
            }`}
          >
            Sintonização de Preces (IA)
            {activeTab === 'resources' && <span className="absolute bottom-0 inset-x-0 h-0.5 bg-amber-800" />}
          </button>
        </div>

        {/* Dynamic Area Displays */}
        <AnimatePresence mode="wait">
          
          {/* TAB 1: Live WebRTC Rooms Monitor */}
          {activeTab === 'rooms' && (
            <motion.div
              key="rooms-panel"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {activeRooms.length === 0 ? (
                <div className="bg-white border border-[#E6DEC9]/65 p-12 rounded-2xl text-center space-y-4 shadow-2xs">
                  <Activity className="w-10 h-10 text-stone-300 mx-auto animate-pulse" />
                  <h3 className="font-serif font-bold text-sm text-[#3B342C]">Nenhuma egrégora online agora</h3>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto">
                    Não existem salas de vídeo abertas no momento. Abra uma chamada em nova aba ou espere que participantes conectem.
                  </p>
                  <Link 
                    href="/conference?room=paz-estudo"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-800 text-white rounded-lg text-xs font-serif font-bold hover:bg-amber-700 transition"
                  >
                    <Video className="w-3.5 h-3.5" /> Adentrar Círculo Piloto
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {activeRooms.map((room) => (
                    <div key={room.roomId} className="bg-white border border-[#E6DEC9] rounded-2xl p-5 shadow-2xs flex flex-col justify-between gap-5 hover:border-amber-500/50 transition">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <span className="text-[10px] font-mono bg-amber-50 border border-amber-200 text-amber-850 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                              SALA: {room.roomId}
                            </span>
                            <h3 className="font-serif font-bold text-base text-[#3B342C] mt-1.5 flex items-center gap-2">
                              <Video className="w-4 h-4 text-amber-700" />
                              Círculo {room.roomId.replace('-', ' ')}
                            </h3>
                          </div>
                          <button
                            onClick={() => handleDeleteRoom(room.roomId)}
                            className="bg-red-50 hover:bg-red-100 text-red-650 p-2 rounded-lg transition"
                            title="Encerrar Sala"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>

                        <div className="space-y-2">
                          <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider flex items-center gap-1">
                            <Users className="w-3 h-3 text-stone-400" />
                            Membros Conectados ({room.participants.length})
                          </span>
                          
                          <div className="space-y-1.5 max-h-40 overflow-y-auto">
                            {room.participants.length === 0 ? (
                              <p className="text-xs text-stone-400 italic">Participantes sinalizando...</p>
                            ) : (
                              room.participants.map((p) => (
                                <div key={p.id} className="flex items-center justify-between p-2 bg-stone-50/70 rounded-lg border border-stone-200/50 text-xs">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="font-medium text-stone-850">{p.name}</span>
                                    <span className="text-[9px] font-mono text-stone-400">({p.id.substring(0,6)})</span>
                                  </div>
                                  <button
                                    onClick={() => handleKickParticipant(room.roomId, p.id, p.name)}
                                    className="text-[10px] bg-white hover:bg-stone-100 text-[#DA7F67] hover:text-red-700 font-bold border py-0.5 px-2 rounded-md transition"
                                  >
                                    Remover
                                  </button>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="pt-3.5 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500 font-mono">
                        <span>Mensagens trocadas: {room.messageCount}</span>
                        <Link
                          href={`/conference?room=${room.roomId}`}
                          className="text-amber-700 hover:text-amber-900 font-bold font-serif flex items-center gap-1 transition"
                        >
                          Entrar por vídeo →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 2: Scheduled Meetings Manager */}
          {activeTab === 'meetings' && (
            <motion.div
              key="meetings-panel"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center bg-white p-4 border border-[#E6DEC9] rounded-2xl shadow-2xs">
                <div>
                  <h3 className="font-serif font-bold text-[#3B342C]">Organização das Obras e Agendamentos</h3>
                  <p className="text-xs text-stone-500">Adicione novas reuniões de comunhão para que apareçam na landing page para todos.</p>
                </div>
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="px-4 py-2 bg-amber-800 hover:bg-amber-700 text-white rounded-xl text-xs font-serif font-bold flex items-center gap-2 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  {showAddForm ? 'Fechar Form' : 'Programar Reunião'}
                </button>
              </div>

              {/* Add form overlay / accordion element */}
              {showAddForm && (
                <motion.form
                  onSubmit={handleAddMeeting}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-[#FAF8F5] border-2 border-dashed border-[#E6DEC9] p-5 sm:p-6 rounded-2xl space-y-4"
                >
                  <h4 className="font-serif font-bold text-sm text-[#3B342C]">Agendar Novo Estudo Virtual/Presencial</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-stone-500 block">Título do Estudo/Celebração</label>
                      <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="Ex: Leitura de Apoio Cap 11"
                        className="w-full bg-white border border-[#DCD3C1] rounded-xl py-2 px-3 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-stone-500 block">Identificador da Sala</label>
                      <input
                        type="text"
                        value={newRoomId}
                        onChange={(e) => setNewRoomId(e.target.value)}
                        placeholder="Ex: luz-lar"
                        className="w-full bg-white border border-[#DCD3C1] rounded-xl py-2 px-3 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-stone-500 block">Data Proporcionada</label>
                      <input
                        type="date"
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                        className="w-full bg-white border border-[#DCD3C1] rounded-xl py-2.5 px-3 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-stone-500 block">Horário de Início</label>
                      <input
                        type="time"
                        value={newTime}
                        onChange={(e) => setNewTime(e.target.value)}
                        className="w-full bg-white border border-[#DCD3C1] rounded-xl py-2.5 px-3 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-stone-500 block font-sans">Vibração e Intencionalidade (Descrição)</label>
                      <textarea
                        rows={2}
                        value={newDesc}
                        onChange={(e) => setNewDesc(e.target.value)}
                        placeholder="Discorra brevemente sobre os amparados desta oração especial..."
                        className="w-full bg-white border border-[#DCD3C1] rounded-xl py-2 px-3 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-4 py-2 border border-stone-200 hover:bg-white rounded-lg text-xs"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-[#3B342C] text-white hover:bg-stone-900 rounded-lg text-xs font-bold"
                    >
                      Agendar Oficialmente
                    </button>
                  </div>
                </motion.form>
              )}

              {/* Planned List display */}
              <div className="space-y-3.5">
                {scheduledMeetings.map((m) => (
                  <div 
                    key={m.id} 
                    className="bg-white border border-[#E6DEC9] p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-2xs hover:border-amber-400 transition"
                  >
                    <div className="space-y-2 max-w-xl">
                      <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-[#BA5635]">
                        <span className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          <Calendar className="w-3.5 h-3.5 text-amber-700" />
                          {m.date}
                        </span>
                        <span className="flex items-center gap-1 bg-stone-100 px-2 py-0.5 rounded text-stone-600">
                          <Clock className="w-3.5 h-3.5" />
                          {m.time}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-[#3B342C] text-sm md:text-base">{m.title}</h4>
                        <p className="text-xs text-stone-500 leading-relaxed mt-0.5">{m.description}</p>
                      </div>
                      <div className="text-[10px] font-mono text-stone-400">
                        Código de Canal WebRTC: <strong className="text-[#3B342C]">{m.roomId}</strong>
                      </div>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto self-end md:self-center">
                      <button
                        onClick={() => handleDeleteMeeting(m.id)}
                        className="border border-red-200 bg-red-50 text-red-600 p-2.5 rounded-xl hover:bg-red-100 transition whitespace-nowrap"
                        title="Deletar Programação"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <Link
                        href={`/conference?room=${m.roomId}`}
                        className="flex-grow md:flex-none text-center px-4 py-2.5 bg-amber-800 text-white hover:bg-amber-700 rounded-xl text-xs font-serif font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Video className="w-4 h-4 text-amber-200 animate-pulse" />
                        Reunir Agora
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB 3: AI Tune Custom Prayers */}
          {activeTab === 'resources' && (
            <motion.div
              key="resources-panel"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="bg-white border border-[#E6DEC9] p-6 rounded-2xl shadow-2xs space-y-5">
                <div className="space-y-1">
                  <h3 className="font-serif font-bold text-base text-[#3B342C] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    Sintonizador e Copiloto de Preces Espíritas
                  </h3>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Personalize e pre-visualize preces de estudo adaptadas a intencionalidades familiares específicas. O robô de Inteligência Artificial consolidadora criará uma partitura de vibração dedicada.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-stone-500 block">Intenção / Alvo da Oração</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customIntention}
                        onChange={(e) => setCustomIntention(e.target.value)}
                        placeholder="Ex: harmonização e pregação da paciência no lar e amparo aos vizinhos enfermos"
                        className="flex-grow bg-[#FAF8F5] border border-[#DCD3C1] focus:ring-1 focus:ring-amber-500 rounded-xl py-3 px-4 text-xs transition-all focus:outline-none"
                      />
                      <button
                        onClick={handleTunePrayer}
                        disabled={tuningPrayer || !customIntention}
                        className="bg-amber-800 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl py-2 px-6 text-xs font-serif font-bold transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                      >
                        {tuningPrayer ? 'Canalizando...' : 'Inspirar Oração'}
                        <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                      </button>
                    </div>
                  </div>
                </div>

                {tuningPrayer && (
                  <div className="py-12 border border-dashed border-stone-200 rounded-xl text-center space-y-2">
                    <div className="w-8 h-8 rounded-full border-2 border-amber-600 border-t-transparent animate-spin mx-auto" />
                    <p className="text-xs text-stone-500 italic animate-pulse">Sintonizando com os mentores universais de preces e harmonização do lar...</p>
                  </div>
                )}

                {/* Tuned Prayer result display */}
                {tunedPrayer && !tuningPrayer && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-5 bg-amber-50/15 border border-amber-200/50 rounded-xl space-y-3.5"
                  >
                    <h4 className="font-serif font-bold text-[#3B342C] text-sm md:text-base border-b border-amber-200/30 pb-2">
                      {tunedPrayer.title}
                    </h4>
                    <pre className="font-serif text-xs text-stone-700 leading-relaxed whitespace-pre-wrap font-sans bg-white/70 p-4 border border-stone-200/40 rounded-lg">
                      {tunedPrayer.content}
                    </pre>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Floating System Notifications */}
      {notification && (
        <div className="fixed bottom-6 right-6 bg-[#3B342C] border border-amber-700/25 text-white text-xs py-3 px-5 rounded-2xl shadow-xl flex items-center gap-2 z-50 animate-fadeIn select-none font-sans">
          <CheckCircle className="w-4 h-4 text-amber-400" />
          <span>{notification}</span>
        </div>
      )}
    </div>
  );
}
