import React, { useState, useEffect, useRef, useCallback } from 'react';
import Bird from './Bird';
import Pipe from './Pipe';
import GameOverModal from './GameOverModal';
import { GameState, PipeData, BirdState } from '../types';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  GRAVITY,
  JUMP_STRENGTH,
  PIPE_SPEED,
  PIPE_SPAWN_RATE,
  PIPE_GAP,
  BIRD_SIZE,
  PIPE_WIDTH,
  INITIAL_BIRD_X,
  INITIAL_BIRD_Y
} from '../constants';
import { Play, MousePointer2 } from 'lucide-react';

const Game: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  
  // Refs for mutable game state to avoid re-render lag in loop
  const birdY = useRef(INITIAL_BIRD_Y);
  const birdVelocity = useRef(0);
  const birdRotation = useRef(0);
  const pipes = useRef<PipeData[]>([]);
  const frameCount = useRef(0);
  const reqRef = useRef<number>(0);

  // State for rendering
  const [renderBird, setRenderBird] = useState<BirdState>({ y: INITIAL_BIRD_Y, velocity: 0, rotation: 0 });
  const [renderPipes, setRenderPipes] = useState<PipeData[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('flappyGenAiHighScore');
    if (stored) setHighScore(parseInt(stored));
  }, []);

  const startGame = () => {
    setGameState(GameState.PLAYING);
    setScore(0);
    birdY.current = INITIAL_BIRD_Y;
    birdVelocity.current = 0;
    birdRotation.current = 0;
    pipes.current = [];
    frameCount.current = 0;
  };

  const jump = useCallback(() => {
    if (gameState === GameState.PLAYING) {
      birdVelocity.current = -JUMP_STRENGTH;
    } else if (gameState === GameState.START) {
      startGame();
      birdVelocity.current = -JUMP_STRENGTH;
    }
  }, [gameState]);

  const gameOver = useCallback(() => {
    setGameState(GameState.GAME_OVER);
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('flappyGenAiHighScore', score.toString());
    }
  }, [score, highScore]);

  const checkCollision = (currentBirdY: number, currentPipes: PipeData[]) => {
    // 1. Floor/Ceiling
    if (currentBirdY + BIRD_SIZE >= GAME_HEIGHT || currentBirdY <= 0) {
      return true;
    }

    // 2. Pipes
    const birdLeft = INITIAL_BIRD_X + 4; // Add padding to make hit box forgiving
    const birdRight = INITIAL_BIRD_X + BIRD_SIZE - 4;
    const birdTop = currentBirdY + 4;
    const birdBottom = currentBirdY + BIRD_SIZE - 4;

    for (const pipe of currentPipes) {
      const pipeLeft = pipe.x;
      const pipeRight = pipe.x + PIPE_WIDTH;
      
      // Check horizontal overlap first
      if (birdRight > pipeLeft && birdLeft < pipeRight) {
        // Check vertical overlap (collision with top pipe OR bottom pipe)
        const hitTopPipe = birdTop < pipe.topHeight;
        const hitBottomPipe = birdBottom > pipe.topHeight + PIPE_GAP;
        
        if (hitTopPipe || hitBottomPipe) {
          return true;
        }
      }
    }
    return false;
  };

  // Game Loop
  useEffect(() => {
    const loop = () => {
      if (gameState === GameState.PLAYING) {
        frameCount.current++;

        // Physics
        birdVelocity.current += GRAVITY;
        birdY.current += birdVelocity.current;
        
        // Rotation
        // Increased multiplier from 3 to 5 to keep rotation snappy with lower velocity
        birdRotation.current = Math.min(Math.max(birdVelocity.current * 5, -25), 90);

        // Spawn Pipes
        if (frameCount.current % PIPE_SPAWN_RATE === 0) {
          const minPipeHeight = 50;
          const maxPipeHeight = GAME_HEIGHT - PIPE_GAP - minPipeHeight - 50; // -50 for ground buffer
          const randomHeight = Math.floor(Math.random() * (maxPipeHeight - minPipeHeight + 1)) + minPipeHeight;
          
          pipes.current.push({
            id: frameCount.current,
            x: GAME_WIDTH,
            topHeight: randomHeight,
            passed: false
          });
        }

        // Move Pipes & Clean up
        pipes.current.forEach(p => p.x -= PIPE_SPEED);
        if (pipes.current.length > 0 && pipes.current[0].x < -PIPE_WIDTH) {
          pipes.current.shift();
        }

        // Score
        pipes.current.forEach(p => {
          if (!p.passed && p.x + PIPE_WIDTH < INITIAL_BIRD_X) {
            p.passed = true;
            setScore(s => s + 1);
          }
        });

        // Collision
        if (checkCollision(birdY.current, pipes.current)) {
          gameOver();
        }

        // Sync to render state
        setRenderBird({
          y: birdY.current,
          velocity: birdVelocity.current,
          rotation: birdRotation.current
        });
        setRenderPipes([...pipes.current]);
      } else if (gameState === GameState.START) {
        // Bobbing animation for start screen
        const time = Date.now() / 300;
        setRenderBird(prev => ({ ...prev, y: INITIAL_BIRD_Y + Math.sin(time) * 10, rotation: 0 }));
      }

      reqRef.current = requestAnimationFrame(loop);
    };

    reqRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(reqRef.current!);
  }, [gameState, gameOver]);

  // Input Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault(); // Prevent scrolling
        jump();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [jump]);

  const handleTouch = (e: React.MouseEvent | React.TouchEvent) => {
    // e.preventDefault(); // often needed for touch but can block clicks
    jump();
  };

  return (
    <div 
      className="relative overflow-hidden bg-sky-300 shadow-2xl rounded-lg select-none"
      style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
      onMouseDown={handleTouch}
      onTouchStart={handleTouch}
    >
      {/* Background Elements (Clouds) */}
      <div className="absolute top-20 left-10 text-white/40 opacity-80"><Cloud size={60} /></div>
      <div className="absolute top-40 left-60 text-white/40 opacity-60"><Cloud size={40} /></div>
      <div className="absolute top-10 left-80 text-white/40 opacity-70"><Cloud size={50} /></div>
      
      {/* Cityscape Silhouette (Static Background Layer) */}
      <div 
        className="absolute bottom-0 left-0 w-full h-32 bg-repeat-x opacity-30 z-0"
        style={{ 
          backgroundImage: 'linear-gradient(to top, #475569 0%, transparent 100%)',
          backgroundSize: '50px 100%'
        }}
      />

      {/* Pipes */}
      {renderPipes.map(pipe => (
        <Pipe key={pipe.id} pipe={pipe} />
      ))}

      {/* Bird */}
      <Bird y={renderBird.y} rotation={renderBird.rotation} />

      {/* Ground */}
      <div className="absolute bottom-0 w-full h-4 bg-[#ded895] border-t-4 border-[#d4ce8a] z-30">
         <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTAgMGwyMCAyMEgwVjB6IiBmaWxsPSIjYzVjMDgyIiBmaWxsLW9wYWNpdHk9IjAuMyIvPjwvc3ZnPg==')] opacity-30"></div>
      </div>

      {/* Score HUD */}
      {gameState === GameState.PLAYING && (
        <div className="absolute top-10 w-full text-center z-30 pointer-events-none">
          <span className="text-6xl font-black text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] stroke-black pixel-font">
            {score}
          </span>
        </div>
      )}

      {/* Start Screen */}
      {gameState === GameState.START && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-40 bg-black/20 backdrop-blur-[2px]">
          <div className="bg-white/90 p-6 rounded-2xl shadow-lg border-4 border-white flex flex-col items-center animate-bounce-slow">
            <h1 className="text-4xl font-black text-slate-800 mb-2 pixel-font tracking-wider">FLAPPY GENAI</h1>
            <div className="flex items-center gap-2 text-slate-600 mb-4">
              <MousePointer2 className="w-5 h-5" />
              <span className="font-bold text-sm">TAP / SPACE TO JUMP</span>
            </div>
            <button 
              className="bg-sky-500 text-white px-8 py-3 rounded-full font-bold text-xl shadow-md hover:bg-sky-600 transition-colors flex items-center gap-2"
              onClick={(e) => { e.stopPropagation(); startGame(); }}
            >
              <Play className="w-6 h-6 fill-white" /> PLAY
            </button>
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {gameState === GameState.GAME_OVER && (
        <GameOverModal 
          score={score} 
          highScore={highScore} 
          onRestart={(e?: any) => { 
             if(e) e.stopPropagation();
             setGameState(GameState.START);
             // Short delay to prevent immediate jump
             setTimeout(() => {
                birdY.current = INITIAL_BIRD_Y;
                setRenderBird({ y: INITIAL_BIRD_Y, velocity: 0, rotation: 0 });
             }, 50);
          }} 
        />
      )}
    </div>
  );
};

// Simple Cloud Icon Component
const Cloud = ({ size }: { size: number }) => (
  <svg width={size} height={size * 0.6} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.5,19c-3.037,0-5.5-2.463-5.5-5.5c0-0.146,0.006-0.291,0.017-0.436C11.206,13.499,10.616,13.75,10,13.75 c-2.485,0-4.5-2.015-4.5-4.5c0-0.664,0.144-1.294,0.403-1.866C4.673,7.975,3.5,9.356,3.5,11c0,2.485,2.015,4.5,4.5,4.5 c0.245,0,0.485-0.021,0.719-0.061C9.25,17.885,11.669,19,14.5,19c0.293,0,0.581-0.023,0.862-0.066C16.064,18.956,16.766,19,17.5,19 z" opacity="0.9"/>
    <path d="M17.5,6c-1.747,0-3.333,0.687-4.52,1.81C12.546,7.271,12.03,7,11.5,7c-2.485,0-4.5,2.015-4.5,4.5 c0,0.323,0.035,0.637,0.1,0.941C5.206,12.959,3.5,14.794,3.5,17c0,2.761,2.239,5,5,5c3.529,0,6.48-2.294,7.596-5.48 C16.518,16.826,17,17,17.5,17c2.485,0,4.5-2.015,4.5-4.5S19.985,6,17.5,6z" />
  </svg>
);

export default Game;