"use client";

import React, { useState, useEffect } from "react";
import { playSpinAction } from "./actions/game.action.js";
import { SYMBOL_KEYS, SYMBOLS } from "../lib/entities/game.model.js";

const COLS = 6;
const ROWS = 5;

const EVENT_DURATIONS = {
  SPIN_START: 0,
  BALANCE_DEDUCTED: 0,
  GRID_GENERATED: 500,
  WIN_EVALUATED: 700,
  MULTIPLIERS_COLLECTED: 900,
  WIN_CLEANUP_STARTED: 100,
  CASCADE_APPLIED: 400,
  CASCADE_ENDED: 100,
  SCATTERS_EVALUATED: 400,
  FREE_SPINS_TRIGGERED: 2500,
  FREE_SPINS_RETRIGGERED: 1500,
  MULTIPLIER_APPLIED: 1500,
  SPIN_SETTLEMENT: 0,
  SPIN_FINALIZED: 800,
};

// Start dengan grid transparan murni untuk menghindari bentrokan Hydration Mismatch React SSR
const getBlankGrid = () =>
  Array(ROWS)
    .fill(null)
    .map(() => Array(COLS).fill(null));

// Generate simulasi awal agar kotak tak melompong
const generateInitialGrid = () =>
  Array(ROWS)
    .fill(null)
    .map((_, r) =>
      Array(COLS)
        .fill(null)
        .map((_, c) => {
          const key =
            SYMBOL_KEYS[Math.floor(Math.random() * SYMBOL_KEYS.length)];
          const sym = SYMBOLS[key];
          return {
            id: key,
            char: sym.char,
            image: sym.image,
            uuid: `init-${r}-${c}`,
          };
        }),
    );

export default function SlotGameUI() {
  const [grid, setGrid] = useState(getBlankGrid());
  const [isSpinning, setIsSpinning] = useState(false);
  const [bet, setBet] = useState(1000);

  const [balance, setBalance] = useState(1000000);
  const [freeSpins, setFreeSpins] = useState(0);
  const [globalMulti, setGlobalMulti] = useState(0);

  const [winStatus, setWinStatus] = useState(null);
  const [displayCascadeWin, setDisplayCascadeWin] = useState(0);
  const [displayStepMulti, setDisplayStepMulti] = useState(0);
  const [winningPos, setWinningPos] = useState([]);
  const [poppingMultipliers, setPoppingMultipliers] = useState([]);

  const [showAutoSpinMenu, setShowAutoSpinMenu] = useState(false);
  const [autoSpinsLeft, setAutoSpinsLeft] = useState(0);
  const [turboMode, setTurboMode] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space" && !e.repeat) {
        e.preventDefault();
        setTurboMode(true);
      }
    };
    const handleKeyUp = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        setTurboMode(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (turboMode && !isSpinning && autoSpinsLeft === 0) {
      if (balance >= bet) spin();
    }
  }, [turboMode, isSpinning]);

  useEffect(() => {
    setGrid(generateInitialGrid());
  }, []);

  useEffect(() => {
    let timer;
    if (!isSpinning && autoSpinsLeft > 0 && winStatus === null) {
      timer = setTimeout(() => {
        if (balance >= bet) {
          setAutoSpinsLeft((prev) => prev - 1);
          spin();
        } else {
          setAutoSpinsLeft(0);
        }
      }, 1200);
    }
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSpinning, autoSpinsLeft, winStatus]);

  const startAutoSpin = (count) => {
    setAutoSpinsLeft(count);
    setShowAutoSpinMenu(false);
    if (!isSpinning) {
      setAutoSpinsLeft(count - 1);
      spin();
    }
  };

  const stopAutoSpin = () => {
    setAutoSpinsLeft(0);
  };

  const spin = async () => {
    if (isSpinning || balance < bet) return;
    setIsSpinning(true);

    setWinStatus(null);
    setDisplayCascadeWin(0);
    setDisplayStepMulti(0);
    setWinningPos([]);
    setPoppingMultipliers([]);

    try {
      const response = await playSpinAction({
        bet,
        currentGlobalMulti: globalMulti,
        currentFreeSpins: freeSpins,
      });

      if (!response.success) {
        console.error(response.error);
        setIsSpinning(false);
        return;
      }

      const eventStream = response.data.events;
      await playEventStream(eventStream);
    } catch (e) {
      console.error("Failed to spin", e);
      setIsSpinning(false);
    }
  };

  const delay = (ms) => new Promise((r) => setTimeout(r, ms));

  // ----------------------------------------------------
  // NATIVE WEB AUDIO API SYNTHESIZER (ZERO DEPS AUDIO)
  // Menghasilkan bunyi elektronik/retro langsung di Browser
  // ----------------------------------------------------
  const playSound = (type) => {
    try {
      if (!window.audioCtx) window.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = window.audioCtx;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      const now = ctx.currentTime;

      if (type === 'spin') {
        // Putaran (Mendengung menyapu)
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.3);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'drop') {
        // Celah Jatuh (Bedebuk pelan)
        osc.type = 'square';
        osc.frequency.setValueAtTime(100, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.1);
        gainNode.gain.setValueAtTime(0.05, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'win') {
        // Nada Menang (Lonceng Minor/Mayor)
        osc.disconnect(); // matikan osc utama, kita pakai arpeggio
        [440, 554, 659, 880].forEach((freq, i) => { // Nada A Mayor
           const stepOsc = ctx.createOscillator();
           const stepGain = ctx.createGain();
           const time = now + i * 0.08;
           stepOsc.type = 'sine';
           stepOsc.frequency.value = freq;
           stepOsc.connect(stepGain);
           stepGain.connect(ctx.destination);
           stepGain.gain.setValueAtTime(0, time);
           stepGain.gain.linearRampToValueAtTime(0.2, time + 0.02);
           stepGain.gain.exponentialRampToValueAtTime(0.01, time + 0.4);
           stepOsc.start(time);
           stepOsc.stop(time + 0.5);
        });
      } else if (type === 'pop') {
        // Kilatan Petir / Multiplier pecah
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(1500, now + 0.1);
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.15, now + 0.02);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'scatter') {
        // Suara Scatter (Gong berat)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.8);
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 1);
        osc.start(now);
        osc.stop(now + 1);
      } else if (type === 'trigger') {
        // Alarm Free Spin
        osc.type = 'square';
        osc.frequency.setValueAtTime(1000, now);
        osc.frequency.linearRampToValueAtTime(1500, now + 0.2);
        osc.frequency.linearRampToValueAtTime(1000, now + 0.4);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.6);
        osc.start(now);
        osc.stop(now + 0.6);
      }
    } catch(e) {}
  };

  const playEventStream = async (events) => {
    for (const event of events) {
      switch (event.type) {
        case "BALANCE_DEDUCTED":
          setBalance((b) => b + event.payload.amount);
          break;
        case "SPIN_START":
          playSound('spin');
          break;
        case "GRID_GENERATED":
          playSound('drop');
          setGrid(event.payload.grid);
          break;
        case "WIN_EVALUATED":
          playSound('win');
          setWinningPos(event.payload.winningPositions);
          setDisplayCascadeWin(event.payload.accumulatedPayout);
          break;
        case "MULTIPLIERS_COLLECTED":
          playSound('pop');
          setPoppingMultipliers(event.payload.multiplierPositions);
          setDisplayStepMulti(event.payload.accumulatedMultiplier);
          break;
        case "WIN_CLEANUP_STARTED":
          setWinningPos([]);
          setPoppingMultipliers([]);
          break;
        case "CASCADE_APPLIED":
          setGrid(event.payload.grid);
          break;
        case "CASCADE_ENDED":
          break;
        case "SCATTERS_EVALUATED":
          playSound('scatter');
          break;
        case "FREE_SPINS_TRIGGERED":
          playSound('trigger');
          setWinStatus("🌟 FREE SPINS 🌟");
          setFreeSpins((prev) => prev + event.payload.amount);
          break;
        case "FREE_SPINS_RETRIGGERED":
          playSound('trigger');
          setWinStatus("⚡ +5 FREE SPINS ⚡");
          setFreeSpins((prev) => prev + event.payload.amount);
          break;
        case "MULTIPLIER_APPLIED":
          setWinStatus(`X${event.payload.multiplier} APPLIED!`);
          break;
        case "SPIN_SETTLEMENT":
          setBalance((b) => b + event.payload.amount);
          setWinStatus(`MENANG: Rp ${event.payload.amount.toLocaleString('id-ID')}`);
          break;
        case "SPIN_FINALIZED":
          setFreeSpins(event.payload.resultingFreeSpins);
          setGlobalMulti(event.payload.resultingGlobalMulti);
          break;
      }

      const stepDelay = EVENT_DURATIONS[event.type] || 0;
      if (stepDelay > 0) {
        await delay(stepDelay); // Kembalikan ke normal, tidak nge-skip animasi murni
      }
    }

    if (autoSpinsLeft > 0) {
      await delay(1500);
      setWinStatus(null);
    }
    setIsSpinning(false);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0d0415] font-sans flex items-center justify-center select-none text-white">
      {/* Background Graphic */}
      <div className="absolute inset-0 bg-black/20 pointer-events-none"></div>

      {/* Absolute Full Screen Container Space */}
      <div className="relative z-10 flex w-full h-full max-w-[1920px] pb-[100px] xl:pb-[120px] pt-4 items-center justify-center">
        {/* LEFT COLUMN - Statistics Box Only */}
        <div className="hidden lg:flex w-56 flex-col gap-6 justify-center shrink-0 px-4">
          {/* Kotak Murni Info Multiplier dan Spin */}
          <div className="bg-[#111] border-4 border-[#b8860b] rounded-2xl w-full h-40 flex flex-col items-center justify-center text-white font-black shadow-[inset_0_4px_15px_rgba(0,0,0,1)] relative overflow-hidden">
            <div className="absolute inset-0"></div>

            {freeSpins > 0 ? (
              <>
                <div className="text-[#0891b2] text-sm mb-1 shadow-black drop-shadow-md z-10">
                  FREE SPINS
                </div>
                <div className="text-6xl text-cyan-50 drop-shadow-[0_2px_10px_#0891b2] z-10">
                  {freeSpins}
                </div>
              </>
            ) : (
              <>
                <div className="text-rose-500 text-5xl mb-1 drop-shadow-[0_2px_5px_rgba(244,63,94,0.5)] z-10">
                  {globalMulti > 0
                    ? `${globalMulti}X`
                    : displayStepMulti > 0
                      ? `${displayStepMulti}X`
                      : ""}
                </div>
                <div className="text-yellow-400 text-2xl drop-shadow-[0_2px_2px_#000] z-10 font-black">
                  {displayCascadeWin > 0
                    ? `Rp ${displayCascadeWin.toLocaleString('id-ID')}`
                    : ""}
                </div>
              </>
            )}
          </div>
        </div>

        {/* CENTER COLUMN - DEDICATED MATRIX BOARD */}
        {/* 
            Memakai flex-1 dan aspect-ratio agar 6 kolom dan 5 baris kotak proporsional secara penuh
            tanpa mengorbankan tinggi dan lebar frame border
          */}
        <div className="flex-1 max-w-[1000px] h-[70vh] min-h-[450px] flex justify-center items-center relative p-2 sm:p-4 shrink-0">
          {/* THE ACTUAL MATRIX FRAME - Flush Background & Border */}
          <div className="relative w-full h-full bg-[#310b47] border-[6px] rounded-xl border-[#e8b548] z-10 flex">
            {grid[0]?.map((_, colIndex) => (
              <div
                key={`col-${colIndex}`}
                className={`flex flex-col w-[16.666%] h-full ${colIndex < COLS - 1 ? 'border-r-2 border-[#e8b548]/30' : ''}`}
              >
                {grid.map((row, rowIndex) => {
                  const symbol = row[colIndex];

                  const isWinning = winningPos.some(
                    (p) => p.r === rowIndex && p.c === colIndex,
                  );
                  const isPoppingMulti = poppingMultipliers.some(
                    (p) => p.r === rowIndex && p.c === colIndex,
                  );

                  return (
                    <div
                      key={`${colIndex}-${rowIndex}-${symbol?.uuid || "empty"}`}
                      className="relative w-full h-[20%] p-1 sm:p-[6px]"
                    >
                      <div
                        className={`relative w-full h-full flex items-center justify-center transition-all duration-300 rounded-lg
                                   ${symbol ? "symbol-drop" : ""} 
                                   ${symbol?.isSuper ? "shadow-[0_0_15px_#ffea00] block" : ""}
                                   ${isWinning ? "bg-yellow-500/20 shadow-[0_0_15px_#ffea00] z-20 brightness-125" : ""}
                                   ${isPoppingMulti ? "scale-105 shadow-[0_0_20px_#ff0000] z-30 brightness-125" : ""}
                                 `}
                        style={{ animationDelay: `${colIndex * 60}ms` }}
                      >
                        {symbol?.image ? (
                          <>
                            <img
                              src={symbol.image}
                              alt={symbol?.char || ""}
                              className="w-[85%] h-[85%] object-contain drop-shadow-[0_8px_8px_rgba(0,0,0,0.8)] z-10"
                              onError={(e) => {
                                e.target.style.display = "none";
                                if (e.target.nextSibling)
                                  e.target.nextSibling.style.display = "block";
                              }}
                            />
                            <span className="hidden leading-none text-4xl sm:text-5xl md:text-6xl drop-shadow-[0_3px_5px_#000] z-10 relative">
                              {symbol?.char}
                            </span>
                          </>
                        ) : (
                          <span className="leading-none text-4xl sm:text-5xl md:text-6xl drop-shadow-[0_3px_5px_#000] z-10 relative">
                            {symbol?.char}
                          </span>
                        )}

                        {/* HUD Multiplier Pill Badge */}
                        {symbol?.isMultiplier && (
                          <div className="absolute bottom-[5%] right-[5%] z-20 bg-gradient-to-b from-red-600 to-red-900 border border-white/80 rounded-full px-1.5 py-0.5 shadow-[0_4px_10px_rgba(0,0,0,0.8)]">
                            <span className="text-[11px] sm:text-xs font-black text-white leading-none block drop-shadow-md pb-[1px]">
                              {symbol.value}x
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN - Empty padding space placeholder to balance Left Column sizes */}
        <div className="hidden lg:flex w-56 justify-end items-end h-[75vh] shrink-0 opacity-0"></div>
      </div>

      {/* OVERLAY GAME BOTTOM HUD - STICKY FULL WIDTH */}
      <div className="absolute bottom-0 w-full h-[90px] xl:h-[110px] bg-gradient-to-t from-[#000] via-[#050505] to-transparent flex items-center justify-between px-4 lg:px-10 z-50">
        {/* Left Elements (System Buttons, Credit, Bet) */}
        <div className="flex items-center gap-4 xl:gap-6 min-w-[250px] shrink-0 relative z-20 pb-2">

          <div className="flex flex-col leading-tight">
            <div className="flex items-center text-sm xl:text-lg">
              <span className="text-yellow-500 font-extrabold w-16 xl:w-20 text-left">
                Credit
              </span>
              <span className="text-white font-bold text-sm xl:text-lg">
                Rp {balance.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-yellow-500 font-extrabold w-16 xl:w-20 text-left">
                Bet
              </span>
              <span className="text-white font-bold text-sm xl:text-lg">Rp {bet.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>

        {/* Center Text Message Message (Always visible if message exists) */}
        <div className="absolute inset-x-0 w-full flex justify-center items-center pointer-events-none z-10 transform -translate-y-8 xl:-translate-y-10">
          <span className="text-white font-extrabold text-2xl lg:text-3xl text-center bg-black/40 px-6 py-2 rounded-full border border-white/10 drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)]">
            {winStatus || "Hold space for turbo spin"}
          </span>
        </div>

        {/* Right Elements (Spin Actions) */}
        <div className="flex items-center gap-2 xl:gap-3 shrink-0 relative z-20 pb-2">
          {/* (-) Bet Button */}
          <button
            onClick={() => setBet((b) => Math.max(200, b - 200))}
            disabled={isSpinning || autoSpinsLeft > 0}
            className="w-12 h-12 xl:w-16 xl:h-16 rounded-full border border-white/30 bg-black/70 text-white text-3xl flex items-center justify-center hover:bg-white/20 hover:text-white transition-all shadow-lg pb-1.5 disabled:opacity-50"
          >
            <span className="drop-shadow-md">-</span>
          </button>

          {/* SPIN BUTTON HUB */}
          <div className="relative flex flex-col items-center shrink-0 w-24 xl:w-32 z-30 justify-center translate-y-[-10px] xl:translate-y-[-15px]">
            {autoSpinsLeft > 0 ? (
              <button
                className="w-[85px] h-[85px] xl:w-[110px] xl:h-[110px] rounded-full border-[5px] border-rose-600 bg-black hover:bg-[#111] shadow-[0_0_30px_rgba(225,29,72,0.6)] text-rose-500 flex flex-col items-center justify-center transition-all active:scale-95 z-20"
                onClick={stopAutoSpin}
              >
                <span className="text-xs font-black mt-1">
                  STOP
                </span>
                <span className="text-3xl xl:text-5xl font-black leading-none drop-shadow-md text-white">
                  {autoSpinsLeft}
                </span>
              </button>
            ) : (
              <button
                className={`w-[85px] h-[85px] xl:w-[110px] xl:h-[110px] rounded-full border-[5px] border-white/20 flex flex-col items-center justify-center transition-all z-20 
                       ${isSpinning ? "bg-black text-white/50 border-white/10 cursor-not-allowed scale-95 shadow-none" : "bg-black text-white hover:border-white/60 hover:bg-[#111] cursor-pointer shadow-[0_10px_25px_rgba(0,0,0,0.8)] active:scale-95"}`}
                onClick={spin}
                disabled={isSpinning}
              >
                <svg
                  viewBox="0 0 100 100"
                  className="w-[70%] h-[70%]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeLinecap="round"
                >
                  <path d="M 50 15 A 35 35 0 0 1 85 50" />
                  <polygon
                    points="85,50 75,40 95,40"
                    fill="currentColor"
                    stroke="none"
                  />
                  <path d="M 50 85 A 35 35 0 0 1 15 50" />
                  <polygon
                    points="15,50 25,60 5,60"
                    fill="currentColor"
                    stroke="none"
                  />
                </svg>
              </button>
            )}

            {!autoSpinsLeft && (
              <button
                disabled={isSpinning}
                onClick={() => setShowAutoSpinMenu(true)}
                className="mt-2 px-1 bg-transparent text-white/70 font-black text-[10px] xl:text-xs rounded-lg border border-white hover:text-white transition-all disabled:opacity-50 flex items-center justify-center"
              >
                Auto Spin
              </button>
            )}
          </div>

          {/* (+) Bet Button */}
          <button
            onClick={() => setBet((b) => Math.max(200, b + 200))}
            disabled={isSpinning || autoSpinsLeft > 0}
            className="w-12 h-12 xl:w-16 xl:h-16 rounded-full border border-white/30 bg-black/70 text-white text-3xl flex items-center justify-center hover:bg-white/20 hover:text-white transition-all shadow-lg pb-1 disabled:opacity-50"
          >
            <span className="drop-shadow-md">+</span>
          </button>
        </div>
      </div>

      {/* AUTO SPIN MODAL MENU */}
      {showAutoSpinMenu && (
        <div className="absolute inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1a1a24] border-2 border-[#b8860b] rounded-2xl w-full max-w-xs flex flex-col p-6 shadow-[0_10px_50px_rgba(30,10,40,0.8)] animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-black text-center text-yellow-500 mb-6 drop-shadow-md border-b border-white/10 pb-4">
              AUTOPLAY
            </h3>

            <div className="text-white text-xs font-bold mb-3 text-center opacity-70">
              Number of Spins
            </div>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[10, 20, 30, 50, 100, 1000].map((count) => (
                <button
                  key={`ap-${count}`}
                  onClick={() => startAutoSpin(count)}
                  className="bg-[#2a2a35] hover:bg-[#d4af37] hover:text-black hover:border-[#fff] border border-white/10 text-white font-black py-3 rounded-lg transition-all shadow-md text-lg"
                >
                  {count}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowAutoSpinMenu(false)}
              className="mt-2 text-sm text-gray-500 hover:text-white font-black transition-all tracking-wider py-3 border-t border-white/10"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
