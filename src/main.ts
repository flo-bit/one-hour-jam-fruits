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

// Game state
let gameTime = 10; // 60 seconds game duration
let gameActive = true;
let timerInterval: number;

// List of emojis to randomly use
const fruitEmojis = ["🍎", "🍐", "🍊", "🍋"];

// Assign specific fruits to each player
const player1Fruit = "🍎"; // Red apple for player 1
const player2Fruit = "🍊"; // Orange for player 2

// Create HTML UI elements
function createUIElements() {
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
  
  // Create timer
  const timer = document.createElement('div');
  timer.id = 'game-timer';
  timer.style.color = '#FFFFFF';
  timer.textContent = `Time: ${gameTime}`;
  
  // Create player 2 score
  const p2Score = document.createElement('div');
  p2Score.id = 'player2-score';
  p2Score.style.color = '#FFFF55';
  p2Score.textContent = `Player 2: 0`;
  
  // Add elements to container
  scoreContainer.appendChild(p1Score);
  scoreContainer.appendChild(timer);
  scoreContainer.appendChild(p2Score);
  
  // Add container to document
  document.body.appendChild(scoreContainer);
  
  // Create winner announcement container (hidden initially)
  const winnerContainer = document.createElement('div');
  winnerContainer.id = 'winner-container';
  winnerContainer.style.position = 'absolute';
  winnerContainer.style.top = '50%';
  winnerContainer.style.left = '50%';
  winnerContainer.style.transform = 'translate(-50%, -50%)';
  winnerContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
  winnerContainer.style.color = '#FFFFFF';
  winnerContainer.style.padding = '20px 40px';
  winnerContainer.style.borderRadius = '10px';
  winnerContainer.style.fontSize = '36px';
  winnerContainer.style.fontWeight = 'bold';
  winnerContainer.style.textAlign = 'center';
  winnerContainer.style.display = 'none';
  
  document.body.appendChild(winnerContainer);
}

// Update score displays
function updateScores() {
  const p1ScoreElement = document.getElementById('player1-score');
  const p2ScoreElement = document.getElementById('player2-score');
  
  if (p1ScoreElement) p1ScoreElement.textContent = `Player 1: ${score1}`;
  if (p2ScoreElement) p2ScoreElement.textContent = `Player 2: ${score2}`;
}

// Update timer display
function updateTimer() {
  const timerElement = document.getElementById('game-timer');
  
  if (timerElement) timerElement.textContent = `Time: ${gameTime}`;
}

// Start game timer
function startGameTimer() {
  timerInterval = window.setInterval(() => {
    gameTime--;
    updateTimer();
    
    if (gameTime <= 0) {
      endGame();
    }
  }, 1000);
}

// End the game and show the winner
function endGame() {
  gameActive = false;
  clearInterval(timerInterval);
  
  const winnerContainer = document.getElementById('winner-container');
  if (winnerContainer) {
    let message;
    
    if (score1 > score2) {
      message = 'Player 1 Wins! 🎉';
      winnerContainer.style.color = '#FF5555';
    } else if (score2 > score1) {
      message = 'Player 2 Wins! 🎉';
      winnerContainer.style.color = '#FFFF55';
    } else {
      message = "It's a Tie!";
      winnerContainer.style.color = '#FFFFFF';
    }
    
    winnerContainer.textContent = message;
    winnerContainer.style.display = 'block';
    
    // Add restart button
    const restartButton = document.createElement('button');
    restartButton.textContent = 'Play Again';
    restartButton.style.marginTop = '20px';
    restartButton.style.padding = '10px 20px';
    restartButton.style.fontSize = '20px';
    restartButton.style.backgroundColor = '#4CAF50';
    restartButton.style.border = 'none';
    restartButton.style.borderRadius = '5px';
    restartButton.style.color = 'white';
    restartButton.style.cursor = 'pointer';
    
    restartButton.addEventListener('click', () => {
      location.reload();
    });
    
    winnerContainer.appendChild(restartButton);
  }
}

async function setup() {
  // Create UI elements
  createUIElements();
  
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
  
  // Load tree texture
  const treeTexture = await PIXI.Assets.load('tree.png');
  
  // Create and position trees
  const trees = [];
  const treeCount = 15;
  const treeWidth = 300; // Adjust based on your tree image size
  const totalWidth = treeWidth * treeCount * 0.5;
  const startX = -totalWidth / 2;
  
  for (let i = 0; i < treeCount; i++) {
    const tree = new PIXI.Sprite(treeTexture);
    tree.width = treeWidth;
    tree.height = 400; // Adjust based on your tree image size
    tree.x = startX + i * treeWidth * 0.5;
    tree.y = 200; // Position trees at ground level
    tree.anchor.set(0.5, 1); // Set anchor to bottom-center
    trees.push(tree);
    container.addChild(tree);
  }

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

  resize();
  
  // Start game timer
  startGameTimer();

  app.ticker.add((ticker) => {
    if (!gameActive) return;
    
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