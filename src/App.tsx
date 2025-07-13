// src/App.tsx
import { getCurrentWindow, LogicalPosition } from '@tauri-apps/api/window';
import { useEffect } from 'react';
import CatAnimation from './components/CatAnimation/CatAnimation';
import Music from './components/Music/Music';
import Notes from './components/Notes/Notes';
import PomodoroTimer from './components/PomodoroTimer/PomodoroTimer';
import Settings from './components/Settings/Settings';

function App() {
  useEffect(() => {
    const moveToCorner = async () => {
      try {
        const appWindow = getCurrentWindow();
        const screenWidth = window.screen.width;
        const screenHeight = window.screen.height;

        const windowWidth = 600;
        const windowHeight = 300;

        const x = screenWidth;
        const y = screenHeight;

        await appWindow.setPosition(new LogicalPosition(Math.max(0, x), Math.max(0, y)));
      } catch (error) {
        console.error('Error positioning window:', error);
      }
    };

    moveToCorner();
  }, []);

  // Cat's bottom visual edge is at 5rem (top-4 + h-16 = 1rem + 4rem).
  // Let the widget start at 4.5rem (72px) to have the cat sit slightly on top.
  const WIDGET_TOP_OFFSET_REM = "4.5rem";

  return (
    <>
      <CatAnimation />
      <div
        className="absolute left-2 right-2 bottom-2 flex flex-col p-2 backdrop-blur-md rounded-xl"
        //  bg-pink-100/70
        style={{
          top: WIDGET_TOP_OFFSET_REM,
          background: 'linear-gradient(to right, rgba(196, 191, 208, 0.9), rgba(254, 242, 242, 0.9))'
        }}
      >
        {/* <div className="flex justify-end mb-1">
          <Settings />
        </div> */}

        {/* Main Content Area */}
        {/* Reduced space-x-4 to space-x-2 (0.5rem) */}
        <div className="flex-1 flex items-stretch space-x-0.5">
          {/* Left Column - Pomodoro Timer */}
          {/* Removed p-1, let PomodoroTimer manage its internal padding */}
          <div className="flex-1 flex items-center justify-center">
            <PomodoroTimer />
          </div>

          {/* Right Column - Notes and Music */}
          {/* Reduced space-y-4 to space-y-1 (0.25rem) */}
          <div className="flex-1 flex flex-col space-y-1">
            <div className="flex-1 min-h-0"> {/* Added min-h-0 to allow shrinking */}
              <Notes />
            </div>
            <div className="flex-1 min-h-0"> {/* Added min-h-0 to allow shrinking */}
              <Music />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;