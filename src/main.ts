import * as PIXI from 'pixi.js'
import ParticleSystem from './particles';
import { Player } from './player';

let app: PIXI.Application;
let container: PIXI.Container;
let particles: ParticleSystem;
let player: Player;
let score = 0;
let scoreText: PIXI.Text;

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

  // Add the container to the stage
  app.stage.addChild(container);

  // add background
  const background = new PIXI.Graphics();
  background.rect(-350, -200, 700, 400).fill({ color: 0x515151, alpha: 1 });
  container.addChild(background);

  // Create the particle system
  particles = new ParticleSystem(1000);
  container.addChild(particles.container);

  // Create player
  player = new Player({
    x: 0,
    y: 150, // Place near bottom of screen
    speed: 200,
    width: 40,
    emoji: "👨‍🌾",
    basketEmoji: "🧺",
    color: 0xFFFFFF,
    controls: {
      left: "a",
      right: "d"
    }
  });
  
  container.addChild(player.container);
  
  // Create score text
  scoreText = new PIXI.Text("Score: 0", {
    fontSize: 24,
    fill: 0xFFFFFF
  });
  scoreText.x = -340;
  scoreText.y = -190;
  container.addChild(scoreText);

  resize();

  app.ticker.add((ticker) => {
    // Update player
    player.update(ticker.deltaMS * 0.001);
    
    // Update particles
    particles.update(ticker.deltaMS * 0.001);

    // Spawn fruits
    if(Math.random() < 0.05) {
      // Get a random emoji from our list
      const randomEmoji = fruitEmojis[Math.floor(Math.random() * fruitEmojis.length)];
      
      // Random color for variety
      const colors = [0xFFFFFF, 0xFF9999, 0x99FF99, 0x9999FF, 0xFFFF99, 0xFF99FF, 0x99FFFF];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      
      const size = 20 + Math.random() * 20;
      
      const particle = particles.spawnParticle({
        x: Math.random() * 700 - 350,
        y: -200,
        size: size,
        color: randomColor,
        alpha: 1,
        speedX: Math.random() * 10 - 5,
        speedY: 100 + Math.random() * 50,
        emoji: randomEmoji
      });
      
      if (particle) {
        // Store the original info in the particle for collision detection
        (particle as any).fruitData = {
          emoji: randomEmoji,
          size: size
        };
      }
    }
    
    // Check for collisions with fruits
    for (let i = 0; i < particles.particles.length; i++) {
      const particle = particles.particles[i] as any;
      if (particle && particle.fruitData) {
        if (player.checkFruitCollision(particle.x, particle.y, particle.fruitData.size)) {
          // Fruit caught!
          score++;
          scoreText.text = `Score: ${score}`;
          
          // Remove the fruit
          particles.removeParticle(particle);
          
          // Create a small celebration effect
          for (let j = 0; j < 5; j++) {
            particles.spawnParticle({
              x: particle.x,
              y: particle.y,
              size: 15,
              color: 0xFFFF00,
              alpha: 1,
              speedX: Math.random() * 50 - 25,
              speedY: Math.random() * -50 - 50,
              emoji: "✨",
              maxAge: 0.5
            });
          }
        }
      }
    }
  });
}

// Function to handle window resize
function resize() {
    const scale = Math.min(
        window.innerWidth / 700,
        window.innerHeight / 400
    );

    container.scale.set(scale);
    container.position.set(window.innerWidth / 2, window.innerHeight / 2);
}

// Add resize event listener
window.addEventListener('resize', resize);

setup();