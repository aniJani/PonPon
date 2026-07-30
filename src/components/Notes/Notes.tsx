import React, { useEffect, useState } from 'react';

const Notes: React.FC = () => {
    // Read on init rather than in an effect: a load-after-mount races the save effect
    // below, which would write the empty initial value over the saved notes first.
    const [notes, setNotes] = useState(() => localStorage.getItem('pomodoroNotes') ?? '');

    useEffect(() => {
        localStorage.setItem('pomodoroNotes', notes);
    }, [notes]);

    return (
        <div className="backdrop-blur-sm rounded-lg p-1.5 shadow-md flex flex-col h-full relative overflow-hidden"
            style={{
                background: 'rgb(249, 228, 212)',
                border: '1px solid rgba(230, 220, 210, 0.8)'
            }}>
            {/* Hole punch */}
            <div
                className="absolute left-2 top-4 w-3 h-3 rounded-full"
                style={{
                    background: 'linear-gradient(135deg, #e6e2f0 0%, #d1c9e0 100%)',
                    border: '1px solid rgba(180, 170, 190, 0.4)',
                    boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.1)'
                }}
            />

            {/* Ruled lines background */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: `
                        linear-gradient(to bottom, transparent 32px, rgba(220, 210, 200, 0.3) 32px, rgba(220, 210, 200, 0.3) 33px, transparent 33px),
                        linear-gradient(to bottom, transparent 48px, rgba(220, 210, 200, 0.3) 48px, rgba(220, 210, 200, 0.3) 49px, transparent 49px),
                        linear-gradient(to bottom, transparent 64px, rgba(220, 210, 200, 0.3) 64px, rgba(220, 210, 200, 0.3) 65px, transparent 65px),
                        linear-gradient(to bottom, transparent 80px, rgba(220, 210, 200, 0.3) 80px, rgba(220, 210, 200, 0.3) 81px, transparent 81px)
                    `,
                    backgroundSize: '100% 16px'
                }}
            />

            {/* Red margin line */}
            <div
                className="absolute left-7 top-0 bottom-0 w-px"
                style={{ background: 'rgba(220, 100, 120, 0.4)' }}
            />



            <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Write your notes here..."
                className="w-full flex-1 p-1 pl-7 text-xs text-gray-700 placeholder-gray-400 bg-transparent border-none resize-none focus:outline-none relative z-10 opacity-90"
                style={{
                    lineHeight: '16px',
                    fontFamily: 'Inter, ui-sans-serif, system-ui'
                }}
            />
        </div>
    );
};

export default Notes;