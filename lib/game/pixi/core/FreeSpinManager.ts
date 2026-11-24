import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';

export class FreeSpinManager extends PIXI.Container {
    private overlay: PIXI.Graphics;
    private introText: PIXI.Text;
    private countText: PIXI.Text;
    private persistentMultiplier: number = 0;
    private isFreeSpinMode: boolean = false;

    constructor() {
        super();
        
        this.overlay = new PIXI.Graphics();
        this.addChild(this.overlay);

        this.introText = new PIXI.Text({
            text: 'FREE SPINS!',
            style: {
                fill: 0x00ffff,
                fontSize: 100,
                fontWeight: '900',
                stroke: { color: 0x000000, width: 10 }
            }
        });
        this.introText.anchor.set(0.5);
        this.addChild(this.introText);

        this.countText = new PIXI.Text({
            text: '',
            style: {
                fill: 0xffffff,
                fontSize: 40,
                fontWeight: 'bold'
            }
        });
        this.countText.anchor.set(0.5);
        this.addChild(this.countText);

        this.visible = false;
    }

    public async playIntro(amount: number) {
        this.isFreeSpinMode = true;
        this.visible = true;
        this.overlay.clear().rect(0, 0, 1920, 1080).fill({ color: 0x000000, alpha: 0.8 });
        
        this.introText.text = `${amount} FREE SPINS!`;
        this.introText.scale.set(0);
        
        await gsap.to(this.introText.scale, { x: 1, y: 1, duration: 0.8, ease: "back.out" });
        await new Promise(r => setTimeout(r, 1500));
        
        gsap.to(this.overlay, { alpha: 0, duration: 0.5 });
        gsap.to(this.introText, { alpha: 0, duration: 0.5, onComplete: () => {
            this.visible = false;
            this.introText.alpha = 1;
        }});
    }

    public async playOutro(totalWin: number) {
        this.isFreeSpinMode = false;
        this.visible = true;
        this.overlay.alpha = 1;
        this.overlay.clear().rect(0, 0, 1920, 1080).fill({ color: 0x000000, alpha: 0.8 });
        
        this.introText.text = `TOTAL WIN\nRp ${totalWin.toLocaleString()}`;
        this.introText.scale.set(1.5);
        
        await gsap.from(this.introText, { alpha: 0, y: "+=50", duration: 1 });
        await new Promise(r => setTimeout(r, 3000));
        this.visible = false;
    }

    public updateMultiplier(val: number) {
        this.persistentMultiplier = val;
    }

    public getMultiplier() {
        return this.persistentMultiplier;
    }

    public resize(width: number, height: number) {
        this.overlay.width = width;
        this.overlay.height = height;
        this.introText.position.set(width / 2, height / 2);
    }
}
