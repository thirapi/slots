import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';

export class BuyFeatureUI extends PIXI.Container {
    private panel: PIXI.Graphics;
    private title: PIXI.Text;
    private optionsContainer: PIXI.Container;

    constructor(onSelect: (multiplier: number) => void) {
        super();
        
        this.panel = new PIXI.Graphics();
        this.panel.roundRect(0, 0, 600, 400, 20);
        this.panel.fill({ color: 0x1a1a2e, alpha: 0.95 });
        this.panel.stroke({ color: 0xffd700, width: 4 });
        this.addChild(this.panel);

        this.title = new PIXI.Text({
            text: 'BUY FREE SPINS',
            style: { fill: 0xffd700, fontSize: 32, fontWeight: 'bold' }
        });
        this.title.anchor.set(0.5);
        this.title.position.set(300, 50);
        this.addChild(this.title);

        this.optionsContainer = new PIXI.Container();
        this.optionsContainer.y = 120;
        this.addChild(this.optionsContainer);

        const prices = [10, 25, 50, 100];
        prices.forEach((p, i) => {
            const btn = new PIXI.Container();
            btn.x = 50 + (i % 2) * 260;
            btn.y = Math.floor(i / 2) * 120;
            
            const bg = new PIXI.Graphics();
            bg.roundRect(0, 0, 240, 80, 10);
            bg.fill({ color: 0x2a2a4e });
            bg.stroke({ color: 0xffffff, alpha: 0.2 });
            btn.addChild(bg);

            const txt = new PIXI.Text({
                text: `${p}x BET`,
                style: { fill: 0xffffff, fontSize: 24, fontWeight: '900' }
            });
            txt.anchor.set(0.5);
            txt.position.set(120, 40);
            btn.addChild(txt);

            btn.eventMode = 'static';
            btn.cursor = 'pointer';
            btn.on('pointerdown', () => {
                onSelect(p);
                this.hide();
            });

            this.optionsContainer.addChild(btn);
        });

        this.visible = false;
        this.pivot.set(300, 200);
    }

    public show() {
        this.visible = true;
        this.scale.set(0);
        gsap.to(this.scale, { x: 1, y: 1, duration: 0.4, ease: "back.out" });
    }

    public hide() {
        gsap.to(this.scale, { x: 0, y: 0, duration: 0.3, onComplete: () => { this.visible = false; } });
    }
}
