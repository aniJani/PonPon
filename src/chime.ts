let ctx: AudioContext | null = null;

// Must be called from a real user gesture: autoplay policy leaves an AudioContext that has
// never seen one suspended, and a chime that fires 25 minutes later is not a gesture.
export const primeChime = () => {
    ctx ??= new AudioContext();
    // resume() rejects if the browser decides this wasn't a real gesture; that is a
    // silent chime, not a crash, so it must not surface as an unhandled rejection.
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
};

// Synthesised rather than a bundled sound file — two sine notes need no asset, no licence,
// and no decode. Rising when focus ends, falling when the break does.
export const playChime = (ended: 'focus' | 'break') => {
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});

    const notes = ended === 'focus' ? [660, 880] : [880, 660];
    notes.forEach((frequency, index) => {
        const at = ctx!.currentTime + index * 0.16;
        const osc = ctx!.createOscillator();
        const gain = ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.value = frequency;

        // exponentialRamp cannot touch zero, hence the tiny floor values.
        gain.gain.setValueAtTime(0.0001, at);
        gain.gain.exponentialRampToValueAtTime(0.2, at + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.5);

        osc.connect(gain).connect(ctx!.destination);
        osc.start(at);
        osc.stop(at + 0.55);
    });
};
