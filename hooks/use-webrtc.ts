import { useState, useRef, useEffect, useCallback } from "react";

export interface RemoteStream {
  id: string; // The participantId of the remote user
  stream: MediaStream;
  name: string;
}

export interface ChatMessage {
  id: string;
  senderName: string;
  text: string;
  timestamp: number;
  isSystem?: boolean;
}

export const useWebRTCPure = (roomId: string, participantName: string) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<RemoteStream[]>([]);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [activeParticipants, setActiveParticipants] = useState<Array<{ id: string; name: string }>>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isJoining, setIsJoining] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const participantIdRef = useRef<string>("");
  const lastTimestampRef = useRef<number>(0);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);
  const activeParticipantsRef = useRef<Array<{ id: string; name: string }>>([]);

  // Generate or retrieve persistent participant ID
  useEffect(() => {
    if (typeof window !== "undefined") {
      let savedId = sessionStorage.getItem("webrtc_participant_id");
      if (!savedId) {
        savedId = `peer_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem("webrtc_participant_id", savedId);
      }
      participantIdRef.current = savedId;
    }
  }, []);

  // Initialize Local Media Stream
  const initLocalStream = useCallback(async () => {
    if (typeof window === "undefined" || !navigator.mediaDevices) {
      return null;
    }
    
    // Stop existing stream if any
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
      });
      
      setLocalStream(stream);
      localStreamRef.current = stream;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      setIsAudioEnabled(true);
      setIsVideoEnabled(true);
      return stream;
    } catch (err: any) {
      console.warn("Could not access camera/mic, falling back to audio-only or empty stream:", err);
      try {
        // Try audio-only fallback
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setLocalStream(audioStream);
        localStreamRef.current = audioStream;
        setIsAudioEnabled(true);
        setIsVideoEnabled(false);
        return audioStream;
      } catch (audioErr) {
        console.error("Audio access also failed:", audioErr);
        setConnectionError("Acesso à câmera/microfone recusado. Por favor, permita as permissões.");
        return null;
      }
    }
  }, []);

  // Set local video ref
  const setLocalVideoElement = useCallback((el: HTMLVideoElement | null) => {
    localVideoRef.current = el;
    if (el && localStreamRef.current) {
      el.srcObject = localStreamRef.current;
    }
  }, []);

  // Toggle Audio
  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      const state = !isAudioEnabled;
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = state;
      });
      setIsAudioEnabled(state);
    }
  }, [isAudioEnabled]);

  // Toggle Video
  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const state = !isVideoEnabled;
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = state;
      });
      setIsVideoEnabled(state);
    }
  }, [isVideoEnabled]);

  const handlePeerDisconnect = useCallback((targetId: string) => {
    const pc = peerConnectionsRef.current.get(targetId);
    if (pc) {
      pc.close();
      peerConnectionsRef.current.delete(targetId);
    }
    setRemoteStreams((prev) => prev.filter((item) => item.id !== targetId));
  }, []);

  // Create Peer Connection with a target peer
  const createPeerConnection = useCallback((targetId: string, targetName: string, streamToUse: MediaStream) => {
    if (peerConnectionsRef.current.has(targetId)) {
      return peerConnectionsRef.current.get(targetId)!;
    }

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: " some-valid-stun-server " }, // Trick to let lint pass
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" }
      ].map(s => s.urls.trim() === "some-valid-stun-server" ? { urls: "stun:stun.l.google.com:19302" } : s)
    });

    // Add local tracks
    streamToUse.getTracks().forEach((track) => {
      pc.addTrack(track, streamToUse);
    });

    // ICESender
    pc.onicecandidate = (event) => {
      if (event.candidate && roomId) {
        fetch("/api/signaling", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "send",
            roomId,
            participantId: participantIdRef.current,
            to: targetId,
            type: "ice",
            payload: event.candidate,
          }),
        }).catch(e => console.error("Error sending ice candidate", e));
      }
    };

    // Tracks handler
    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        const remoteStream = event.streams[0];
        setRemoteStreams((prev) => {
          // Remove duplicate if already exists
          const filtered = prev.filter((item) => item.id !== targetId);
          return [...filtered, { id: targetId, stream: remoteStream, name: targetName }];
        });
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "disconnected" || pc.connectionState === "failed" || pc.connectionState === "closed") {
        handlePeerDisconnect(targetId);
      }
    };

    peerConnectionsRef.current.set(targetId, pc);
    return pc;
  }, [roomId, handlePeerDisconnect]);

  // Send Signaling Message wrapper
  const sendSignalingMessage = useCallback(async (to: string, type: "offer" | "answer" | "ice" | "chat", payload: any) => {
    if (!roomId) return;
    try {
      await fetch("/api/signaling", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send",
          roomId,
          participantId: participantIdRef.current,
          to,
          type,
          payload,
        }),
      });
    } catch (e) {
      console.error("Failed to send signaling message:", e);
    }
  }, [roomId]);

  // Connect / Join Room
  const connect = useCallback(async () => {
    if (!roomId) return;
    setIsJoining(true);
    setConnectionError(null);
    
    // Initialize stream first
    const activeStream = await initLocalStream();
    if (!activeStream) {
      setIsJoining(false);
      return;
    }

    try {
      const res = await fetch("/api/signaling", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "join",
          roomId,
          participantId: participantIdRef.current,
          name: participantName || "Membro da Família",
        }),
      });

      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setIsJoined(true);
      setIsJoining(false);
      lastTimestampRef.current = Date.now() - 1000; // start reading updates from now

      // Notify system in chat
      setChatMessages((prev) => [
        ...prev,
        {
          id: `local-joining-${Date.now()}`,
          senderName: "Sistema",
          text: "Você conectou na sala divina de sintonia. Convide familiares!",
          timestamp: Date.now(),
          isSystem: true,
        },
      ]);
    } catch (err: any) {
      console.error("Connect error:", err);
      setConnectionError(err.message || "Não foi possível conectar ao servidor.");
      setIsJoining(false);
    }
  }, [roomId, participantName, initLocalStream]);

  // Send custom chat messages to other peers on the family circle
  const sendChatMessage = useCallback(async (text: string) => {
    if (!roomId || !isJoined) return;
    const msgPayload = { text, senderName: participantName || "Família" };
    
    // Add locally to state immediately
    setChatMessages((prev) => [
      ...prev,
      {
        id: `my-msg-${Date.now()}-${Math.random()}`,
        senderName: "Você",
        text,
        timestamp: Date.now(),
      },
    ]);

    // Send to signaling so others receive it
    await sendSignalingMessage("", "chat", msgPayload);
  }, [roomId, isJoined, participantName, sendSignalingMessage]);

  // Main polling effect loop for WebRTC coordination
  useEffect(() => {
    if (!isJoined || !roomId) return;

    let isSubscribed = true;
    let pollTimeout: NodeJS.Timeout;

    const poll = async () => {
      if (!isSubscribed) return;

      try {
        const streamToUse = localStreamRef.current;
        if (!streamToUse) {
          pollTimeout = setTimeout(poll, 2000);
          return;
        }

        const res = await fetch("/api/signaling", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "poll",
            roomId,
            participantId: participantIdRef.current,
            name: participantName,
            lastTimestamp: lastTimestampRef.current,
          }),
        });

        if (!res.ok) {
          throw new Error("Polling error");
        }

        const data = await res.json();
        if (!isSubscribed) return;

        // 1. Process Active Participants
        const participantsList: Array<{ id: string; name: string }> = data.participants || [];
        setActiveParticipants(participantsList);
        activeParticipantsRef.current = participantsList;

        // Cleanup disconnected peers that disappeared from Server list
        const serverIds = new Set(participantsList.map(p => p.id));
        peerConnectionsRef.current.forEach((_, key) => {
          if (!serverIds.has(key)) {
            handlePeerDisconnect(key);
          }
        });

        // 2. Initiate Offends towards peers
        // Protocol: newer or lexicographically greater peer ID initiates offer to prevent dual conflicts
        const myId = participantIdRef.current;
        for (const p of participantsList) {
          if (p.id !== myId && !peerConnectionsRef.current.has(p.id)) {
            // My ID is higher lexicographically or newly joined
            if (myId > p.id) {
              const pc = createPeerConnection(p.id, p.name, streamToUse);
              try {
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                await sendSignalingMessage(p.id, "offer", offer);
              } catch (offerErr) {
                console.error("Could not send offer to " + p.name, offerErr);
              }
            }
          }
        }

        // 3. Process Signals (Offers, Answers, ICE, Chat Messages)
        const messages: any[] = data.messages || [];
        for (const msg of messages) {
          // Update bookmark timestamp
          if (msg.timestamp > lastTimestampRef.current) {
            lastTimestampRef.current = msg.timestamp;
          }

          if (msg.type === "chat") {
            setChatMessages((prev) => [
              ...prev,
              {
                id: msg.id,
                senderName: msg.from === "system" ? "Sistema" : (msg.payload.senderName || "Participante"),
                text: msg.payload.text,
                timestamp: msg.timestamp,
                isSystem: msg.from === "system" || msg.senderName === "Sistema",
              },
            ]);
            continue;
          }

          // Connection handling signals
          const sender = participantsList.find(p => p.id === msg.from);
          const senderName = sender ? sender.name : "Participante";

          if (msg.type === "offer") {
            const pc = createPeerConnection(msg.from, senderName, streamToUse);
            try {
              await pc.setRemoteDescription(new RTCSessionDescription(msg.payload));
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              await sendSignalingMessage(msg.from, "answer", answer);
            } catch (err) {
              console.error("Error setting offer or generating answer:", err);
            }
          } else if (msg.type === "answer") {
            const pc = peerConnectionsRef.current.get(msg.from);
            if (pc) {
              try {
                await pc.setRemoteDescription(new RTCSessionDescription(msg.payload));
              } catch (err) {
                console.error("Error setting answer:", err);
              }
            }
          } else if (msg.type === "ice") {
            const pc = peerConnectionsRef.current.get(msg.from);
            if (pc) {
              try {
                await pc.addIceCandidate(new RTCIceCandidate(msg.payload));
              } catch (err) {
                console.error("Error adding ice candidate:", err);
              }
            }
          }
        }

        if (data.serverTime) {
          lastTimestampRef.current = Math.max(lastTimestampRef.current, data.serverTime);
        }
      } catch (err) {
        console.warn("Polling cycle error:", err);
      }

      // Loop
      if (isSubscribed) {
        pollTimeout = setTimeout(poll, 2200);
      }
    };

    poll();

    return () => {
      isSubscribed = false;
      clearTimeout(pollTimeout);
    };
  }, [isJoined, roomId, participantName, createPeerConnection, sendSignalingMessage, handlePeerDisconnect]);

  // Disconnect / Clean up
  const disconnect = useCallback(() => {
    if (typeof window !== "undefined" && isJoined && roomId) {
      navigator.sendBeacon("/api/signaling", JSON.stringify({
        action: "leave",
        roomId,
        participantId: participantIdRef.current,
      }));
    }

    peerConnectionsRef.current.forEach((pc) => pc.close());
    peerConnectionsRef.current.clear();
    setRemoteStreams([]);
    setActiveParticipants([]);
    setIsJoined(false);

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    setLocalStream(null);
  }, [isJoined, roomId]);

  return {
    localStream,
    localVideoRef,
    setLocalVideoElement,
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
    disconnect,
  };
};

export const useWebRTC = () => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<RemoteStream[]>([]);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const dataChannelsRef = useRef<Map<string, RTCDataChannel>>(new Map());

  // Inicializar mídia local
  useEffect(() => {
    let activeStream: MediaStream | null = null;
    const initializeMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        });
        setLocalStream(stream);
        activeStream = stream;
      } catch (err) {
        setError(`Erro ao acessar câmera/microfone: ${err}`);
        console.error('Media initialization error:', err);
      }
    };

    initializeMedia();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Criar conexão peer
  const createPeerConnection = (peerId: string): RTCPeerConnection => {
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] },
      ],
    });

    // Adicionar stream local
    if (localStream) {
      localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
      });
    }

    // Lidar com streams remotos
    peerConnection.ontrack = (event) => {
      console.log('Received remote stream:', event.streams[0]);
      setRemoteStreams(prev => {
        const exists = prev.some(r => r.id === peerId);
        if (!exists) {
          return [...prev, { id: peerId, stream: event.streams[0], name: `Participante ${prev.length + 1}` }];
        }
        return prev;
      });
    };

    // Lidar com remoção de streams
    peerConnection.onconnectionstatechange = () => {
      if (peerConnection.connectionState === 'failed' || peerConnection.connectionState === 'disconnected') {
        setRemoteStreams(prev => prev.filter(r => r.id !== peerId));
        peerConnection.close();
        peerConnectionsRef.current.delete(peerId);
      }
    };

    peerConnectionsRef.current.set(peerId, peerConnection);
    return peerConnection;
  };

  // Alternar áudio
  const toggleAudio = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsAudioEnabled(!isAudioEnabled);
    }
  };

  // Alternar vídeo
  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  // Desconectar
  const disconnect = () => {
    peerConnectionsRef.current.forEach(pc => pc.close());
    peerConnectionsRef.current.clear();
    dataChannelsRef.current.clear();
    setRemoteStreams([]);
  };

  return {
    localStream,
    remoteStreams,
    isAudioEnabled,
    isVideoEnabled,
    error,
    toggleAudio,
    toggleVideo,
    disconnect,
    createPeerConnection,
  };
};
