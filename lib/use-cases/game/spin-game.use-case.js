import { GAME_CONFIG, SYMBOLS } from '../../entities/game.model.js';

/**
 * PURE EVENT-DRIVEN GAME ENGINE.
 * - Tidak memiliki informasi spesifik durasi UI (Clean Architecture Rule).
 * - Algoritma Gravity & Matching dioptimasi menggunakan Set() & Tumpukan Stack LIFO.
 * - Menggunakan Shallow Copy atas matriks koordinat (hindari Deep Copy GC Churn).
 */
export class SpinGameUseCase {
  constructor(rngService) {
    this.rngService = rngService;
    this.events = [];
  }

  emit(type, payload = {}) {
     this.events.push({ type, payload });
  }

  getPayoutIndex(count) {
    if (count >= 12) return 2;
    if (count >= 10) return 1;
    if (count >= 8) return 0;
    return -1;
  }

  execute(bet, currentGlobalMulti, currentFreeSpins) {
    this.events = []; 
    
    // --- STATE INITIALIZATION ---
    const { ROWS, COLS } = GAME_CONFIG;
    let cascadeWin = 0;
    let totalMultiplierFromSteps = 0;
    const isFreeSpinMode = currentFreeSpins > 0;
    
    this.emit('SPIN_START', { bet, isFreeSpinMode });

    // Deduct bet from balance at spin start
    const betDeduction = isFreeSpinMode ? 0 : -bet;
    if (betDeduction < 0) {
       this.emit('BALANCE_DEDUCTED', { amount: betDeduction });
    }

    // --- GENERATE INITIAL GRID ---
    let grid = Array(ROWS).fill(null).map(() => Array(COLS).fill(null).map(() => this.rngService.getRandomSymbol()));
    this.emit('GRID_GENERATED', { grid: this.fastCopyGrid(grid) });
    
    // --- CASCADE ENGINE LOOP ---
    let isTumbling = true;

    while (isTumbling) {
      // 1. Evaluate Win
      let counts = {};
      grid.forEach(row => row.forEach(cell => {
         if (cell && !cell.isScatter && !cell.isMultiplier) {
            counts[cell.id] = (counts[cell.id] || 0) + 1;
         }
      }));

      const winningIds = Object.keys(counts).filter(id => counts[id] >= 8);
      
      if (winningIds.length === 0) {
         isTumbling = false;
         break; 
      }

      // O(1) Lookup optimization
      const winningSet = new Set(winningIds);

      let stepPayout = 0;
      winningIds.forEach(id => {
         const payoutIdx = this.getPayoutIndex(counts[id]);
         if (payoutIdx !== -1) {
            stepPayout += SYMBOLS[id].pay[payoutIdx] * bet;
         }
      });
      cascadeWin += stepPayout;

      // Extract details
      let winningPositions = [];
      let stepMultiplier = 0;
      let multiplierPositions = [];

      for (let r = 0; r < ROWS; r++) {
         for (let c = 0; c < COLS; c++) {
            const cell = grid[r][c];
            if (cell) {
               if (winningSet.has(cell.id)) {
                  winningPositions.push({ r, c });
               } else if (cell.isMultiplier) {
                  stepMultiplier += cell.value;
                  multiplierPositions.push({ r, c, value: cell.value });
               }
            }
         }
      }

      totalMultiplierFromSteps += stepMultiplier;

      // EMIT WIN EVENT
      this.emit('WIN_EVALUATED', { 
         winningIds,
         winningPositions,
         accumulatedPayout: cascadeWin 
      });

      // EMIT MULTIPLIER EVENT
      if (multiplierPositions.length > 0) {
         this.emit('MULTIPLIERS_COLLECTED', { 
            stepMultiplier,
            multiplierPositions, 
            accumulatedMultiplier: totalMultiplierFromSteps 
         });
      }

      this.emit('WIN_CLEANUP_STARTED', {});

      // 2. Resolve Cascade / Gravity
      let nextGrid = Array(ROWS).fill(null).map(() => Array(COLS).fill(null));
      
      for (let c = 0; c < COLS; c++) {
         let colItems = []; 
         
         for (let r = 0; r < ROWS; r++) {
            const cell = grid[r][c];
            if (cell && !cell.isScatter && !cell.isMultiplier && !winningSet.has(cell.id)) {
                // Symbols to drop are pushed into stack strictly in top-to-bottom order
                // Object references don't mutate so it's perfectly safe.
                colItems.push(cell); 
            }
         }

         for (let r = 0; r < ROWS; r++) {
             const cell = grid[r][c];
             if (cell && cell.isScatter) {
                 nextGrid[r][c] = cell; // Block position permanently
             }
         }

         for (let r = ROWS - 1; r >= 0; r--) {
             if (nextGrid[r][c] === null) { 
                 if (colItems.length > 0) {
                     nextGrid[r][c] = colItems.pop(); // LIFO drop maintains proper physical order sequence
                 } else {
                     nextGrid[r][c] = this.rngService.getRandomSymbol();
                 }
             }
         }
      }
      grid = nextGrid;
      this.emit('CASCADE_APPLIED', { grid: this.fastCopyGrid(grid) });
    } // End cascade loop

    this.emit('CASCADE_ENDED', {});

    // --- FINALIZE EVENT: SCATTERS & FREE SPINS ---
    let scatters = [];
    let superScattersCount = 0;
    
    grid.forEach(row => row.forEach(cell => {
       if (cell && cell.isScatter) {
           scatters.push(cell);
           if (cell.isSuper) superScattersCount++;
       }
    }));

    let resultingFreeSpins = currentFreeSpins;
    let scatterWinAmount = 0;

    if (scatters.length >= 3) {
       this.emit('SCATTERS_EVALUATED', { count: scatters.length, superCount: superScattersCount });
    }

    // Trigger on Base Game
    if (currentFreeSpins === 0 && scatters.length >= 4) {
      resultingFreeSpins = 15;
      
      if (superScattersCount === 1) scatterWinAmount += 100 * bet;
      else if (superScattersCount === 2) scatterWinAmount += 500 * bet;
      else if (superScattersCount === 3) scatterWinAmount += 5000 * bet;
      else if (superScattersCount >= 4) scatterWinAmount += 50000 * bet;
      scatterWinAmount += 3 * bet; 
      
      this.emit('FREE_SPINS_TRIGGERED', { amount: 15, payout: scatterWinAmount });
    } 
    // Retrigger on Free Spins
    else if (currentFreeSpins > 0) {
      if (scatters.length >= 3) {
         resultingFreeSpins += 5; 
         scatterWinAmount += 3 * bet;
         this.emit('FREE_SPINS_RETRIGGERED', { amount: 5, payout: scatterWinAmount });
      }
      resultingFreeSpins -= 1; 
    }

    // --- FINAL MATH & MULTIPLIER RESOLUTION ---
    let finalMulti = 1;
    let globalMultiToSave = currentGlobalMulti;

    if (cascadeWin > 0) {
       if (totalMultiplierFromSteps > 0) {
           if (currentFreeSpins > 0) {
               globalMultiToSave = currentGlobalMulti + totalMultiplierFromSteps;
               finalMulti = globalMultiToSave;
           } else {
               finalMulti = totalMultiplierFromSteps;
           }
           this.emit('MULTIPLIER_APPLIED', { multiplier: finalMulti });
       }
    }

    const totalWinFromCascades = cascadeWin * finalMulti;
    const finalTotalPayout = totalWinFromCascades + scatterWinAmount;

    // Reset multi condition bila putaran FS benar-benar habis
    if (resultingFreeSpins <= 0) {
        globalMultiToSave = 0;
    }

    if (finalTotalPayout > 0) {
       this.emit('SPIN_SETTLEMENT', { amount: finalTotalPayout });
    }

    this.emit('SPIN_FINALIZED', { 
       finalPayout: finalTotalPayout,
       resultingFreeSpins,
       resultingGlobalMulti: globalMultiToSave
    });

    return {
       success: true,
       events: this.events
    };
  }

  fastCopyGrid(gridMatrix) {
      // Cell Object is mathematically immutable in our simulation context, Array index mutation only
      // Eliminates GC Memory Churn using standard rest operator
      return gridMatrix.map(r => [...r]);
  }
}
