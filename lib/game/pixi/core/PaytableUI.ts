import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';

export class PaytableUI extends PIXI.Container {
    private panel: PIXI.Graphics;
    private closeBtn: PIXI.Text;

    constructor() {
        super();
        
        this.panel = new PIXI.Graphics();
        this.panel.roundRect(0, 0, 800, 550, 20);
        this.panel.fill({ color: 0x0a0a1a, alpha: 0.98 });
        this.panel.stroke({ color: 0xe8b548, width: 3 });
        this.addChild(this.panel);

        const title = new PIXI.Text({
            text: 'PAYTABLE',
            style: { fill: 0xe8b548, fontSize: 36, fontWeight: '900' }
        });
        title.anchor.set(0.5);
        title.position.set(400, 50);
        this.addChild(title);

        this.closeBtn = new PIXI.Text({
            text: '✕',
            style: { fill: 0xffffff, fontSize: 30 }
        });
        this.closeBtn.position.set(750, 20);
        this.closeBtn.eventMode = 'static';
        this.closeBtn.cursor = 'pointer';
        this.closeBtn.on('pointerdown', () => this.hide());
        this.addChild(this.closeBtn);

        this.visible = false;
        this.pivot.set(400, 275);
    }

    public show() {
        this.visible = true;
        this.alpha = 0;
        gsap.to(this, { alpha: 1, duration: 0.3 });
    }

    public hide() {
        gsap.to(this, { alpha: 0, duration: 0.3, onComplete: () => { this.visible = false; } });
    }
}
