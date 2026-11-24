import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';

export class EffectManager extends PIXI.Container {
  private particlePool: PIXI.Graphics[] = [];

  constructor() {
    super();
  }

  public playBigWin() {
    for (let i = 0; i < 100; i++) {
      this.createParticle();
    }
  }

  public playMultiplierIncrease(x: number, y: number) {
     const text = new PIXI.Text({ 
        text: '⚡ MULTIPLIER ⚡', 
        style: {
           fill: 0xffea00,
           fontSize: 48,
           fontWeight: 'bold',
           stroke: { color: 0x000000, width: 6 }
        }
     });
     text.anchor.set(0.5);
     text.position.set(x, y);
     this.addChild(text);

     gsap.to(text.scale, { x: 1.5, y: 1.5, duration: 0.5, yoyo: true, repeat: 1 });
     gsap.to(text, { y: y - 200, alpha: 0, duration: 1.5, ease: "power2.out", onComplete: () => this.removeChild(text) });
  }

  private createParticle() {
    const p = this.particlePool.pop() || new PIXI.Graphics();
    p.clear();
    p.circle(0, 0, Math.random() * 5 + 2);
    p.fill(Math.random() > 0.5 ? 0xffd700 : 0xffffff);
    
    p.position.set(640, 360);
    this.addChild(p);

    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 600 + 200;

    gsap.to(p.position, {
      x: 640 + Math.cos(angle) * distance,
      y: 360 + Math.sin(angle) * distance,
      duration: Math.random() * 1 + 1,
      ease: "power2.out"
    });

    gsap.to(p, {
      alpha: 0,
      duration: 1.5,
      onComplete: () => {
        this.removeChild(p);
        this.particlePool.push(p);
      }
    });
  }
}
