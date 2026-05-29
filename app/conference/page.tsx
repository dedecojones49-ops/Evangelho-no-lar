'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import VideoConference from '@/components/VideoConference';

function ConferenceContent() {
  const searchParams = useSearchParams();
  const room = searchParams.get('room') || 'evangelho-no-lar';
  return <VideoConference roomId={room} />;
}

export default function ConferencePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center font-sans text-stone-600 animate-pulse">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-amber-600 border-t-transparent animate-spin mx-auto"></div>
          <p className="font-serif italic text-sm">Sintonizando com o portal espiritual do círculo virtual...</p>
        </div>
      </div>
    }>
      <ConferenceContent />
    </Suspense>
  );
}
