import * as PIXI from 'pixi.js'
import ParticleSystem from './particles';
import { Player } from './player';

let app: PIXI.Application;
let container: PIXI.Container;
let particles: ParticleSystem;
let player1: Player;
let player2: Player;
let score1 = 0;
let score2 = 0;
let scoreText1: PIXI.Text;
let scoreText2: PIXI.Text;

// List of emojis to randomly use
const fruitEmojis = ["🍎", "🍐", "🍊", "🍋", "🍇", "🍓", "🫐"];

// Assign specific fruits to each player
const player1Fruit = "🍎"; // Red apple for player 1
const player2Fruit = "🍊"; // Banana for player 2

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

  // Create player 1
  player1 = new Player({
    x: -150,
    y: 150, // Place near bottom of screen
    speed: 200,
    width: 40,
    emoji: "👨‍🌾",
    basketEmoji: "🧺",
    color: 0xFF5555, // Reddish color
    controls: {
      left: "a",
      right: "d"
    }
  });
  
  // Create player 2
  player2 = new Player({
    x: 150,
    y: 150, // Place near bottom of screen
    speed: 200,
    width: 40,
    emoji: "👩‍🌾",
    basketEmoji: "🧺",
    color: 0xFFFF55, // Yellowish color
    controls: {
      left: "arrowleft",
      right: "arrowright"
    }
  });
  
  container.addChild(player1.container);
  container.addChild(player2.container);
  
  // Create score text for player 1
  scoreText1 = new PIXI.Text(`Player 1: 0 ${player1Fruit}`, {
    fontSize: 24,
    fill: 0xFF5555
  });
  scoreText1.x = -340;
  scoreText1.y = -190;
  container.addChild(scoreText1);
  
  // Create score text for player 2
  scoreText2 = new PIXI.Text(`Player 2: 0 ${player2Fruit}`, {
    fontSize: 24,
    fill: 0xFFFF55
  });
  scoreText2.x = 100;
  scoreText2.y = -190;
  container.addChild(scoreText2);

  // Instructions text
  const instructionsText = new PIXI.Text("Player 1: A/D keys | Player 2: ←/→ keys", {
    fontSize: 16,
    fill: 0xFFFFFF
  });
  instructionsText.x = -170;
  instructionsText.y = 180;
  container.addChild(instructionsText);

  resize();

  app.ticker.add((ticker) => {
    // Update players
    player1.update(ticker.deltaMS * 0.001);
    player2.update(ticker.deltaMS * 0.001);
    
    // Update particles
    particles.update(ticker.deltaMS * 0.001);

    // Spawn fruits
    if(Math.random() < 0.05) {
      // Get a random emoji from our list
      const randomEmoji = fruitEmojis[Math.floor(Math.random() * fruitEmojis.length)];
      
      const particle = particles.spawnParticle({
        x: Math.random() * 700 - 350,
        y: -200,
        size: 20,
        speedX: Math.random() * 10 - 5,
        speedY: 100 + Math.random() * 50,
        emoji: randomEmoji
      });
      
      if (particle) {
        // Store the original info in the particle for collision detection
        (particle as any).fruitData = {
          emoji: randomEmoji,
          size: 20
        };
      }
    }
    
    // Check for collisions with fruits for player 1
    checkPlayerFruitCollisions(player1, 1, player1Fruit);
    
    // Check for collisions with fruits for player 2
    checkPlayerFruitCollisions(player2, 2, player2Fruit);
  });
}

function checkPlayerFruitCollisions(player: Player, playerNumber: number, targetFruit: string) {
  for (const element of particles.particles) {
    const particle = element as any;
    if (particle?.fruitData) {
      if (player.checkFruitCollision(particle.x, particle.y, particle.fruitData.size)) {
        // Determine if it's the player's target fruit
        const isTargetFruit = particle.fruitData.emoji === targetFruit;
        
        // Update score
        if (isTargetFruit) {
          // Increase score for catching target fruit
          if (playerNumber === 1) {
            score1++;
            scoreText1.text = `Player 1: ${score1} ${player1Fruit}`;
          } else {
            score2++;
            scoreText2.text = `Player 2: ${score2} ${player2Fruit}`;
          }
          
          // Create a positive celebration effect
          createCelebrationEffect(particle.x, particle.y, 0x00FF00, "✨");
        } else {
          // Decrease score for catching wrong fruit
          if (playerNumber === 1) {
            score1--;
            scoreText1.text = `Player 1: ${score1} ${player1Fruit}`;
          } else {
            score2--;
            scoreText2.text = `Player 2: ${score2} ${player2Fruit}`;
          }
          
          // Create a negative effect
          createCelebrationEffect(particle.x, particle.y, 0xFF0000, "❌");
        }
        
        // Remove the fruit
        particles.removeParticle(particle);
        break; // Break after handling one collision
      }
    }
  }
}

function createCelebrationEffect(x: number, y: number, color: number, emoji: string) {
  for (let j = 0; j < 5; j++) {
    particles.spawnParticle({
      x: x,
      y: y,
      size: 15,
      color: color,
      alpha: 1,
      speedX: Math.random() * 50 - 25,
      speedY: Math.random() * -50 - 50,
      emoji: emoji,
      maxAge: 0.5
    });
  }
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