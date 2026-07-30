import React, { useEffect, useRef } from 'react';

export const WORK_RANGE = { min: 1, max: 90 };
export const BREAK_RANGE = { min: 1, max: 30 };

const PRESETS = [
    { name: 'Classic', work: 25, rest: 5 },
    { name: 'Deep', work: 50, rest: 10 },
    { name: 'Short', work: 15, rest: 3 },
];

export const clampMinutes = (value: number, range: { min: number; max: number }) => {
    if (!Number.isFinite(value)) return range.min;
    return Math.min(range.max, Math.max(range.min, Math.round(value)));
};

const Stepper: React.FC<{ label: string; onClick: () => void; disabled: boolean; glyph: string }> = ({
    label,
    onClick,
    disabled,
    glyph,
}) => (
    <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        className="w-6 h-6 rounded-full flex items-center justify-center text-[13px] leading-none
                   text-[#4A4453] bg-[#F9E4D4] enabled:hover:bg-[#FDA0AE] disabled:opacity-30
                   transition-colors motion-reduce:transition-none
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D96A80]"
    >
        {glyph}
    </button>
);

interface DurationRowProps {
    label: string;
    minutes: number;
    range: { min: number; max: number };
    onChange: (next: number) => void;
}

const DurationRow: React.FC<DurationRowProps> = ({ label, minutes, range, onChange }) => (
    <div className="flex items-center justify-between">
        <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#4A4453]/55">
            {label}
        </span>
        <div className="flex items-center gap-2">
            <Stepper
                glyph="−"
                label={`Decrease ${label.toLowerCase()} by one minute`}
                disabled={minutes <= range.min}
                onClick={() => onChange(clampMinutes(minutes - 1, range))}
            />
            <span className="text-[22px] font-semibold leading-none tabular-nums text-[#4A4453] w-[2.2ch] text-right">
                {minutes}
            </span>
            <span className="text-[10px] text-[#4A4453]/45 w-[1.8rem]">min</span>
            <Stepper
                glyph="+"
                label={`Increase ${label.toLowerCase()} by one minute`}
                disabled={minutes >= range.max}
                onClick={() => onChange(clampMinutes(minutes + 1, range))}
            />
        </div>
    </div>
);

interface TimerSettingsProps {
    workMinutes: number;
    breakMinutes: number;
    onChange: (work: number, rest: number) => void;
    onClose: () => void;
}

const TimerSettings: React.FC<TimerSettingsProps> = ({ workMinutes, breakMinutes, onChange, onClose }) => {
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        panelRef.current?.focus();
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [onClose]);

    const focusShare = (workMinutes / (workMinutes + breakMinutes)) * 100;

    return (
        <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Timer settings"
            tabIndex={-1}
            className="panel-in absolute inset-0 z-20 flex flex-col justify-center gap-2.5 rounded-xl
                       backdrop-blur-md p-3.5 focus:outline-none"
            // Same gradient and direction as the card underneath, just denser, so the panel
            // reads as more of the same glass rather than a separate opaque sheet.
            style={{
                background:
                    'linear-gradient(to right, rgba(196, 191, 208, 0.82), rgba(254, 242, 242, 0.82))',
            }}
        >
            <div className="flex flex-col gap-1">
                <DurationRow
                    label="Focus"
                    minutes={workMinutes}
                    range={WORK_RANGE}
                    onChange={(next) => onChange(next, breakMinutes)}
                />
                <DurationRow
                    label="Break"
                    minutes={breakMinutes}
                    range={BREAK_RANGE}
                    onChange={(next) => onChange(workMinutes, next)}
                />
            </div>

            {/* How the cycle actually splits — the one thing the two numbers alone don't show. */}
            <div className="flex h-1.5 overflow-hidden rounded-full bg-[#F9E4D4]" aria-hidden="true">
                <div className="bg-[#FDA0AE]" style={{ width: `${focusShare}%` }} />
            </div>

            <div className="flex gap-1.5">
                {PRESETS.map((preset) => {
                    const active = preset.work === workMinutes && preset.rest === breakMinutes;
                    return (
                        <button
                            key={preset.name}
                            type="button"
                            onClick={() => onChange(preset.work, preset.rest)}
                            aria-pressed={active}
                            className={`flex-1 rounded-full py-1 text-[10px] transition-colors motion-reduce:transition-none
                                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D96A80]
                                        ${active
                                    ? 'bg-[#FDA0AE] text-[#4A4453] font-semibold'
                                    : 'bg-[#4A4453]/[0.06] text-[#4A4453]/70 hover:bg-[#4A4453]/10'
                                }`}
                        >
                            {preset.name} <span className="opacity-50">{preset.work}/{preset.rest}</span>
                        </button>
                    );
                })}
            </div>

            {/* Ink, not pink: in this panel pink means "the value you are on", and the
                close action should not read as another selectable state. */}
            <button
                type="button"
                onClick={onClose}
                className="w-full rounded-lg bg-[#4A4453] py-1.5 text-[10px] font-semibold
                           uppercase tracking-[0.12em] text-[#FFFBFC] hover:bg-[#5C5566]
                           transition-colors motion-reduce:transition-none focus-visible:outline-none
                           focus-visible:ring-2 focus-visible:ring-[#D96A80] focus-visible:ring-offset-1"
            >
                Done
            </button>
        </div>
    );
};

export default TimerSettings;
