import React, { useEffect, useState } from 'react';
import { playChime, primeChime } from '../../chime';
import TimerSettings, { BREAK_RANGE, WORK_RANGE, clampMinutes } from './TimerSettings';

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

type Mode = 'work' | 'break';
type Settings = { work: number; rest: number };

const SETTINGS_KEY = 'ponpon.timer';
const SESSION_KEY = 'ponpon.session';
const DEFAULTS: Settings = { work: 25, rest: 5 };

const loadSettings = (): Settings => {
    try {
        const raw = localStorage.getItem(SETTINGS_KEY);
        if (!raw) return DEFAULTS;
        const parsed = JSON.parse(raw);
        return {
            work: clampMinutes(parsed.work ?? DEFAULTS.work, WORK_RANGE),
            rest: clampMinutes(parsed.rest ?? DEFAULTS.rest, BREAK_RANGE),
        };
    } catch {
        return DEFAULTS;
    }
};

const secondsFor = (mode: Mode, settings: Settings) =>
    (mode === 'work' ? settings.work : settings.rest) * 60;

const loadSession = (settings: Settings) => {
    const fresh = { mode: 'work' as Mode, remaining: secondsFor('work', settings), active: false };
    try {
        const raw = localStorage.getItem(SESSION_KEY);
        if (!raw) return fresh;
        const saved = JSON.parse(raw);
        const mode: Mode = saved.mode === 'break' ? 'break' : 'work';

        if (typeof saved.endsAt === 'number') {
            const left = Math.round((saved.endsAt - Date.now()) / 1000);
            // Was running when the app closed, and the deadline is still ahead: pick the
            // clock up where wall time actually left it, not where the app stopped looking.
            if (left > 0) return { mode, remaining: left, active: true };
            // It elapsed while closed. Open on the next block rather than firing a
            // completion chime for a session that ended who knows when.
            const next: Mode = mode === 'work' ? 'break' : 'work';
            return { mode: next, remaining: secondsFor(next, settings), active: false };
        }

        const remaining = Number(saved.remaining);
        if (!Number.isFinite(remaining) || remaining <= 0) return fresh;
        return { mode, remaining: Math.min(remaining, secondsFor(mode, settings)), active: false };
    } catch {
        return fresh;
    }
};

const SVG_SIZE = 140;
const STROKE_WIDTH = 8;
const CENTER = SVG_SIZE / 2;
const RADIUS = CENTER - STROKE_WIDTH;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const PomodoroTimer: React.FC = () => {
    const [settings, setSettings] = useState(loadSettings);
    const [restored] = useState(() => loadSession(settings));
    const [mode, setMode] = useState<Mode>(restored.mode);
    const [remaining, setRemaining] = useState(restored.remaining);
    const [isActive, setIsActive] = useState(restored.active);
    const [showSettings, setShowSettings] = useState(false);

    const durationFor = (m: Mode) => secondsFor(m, settings);

    useEffect(() => {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    }, [settings]);

    // Autoplay policy suspends an AudioContext that has never seen a gesture, so the chime
    // is armed by the first click anywhere — including one that only drags the cat.
    useEffect(() => {
        window.addEventListener('pointerdown', primeChime, { once: true });
        return () => window.removeEventListener('pointerdown', primeChime);
    }, []);

    // Written once per transition, not per tick: while running, endsAt alone is enough to
    // rebuild the clock, and a write every 250ms would be pure churn.
    useEffect(() => {
        if (!isActive) return;
        const payload = { mode, endsAt: Date.now() + remaining * 1000 };
        localStorage.setItem(SESSION_KEY, JSON.stringify(payload));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isActive, mode]);

    useEffect(() => {
        if (isActive) return;
        localStorage.setItem(SESSION_KEY, JSON.stringify({ mode, remaining }));
    }, [isActive, mode, remaining]);

    useEffect(() => {
        if (!isActive) return;
        // Anchored to a wall-clock deadline rather than counting ticks: an interval loses
        // time whenever the machine sleeps, which for an always-on-top widget is routine.
        const endsAt = Date.now() + remaining * 1000;
        const id = setInterval(() => {
            setRemaining(Math.max(0, Math.round((endsAt - Date.now()) / 1000)));
        }, 250);
        return () => clearInterval(id);
        // `remaining` is deliberately not a dependency — the deadline is fixed when the
        // clock starts, and re-running this on every tick is what made the old timer drift.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isActive]);

    useEffect(() => {
        if (remaining > 0) return;
        const next: Mode = mode === 'work' ? 'break' : 'work';
        playChime(mode === 'work' ? 'focus' : 'break');
        setIsActive(false);
        setMode(next);
        setRemaining(secondsFor(next, settings));
    }, [remaining, mode, settings]);

    const applySettings = (work: number, rest: number) => {
        const next = {
            work: clampMinutes(work, WORK_RANGE),
            rest: clampMinutes(rest, BREAK_RANGE),
        };
        setSettings(next);
        if (!isActive) setRemaining((mode === 'work' ? next.work : next.rest) * 60);
    };

    const resetTimer = () => {
        setIsActive(false);
        setRemaining(durationFor(mode));
    };

    const total = durationFor(mode);
    const progress = total > 0 ? (total - remaining) / total : 0;
    const strokeDashoffset = CIRCUMFERENCE * (1 - Math.max(0, Math.min(1, progress)));

    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;

    return (
        <div className="flex flex-col justify-between items-center h-full w-full text-white py-2">
            {showSettings && (
                <TimerSettings
                    workMinutes={settings.work}
                    breakMinutes={settings.rest}
                    onChange={applySettings}
                    onClose={() => setShowSettings(false)}
                />
            )}

            <div className="relative w-[140px] h-[140px]">
                <svg
                    height={SVG_SIZE}
                    width={SVG_SIZE}
                    viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
                    className="transform -rotate-90"
                    aria-hidden="true"
                >
                    <defs>
                        <radialGradient id="pinkBrushSpray" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="rgb(253, 160, 174)" stopOpacity="0.8" />
                            <stop offset="30%" stopColor="rgb(253, 160, 174)" stopOpacity="0.6" />
                            <stop offset="60%" stopColor="rgb(253, 160, 174)" stopOpacity="0.4" />
                            <stop offset="80%" stopColor="rgb(253, 160, 174)" stopOpacity="0.1" />
                            <stop offset="100%" stopColor="rgb(253, 160, 174)" stopOpacity="0" />
                        </radialGradient>
                    </defs>

                    <circle fill="url(#pinkBrushSpray)" r={RADIUS + 15} cx={CENTER} cy={CENTER} />

                    <circle
                        stroke="rgba(166, 135, 146, 0.2)"
                        fill="transparent"
                        strokeWidth={STROKE_WIDTH}
                        r={RADIUS}
                        cx={CENTER}
                        cy={CENTER}
                    />
                    <circle
                        stroke="rgb(253, 160, 174)"
                        fill="transparent"
                        strokeWidth={STROKE_WIDTH}
                        strokeDasharray={CIRCUMFERENCE}
                        style={{ strokeDashoffset }}
                        className="transition-[stroke-dashoffset] duration-300 ease-linear motion-reduce:transition-none"
                        strokeLinecap="round"
                        r={RADIUS}
                        cx={CENTER}
                        cy={CENTER}
                    />
                </svg>

                <button
                    type="button"
                    className="absolute inset-0 flex items-center justify-center rounded-full
                               disabled:cursor-default focus-visible:outline-none
                               focus-visible:ring-2 focus-visible:ring-white/70"
                    onClick={() => setShowSettings(true)}
                    disabled={isActive}
                    aria-label={isActive ? 'Timer running' : 'Open timer settings'}
                >
                    <span className="text-2xl font-sans font-semibold tabular-nums text-white">
                        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                    </span>
                </button>
            </div>

            <div className="flex justify-between items-center w-full px-10">
                <button
                    onClick={resetTimer}
                    className="text-white/80 hover:text-white transition-colors motion-reduce:transition-none
                               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 rounded"
                    aria-label="Reset timer"
                >
                    <ResetIcon />
                </button>
                <button
                    onClick={() => setIsActive((active) => !active)}
                    className="text-white/80 hover:text-white transition-colors motion-reduce:transition-none
                               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 rounded"
                    aria-label={isActive ? 'Pause timer' : 'Start timer'}
                >
                    {isActive ? <PauseIcon /> : <PlayIcon />}
                </button>
            </div>
        </div>
    );
};

export default PomodoroTimer;
