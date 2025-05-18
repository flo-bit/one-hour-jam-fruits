import * as PIXI from "pixi.js";

interface Particle extends PIXI.Sprite {
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
  texture: PIXI.Texture;
};

export default class ParticleSystem {
  private maxParticles: number;
  public container: PIXI.Container;
  public particles: Particle[];
  private particlePool: Particle[];

  constructor(maxParticles: number = 10000) {
    this.maxParticles = maxParticles;
    this.container = new PIXI.Container();
    this.container.zIndex = 10;
    this.particles = [];
    this.particlePool = [];
  }

  spawnParticle(opts: Partial<ParticleOptions>): Particle | null {
    let particle: Particle;
    
    if (this.particlePool.length > 0) {
      particle = this.particlePool.pop()!;
      if (opts.texture) {
        particle.texture = opts.texture;
      }
    } else if (this.particles.length < this.maxParticles) {
      console.log('spawnParticle', opts);
      const texture = opts.texture || PIXI.Texture.WHITE;
      particle = new PIXI.Sprite(texture) as Particle;
      particle.anchor.set(0.5, 0.5);
      this.container.addChild(particle);
    } else {
      return null;
    }

    particle.rotation = (Math.random() - 0.5) * 0.5;
    particle.visible = true;
    particle.x = opts.x ?? 0;
    particle.y = opts.y ?? 0;
    
    // Apply color tint if provided
    if (opts.color) {
      particle.tint = typeof opts.color === 'number' ? opts.color : 0xFFFFFF;
    } else {
      particle.tint = 0xFFFFFF;
    }
    
    if(opts.size) particle.scale.set(opts.size);
    else particle.scale.set(0.0);
    particle.alpha = opts.alpha ?? 1;
    particle.speedX = opts.speedX ?? 0;
    particle.speedY = opts.speedY ?? 0;
    particle.age = 0;
    particle.maxAge = opts.maxAge ?? 100;
    particle.maxScale = 0.05;
    particle.scaleSpeed = 0.1;
    particle.rotation = opts.rotation ?? (Math.random() - 0.5) * 0.5;
    particle.rotationSpeed = opts.rotationSpeed ?? (Math.random() - 0.5);

    this.particles.push(particle);

    return particle;
  }

  removeParticle(particle: Particle): void {
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
      if(particle.scale.x < particle.maxScale) {
        particle.scale.x += particle.scaleSpeed * deltaTime;
        particle.scale.y += particle.scaleSpeed * deltaTime;
        continue;
      }
      particle.x += particle.speedX * deltaTime;
      particle.y += particle.speedY * deltaTime;
      particle.age += deltaTime;

      particle.rotation += deltaTime * particle.rotationSpeed * 5

      if(particle.y > 400 || particle.age > particle.maxAge) {
        this.removeParticle(particle);
      }
    }
  }
}
