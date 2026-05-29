'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  MessageSquare, 
  Send, 
  Share2, 
  LogOut, 
  Sparkles, 
  Home, 
  Users, 
  Volume2, 
  Tv,
  Download
} from 'lucide-react';
import { useWebRTCPure } from '@/hooks/use-webrtc';
import { useAuth } from '@/_core/hooks/useAuth';
import { useRecording } from '@/hooks/use-recording';

interface VideoConferenceProps {
  roomId: string;
}

export default function VideoConference({ roomId: initialRoomId }: VideoConferenceProps) {
  const { user } = useAuth();
  const [roomId, setRoomId] = useState(initialRoomId || 'evangelho-no-lar');
  const [nameInput, setNameInput] = useState(user?.name || '');
  const [showChat, setShowChat] = useState(true);
  const [chatMessageText, setChatMessageText] = useState('');
  const [copied, setCopied] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Elegant Toast notification state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    const timer = setTimeout(() => {
      setToast(null);
    }, 4000);
    return () => clearTimeout(timer);
  };

  // Sync inputs with user object when it updates
  useEffect(() => {
    if (user?.name && !nameInput) {
      const timer = setTimeout(() => {
        setNameInput(user.name);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [user, nameInput]);

  const activeName = nameInput.trim() || user?.name || 'Sintonizador de Luz';

  const {
    localStream,
    remoteStreams,
    isAudioEnabled,
    isVideoEnabled,
    activeParticipants,
    chatMessages,
    isJoining,
    isJoined,
    connectionError,
    connect,
    toggleAudio,
    toggleVideo,
    sendChatMessage,
    disconnect
  } = useWebRTCPure(roomId, activeName);

  // Extract pure streams for recording
  const remoteMediaStreams = remoteStreams
    .map((peer) => peer.stream)
    .filter((st): st is MediaStream => !!st);

  // Robust Recording Hook integration
  const {
    isRecording,
    recordingTime,
    recordedBlob,
    error: recordingError,
    startRecording,
    stopRecording,
    downloadRecording,
    resetRecording,
    formatTime,
  } = useRecording(localStream, remoteMediaStreams);

  // Auto-download when recording finishes
  useEffect(() => {
    if (recordedBlob) {
      downloadRecording();
      const timer = setTimeout(() => {
        showNotification('Gravação concluída e baixada com sucesso!', 'success');
        resetRecording();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [recordedBlob, downloadRecording, resetRecording]);

  // Toast recording errors
  useEffect(() => {
    if (recordingError) {
      const timer = setTimeout(() => {
        showNotification(recordingError, 'error');
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [recordingError]);

  // Auto-scroll chat to the bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, showChat]);

  const handleCopyCode = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(roomId);
      setCopied(true);
      showNotification('Código da sala copiado!', 'success');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLeave = () => {
    disconnect();
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('conference');
      window.history.pushState(null, '', url.pathname + url.search);
      window.location.reload(); // Refresh to clean signals and states
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex flex-col font-sans selection:bg-amber-100 selection:text-amber-900">
      {/* Header */}
      <header className="w-full bg-[#FCFBFA]/90 backdrop-blur-md border-b border-[#E6DEC9] py-4 px-6 md:px-12 flex justify-between items-center sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="bg-amber-100 p-2 rounded-full text-amber-700 animate-pulse">
            <Tv className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-serif font-bold text-base sm:text-lg text-[#3B342C]">Círculo de Sintonia Virtual</h1>
            <p className="text-[10px] text-stone-500 font-mono tracking-wider uppercase">Sala: {roomId}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleLeave}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-serif font-bold bg-[#FAF8F5] border border-[#E6DEC9] text-[#6D655A] hover:text-[#3B342C] hover:bg-[#F5EFE6] rounded-full transition-all cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Sair</span>
          </button>
        </div>
      </header>

      {/* Main Content Pane */}
      <div className="flex-grow flex flex-col lg:flex-row h-[calc(100vh-73px)] overflow-hidden">
        
        {/* Conference Room View */}
        <div className="flex-grow flex flex-col p-4 sm:p-6 overflow-y-auto justify-between gap-6">
          
          {/* Setup screen if not joined */}
          {!isJoined ? (
            <div className="max-w-md w-full mx-auto my-auto bg-white border border-[#E6DEC9]/70 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-fadeIn">
              <div className="text-center space-y-2">
                <Sparkles className="w-8 h-8 text-amber-600 mx-auto animate-bounce" />
                <h2 className="font-serif font-bold text-xl text-stone-900">Configurar sua Sintonia</h2>
                <p className="text-stone-500 text-xs">Ajuste seu nome e confirme o código para entrar no círculo de preces.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-stone-400 block">Seu Nome</label>
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Ex: Tio Roberto"
                    className="w-full bg-[#FAF8F5] border border-[#DCD3C1] focus:ring-1 focus:ring-amber-500 focus:border-amber-500 rounded-xl py-3 px-4 text-sm transition-all focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-stone-400 block">Código da Sala</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={roomId}
                      onChange={(e) => setRoomId(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                      className="flex-grow bg-[#FAF8F5] border border-[#DCD3C1] focus:ring-1 focus:ring-amber-500 focus:border-amber-500 rounded-xl py-3 px-4 text-sm font-mono focus:outline-none"
                    />
                    <button
                      onClick={() => setRoomId('paz-' + Math.random().toString(36).substring(2, 7))}
                      className="px-3 bg-white hover:bg-stone-50 text-xs font-mono border border-[#DCD3C1] rounded-xl transition-all cursor-pointer"
                      title="Gerar código aleatório"
                    >
                      Gerar
                    </button>
                  </div>
                </div>
              </div>

              {connectionError && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600">
                  {connectionError}
                </div>
              )}

              <button
                onClick={connect}
                disabled={isJoining}
                className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-700 hover:to-orange-800 text-white font-serif font-bold text-sm rounded-xl shadow-md transition-all active:scale-98 disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
              >
                {isJoining ? 'Iniciando sintonia...' : 'Entrar no Círculo Virtual'}
                <Sparkles className="w-4 h-4 animate-pulse" />
              </button>

              <p className="text-[10px] text-center text-stone-400 italic">
                *Requer permissão de câmera e microfone para transmissão ao vivo.
              </p>
            </div>
          ) : (
            // Active Call Grid Flow
            <div className="flex-grow flex flex-col justify-between gap-6">
              
              {/* Rooms and Invites Top Deck */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-amber-50/50 border border-amber-200/40 p-3.5 rounded-2xl">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs font-serif font-bold text-stone-800">Círculo Conectado</span>
                  <span className="text-[10px] font-mono font-bold bg-amber-100 uppercase border border-amber-200 py-0.5 px-2 rounded">
                    SALA: {roomId}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleCopyCode}
                    className="p-1 px-3 bg-white border border-stone-200 hover:bg-stone-50 rounded-lg text-xs text-stone-600 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Share2 className="w-3.5 h-3.5" /> 
                    {copied ? 'Copiado!' : 'Compartilhar Sala'}
                  </button>

                  <button
                    onClick={() => setShowChat(!showChat)}
                    className="p-1 px-3 bg-white border border-stone-200 hover:bg-stone-50 rounded-lg text-xs text-stone-600 transition-all cursor-pointer flex items-center gap-1.5 lg:hidden"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> 
                    Chat ({chatMessages.length})
                  </button>
                </div>
              </div>

              {/* Mosaico Grid Area */}
              <div className="flex-grow flex items-center justify-center py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 w-full max-w-5xl justify-center items-center">
                  
                  {/* Local Stream Cell */}
                  <div className="relative group aspect-video rounded-2xl overflow-hidden shadow-sm bg-stone-900 border-2 border-amber-650/15 flex flex-col justify-end">
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
                      <div className="absolute inset-0 bg-gradient-to-br from-[#1E1C1A] to-[#3B342C] flex flex-col items-center justify-center text-center p-4">
                        <VideoOff className="w-8 h-8 text-stone-500 mb-1.5" />
                        <span className="text-xs text-stone-400 font-mono">Vídeo Desativado</span>
                      </div>
                    )}
                    <div className="absolute top-3 left-3 bg-stone-900/40 backdrop-blur-xs px-2.5 py-1 rounded-full border border-stone-650/10 flex items-center gap-1.5">
                      <span className="text-[10px] text-white font-serif font-bold">{activeName} (Você)</span>
                    </div>
                  </div>

                  {/* Remote Stream Cells */}
                  {remoteStreams.map((peer) => (
                    <div key={peer.id} className="relative aspect-video rounded-2xl overflow-hidden shadow-sm bg-stone-900 border-2 border-stone-800 flex flex-col justify-end">
                      <video
                        ref={(el) => {
                          if (el && peer.stream) {
                            el.srcObject = peer.stream;
                          }
                        }}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3 bg-stone-900/40 backdrop-blur-xs px-2.5 py-1 rounded-full border border-stone-650/10">
                        <span className="text-[10px] text-white font-serif font-bold">{peer.name}</span>
                      </div>
                    </div>
                  ))}

                  {/* Empty state placeholder */}
                  {remoteStreams.length === 0 && (
                    <div className="col-span-full aspect-video md:aspect-auto md:h-64 flex flex-col items-center justify-center text-center p-6 bg-white border border-[#E6DEC9]/45 rounded-2xl space-y-3">
                      <Users className="w-10 h-10 text-stone-300 animate-pulse" />
                      <h3 className="font-serif font-bold text-sm text-[#3B342C]">Aguardando familiares entrar...</h3>
                      <p className="text-xs text-stone-500 max-w-sm">
                        Envie o código da sala <strong className="font-mono">{roomId}</strong> para conectar quem você ama neste círculo de luz.
                      </p>
                    </div>
                  )}

                </div>
              </div>

              {/* Mic and Cam Action Rails */}
              <div className="flex justify-center items-center gap-4 bg-[#FAF8F5]/90 border border-[#E6DEC9] p-4 rounded-2xl max-w-lg mx-auto w-full">
                <button
                  onClick={toggleAudio}
                  className={`p-3 rounded-full border shadow-2xs transition-all cursor-pointer active:scale-95 flex items-center justify-center ${
                    isAudioEnabled 
                      ? "bg-white border-stone-200 hover:bg-stone-50 text-stone-700" 
                      : "bg-red-50 border-red-200 text-red-600"
                  }`}
                  title={isAudioEnabled ? "Desativar microfone" : "Ativar microfone"}
                >
                  {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                </button>

                <button
                  onClick={toggleVideo}
                  className={`p-3 rounded-full border shadow-2xs transition-all cursor-pointer active:scale-95 flex items-center justify-center ${
                    isVideoEnabled 
                      ? "bg-white border-stone-200 hover:bg-stone-50 text-stone-700" 
                      : "bg-red-50 border-red-200 text-red-600"
                  }`}
                  title={isVideoEnabled ? "Câmera Ativada" : "Câmera Desativada"}
                >
                  {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                </button>

                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`p-3 rounded-full border shadow-2xs transition-all cursor-pointer active:scale-95 flex items-center justify-center ${
                    isRecording 
                      ? "bg-red-50 border-red-300 text-red-600 animate-pulse" 
                      : "bg-white border-stone-200 hover:bg-stone-50 text-stone-700"
                  }`}
                  title={isRecording ? "Parar Gravação" : "Gravar Reunião"}
                >
                  <Download className={`w-5 h-5 ${isRecording ? 'text-red-600 animate-bounce' : ''}`} />
                </button>

                <div className="h-6 w-px bg-stone-200" />

                <button
                  onClick={handleLeave}
                  className="p-3 px-6 rounded-full bg-red-600 text-white hover:bg-red-700 font-serif font-bold text-xs flex items-center gap-1.5 shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer ml-1"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sair da Sala</span>
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Sidebar Chat Box */}
        {isJoined && showChat && (
          <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-[#E6DEC9] bg-[#FCFBFA] flex flex-col h-96 lg:h-full animate-slideIn">
            {/* Header of Chat */}
            <div className="bg-[#FAF8F5] p-4 border-b border-[#E6DEC9] flex justify-between items-center">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-700" />
                <h3 className="font-serif font-bold text-sm text-[#3B342C]">Vibrações e Pedidos</h3>
              </div>
              <span className="text-[10px] font-mono bg-stone-200/50 px-2 py-0.5 rounded text-stone-600">
                {chatMessages.length} mensagens
              </span>
            </div>

            {/* Chat Messages */}
            <div className="flex-grow p-4 overflow-y-auto space-y-4 font-sans text-xs">
              {chatMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4 text-stone-400 italic">
                  <p>As vibrações do ambiente começam em união. Escreva um pedido especial abaixo para iniciar a irradiação positiva!</p>
                </div>
              ) : (
                chatMessages.map((msg) => (
                  <div key={msg.id} className={`${msg.isSystem ? 'text-center bg-amber-50/30 py-1 rounded border border-amber-100/10' : 'text-left'}`}>
                    {msg.isSystem ? (
                      <span className="text-[10px] text-amber-800/80 italic font-medium">
                        {msg.text}
                      </span>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] text-stone-500 font-mono">
                          <span className="font-bold text-amber-900">{msg.senderName}</span>
                          <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-white border border-[#F2ECE0] shadow-2xs text-[#4A433A] leading-relaxed">
                          {msg.text}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Form Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (chatMessageText.trim()) {
                  sendChatMessage(chatMessageText.trim());
                  setChatMessageText('');
                }
              }}
              className="p-3.5 border-t border-[#E6DEC9] bg-[#FAF8F5] flex gap-2"
            >
              <input
                type="text"
                value={chatMessageText}
                onChange={(e) => setChatMessageText(e.target.value)}
                placeholder="Pedir vibração por um ente querido..."
                className="flex-grow bg-white border border-[#DCD3C1] focus:ring-1 focus:ring-amber-500 focus:border-amber-500 rounded-xl py-2 px-3.5 text-xs transition-all focus:outline-none"
              />
              <button
                type="submit"
                className="p-2.5 bg-amber-800 text-white rounded-xl hover:bg-amber-700 transition-all active:scale-95 flex items-center justify-center cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

      </div>

      {/* Toast Alert Banner */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-stone-900 border border-stone-850 text-white text-xs font-sans py-3.5 px-5 rounded-2xl shadow-xl flex items-center gap-2.5 z-50 animate-fadeIn select-none">
          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse flex-shrink-0" />
          <span className="font-medium">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
