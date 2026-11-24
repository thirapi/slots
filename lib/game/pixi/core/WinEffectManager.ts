import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';

export type WinTier = 'NORMAL' | 'BIG' | 'MEGA' | 'EPIC';

export class WinEffectManager extends PIXI.Container {
    private overlay: PIXI.Graphics;
    private winText: PIXI.Text;
    private amountText: PIXI.Text;
    private coinParticles: PIXI.Container;

    constructor() {
        super();
        
        this.overlay = new PIXI.Graphics();
        this.addChild(this.overlay);

        this.coinParticles = new PIXI.Container();
        this.addChild(this.coinParticles);

        this.winText = new PIXI.Text({
            text: '',
            style: {
                fill: 0xffd700,
                fontSize: 100,
                fontWeight: '900',
                stroke: { color: 0x000000, width: 10 },
                dropShadow: { blur: 15, color: '#000000', distance: 8 }
            }
        });
        this.winText.anchor.set(0.5);
        this.addChild(this.winText);

        this.amountText = new PIXI.Text({
            text: '',
            style: {
                fill: 0xffffff,
                fontSize: 80,
                fontWeight: 'bold',
                stroke: { color: 0x000000, width: 6 }
            }
        });
        this.amountText.anchor.set(0.5);
        this.addChild(this.amountText);
        
        this.visible = false;
    }

    public async showWin(amount: number, bet: number, onPlaySound: (type: string) => void) {
        const ratio = amount / bet;
        let tier: WinTier = 'NORMAL';
        let duration = 2;

        if (ratio >= 50) { tier = 'EPIC'; duration = 5; onPlaySound('epic_win'); }
        else if (ratio >= 20) { tier = 'MEGA'; duration = 4; onPlaySound('mega_win'); }
        else if (ratio >= 10) { tier = 'BIG'; duration = 3; onPlaySound('big_win'); }
        else { onPlaySound('win_short'); }

        this.winText.text = `${tier} WIN!`;
        this.visible = true;
        this.overlay.alpha = 0;
        this.amountText.text = 'Rp 0';
        
        const tl = gsap.timeline();
        
        // 1. Epic Flash & Zoom
        tl.to(this.overlay.clear().rect(0, 0, 1920, 1080).fill({ color: 0xffffff }), { alpha: 0.6, duration: 0.1 });
        tl.to(this.overlay, { alpha: 0, duration: 0.8 });
        
        // 2. Win Text Bounce
        this.winText.scale.set(0);
        tl.to(this.winText.scale, { x: 1.2, y: 1.2, duration: 0.6, ease: "back.out(2)" }, 0);
        
        // 3. Roll-up Counter
        const counter = { val: 0 };
        tl.to(counter, {
            val: amount,
            duration: duration,
            ease: "power1.out",
            onUpdate: () => {
                this.amountText.text = `Rp ${Math.floor(counter.val).toLocaleString()}`;
                // Subtle pulse on counter
                const s = 1 + (Math.random() * 0.05);
                this.amountText.scale.set(s);
            }
        }, 0.2);

        // 4. Particle Burst
        if (tier !== 'NORMAL') this.startCoinRain(duration);

        await tl.play();
        await new Promise(r => setTimeout(r, 2000));
        this.visible = false;
    }

    private startCoinRain(duration: number) {
        // Logic for continuous coin rain from top
        const interval = setInterval(() => {
            if (!this.visible) { clearInterval(interval); return; }
            this.dropCoin();
        }, 50);
        setTimeout(() => clearInterval(interval), duration * 1000);
    }

    private dropCoin() {
        const coin = new PIXI.Graphics();
        coin.circle(0, 0, 10).fill(0xffd700);
        coin.x = Math.random() * 1280;
        coin.y = -20;
        this.coinParticles.addChild(coin);
        
        gsap.to(coin, {
            y: 800,
            x: coin.x + (Math.random() - 0.5) * 200,
            rotation: 10,
            duration: 1 + Math.random(),
            onComplete: () => coin.destroy()
        });
    }

    public resize(width: number, height: number) {
        this.winText.position.set(width / 2, height / 2 - 50);
        this.amountText.position.set(width / 2, height / 2 + 80);
    }
}
