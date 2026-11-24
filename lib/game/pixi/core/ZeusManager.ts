import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';

export type ZeusState = 'IDLE' | 'ANGRY' | 'POWER_UP' | 'LAUGHING';

export class ZeusManager extends PIXI.Container {
    private zeus: PIXI.Container;
    private aura: PIXI.Graphics;
    private lightning: PIXI.Graphics;
    private state: ZeusState = 'IDLE';

    constructor() {
        super();
        
        this.zeus = new PIXI.Container();
        this.addChild(this.zeus);

        // Aura Effect
        this.aura = new PIXI.Graphics();
        this.aura.circle(0, 0, 150);
        this.aura.fill({ color: 0x00ffff, alpha: 0.2 });
        this.zeus.addChild(this.aura);
        this.animateAura();

        // Zeus Body Placeholder (Ideally a Spine skeleton or Spritesheet)
        const body = new PIXI.Graphics();
        body.ellipse(0, 0, 60, 120);
        body.fill({ color: 0xdcdde1 });
        this.zeus.addChild(body);

        this.lightning = new PIXI.Graphics();
        this.addChild(this.lightning);
    }

    private animateAura() {
        gsap.to(this.aura.scale, { x: 1.2, y: 1.2, duration: 1.5, repeat: -1, yoyo: true });
        gsap.to(this.aura, { alpha: 0.4, duration: 1.5, repeat: -1, yoyo: true });
    }

    public setState(newState: ZeusState) {
        this.state = newState;
        gsap.killTweensOf(this.zeus.scale);
        
        switch (newState) {
            case 'IDLE':
                gsap.to(this.zeus.scale, { x: 1, y: 1, duration: 0.5 });
                break;
            case 'ANGRY':
                gsap.to(this.zeus.scale, { x: 1.1, y: 1.1, duration: 0.2, yoyo: true, repeat: 3 });
                break;
            case 'POWER_UP':
                gsap.to(this.zeus.scale, { x: 1.3, y: 1.3, duration: 0.3, ease: "back.out" });
                this.aura.tint = 0xffea00;
                break;
            case 'LAUGHING':
                gsap.to(this.zeus, { y: "-=20", duration: 0.2, repeat: 10, yoyo: true });
                break;
        }
    }

    public async castLightning(targetX: number, targetY: number) {
        this.setState('POWER_UP');
        
        const startX = this.x;
        const startY = this.y;

        for (let i = 0; i < 3; i++) {
            this.drawLightning(startX, startY, targetX, targetY);
            await new Promise(r => setTimeout(r, 50));
            this.lightning.clear();
        }
        
        setTimeout(() => this.setState('IDLE'), 500);
    }

    private drawLightning(x1: number, y1: number, x2: number, y2: number) {
        this.lightning.clear();
        this.lightning.moveTo(x1, y1);
        
        let curX = x1;
        let curY = y1;
        const segments = 8;
        
        for (let i = 0; i < segments; i++) {
            curX += (x2 - x1) / segments + (Math.random() - 0.5) * 60;
            curY += (y2 - y1) / segments + (Math.random() - 0.5) * 60;
            this.lightning.lineTo(curX, curY);
        }
        
        this.lightning.stroke({ color: 0xffffff, width: 4 });
        this.lightning.stroke({ color: 0x00ffff, width: 10, alpha: 0.3 });
    }
}
