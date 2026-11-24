import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';
import { GAME_CONFIG } from './Constants';

export class SlotSymbol extends PIXI.Container {
  private sprite: PIXI.Sprite;
  private glowEffect: PIXI.Graphics;
  private blurFilter: PIXI.BlurFilter;
  public symbolId: string = '';
  private idleTween?: gsap.core.Tween;

  constructor() {
    super();
    
    this.glowEffect = new PIXI.Graphics();
    this.glowEffect.circle(0, 0, GAME_CONFIG.SYMBOL_WIDTH * 0.7);
    this.glowEffect.fill({ color: 0xffea00, alpha: 0.6 });
    this.glowEffect.visible = false;
    this.addChild(this.glowEffect);

    this.sprite = new PIXI.Sprite();
    this.sprite.anchor.set(0.5);
    this.addChild(this.sprite);

    this.blurFilter = new PIXI.BlurFilter();
    this.blurFilter.blurX = 0;
    this.blurFilter.blurY = 0;
    this.sprite.filters = [this.blurFilter];
  }

  public setup(texture: PIXI.Texture, id: string) {
    this.symbolId = id;
    this.sprite.texture = texture;
    this.sprite.width = GAME_CONFIG.SYMBOL_WIDTH;
    this.sprite.height = GAME_CONFIG.SYMBOL_HEIGHT;
    this.sprite.alpha = 1;
    this.sprite.scale.set(1);
    this.sprite.rotation = 0;
    this.glowEffect.visible = false;
    this.blurFilter.blurY = 0;
    this.visible = true;
    
    this.startIdle();
  }

  private startIdle() {
      this.stopIdle();
      this.idleTween = gsap.to(this.sprite.scale, {
          x: 1.03,
          y: 1.03,
          duration: 2 + Math.random(),
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
      });
  }

  private stopIdle() {
      if (this.idleTween) {
          this.idleTween.kill();
          this.idleTween = undefined;
      }
  }

  public async playLandAnimation() {
      this.stopIdle();
      const tl = gsap.timeline();
      tl.to(this.sprite.scale, { x: 1.1, y: 0.9, duration: 0.1 });
      tl.to(this.sprite.scale, { x: 1, y: 1, duration: 0.4, ease: "bounce.out" });
      tl.to(this.sprite, { rotation: (Math.random() - 0.5) * 0.2, duration: 0.1, yoyo: true, repeat: 1 }, 0);
      await tl.play();
      this.startIdle();
  }

  public setSpinning(isSpinning: boolean) {
     if (isSpinning) {
        this.stopIdle();
        gsap.to(this.blurFilter, { blurY: 20, duration: 0.2 });
        gsap.to(this.sprite.scale, { y: 1.2, duration: 0.2 });
     } else {
        gsap.to(this.blurFilter, { blurY: 0, duration: 0.1 });
        gsap.to(this.sprite.scale, { y: 1, duration: 0.1 });
        this.startIdle();
     }
  }

  public playWin() {
    this.stopIdle();
    this.glowEffect.visible = true;
    this.glowEffect.alpha = 0;
    gsap.to(this.sprite.scale, { x: 1.15, y: 1.15, duration: 0.4, yoyo: true, repeat: -1, ease: "sine.inOut" });
    gsap.to(this.glowEffect, { alpha: 0.8, duration: 0.4, yoyo: true, repeat: -1 });
    gsap.to(this.sprite, { rotation: 0.1, duration: 0.1, yoyo: true, repeat: -1 });
  }

  public playPop(onComplete: () => void) {
    this.stopIdle();
    gsap.killTweensOf(this.sprite);
    gsap.killTweensOf(this.sprite.scale);
    gsap.killTweensOf(this.glowEffect);

    gsap.to(this.sprite.scale, { x: 0, y: 0, duration: 0.3, ease: "back.in" });
    gsap.to(this.glowEffect.scale, { x: 2, y: 2, duration: 0.3 });
    gsap.to(this.glowEffect, { alpha: 0, duration: 0.3, onComplete: () => {
        this.visible = false;
        onComplete();
    }});
  }

  public reset() {
    this.stopIdle();
    gsap.killTweensOf(this.sprite);
    gsap.killTweensOf(this.sprite.scale);
    gsap.killTweensOf(this.glowEffect);
    this.sprite.scale.set(1);
    this.sprite.rotation = 0;
    this.sprite.alpha = 1;
    this.glowEffect.visible = false;
    this.glowEffect.scale.set(1);
    this.blurFilter.blurY = 0;
    this.visible = true;
  }
}
