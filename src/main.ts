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

// List of emojis to randomly use
const fruitEmojis = ["🍎", "🍐", "🍊", "🍋"];

// Assign specific fruits to each player
const player1Fruit = "🍎"; // Red apple for player 1
const player2Fruit = "🍊"; // Orange for player 2

// Create HTML score elements
function createScoreElements() {
  // Create score container
  const scoreContainer = document.createElement('div');
  scoreContainer.style.position = 'absolute';
  scoreContainer.style.top = '10px';
  scoreContainer.style.left = '0';
  scoreContainer.style.width = '100%';
  scoreContainer.style.display = 'flex';
  scoreContainer.style.justifyContent = 'space-between';
  scoreContainer.style.padding = '0 20px';
  scoreContainer.style.boxSizing = 'border-box';
  scoreContainer.style.pointerEvents = 'none';
  scoreContainer.style.fontFamily = 'Arial, sans-serif';
  scoreContainer.style.fontSize = '24px';
  scoreContainer.style.fontWeight = 'bold';
  
  // Create player 1 score
  const p1Score = document.createElement('div');
  p1Score.id = 'player1-score';
  p1Score.style.color = '#FF5555';
  p1Score.textContent = `Player 1: 0`;
  
  // Create player 2 score
  const p2Score = document.createElement('div');
  p2Score.id = 'player2-score';
  p2Score.style.color = '#FFFF55';
  p2Score.textContent = `Player 2: 0`;
  
  // Add scores to container
  scoreContainer.appendChild(p1Score);
  scoreContainer.appendChild(p2Score);
  
  // Add container to document
  document.body.appendChild(scoreContainer);
}

// Update score displays
function updateScores() {
  const p1ScoreElement = document.getElementById('player1-score');
  const p2ScoreElement = document.getElementById('player2-score');
  
  if (p1ScoreElement) p1ScoreElement.textContent = `Player 1: ${score1}`;
  if (p2ScoreElement) p2ScoreElement.textContent = `Player 2: ${score2}`;
}

async function setup() {
  // Create score elements
  createScoreElements();
  
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
  
  // Add target fruit indicators next to players
  const player1FruitText = new PIXI.Text(player1Fruit, {
    fontSize: 24
  });
  player1FruitText.anchor.set(0.5);
  player1FruitText.x = -30;
  player1FruitText.y = -20;
  player1.container.addChild(player1FruitText);
  
  const player2FruitText = new PIXI.Text(player2Fruit, {
    fontSize: 24
  });
  player2FruitText.anchor.set(0.5);
  player2FruitText.x = -30;
  player2FruitText.y = -20;
  player2.container.addChild(player2FruitText);
  
  container.addChild(player1.container);
  container.addChild(player2.container);
  
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
        speedX: Math.random() * 50 - 25,
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
          } else {
            score2++;
          }
          
          // Create a positive celebration effect
          // createCelebrationEffect(particle.x, particle.y, 0x00FF00, "✨");
        } else {
          // Decrease score for catching wrong fruit
          if (playerNumber === 1) {
            score1--;
          } else {
            score2--;
          }
          
          // Create a negative effect
          // createCelebrationEffect(particle.x, particle.y, 0xFF0000, "❌");
        }
        
        // Update HTML score display
        updateScores();
        
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