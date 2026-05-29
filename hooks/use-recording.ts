'use client';

import { useState, useCallback, useRef } from 'react';

interface RecordingState {
  isRecording: boolean;
  recordingTime: number;
  recordedBlob: Blob | null;
  error: string | null;
}

export const useRecording = (localStream: MediaStream | null, remoteStreams: MediaStream[]) => {
  const [state, setState] = useState<RecordingState>({
    isRecording: false,
    recordingTime: 0,
    recordedBlob: null,
    error: null,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = useCallback(() => {
    try {
      if (!localStream) {
        setState((prev) => ({
          ...prev,
          error: 'Stream local não disponível',
        }));
        return;
      }

      // Combine local and remote streams
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioDestination = audioContext.createMediaStreamDestination();

      // Add local audio
      const localAudioTracks = localStream.getAudioTracks();
      if (localAudioTracks.length > 0) {
        const localAudioSource = audioContext.createMediaStreamSource(localStream);
        localAudioSource.connect(audioDestination);
      }

      // Add remote audio streams
      remoteStreams.forEach((stream) => {
        const remoteTracks = stream.getAudioTracks();
        if (remoteTracks.length > 0) {
          const remoteAudioSource = audioContext.createMediaStreamSource(stream);
          remoteAudioSource.connect(audioDestination);
        }
      });

      // Create combined stream with video from local
      const combinedStream = new MediaStream();

      // Add video track from local stream
      const videoTracks = localStream.getVideoTracks();
      if (videoTracks.length > 0) {
        combinedStream.addTrack(videoTracks[0]);
      }

      // Add combined audio
      audioDestination.stream.getAudioTracks().forEach((track) => {
        combinedStream.addTrack(track);
      });

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType: 'video/webm;codecs=vp9,opus',
        videoBitsPerSecond: 2500000,
      });

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        setState((prev) => ({
          ...prev,
          recordedBlob: blob,
          isRecording: false,
        }));

        // Clean up audio context
        audioContext.close();

        // Stop all tracks
        combinedStream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;

      // Start timer
      let seconds = 0;
      timerIntervalRef.current = setInterval(() => {
        seconds += 1;
        setState((prev) => ({
          ...prev,
          recordingTime: seconds,
          isRecording: true,
          error: null,
        }));
      }, 1000);

      setState((prev) => ({
        ...prev,
        isRecording: true,
        recordingTime: 0,
        error: null,
      }));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao iniciar gravação';
      setState((prev) => ({
        ...prev,
        error: errorMsg,
      }));
    }
  }, [localStream, remoteStreams]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    setState((prev) => ({
      ...prev,
      isRecording: false,
    }));
  }, []);

  const downloadRecording = useCallback(() => {
    if (state.recordedBlob) {
      const url = URL.createObjectURL(state.recordedBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `evangelho-no-lar-${new Date().toISOString().slice(0, 19)}.webm`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }, [state.recordedBlob]);

  const resetRecording = useCallback(() => {
    chunksRef.current = [];
    setState({
      isRecording: false,
      recordingTime: 0,
      recordedBlob: null,
      error: null,
    });
  }, []);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const pad = (num: number) => String(num).padStart(2, '0');

    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
    }
    return `${pad(minutes)}:${pad(secs)}`;
  };

  return {
    isRecording: state.isRecording,
    recordingTime: state.recordingTime,
    recordedBlob: state.recordedBlob,
    error: state.error,
    startRecording,
    stopRecording,
    downloadRecording,
    resetRecording,
    formatTime,
  };
};
