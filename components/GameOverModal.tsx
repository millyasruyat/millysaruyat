import React, { useEffect, useState } from 'react';
import { RefreshCw, MessageSquare, BrainCircuit } from 'lucide-react';
import { getAiCommentary } from '../services/geminiService';

interface GameOverModalProps {
  score: number;
  highScore: number;
  onRestart: () => void;
}

const GameOverModal: React.FC<GameOverModalProps> = ({ score, highScore, onRestart }) => {
  const [commentary, setCommentary] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const fetchCommentary = async () => {
    if (loading || commentary) return;
    setLoading(true);
    const text = await getAiCommentary(score);
    setCommentary(text);
    setLoading(false);
  };

  // Auto-fetch if score is interesting, or just let user click. 
  // Let's let user click to save tokens/make it an interaction.
  
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-xl border-4 border-slate-800 shadow-2xl max-w-xs w-full text-center animate-bounce-in">
        <h2 className="text-3xl font-bold text-slate-800 mb-4 pixel-font">GAME OVER</h2>
        
        <div className="flex justify-around mb-6">
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 uppercase font-bold">Score</span>
            <span className="text-4xl font-black text-slate-900">{score}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 uppercase font-bold">Best</span>
            <span className="text-4xl font-black text-yellow-600">{highScore}</span>
          </div>
        </div>

        {/* AI Section */}
        <div className="mb-6 min-h-[80px] bg-slate-100 rounded-lg p-3 border border-slate-200 relative">
          {commentary ? (
             <p className="text-sm text-slate-700 italic leading-snug">"{commentary}"</p>
          ) : loading ? (
            <div className="flex items-center justify-center h-full text-slate-400 text-xs animate-pulse">
              <BrainCircuit className="w-4 h-4 mr-2" /> Gemini is thinking...
            </div>
          ) : (
            <button 
              onClick={fetchCommentary}
              className="w-full h-full flex flex-col items-center justify-center text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              <MessageSquare className="w-6 h-6 mb-1" />
              <span className="text-xs font-bold">Get AI Roast</span>
            </button>
          )}
        </div>

        <button
          onClick={onRestart}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg border-b-4 border-green-700 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-5 h-5" />
          RESTART
        </button>
      </div>
    </div>
  );
};

export default GameOverModal;