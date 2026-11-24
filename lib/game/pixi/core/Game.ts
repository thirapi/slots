import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';
import { ReelManager } from './ReelManager';
import { BackgroundEnvironment } from './BackgroundEnvironment';
import { ReelFrame } from './ReelFrame';
import { ParticleManager } from './ParticleManager';
import { ZeusManager } from './ZeusManager';
import { WinEffectManager } from './WinEffectManager';
import { FreeSpinManager } from './FreeSpinManager';
import { BuyFeatureUI } from './BuyFeatureUI';
import { PaytableUI } from './PaytableUI';
import { ASSETS, GAME_CONFIG } from './Constants';

export class Game {
  private app: PIXI.Application;
  private bgEnv!: BackgroundEnvironment;
  private reelManager!: ReelManager;
  private reelFrame!: ReelFrame;
  private particleManager!: ParticleManager;
  private zeusManager!: ZeusManager;
  private winEffectManager!: WinEffectManager;
  private fsManager!: FreeSpinManager;
  private buyUI!: BuyFeatureUI;
  private paytableUI!: PaytableUI;
  private textures: Record<string, PIXI.Texture> = {};
  private gameContainer!: PIXI.Container;
  private uiContainer!: PIXI.Container;
  private currentBet: number = 200;
  private isTurbo: boolean = false;
  private canvas: HTMLCanvasElement;

  public onPlaySound: (type: string) => void = () => {};

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.app = new PIXI.Application();
  }

  public async init() {
    await this.app.init({ 
      canvas: this.canvas, 
      width: 1280, 
      height: 720, 
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
      backgroundColor: 0x000000,
    });

    this.gameContainer = new PIXI.Container();
    this.uiContainer = new PIXI.Container();
    this.app.stage.addChild(this.gameContainer);
    this.app.stage.addChild(this.uiContainer);

    this.reelManager = new ReelManager();
    this.reelFrame = new ReelFrame();
    this.particleManager = new ParticleManager();
    this.zeusManager = new ZeusManager();
    this.winEffectManager = new WinEffectManager();
    this.fsManager = new FreeSpinManager();
    this.paytableUI = new PaytableUI();
    this.buyUI = new BuyFeatureUI((multiplier) => {
        console.log(`Buying FS with ${multiplier}x bet`);
    });
    
    this.gameContainer.addChild(this.reelManager);
    this.gameContainer.addChild(this.reelFrame);
    this.gameContainer.addChild(this.particleManager);
    this.gameContainer.addChild(this.zeusManager);
    
    this.uiContainer.addChild(this.winEffectManager);
    this.uiContainer.addChild(this.fsManager);
    this.uiContainer.addChild(this.buyUI);
    this.uiContainer.addChild(this.paytableUI);
    
    this.positionContainers(1280, 720);

    this.app.ticker.add((ticker) => {
        if (this.bgEnv) this.bgEnv.update(ticker.deltaTime);
    });
  }

  private positionContainers(width: number, height: number) {
    const totalReelWidth = GAME_CONFIG.COLS * (GAME_CONFIG.SYMBOL_WIDTH + GAME_CONFIG.REEL_GAP);
    const totalReelHeight = GAME_CONFIG.ROWS * GAME_CONFIG.SYMBOL_HEIGHT;

    if (this.reelManager) {
        this.reelManager.x = (width - totalReelWidth) / 2;
        this.reelManager.y = (height - totalReelHeight) / 2;
    }
    
    if (this.reelFrame) {
        this.reelFrame.x = (width - totalReelWidth) / 2;
        this.reelFrame.y = (height - totalReelHeight) / 2;
    }
    
    if (this.zeusManager) {
        this.zeusManager.position.set(width * 0.85, height * 0.3);
    }

    if (this.winEffectManager) this.winEffectManager.resize(width, height);
    if (this.fsManager) this.fsManager.resize(width, height);
    if (this.buyUI) this.buyUI.position.set(width / 2, height / 2);
    if (this.paytableUI) this.paytableUI.position.set(width / 2, height / 2);
    
    if (this.bgEnv) this.bgEnv.resize(width, height);
  }

  public setTurbo(enabled: boolean) {
      this.isTurbo = enabled;
      gsap.globalTimeline.timeScale(enabled ? 2 : 1);
  }

  public showBuyFeature() { this.buyUI.show(); }
  public showPaytable() { this.paytableUI.show(); }

  public async onFreeSpinsTriggered(amount: number) {
    this.onPlaySound('trigger');
    this.zeusManager.setState('ANGRY');
    await this.fsManager.playIntro(amount);
  }

  public async onFreeSpinsStarted(payload: any) {
      gsap.to(this.gameContainer, { pixi: { colorMatrix: { hue: 180, contrast: 1.2 } }, duration: 1 });
  }

  public async onFreeSpinsEnded(payload: any) {
      await this.fsManager.playOutro(payload.totalWin);
      gsap.to(this.gameContainer, { pixi: { colorMatrix: { hue: 0, contrast: 1 } }, duration: 1 });
  }

  public async loadAssets() {
    const symbolKeys = Object.keys(ASSETS.SYMBOLS);
    for (const key of symbolKeys) {
      this.textures[key] = await PIXI.Assets.load(ASSETS.SYMBOLS[key as keyof typeof ASSETS.SYMBOLS]);
    }
    
    this.bgEnv = new BackgroundEnvironment();
    this.gameContainer.addChildAt(this.bgEnv, 0);
    this.bgEnv.resize(this.app.screen.width, this.app.screen.height);
  }

  public async onSpinStart() {
    this.onPlaySound('spin');
    this.zeusManager.setState('IDLE');
    await this.reelManager.spinStart();
  }

  public async onReelsStop(grid: any[][]) {
    this.onPlaySound('drop');
    await this.reelManager.updateGrid(grid, this.textures);
  }

  public async onWinFound(positions: {r: number, c: number}[], payout: number) {
    this.onPlaySound('win');
    this.reelManager.highlightWinningPositions(positions);
    this.screenShake(0.3);
    
    positions.forEach(pos => {
      this.particleManager.playWinBurst(
        this.reelManager.x + pos.c * (GAME_CONFIG.SYMBOL_WIDTH + GAME_CONFIG.REEL_GAP) + GAME_CONFIG.SYMBOL_WIDTH/2,
        this.reelManager.y + pos.r * GAME_CONFIG.SYMBOL_HEIGHT + GAME_CONFIG.SYMBOL_HEIGHT/2
      );
    });

    await new Promise(resolve => setTimeout(resolve, this.isTurbo ? 400 : 800));
  }

  public async onMultiplierAdded(positions: any[], totalMulti: number) {
    this.onPlaySound('pop');
    for (const pos of positions) {
        await this.zeusManager.castLightning(this.reelManager.x + pos.c * 150 + 75, this.reelManager.y + pos.r * 140 + 70);
    }
    await this.reelFrame.updateMultiplier(totalMulti);
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  public async onWinCleanup(payload: any) {
  }

  public async onCascade(newGrid: any[][]) {
    this.onPlaySound('drop');
    await this.reelManager.updateGrid(newGrid, this.textures);
  }

  public async onSettlement(amount: number) {
    if (amount > 0) {
       this.zeusManager.setState('LAUGHING');
       await this.winEffectManager.showWin(amount, this.currentBet, this.onPlaySound);
       this.screenShake(1.0);
    }
  }

  public setBet(bet: number) {
      this.currentBet = bet;
  }

  private screenShake(intensity: number) {
    const tl = gsap.timeline();
    for (let i = 0; i < 10; i++) {
        tl.to(this.gameContainer, {
            x: (Math.random() - 0.5) * 20 * intensity,
            y: (Math.random() - 0.5) * 20 * intensity,
            duration: 0.05
        });
    }
    tl.to(this.gameContainer, { x: 0, y: 0, duration: 0.05 });
  }

  public resize(width: number, height: number) {
    if (this.app.renderer) {
      this.app.renderer.resize(width, height);
      this.positionContainers(width, height);
    }
  }

  public destroy() {
    this.app.destroy(true, { children: true, texture: true });
  }
}
