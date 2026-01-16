/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from 'react';

export default function TrackPlayerClient(props: any) {
  const [LoadedComp, setLoadedComp] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    if (!LoadedComp) {
      import('./TrackPlayer')
        .then((mod) => {
          if (!mounted) return;
          setLoadedComp(() => (mod && (mod as any).default) || mod);
        })
        .catch((err) => {
          console.error('[TrackPlayerClient] failed to load TrackPlayer', err);
        });
    }
    return () => {
      mounted = false;
    };
  }, [LoadedComp]);

  return (
    <div>
      {LoadedComp ? (
        <LoadedComp {...props} />
      ) : (
        <div className="track-player-skeleton" style={{ minHeight: '400px' }} />
      )}
    </div>
  );
}
