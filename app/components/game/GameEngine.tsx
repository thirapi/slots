'use client';

import React, { useEffect, useRef } from 'react';
import { Game } from '@/lib/game/pixi/core/Game';
import { EventBridge } from '@/lib/game/pixi/core/EventBridge';

interface GameEngineProps {
  eventStream: any[] | null;
  onEventProcessed?: (event: any) => void;
}

export const GameEngine: React.FC<GameEngineProps> = ({ eventStream, onEventProcessed }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);
  const bridgeRef = useRef<EventBridge | null>(null);

  useEffect(() => {
    if (canvasRef.current && !gameRef.current) {
      const game = new Game(canvasRef.current);
      
      const setupGame = async () => {
        // 1. Initialize PixiJS (v8 async)
        await game.init();
        
        // 2. Load Assets
        await game.loadAssets();
        
        // 3. Register Reference
        gameRef.current = game;
        bridgeRef.current = new EventBridge(game);
      };

      setupGame();

      const handleResize = () => {
        if (gameRef.current) {
          gameRef.current.resize(window.innerWidth, window.innerHeight);
        }
      };

      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
        game?.destroy();
      };
    }
  }, []);

  useEffect(() => {
    if (eventStream && bridgeRef.current) {
      bridgeRef.current.processStream(eventStream).then(() => {
         // All animations for this spin sequence are finished
         if (onEventProcessed) onEventProcessed({ type: 'SEQUENCE_FINISHED' });
      });
    }
  }, [eventStream]);

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
       <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};
