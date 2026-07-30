// src/components/Music/Music.tsx
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import React, { useEffect, useState } from 'react';

// --- SVG Icons ---
const PlayIcon = ({ size = "24" }) => ( // Larger size for main button
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className="text-gray-700 hover:text-black transition-colors">
        <path d="M8 5v14l11-7z" />
    </svg>
);

const PauseIcon = ({ size = "20" }) => ( // Larger size for main button
    <svg width={size} height={size} viewBox="0 0 20 20" fill="currentColor" className="text-gray-700 hover:text-black transition-colors">
        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
);
// --- End SVG Icons ---

interface MediaInfoPayload {
    title?: string;
    artist?: string;
    is_playing: boolean;
    album_art_url?: string | null;
    current_time_ms?: number;
    total_time_ms?: number;
}

const Music: React.FC = () => {
    const [systemTrack, setSystemTrack] = useState<string | null>("No Media Detected");
    const [systemArtist, setSystemArtist] = useState<string | null>(null);
    const [isSystemPlaying, setIsSystemPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0); // in seconds
    const [totalTime, setTotalTime] = useState(0);     // in seconds

    useEffect(() => {
        const unlisten = listen<MediaInfoPayload>('media-info-update', (event) => {
            setSystemTrack(event.payload.title || "Unknown Title");
            setSystemArtist(event.payload.artist || "Unknown Artist");
            setIsSystemPlaying(event.payload.is_playing);

            if (event.payload.total_time_ms && event.payload.total_time_ms > 0) {
                setTotalTime(event.payload.total_time_ms / 1000);
                setCurrentTime((event.payload.current_time_ms || 0) / 1000);
            } else {
                setTotalTime(0);
                setCurrentTime(0);
            }
        });
        return () => { unlisten.then(f => f()); };
    }, []);

    const handlePlayPause = () => invoke('system_media_toggle_play_pause').catch(console.error);

    const progressPercent = totalTime > 0 ? (currentTime / totalTime) * 100 : 0;

    return (
        <div className="h-full flex flex-col p-1.5 text-gray-700 overflow-hidden">
            {/* Main content: Play/Pause Button, Info, Progress */}
            <div className="flex items-center space-x-0 flex-grow min-h-0 overflow-hidden">
                {/* Play/Pause Button */}
                <div className="flex-shrink-0">
                    <button
                        onClick={handlePlayPause}
                        className="w-8 h-8 rounded-full hover:bg-gray-200/70 flex items-center justify-center transition-colors"
                        title={isSystemPlaying ? "Pause" : "Play"}
                    >
                        {isSystemPlaying ? <PauseIcon size="18" /> : <PlayIcon size="20" />}
                    </button>
                </div>

                {/* Right side: Track Info, Progress */}
                <div className="flex-1 flex flex-col justify-center min-w-0 h-full space-y-1 overflow-hidden">
                    {/* Track Info */}
                    <div className="overflow-hidden min-w-0 max-w-full">
                        <p className="text-xs font-semibold truncate" title={systemTrack || ""}>
                            {systemTrack || "---"}
                        </p>
                        {systemArtist && (
                            <p className="text-[10px] text-gray-600 truncate" title={systemArtist}>
                                {systemArtist}
                            </p>
                        )}
                    </div>

                    {/* Playback Progress Bar */}
                    <div className="w-full h-1 bg-gray-300/70 rounded-full overflow-hidden min-w-0 flex-shrink-0">
                        <div
                            className="h-full bg-purple-500 rounded-full"
                            style={{ width: `${progressPercent}%`, transition: 'width 0.2s linear' }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Music;