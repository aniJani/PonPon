// src/components/CatAnimation/CatAnimation.tsx
import { getCurrentWindow } from '@tauri-apps/api/window';
import React from 'react';

import catAnimationGif from '/idle.gif'; // Assuming idle.gif is in your `public` directory

interface CatAnimationProps {
    // children?: React.ReactNode; 
}

const CatAnimation: React.FC<CatAnimationProps> = () => {
    const handleMouseDown = async (e: React.MouseEvent) => {
        e.preventDefault();
        try {
            const appWindow = getCurrentWindow();
            await appWindow.startDragging();
        } catch (error) {
            console.error('Error starting window drag:', error);
        }
    };

    return (
        <div
            className="absolute top-3 left-1/2 w-16 h-16 z-50 cursor-move"
            style={{ transform: 'translateX(calc(-75% - 6rem))' }}
            onMouseDown={handleMouseDown}
        >
            <img
                src={catAnimationGif}
                alt="Animated Cat"
                className="w-full h-full object-contain pointer-events-none"
                draggable={false}
            />
        </div>
    );
};

export default CatAnimation;