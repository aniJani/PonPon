import React, { useEffect, useState } from 'react';

const PlayIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M8 5v14l11-7z" />
    </svg>
);

const PauseIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
);

const ResetIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
    </svg>
);


// --- PomodoroTimer Component ---
const PomodoroTimer: React.FC = () => {
    const [WORK_MINUTES, setWorkMinutes] = useState(25);
    const [BREAK_MINUTES, setBreakMinutes] = useState(5);

    const [minutes, setMinutes] = useState(WORK_MINUTES);
    const [seconds, setSeconds] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState<'work' | 'break'>('work');
    const [totalDuration, setTotalDuration] = useState(WORK_MINUTES * 60);
    const [showSettings, setShowSettings] = useState(false);

    useEffect(() => {
        setTotalDuration((mode === 'work' ? WORK_MINUTES : BREAK_MINUTES) * 60);
    }, [mode, WORK_MINUTES, BREAK_MINUTES]);


    useEffect(() => {
        let interval: ReturnType<typeof setInterval> | null = null;
        if (isActive) {
            interval = setInterval(() => {
                if (seconds > 0) setSeconds(s => s - 1);
                else if (minutes > 0) {
                    setMinutes(m => m - 1);
                    setSeconds(59);
                } else {
                    setIsActive(false);
                    const nextMode = mode === 'work' ? 'break' : 'work';
                    setMode(nextMode);
                    setMinutes(nextMode === 'work' ? WORK_MINUTES : BREAK_MINUTES);
                    setSeconds(0);
                }
            }, 1000);
        } else if (interval) {
            clearInterval(interval);
        }
        return () => { if (interval) clearInterval(interval); };
    }, [isActive, seconds, minutes, mode, WORK_MINUTES, BREAK_MINUTES]);

    const toggleTimer = () => setIsActive(!isActive);
    const resetTimer = () => {
        setIsActive(false);
        setMinutes(mode === 'work' ? WORK_MINUTES : BREAK_MINUTES);
        setSeconds(0);
    };

    const handleCircleClick = () => {
        if (!isActive) {
            setShowSettings(!showSettings);
        }
    };

    const saveSettings = (workDuration: number, breakDuration: number) => {
        setWorkMinutes(workDuration);
        setBreakMinutes(breakDuration);
        setMinutes(mode === 'work' ? workDuration : breakDuration);
        setShowSettings(false);
    };

    // SVG Circular Progress Bar Calculations
    const SVG_SIZE = 140;
    const STROKE_WIDTH = 8;
    const CENTER = SVG_SIZE / 2;
    const RADIUS = CENTER - STROKE_WIDTH;
    const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

    const currentTimeInSeconds = minutes * 60 + seconds;
    const progressFraction = Math.max(0, Math.min(1, (totalDuration - currentTimeInSeconds) / totalDuration));
    const strokeDashoffset = CIRCUMFERENCE * (1 - progressFraction);

    return (
        <div className="flex flex-col justify-between items-center h-full w-full text-white py-2">
            {/* Settings Panel */}
            {showSettings && (
                <div className="absolute top-0 left-0 right-0 bg-white/90 backdrop-blur-sm rounded-md p-3 shadow-md z-10 m-2">
                    <h3 className="font-semibold mb-2 text-gray-800 text-sm">Timer Settings</h3>

                    <div className="space-y-2">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Work Duration (minutes)
                            </label>
                            <input
                                type="number"
                                defaultValue={WORK_MINUTES}
                                id="workDuration"
                                className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                min="1"
                                max="60"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Break Duration (minutes)
                            </label>
                            <input
                                type="number"
                                defaultValue={BREAK_MINUTES}
                                id="breakDuration"
                                className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                min="1"
                                max="30"
                            />
                        </div>

                        <div className="flex space-x-2">
                            <button
                                onClick={() => {
                                    const workInput = document.getElementById('workDuration') as HTMLInputElement;
                                    const breakInput = document.getElementById('breakDuration') as HTMLInputElement;
                                    saveSettings(Number(workInput.value), Number(breakInput.value));
                                }}
                                className="flex-1 px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
                            >
                                Save
                            </button>
                            <button
                                onClick={() => setShowSettings(false)}
                                className="flex-1 px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Circular Progress and Time */}
            <div className="relative w-[140px] h-[140px]">
                <svg
                    height={SVG_SIZE}
                    width={SVG_SIZE}
                    viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
                    className="transform -rotate-90 cursor-pointer"
                    onClick={handleCircleClick}
                    aria-label={!isActive ? "Click to open settings" : "Timer is running"}
                >
                    {/* Define the brush spray gradient */}
                    <defs>
                        <radialGradient id="pinkBrushSpray" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="rgb(253, 160, 174)" stopOpacity="0.8" />
                            <stop offset="30%" stopColor="rgb(253, 160, 174)" stopOpacity="0.6" />
                            <stop offset="60%" stopColor="rgb(253, 160, 174)" stopOpacity="0.4" />
                            <stop offset="80%" stopColor="rgb(253, 160, 174)" stopOpacity="0.1" />
                            <stop offset="100%" stopColor="rgb(253, 160, 174)" stopOpacity="0" />
                        </radialGradient>
                    </defs>

                    {/* Pink brush spray effect in the center */}
                    <circle
                        fill="url(#pinkBrushSpray)"
                        r={RADIUS + 15}
                        cx={CENTER}
                        cy={CENTER}
                        opacity="1"
                    />

                    {/* Background Circle Track */}
                    <circle
                        stroke="rgba(166, 135, 146, 0.2)"
                        fill="transparent"
                        strokeWidth={STROKE_WIDTH}
                        r={RADIUS}
                        cx={CENTER}
                        cy={CENTER}
                    />
                    {/* Progress Circle */}
                    <circle
                        stroke="rgb(253, 160, 174)"
                        fill="transparent"
                        strokeWidth={STROKE_WIDTH}
                        strokeDasharray={CIRCUMFERENCE}
                        style={{ strokeDashoffset }}
                        strokeLinecap="round"
                        r={RADIUS}
                        cx={CENTER}
                        cy={CENTER}
                    />
                </svg>
                {/* Time Display - centered using flex utilities */}
                <div
                    className="absolute inset-0 flex items-center justify-center cursor-pointer"
                    onClick={handleCircleClick}
                >
                    <span className="text-2xl font-sans font-semibold text-white relative z-10">
                        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                    </span>
                </div>
            </div>

            {/* Controls */}
            <div className="flex justify-between items-center w-full px-10 ">
                <button
                    onClick={resetTimer}
                    className="text-white/80 hover:text-white transition-colors"
                    aria-label="Reset timer"
                >
                    <ResetIcon />
                </button>
                <button
                    onClick={toggleTimer}
                    className=" text-white/80 hover:text-white transition-colors"
                    aria-label={isActive ? "Pause timer" : "Start timer"}
                >
                    {isActive ? <PauseIcon /> : <PlayIcon />}
                </button>
            </div>
        </div>
    );
};

export default PomodoroTimer;