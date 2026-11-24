'use client';

import React, { useState, useRef, useEffect } from 'react';
import { GameEngine } from '@/app/components/game/GameEngine';
import { playSpinAction } from '@/app/actions/game.action';

export default function SlotGamePage() {
  // --- STATE MANAGEMENT ---
  const [balance, setBalance] = useState(1000000);
  const [bet, setBet] = useState(1000);
  const [eventStream, setEventStream] = useState<any[] | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isTurbo, setIsTurbo] = useState(false);
  const [lastWin, setLastWin] = useState(0);

  // --- HANDLERS ---
  const handleSpin = async () => {
    if (isSpinning || balance < bet) return;

    setIsSpinning(true);
    setLastWin(0);
    
    try {
      // 1. Panggil Backend Logic (Server Action)
      const response = await playSpinAction({
        bet,
        currentGlobalMulti: 0, 
        currentFreeSpins: 0
      });

      if (response.success) {
        // 2. Kirim Event Stream ke PixiJS melalui Prop
        setEventStream(response.data.events);
      } else {
        setIsSpinning(false);
      }
    } catch (error) {
      console.error("Spin failed:", error);
      setIsSpinning(false);
    }
  };

  const onEventProcessed = (event: any) => {
    // Sinkronisasi State React dengan animasi PixiJS
    switch (event.type) {
      case 'BALANCE_DEDUCTED':
        setBalance(prev => prev + event.payload.amount);
        break;
      case 'SPIN_SETTLEMENT':
        setBalance(prev => prev + event.payload.amount);
        setLastWin(event.payload.amount);
        break;
      case 'SEQUENCE_FINISHED':
        setIsSpinning(false);
        break;
    }
  };

  return (
    <main className="relative w-full h-screen overflow-hidden bg-[#0d0415] font-sans select-none text-white">
      
      {/* LAYER 1: PIXIJS GAME ENGINE (Background & Reels) */}
      <GameEngine 
        eventStream={eventStream} 
        onEventProcessed={onEventProcessed}
      />

      {/* LAYER 2: HUD / UI (React DOM Overlay) */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 md:p-8">
        
        {/* TOP BAR: Info & Logo */}
        <div className="flex justify-between items-start">
           <div className="flex flex-col gap-2">
              <div className="bg-black/60 backdrop-blur-md border-b-4 border-yellow-600 p-3 rounded-xl min-w-[200px]">
                 <p className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">Credit</p>
                 <p className="text-2xl font-black text-white">Rp {balance.toLocaleString('id-ID')}</p>
              </div>
              {lastWin > 0 && (
                <div className="bg-gradient-to-r from-yellow-600/80 to-transparent p-2 rounded-lg animate-in fade-in slide-in-from-left duration-500">
                   <p className="text-[10px] font-bold text-yellow-200 uppercase">Last Win</p>
                   <p className="text-lg font-black text-white">Rp {lastWin.toLocaleString('id-ID')}</p>
                </div>
              )}
           </div>

           <div className="text-right flex flex-col items-end">
              <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-yellow-500 to-yellow-800 italic drop-shadow-2xl">
                 GATES OF OLYMPUS
              </h1>
              <div className="mt-1 flex gap-2">
                 <span className="bg-red-600 text-[10px] font-bold px-2 py-0.5 rounded">6 x 5</span>
                 <span className="bg-yellow-600 text-[10px] font-bold px-2 py-0.5 rounded text-black italic">PRAGMATIC LEVEL</span>
              </div>
           </div>
        </div>

        {/* BOTTOM BAR: Controls */}
        <div className="flex flex-col items-center gap-4">
           
           {/* Message Box */}
           <div className="bg-black/40 px-8 py-2 rounded-full border border-white/10 backdrop-blur-sm">
              <p className="text-sm font-bold text-yellow-100 tracking-wide">
                 {isSpinning ? "ZEUS IS WATCHING..." : "PRESS SPIN TO SUMMON THE DEITIES"}
              </p>
           </div>

           <div className="flex justify-center items-center gap-4 md:gap-8 w-full max-w-4xl">
              
              {/* Bet Controls */}
              <div className="pointer-events-auto flex items-center bg-black/80 rounded-full border border-yellow-500/30 p-1 md:p-2 shadow-2xl">
                 <button 
                   onClick={() => setBet(Math.max(200, bet - 200))}
                   disabled={isSpinning}
                   className="w-10 h-10 md:w-12 md:h-12 rounded-full hover:bg-white/10 text-white font-bold transition-all disabled:opacity-30"
                 >-</button>
                 <div className="px-4 md:px-10 text-center">
                    <p className="text-[9px] md:text-[10px] text-yellow-500/70 font-black uppercase tracking-tighter">Total Bet</p>
                    <p className="text-white font-black text-sm md:text-xl leading-none">Rp {bet.toLocaleString('id-ID')}</p>
                 </div>
                 <button 
                   onClick={() => setBet(bet + 200)}
                   disabled={isSpinning}
                   className="w-10 h-10 md:w-12 md:h-12 rounded-full hover:bg-white/10 text-white font-bold transition-all disabled:opacity-30"
                 >+</button>
              </div>

              {/* MAIN SPIN BUTTON */}
              <div className="relative group">
                <div className={`absolute inset-[-8px] rounded-full blur-xl transition-all duration-500 ${isSpinning ? 'bg-transparent' : 'bg-yellow-500/20 group-hover:bg-yellow-500/40'}`}></div>
                <button 
                  onClick={handleSpin}
                  disabled={isSpinning}
                  className={`pointer-events-auto relative w-20 h-20 md:w-28 md:h-28 rounded-full border-[6px] flex items-center justify-center transition-all duration-300 active:scale-90
                    ${isSpinning 
                      ? 'bg-gray-900 border-gray-700 cursor-wait shadow-inner' 
                      : 'bg-gradient-to-tr from-yellow-700 via-yellow-400 to-yellow-200 border-white shadow-[0_10px_40px_rgba(0,0,0,0.5)] hover:rotate-12'
                    }`}
                >
                   {isSpinning ? (
                      <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                   ) : (
                      <svg viewBox="0 0 24 24" className="w-14 h-14 md:w-16 md:h-16 text-black/80 fill-current drop-shadow-md">
                         <path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
                      </svg>
                   )}
                </button>
              </div>

              {/* Options */}
              <div className="flex flex-col gap-2">
                 <button 
                   onClick={() => setIsTurbo(!isTurbo)}
                   className={`pointer-events-auto px-4 py-2 rounded-lg font-black text-[10px] tracking-widest border transition-all
                     ${isTurbo 
                       ? 'bg-orange-600 border-orange-400 text-white shadow-[0_0_15px_rgba(249,115,22,0.5)]' 
                       : 'bg-black/60 border-white/20 text-gray-400 hover:border-white/40'}`}
                 >
                   {isTurbo ? '⚡ TURBO ON' : 'NORMAL SPEED'}
                 </button>
                 <button className="pointer-events-auto px-4 py-2 rounded-lg font-black text-[10px] tracking-widest border border-white/20 bg-black/60 text-gray-400 hover:text-white hover:border-white/40 transition-all">
                    AUTO PLAY
                 </button>
              </div>

           </div>
        </div>
      </div>

    </main>
  );
}
