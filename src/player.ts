import * as PIXI from 'pixi.js';

export interface PlayerOptions {
  x: number;
  y: number;
  speed: number;
  width: number;
  emoji: string;
  basketEmoji: string;
  color: number;
  controls: {
    left: string;
    right: string;
  };
}

export class Player {
  public container: PIXI.Container;
  private character: PIXI.Text;
  private basket: PIXI.Text;
  private speed: number;
  private bounds: { left: number; right: number };
  private width: number;
  private keys: { [key: string]: boolean } = {};
  private controls: { left: string; right: string };
  
  constructor(options: PlayerOptions) {
    this.container = new PIXI.Container();
    this.speed = options.speed;
    this.width = options.width;
    this.controls = options.controls;
    
    // Set bounds for movement
    this.bounds = {
      left: -350,
      right: 350 - options.width
    };
    
    // Create character
    const characterStyle = new PIXI.TextStyle({
      fontSize: 40,
      fill: options.color
    });
    
    this.character = new PIXI.Text(options.emoji, characterStyle);
    this.character.anchor.set(0.5, 1);
    this.character.x = 0;
    this.character.y = 0;
    
    // Create basket
    const basketStyle = new PIXI.TextStyle({
      fontSize: 30,
      fill: options.color
    });
    
    this.basket = new PIXI.Text(options.basketEmoji, basketStyle);
    this.basket.anchor.set(0.5, 0);
    this.basket.x = 0;
    this.basket.y = 10;
    
    // Add to container
    this.container.addChild(this.character);
    this.container.addChild(this.basket);
    
    // Position container
    this.container.x = options.x;
    this.container.y = options.y;
    
    // Setup keyboard controls
    this.setupKeyboardControls();
  }
  
  private setupKeyboardControls(): void {
    window.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;
    });
    
    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });
  }
  
  public update(deltaTime: number): void {
    // Handle movement
    if (this.keys[this.controls.left]) {
      this.container.x -= this.speed * deltaTime;
    }
    
    if (this.keys[this.controls.right]) {
      this.container.x += this.speed * deltaTime;
    }
    
    // Clamp to boundaries
    if (this.container.x < this.bounds.left) {
      this.container.x = this.bounds.left;
    }
    
    if (this.container.x > this.bounds.right) {
      this.container.x = this.bounds.right;
    }
  }
  
  public checkFruitCollision(fruitX: number, fruitY: number, fruitSize: number): boolean {
    // Calculate basket bounds
    const basketBounds = {
      left: this.container.x - this.basket.width / 2,
      right: this.container.x + this.basket.width / 2,
      top: this.container.y + this.basket.y,
      bottom: this.container.y + this.basket.y + this.basket.height
    };
    
    // Check if fruit is within basket bounds
    return (
      fruitX + fruitSize / 2 > basketBounds.left &&
      fruitX - fruitSize / 2 < basketBounds.right &&
      fruitY + fruitSize / 2 > basketBounds.top &&
      fruitY - fruitSize / 2 < basketBounds.bottom
    );
  }
} 