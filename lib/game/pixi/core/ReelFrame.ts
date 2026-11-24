import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';
import { GAME_CONFIG } from './Constants';

export class ReelFrame extends PIXI.Container {
    private frame: PIXI.Graphics;
    private glow: PIXI.Graphics;
    private multiplierZone: PIXI.Container;
    private multiplierText: PIXI.Text;

    constructor() {
        super();

        const totalWidth = GAME_CONFIG.COLS * (GAME_CONFIG.SYMBOL_WIDTH + GAME_CONFIG.REEL_GAP);
        const totalHeight = GAME_CONFIG.ROWS * GAME_CONFIG.SYMBOL_HEIGHT;

        // 1. Marble Frame
        this.frame = new PIXI.Graphics();
        this.frame.roundRect(-10, -10, totalWidth + 20, totalHeight + 20, 15);
        this.frame.stroke({ color: 0xe8b548, width: 8, alignment: 1 }); // Outer Gold
        this.frame.stroke({ color: 0xffffff, width: 2, alpha: 0.3, alignment: 0 }); // Inner Marble highlight
        this.addChild(this.frame);

        // 2. Dynamic Ambient Glow
        this.glow = new PIXI.Graphics();
        this.glow.rect(0, 0, totalWidth, totalHeight);
        this.glow.fill({ color: 0x4a148c, alpha: 0.2 });
        this.addChild(this.glow);
        this.animateAmbientGlow();

        // 3. Multiplier Zone (Zeus Area)
        this.multiplierZone = new PIXI.Container();
        this.multiplierZone.y = -80;
        this.addChild(this.multiplierZone);

        const mBg = new PIXI.Graphics();
        mBg.roundRect(0, 0, totalWidth, 60, 10);
        mBg.fill({ color: 0x000000, alpha: 0.6 });
        mBg.stroke({ color: 0xffd700, width: 2 });
        this.multiplierZone.addChild(mBg);

        this.multiplierText = new PIXI.Text({
            text: 'TOTAL MULTIPLIER: 1x',
            style: {
                fill: 0xffd700,
                fontSize: 28,
                fontWeight: '900',
                dropShadow: { blur: 4, color: '#000000', distance: 2 }
            }
        });
        this.multiplierText.anchor.set(0.5);
        this.multiplierText.position.set(totalWidth / 2, 30);
        this.multiplierZone.addChild(this.multiplierText);
    }

    private animateAmbientGlow() {
        gsap.to(this.glow, {
            alpha: 0.4,
            duration: 2,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });
    }

    public async updateMultiplier(value: number) {
        this.multiplierText.text = `TOTAL MULTIPLIER: ${value}x`;
        
        // Flash Effect
        gsap.to(this.multiplierZone.scale, { x: 1.1, y: 1.1, duration: 0.1, yoyo: true, repeat: 1 });
        
        const flash = new PIXI.Graphics();
        flash.rect(0, 0, this.multiplierText.width, this.multiplierText.height);
        flash.fill(0xffffff);
        flash.alpha = 0.8;
        this.multiplierText.addChild(flash);
        gsap.to(flash, { alpha: 0, duration: 0.5, onComplete: () => flash.destroy() });
    }

    public playLightningStrike() {
        const strike = new PIXI.Graphics();
        strike.moveTo(GAME_CONFIG.COLS * 70, -200);
        strike.lineTo(GAME_CONFIG.COLS * 70, 0);
        strike.stroke({ color: 0x00ffff, width: 4 });
        this.addChild(strike);
        
        gsap.to(strike, { alpha: 0, duration: 0.1, repeat: 3, onComplete: () => strike.destroy() });
    }
}
