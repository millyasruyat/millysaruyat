import React from 'react';
import Game from './components/Game';
import { Github } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="mb-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400 pixel-font tracking-widest mb-2">
          FLAPPY GENAI
        </h1>
        <p className="text-slate-400 text-sm md:text-base max-w-md mx-auto">
          The classic game, judged by an AI. <br />
          <span className="text-xs opacity-60">Powered by Gemini 2.5 Flash</span>
        </p>
      </div>

      <div className="border-[8px] border-slate-800 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
        <Game />
      </div>

      <div className="mt-8 flex items-center gap-4 text-slate-500 text-sm">
        <a href="#" className="flex items-center gap-2 hover:text-white transition-colors">
          <Github className="w-4 h-4" />
          <span>Source Code</span>
        </a>
        <span>•</span>
        <span>Press SPACE to Jump</span>
      </div>
    </div>
  );
}

export default App;