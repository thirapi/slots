import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';
import { SlotSymbol } from './SlotSymbol';
import { GAME_CONFIG } from './Constants';

export class ReelManager extends PIXI.Container {
  private symbols: SlotSymbol[][] = [];
  private pool: SlotSymbol[] = [];
  private symbolContainer: PIXI.Container;

  constructor() {
    super();
    this.symbolContainer = new PIXI.Container();
    this.addChild(this.symbolContainer);
    
    // Masking reels
    const mask = new PIXI.Graphics();
    mask.rect(0, 0, 
      GAME_CONFIG.COLS * (GAME_CONFIG.SYMBOL_WIDTH + GAME_CONFIG.REEL_GAP),
      GAME_CONFIG.ROWS * (GAME_CONFIG.SYMBOL_HEIGHT)
    );
    mask.fill(0xffffff);
    this.addChild(mask);
    this.symbolContainer.mask = mask;
  }

  public initializeGrid(gridData: any[][], textures: Record<string, PIXI.Texture>) {
    this.clearGrid();
    
    for (let r = 0; r < GAME_CONFIG.ROWS; r++) {
      this.symbols[r] = [];
      for (let c = 0; c < GAME_CONFIG.COLS; c++) {
        const symbolData = gridData[r][c];
        const symbol = this.getSymbolFromPool();
        symbol.setup(textures[symbolData.id], symbolData.id);
        symbol.position.set(
          c * (GAME_CONFIG.SYMBOL_WIDTH + GAME_CONFIG.REEL_GAP) + GAME_CONFIG.SYMBOL_WIDTH / 2,
          r * GAME_CONFIG.SYMBOL_HEIGHT + GAME_CONFIG.SYMBOL_HEIGHT / 2
        );
        this.symbols[r][c] = symbol;
        this.symbolContainer.addChild(symbol);
      }
    }
  }

  public async spinStart() {
    const animations = [];
    for (let r = 0; r < GAME_CONFIG.ROWS; r++) {
      for (let c = 0; c < GAME_CONFIG.COLS; c++) {
        const symbol = this.symbols[r][c];
        symbol.setSpinning(true);
        animations.push(
          gsap.to(symbol.position, {
            y: symbol.position.y + 1000,
            duration: 0.5,
            delay: c * 0.1,
            ease: "back.in",
            onComplete: () => this.returnToPool(symbol)
          })
        );
      }
    }
    await Promise.all(animations);
  }

  public async updateGrid(gridData: any[][], textures: Record<string, PIXI.Texture>) {
    const newSymbols: SlotSymbol[][] = [];
    const animations = [];

    for (let c = 0; c < GAME_CONFIG.COLS; c++) {
      for (let r = 0; r < GAME_CONFIG.ROWS; r++) {
        const symbolData = gridData[r][c];
        const symbol = this.getSymbolFromPool();
        symbol.setup(textures[symbolData.id], symbolData.id);
        
        symbol.position.set(
          c * (GAME_CONFIG.SYMBOL_WIDTH + GAME_CONFIG.REEL_GAP) + GAME_CONFIG.SYMBOL_WIDTH / 2,
          (r - GAME_CONFIG.ROWS) * GAME_CONFIG.SYMBOL_HEIGHT
        );
        
        if (!newSymbols[r]) newSymbols[r] = [];
        newSymbols[r][c] = symbol;
        this.symbolContainer.addChild(symbol);

        animations.push(
          gsap.to(symbol.position, {
            y: r * GAME_CONFIG.SYMBOL_HEIGHT + GAME_CONFIG.SYMBOL_HEIGHT / 2,
            duration: 0.6,
            delay: c * 0.1 + (GAME_CONFIG.ROWS - r) * 0.05,
            ease: "power2.in",
            onComplete: () => {
                symbol.setSpinning(false);
                symbol.playLandAnimation();
            }
          })
        );
      }
    }
    this.symbols = newSymbols;
    await Promise.all(animations);
  }

  public highlightWinningPositions(positions: {r: number, c: number}[]) {
    positions.forEach(pos => {
      this.symbols[pos.r][pos.c].playWin();
    });
  }

  public async cleanupWinningSymbols(positions: {r: number, c: number}[]) {
    const animations = positions.map(pos => {
      return new Promise<void>(resolve => {
        this.symbols[pos.r][pos.c].playPop(() => {
          resolve();
        });
      });
    });
    await Promise.all(animations);
  }

  private getSymbolFromPool(): SlotSymbol {
    return this.pool.pop() || new SlotSymbol();
  }

  private returnToPool(symbol: SlotSymbol) {
    symbol.reset();
    this.symbolContainer.removeChild(symbol);
    this.pool.push(symbol);
  }

  private clearGrid() {
    this.symbols.forEach(row => row && row.forEach(s => s && this.returnToPool(s)));
    this.symbols = [];
  }
}
