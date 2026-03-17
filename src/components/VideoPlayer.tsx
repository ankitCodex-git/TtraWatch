import React, { useEffect, useRef, useState } from 'react';
import { Video } from '../types';

interface VideoPlayerProps {
  video: Video | null;
}

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

const PLAYBACK_TIME_PREFIX = 'ttrawatch_playback_';

export function VideoPlayer({ video }: VideoPlayerProps) {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<number | null>(null);
  const [apiReady, setApiReady] = useState(false);

  // Load YouTube API script
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        setApiReady(true);
      };
    } else {
      setApiReady(true);
    }
  }, []);

  const savePlaybackTime = () => {
    if (playerRef.current && video && typeof playerRef.current.getCurrentTime === 'function') {
      const currentTime = Math.floor(playerRef.current.getCurrentTime());
      if (currentTime > 0) {
        localStorage.setItem(`${PLAYBACK_TIME_PREFIX}${video.youtubeId}`, currentTime.toString());
      }
    }
  };

  useEffect(() => {
    if (!apiReady || !video || !containerRef.current) return;

    const savedTime = localStorage.getItem(`${PLAYBACK_TIME_PREFIX}${video.youtubeId}`);
    const startTime = savedTime ? parseInt(savedTime, 10) : 0;

    // Destroy existing player if it exists
    if (playerRef.current) {
      playerRef.current.destroy();
      playerRef.current = null;
    }

    // Clear any existing interval
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    playerRef.current = new window.YT.Player(containerRef.current, {
      videoId: video.youtubeId,
      playerVars: {
        autoplay: 1,
        start: startTime,
        modestbranding: 1,
        rel: 0,
      },
      events: {
        onStateChange: (event: any) => {
          // YT.PlayerState.ENDED = 0
          if (event.data === 0) {
            localStorage.removeItem(`${PLAYBACK_TIME_PREFIX}${video.youtubeId}`);
            if (intervalRef.current) {
              window.clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
          }
          
          // YT.PlayerState.PAUSED = 2
          if (event.data === 2) {
            savePlaybackTime();
          }
          
          // YT.PlayerState.PLAYING = 1
          if (event.data === 1) {
            if (!intervalRef.current) {
              intervalRef.current = window.setInterval(savePlaybackTime, 5000);
            }
          } else {
            if (intervalRef.current) {
              window.clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
          }
        },
      },
    });

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [apiReady, video?.id]); // Re-initialize when video changes

  if (!video) {
    return (
      <div className="flex aspect-video w-full flex-col items-center justify-center rounded-2xl border border-white/5 bg-[#151A23] shadow-2xl">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-800/50">
          <svg className="h-8 w-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="mt-4 text-slate-400">Select a video to start watching</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl shadow-cyan-900/20">
        <div ref={containerRef} className="absolute inset-0 h-full w-full"></div>
      </div>
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">{video.title}</h2>
          <p className="mt-1 text-sm text-slate-400">Added on {new Date(video.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}
