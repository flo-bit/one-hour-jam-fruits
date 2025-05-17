import * as PIXI from "pixi.js";

interface ParticleText extends PIXI.Text {
  speedX: number;
  speedY: number;
  age: number;
  maxAge: number;
  initialSize: number;
}

export type ParticleOptions = {
  x: number;
  y: number;
  size: number;
  color: PIXI.ColorSource;
  alpha: number;
  speedX: number;
  speedY: number;
  maxAge: number;
  emoji: string;
};

export default class ParticleSystem {
  private maxParticles: number;
  public container: PIXI.Container;
  public particles: ParticleText[];
  private particlePool: ParticleText[];

  constructor(maxParticles: number = 10000) {
    this.maxParticles = maxParticles;
    this.container = new PIXI.Container();
    this.container.zIndex = 10;
    this.particles = [];
    this.particlePool = [];
  }

  spawnParticle(opts: Partial<ParticleOptions>): ParticleText | null {
    let particle: ParticleText;
    
    if (this.particlePool.length > 0) {
      particle = this.particlePool.pop()!;
      particle.text = opts.emoji || "❤️"; // Update the text for reused particles
    } else if (this.particles.length < this.maxParticles) {
      const textStyle = new PIXI.TextStyle({
        fontSize: opts.size || 20,
        fill: opts.color || 0xffffff,
      });
      
      particle = new PIXI.Text(opts.emoji || "❤️", textStyle) as ParticleText;
      particle.anchor.set(0.5, 0.5);
      this.container.addChild(particle);
    } else {
      return null;
    }

    particle.rotation = (Math.random() - 0.5) * 0.5;
    particle.visible = true;
    particle.x = opts.x ?? 0;
    particle.y = opts.y ?? 0;
    particle.scale.set((opts.size ?? 20) / particle.width);
    particle.alpha = opts.alpha ?? 1;
    particle.speedX = opts.speedX ?? 0;
    particle.speedY = opts.speedY ?? 0;
    particle.age = 0;
    particle.maxAge = opts.maxAge ?? 1;
    particle.initialSize = opts.size ?? 20;

    this.particles.push(particle);

    return particle;
  }

  removeParticle(particle: ParticleText): void {
    const index = this.particles.indexOf(particle);
    if (index !== -1) {
      particle.visible = false;

      this.particles.splice(index, 1);
      this.particlePool.push(particle);
    }
  }

  update(deltaTime: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      particle.x += particle.speedX * deltaTime;
      particle.y += particle.speedY * deltaTime;
      particle.age += deltaTime;

      if(particle.y > 400) {
        this.removeParticle(particle);
      }
    }
  }
}
