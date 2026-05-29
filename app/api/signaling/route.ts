import { NextRequest, NextResponse } from "next/server";

interface Participant {
  id: string;
  name: string;
  lastSeen: number;
}

interface SignalMessage {
  id: string;
  from: string;
  to?: string;
  type: "offer" | "answer" | "ice" | "chat";
  payload: any;
  timestamp: number;
}

interface Room {
  participants: Map<string, Participant>;
  messages: SignalMessage[];
}

// In-memory rooms cache
const rooms = new Map<string, Room>();

// Housekeeping: Clean up stale participants and messages every 30s
if (typeof global !== "undefined" && !(global as any)._signalingCleanupStarted) {
  (global as any)._signalingCleanupStarted = true;
  setInterval(() => {
    const now = Date.now();
    for (const [roomId, room] of rooms.entries()) {
      for (const [pId, p] of room.participants.entries()) {
        if (now - p.lastSeen > 18000) { // stale if no poll in 18 seconds
          room.participants.delete(pId);
        }
      }
      
      // Keep only last 100 messages or messages from the last 5 minutes
      room.messages = room.messages
        .filter(msg => now - msg.timestamp < 300000)
        .slice(-100);

      if (room.participants.size === 0 && room.messages.length === 0) {
        rooms.delete(roomId);
      }
    }
  }, 15000);
}

export async function GET(req: NextRequest) {
  try {
    const list = Array.from(rooms.entries()).map(([roomId, room]) => {
      return {
        roomId,
        participants: Array.from(room.participants.values()).map(p => ({
          id: p.id,
          name: p.name,
          lastSeen: p.lastSeen
        })),
        messageCount: room.messages.length
      };
    });
    return NextResponse.json({ success: true, rooms: list });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, roomId, participantId, name, to, type, payload, lastTimestamp } = body;

    // 5. ADMIN INDEPENDENT ACTIONS
    if (action === "admin_delete_room") {
      if (roomId) {
        rooms.delete(roomId);
      }
      return NextResponse.json({ success: true });
    }

    if (!roomId) {
      return NextResponse.json({ error: "Room ID é obrigatório." }, { status: 400 });
    }

    // Get or create room
    let room = rooms.get(roomId);
    if (!room) {
      room = {
        participants: new Map<string, Participant>(),
        messages: [],
      };
      rooms.set(roomId, room);
    }

    const now = Date.now();

    if (action === "admin_kick_participant") {
      const targetId = body.targetParticipantId;
      if (targetId && room.participants.has(targetId)) {
        const p = room.participants.get(targetId);
        room.participants.delete(targetId);
        room.messages.push({
          id: `sys-kick-${now}-${Math.random().toString(36).substr(2, 4)}`,
          from: "system",
          type: "chat",
          payload: { text: `${p?.name || "Participante"} foi desconectado pelo administrador.` },
          timestamp: now,
        });
      }
      return NextResponse.json({ success: true });
    }

    // 1. JOIN ACTION
    if (action === "join") {
      const pName = name || "Participante de Luz";
      room.participants.set(participantId, {
        id: participantId,
        name: pName,
        lastSeen: now,
      });

      // System notification message
      room.messages.push({
        id: `sys-join-${now}-${Math.random().toString(36).substr(2, 4)}`,
        from: "system",
        type: "chat",
        payload: { text: `${pName} entrou no círculo de preces.` },
        timestamp: now,
      });

      return NextResponse.json({
        success: true,
        participants: Array.from(room.participants.values()),
      });
    }

    // 2. POLL ACTION (Includes heartbeat)
    if (action === "poll") {
      const participant = room.participants.get(participantId);
      if (participant) {
        participant.lastSeen = now;
      } else if (name) {
        // Auto rejoin if somehow removed
        room.participants.set(participantId, {
          id: participantId,
          name,
          lastSeen: now,
        });
      }

      // Filter messages intended for this participant (either broadcast to everyone or specifically addressed to them)
      const clientLastTime = lastTimestamp || 0;
      const relevantMessages = room.messages.filter((msg) => {
        const isNew = msg.timestamp > clientLastTime;
        const isFromOthers = msg.from !== participantId;
        const isForMe = !msg.to || msg.to === participantId;
        return isNew && isFromOthers && isForMe;
      });

      return NextResponse.json({
        participants: Array.from(room.participants.values()),
        messages: relevantMessages,
        serverTime: now,
      });
    }

    // 3. SEND SIGNAL / MESSAGE ACTION
    if (action === "send") {
      const msg: SignalMessage = {
        id: `msg-${now}-${Math.random().toString(36).substr(2, 4)}`,
        from: participantId,
        to,
        type,
        payload,
        timestamp: now,
      };
      room.messages.push(msg);
      return NextResponse.json({ success: true, timestamp: now });
    }

    // 4. LEAVE ACTION
    if (action === "leave") {
      const p = room.participants.get(participantId);
      if (p) {
        room.participants.delete(participantId);
        room.messages.push({
          id: `sys-leave-${now}-${Math.random().toString(36).substr(2, 4)}`,
          from: "system",
          type: "chat",
          payload: { text: `${p.name} saiu do círculo.` },
          timestamp: now,
        });
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Ação de sinalização inválida." }, { status: 400 });
  } catch (err: any) {
    console.error("Error in signaling handler:", err);
    return NextResponse.json({ error: err.message || "Erro de sinalização" }, { status: 500 });
  }
}
