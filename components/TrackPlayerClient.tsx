/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import dynamic from 'next/dynamic';
import React from 'react';

const TrackPlayer = dynamic(() => import('./TrackPlayer'), { ssr: false, loading: () => <div className="track-player-skeleton" /> });

export default function TrackPlayerClient(props: any) {
  return <TrackPlayer {...props} />;
}
