import * as PIXI from 'pixi.js'
import ParticleSystem from './particles';

let app: PIXI.Application;
let container: PIXI.Container;

let particles: ParticleSystem;

// List of emojis to randomly use
const fruitEmojis = ["🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🫐", "🍈", "🍒", "🍑", "🥭", "🍍", "🥥", "🥝"];

async function setup() {
  // Create the application
  app = new PIXI.Application();
  await app.init({
    background: 'black',
    resizeTo: window,
  });

  // Add the canvas to the DOM
  document.body.appendChild(app.canvas);

  // Create a container with fixed dimensions
  container = new PIXI.Container();
  container.width = 700;
  container.height = 400;

  // Create a red rectangle
  const rectangle = new PIXI.Graphics();
  rectangle.rect(0, 0, 100, 100).fill({ color: 0xff0000, alpha: 1 });

  // Add the rectangle to the container
  container.addChild(rectangle);

  // Center the rectangle in the container
  rectangle.x = (container.width - rectangle.width) / 2;
  rectangle.y = (container.height - rectangle.height) / 2;

  // Add the container to the stage
  app.stage.addChild(container);

  // add background
  const background = new PIXI.Graphics();
  background.rect(-350, -200, 700, 400).fill({ color: 0x515151, alpha: 1 });
  container.addChild(background);

  // Create the particle system (no need for texture path now)
  particles = new ParticleSystem(1000);

  // Add a test particle
  particles.spawnParticle({
    x: 0,
    y: 0,
    size: 30,
    color: 0xffffff,
    alpha: 1,
    emoji: "🍎"
  });

  container.addChild(particles.container);
  resize();

  app.ticker.add((ticker) => {
    particles.update(ticker.deltaMS * 0.001);

    if(Math.random() < 0.05) {
      // Get a random emoji from our list
      const randomEmoji = fruitEmojis[Math.floor(Math.random() * fruitEmojis.length)];
      
      // Random color for variety
      const colors = [0xFFFFFF, 0xFF9999, 0x99FF99, 0x9999FF, 0xFFFF99, 0xFF99FF, 0x99FFFF];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      
      particles.spawnParticle({
        x: Math.random() * 700 - 350,
        y: -200,
        size: 20 + Math.random() * 20,
        color: randomColor,
        alpha: 1,
        speedX: Math.random() * 10 - 5,
        speedY: 100 + Math.random() * 50,
        emoji: randomEmoji
      });
    }
  });
}

// Function to handle window resize
function resize() {
    const scale = Math.min(
        window.innerWidth / 700,
        window.innerHeight / 400
    );

    console.log(scale);
    container.scale.set(scale);
		container.position.set(window.innerWidth / 2, window.innerHeight / 2);
}

// Add resize event listener
window.addEventListener('resize', resize);

setup();