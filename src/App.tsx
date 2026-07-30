import { getCurrentWindow, LogicalPosition } from '@tauri-apps/api/window';
import { useEffect } from 'react';
import CatAnimation from './components/CatAnimation/CatAnimation';
import Music from './components/Music/Music';
import Notes from './components/Notes/Notes';
import PomodoroTimer from './components/PomodoroTimer/PomodoroTimer';

const SCREEN_MARGIN = 16;
const PLACED_KEY = 'ponpon.placed';

// The cat's bottom edge sits at 5rem (top-4 + h-16), so the card starts just above it
// and the cat appears to perch on the card.
const CARD_TOP = '4.5rem';

function App() {
    useEffect(() => {
        // First launch only. After this, tauri-plugin-window-state restores wherever the
        // window was left, and re-cornering it would throw that away on every start.
        if (localStorage.getItem(PLACED_KEY)) return;

        const moveToCorner = async () => {
            try {
                // availWidth/availHeight exclude the menu bar and Dock. Offsetting by the
                // window's own size is what keeps it on screen — anchoring the top-left to
                // the screen corner pushes the whole window out of view.
                const x = window.screen.availWidth - window.innerWidth - SCREEN_MARGIN;
                const y = window.screen.availHeight - window.innerHeight - SCREEN_MARGIN;
                await getCurrentWindow().setPosition(
                    new LogicalPosition(Math.max(0, x), Math.max(0, y))
                );
                localStorage.setItem(PLACED_KEY, '1');
            } catch (error) {
                console.error('Error positioning window:', error);
            }
        };

        moveToCorner();
    }, []);

    return (
        <>
            <CatAnimation />
            <div
                className="absolute left-2 right-2 bottom-2 flex flex-col p-2 backdrop-blur-md rounded-xl"
                style={{
                    top: CARD_TOP,
                    background:
                        'linear-gradient(to right, rgba(196, 191, 208, 0.9), rgba(254, 242, 242, 0.9))',
                }}
            >
                <div className="flex-1 flex items-stretch space-x-0.5">
                    <div className="flex-1 flex items-center justify-center">
                        <PomodoroTimer />
                    </div>

                    <div className="flex-1 flex flex-col space-y-1">
                        <div className="flex-1 min-h-0">
                            <Notes />
                        </div>
                        <div className="flex-1 min-h-0">
                            <Music />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default App;
