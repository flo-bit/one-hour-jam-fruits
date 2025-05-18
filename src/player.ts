import * as PIXI from 'pixi.js';

export interface PlayerOptions {
  x: number;
  y: number;
  speed: number;
  width: number;
  playerImages: {
    left: PIXI.Texture;
    front: PIXI.Texture;
    right: PIXI.Texture;
  };
  basketEmoji: string;
  color: number;
  controls: {
    left: string;
    right: string;
  };
}

export class Player {
  public container: PIXI.Container;
  private character: PIXI.Sprite;
  private basket: PIXI.Graphics;
  private speed: number;
  private bounds: { left: number; right: number };
  private width: number;
  private keys: { [key: string]: boolean } = {};
  private controls: { left: string; right: string };
  private textures: {
    left: PIXI.Texture;
    front: PIXI.Texture;
    right: PIXI.Texture;
  };
  private lastDirection: 'left' | 'front' | 'right' = 'front';
  
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
    
    // Store textures
    this.textures = options.playerImages;
    
    // Create character sprite
    this.character = new PIXI.Sprite(this.textures.front);
    this.character.anchor.set(0.5, 1);
    this.character.x = 0;
    this.character.y = 0;
    this.character.width = options.width;
    this.character.height = options.width / 0.51; // Adjust height based on width to maintain proportion
    
    // Create basket
    const basketStyle = new PIXI.TextStyle({
      fontSize: 30,
      fill: options.color
    });
    
    this.basket = new PIXI.Graphics();
    this.basket.rect(-20, -10, 40, 20).fill({ color: options.color, alpha: 1 });
    
    this.basket.visible = false;
    this.basket.y = -70;

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
    let isMoving = false;
    let direction: 'left' | 'front' | 'right' = 'front';
    
    // Handle movement
    if (this.keys[this.controls.left]) {
      this.container.x -= this.speed * deltaTime;
      direction = 'left';
      isMoving = true;
    }
    
    if (this.keys[this.controls.right]) {
      this.container.x += this.speed * deltaTime;
      direction = 'right';
      isMoving = true;
    }
    
    // If not moving, use front texture
    if (!isMoving) {
      direction = 'front';
    }
    
    // Update sprite texture if direction changed
    if (direction !== this.lastDirection) {
      this.character.texture = this.textures[direction];
      this.lastDirection = direction;
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
      top: this.container.y + this.basket.y - this.basket.height / 2,
      bottom: this.container.y + this.basket.y + this.basket.height / 2
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