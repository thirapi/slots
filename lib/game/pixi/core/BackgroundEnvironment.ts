import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';

export class BackgroundEnvironment extends PIXI.Container {
    private sky: PIXI.Graphics;
    private godRays: PIXI.Container;
    private clouds: PIXI.TilingSprite[] = [];
    private islands: PIXI.Sprite[] = [];
    private vignette: PIXI.Graphics;

    constructor() {
        super();

        // 1. Deep Dramatic Sky
        this.sky = new PIXI.Graphics();
        this.sky.rect(0, 0, 1920, 1080);
        this.sky.fill({ color: 0x0a041a });
        this.addChild(this.sky);

        // 2. God Rays
        this.godRays = new PIXI.Container();
        this.createGodRays();
        this.addChild(this.godRays);

        // 3. Parallax Clouds (Use placeholders if textures not available)
        for (let i = 0; i < 3; i++) {
            const cloud = new PIXI.TilingSprite({
                texture: PIXI.Texture.WHITE,
                width: 2560,
                height: 500
            });
            cloud.alpha = 0.1 * (i + 1);
            cloud.y = 100 + i * 150;
            this.clouds.push(cloud);
            this.addChild(cloud);
        }

        // 4. Vignette for focus
        this.vignette = new PIXI.Graphics();
        this.addChild(this.vignette);
    }

    private createGodRays() {
        for (let i = 0; i < 8; i++) {
            const ray = new PIXI.Graphics();
            ray.poly([0, 0, 100, 0, 400, 2000, -200, 2000]);
            ray.fill({ color: 0xffea00, alpha: 0.1 });
            ray.rotation = (Math.random() - 0.5) * 0.5;
            ray.x = Math.random() * 1920;
            this.godRays.addChild(ray);

            gsap.to(ray, {
                alpha: 0.2,
                duration: 2 + Math.random() * 2,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });
        }
    }

    public update(delta: number) {
        this.clouds.forEach((c, i) => {
            c.tilePosition.x += (0.1 + i * 0.05) * delta;
        });
        this.godRays.children.forEach((ray, i) => {
            ray.x += Math.sin(Date.now() * 0.001 + i) * 0.2;
        });
    }

    public resize(width: number, height: number) {
        this.sky.width = width;
        this.sky.height = height;
        this.vignette.clear();
        this.vignette.rect(0, 0, width, height);
        this.vignette.fill({ color: 0x000000, alpha: 0.3 }); // Simple vignette placeholder
    }
}
