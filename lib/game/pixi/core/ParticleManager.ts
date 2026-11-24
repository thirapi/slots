import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';

export class ParticleManager extends PIXI.Container {
    private goldPool: PIXI.Sprite[] = [];
    private lightningPool: PIXI.Graphics[] = [];

    constructor() {
        super();
    }

    public playWinBurst(x: number, y: number) {
        for (let i = 0; i < 30; i++) {
            this.createGoldParticle(x, y);
        }
    }

    public playBigWin() {
        // Continuous burst from center
        const interval = setInterval(() => {
            this.playWinBurst(640, 360);
        }, 100);
        setTimeout(() => clearInterval(interval), 3000);
    }

    private createGoldParticle(x: number, y: number) {
        const p = this.goldPool.pop() || new PIXI.Sprite(PIXI.Texture.WHITE);
        p.tint = 0xffd700;
        p.width = p.height = Math.random() * 8 + 4;
        p.anchor.set(0.5);
        p.position.set(x, y);
        p.alpha = 1;
        this.addChild(p);

        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 10 + 5;
        const friction = 0.95;
        let vx = Math.cos(angle) * speed;
        let vy = Math.sin(angle) * speed;

        gsap.to(p, {
            alpha: 0,
            duration: 1 + Math.random(),
            onUpdate: () => {
                p.x += vx;
                p.y += vy;
                vx *= friction;
                vy *= friction;
                vy += 0.2; // Gravity
            },
            onComplete: () => {
                this.removeChild(p);
                this.goldPool.push(p);
            }
        });
    }

    public playLightning(startX: number, startY: number, endX: number, endY: number) {
        const line = this.lightningPool.pop() || new PIXI.Graphics();
        line.clear();
        line.moveTo(startX, startY);
        
        let curX = startX;
        let curY = startY;
        const segments = 5;
        
        for (let i = 0; i < segments; i++) {
            curX += (endX - startX) / segments + (Math.random() - 0.5) * 50;
            curY += (endY - startY) / segments + (Math.random() - 0.5) * 20;
            line.lineTo(curX, curY);
        }

        line.stroke({ color: 0x00ffff, width: 3, alpha: 1 });
        this.addChild(line);

        gsap.to(line, {
            alpha: 0,
            duration: 0.2,
            repeat: 2,
            onComplete: () => {
                this.removeChild(line);
                this.lightningPool.push(line);
            }
        });
    }
}
