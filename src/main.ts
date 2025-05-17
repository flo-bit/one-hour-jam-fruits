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
let gameTime = 60; // 10 seconds game duration
let gameActive = false;
let timerInterval: number;
let gameInitialized = false;

// Audio elements
let backgroundMusic: HTMLAudioElement;
let pointSound: HTMLAudioElement;
let failSound: HTMLAudioElement;
let audioInitialized = false;

// List of emojis to randomly use
const fruitEmojis = ["🍎", "🍐", "🍊", "🍋"];

// Assign specific fruits to each player
const player1Fruit = "🍎"; // Red apple for player 1
const player2Fruit = "🍊"; // Orange for player 2

// Load audio files
function loadAudio() {
  // Only initialize once
  if (audioInitialized) return;
  
  console.log("Loading audio files...");
  
  // Get the base URL
  const baseUrl = import.meta.env.BASE_URL || '/';
  
  // Background music
  backgroundMusic = new Audio();
  backgroundMusic.src = `${baseUrl}jingle.m4a`;
  backgroundMusic.loop = true;
  backgroundMusic.volume = 0.5;
  
  // Point sound
  pointSound = new Audio();
  pointSound.src = `${baseUrl}point.m4a`;
  pointSound.volume = 0.7;
  
  // Fail sound
  failSound = new Audio();
  failSound.src = `${baseUrl}fail.m4a`;
  failSound.volume = 0.7;
  
  // Pre-load audio files
  backgroundMusic.load();
  pointSound.load();
  failSound.load();
  
  audioInitialized = true;
  
  console.log("Audio loaded successfully");
}

// Play a sound effect with better error handling
function playSound(sound: HTMLAudioElement) {
  if (!sound || !audioInitialized) return;
  
  // Create a clone to allow overlapping sounds
  const soundClone = sound.cloneNode() as HTMLAudioElement;
  
  // Play the sound with error handling
  const playPromise = soundClone.play();
  
  // Handle promise rejection (browsers may return a promise from play())
  if (playPromise !== undefined) {
    playPromise.catch(error => {
      console.error("Audio playback error:", error);
    });
  }
}

// Test audio to ensure it's working
function testAudio() {
  console.log("Testing audio...");
  
  // Create a test button to manually play sound
  const audioTestBtn = document.createElement('button');
  audioTestBtn.textContent = 'Test Audio';
  audioTestBtn.style.position = 'fixed';
  audioTestBtn.style.bottom = '10px';
  audioTestBtn.style.left = '10px';
  audioTestBtn.style.zIndex = '999';
  audioTestBtn.style.padding = '5px 10px';
  
  audioTestBtn.addEventListener('click', () => {
    console.log("Playing audio test...");
    if (pointSound) {
      pointSound.currentTime = 0;
      pointSound.play().catch(e => console.error("Point sound error:", e));
    }
    if (backgroundMusic) {
      backgroundMusic.currentTime = 0;
      backgroundMusic.play().catch(e => console.error("Music error:", e));
    }
  });
  
  document.body.appendChild(audioTestBtn);
}

// Create the main menu
function createMainMenu() {
  // Create menu container
  const menuContainer = document.createElement('div');
  menuContainer.id = 'main-menu';
  menuContainer.style.position = 'absolute';
  menuContainer.style.top = '0';
  menuContainer.style.left = '0';
  menuContainer.style.width = '100%';
  menuContainer.style.height = '100%';
  menuContainer.style.display = 'flex';
  menuContainer.style.flexDirection = 'column';
  menuContainer.style.justifyContent = 'center';
  menuContainer.style.alignItems = 'center';
  menuContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
  menuContainer.style.zIndex = '10';
  
  // Create title
  const title = document.createElement('h1');
  title.textContent = 'Fruit Catcher';
  title.style.color = '#FFFFFF';
  title.style.fontSize = '48px';
  title.style.marginBottom = '20px';
  title.style.fontFamily = 'Arial, sans-serif';
  
  // Create subtitle
  const subtitle = document.createElement('div');
  subtitle.style.color = '#FFFFFF';
  subtitle.style.fontSize = '24px';
  subtitle.style.marginBottom = '40px';
  subtitle.style.textAlign = 'center';
  subtitle.style.maxWidth = '600px';
  subtitle.style.lineHeight = '1.5';
  subtitle.innerHTML = `
    <div><span style="color:#FF5555;">Player 1:</span> Use A/D keys to catch ${player1Fruit}</div>
    <div><span style="color:#FFFF55;">Player 2:</span> Use Arrow keys to catch ${player2Fruit}</div>
    <div style="margin-top:10px;">Catch your fruit for +1 point, other fruits -1 point!</div>
  `;
  
  // Create start button
  const startButton = document.createElement('button');
  startButton.textContent = 'Start Game';
  startButton.style.padding = '15px 40px';
  startButton.style.fontSize = '24px';
  startButton.style.backgroundColor = '#4CAF50';
  startButton.style.color = 'white';
  startButton.style.border = 'none';
  startButton.style.borderRadius = '5px';
  startButton.style.cursor = 'pointer';
  startButton.style.transition = 'all 0.2s';
  
  // Hover effect
  startButton.addEventListener('mouseover', () => {
    startButton.style.backgroundColor = '#45a049';
    startButton.style.transform = 'scale(1.05)';
  });
  
  startButton.addEventListener('mouseout', () => {
    startButton.style.backgroundColor = '#4CAF50';
    startButton.style.transform = 'scale(1)';
  });
  
  // Click event to start the game
  startButton.addEventListener('click', () => {
    // Hide menu
    menuContainer.style.display = 'none';
    
    // Start background music - explicitly triggered by user action
    console.log("Attempting to start background music...");
    if (backgroundMusic) {
      backgroundMusic.currentTime = 0;
      backgroundMusic.play()
        .then(() => console.log("Background music started successfully"))
        .catch(error => console.error("Background music failed to start:", error));
    }
    
    // Start game
    if (!gameInitialized) {
      initializeGame();
    } else {
      resetGame();
    }
  });
  
  // Add elements to menu
  menuContainer.appendChild(title);
  menuContainer.appendChild(subtitle);
  menuContainer.appendChild(startButton);
  
  // Add menu to document
  document.body.appendChild(menuContainer);
}

// Create HTML UI elements
function createUIElements() {
  // Create score container
  const scoreContainer = document.createElement('div');
  scoreContainer.id = 'score-container';
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
  winnerContainer.style.zIndex = '20';
  
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
  gameActive = true;
  timerInterval = window.setInterval(() => {
    gameTime--;
    updateTimer();
    
    if (gameTime <= 0) {
      endGame();
    }
  }, 1000);
}

// Reset the game
function resetGame() {
  // Reset scores
  score1 = 0;
  score2 = 0;
  updateScores();
  
  // Reset timer
  gameTime = 10;
  updateTimer();
  
  // Reposition players
  player1.container.x = -150;
  player2.container.x = 150;
  
  // Clear any existing particles
  for (let i = particles.particles.length - 1; i >= 0; i--) {
    particles.removeParticle(particles.particles[i]);
  }
  
  // Restart the game
  startGameTimer();
}

// End the game and show the winner
function endGame() {
  gameActive = false;
  clearInterval(timerInterval);
  
  // Pause background music
  if (backgroundMusic) {
    backgroundMusic.pause();
  }
  
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
      winnerContainer.style.display = 'none';
      resetGame();
      
      // Restart background music
      if (backgroundMusic) {
        backgroundMusic.currentTime = 0;
        backgroundMusic.play().catch(e => console.error("Failed to restart music:", e));
      }
    });
    
    winnerContainer.appendChild(restartButton);
    
    // Add main menu button
    const menuButton = document.createElement('button');
    menuButton.textContent = 'Main Menu';
    menuButton.style.marginTop = '20px';
    menuButton.style.marginLeft = '10px';
    menuButton.style.padding = '10px 20px';
    menuButton.style.fontSize = '20px';
    menuButton.style.backgroundColor = '#3498db';
    menuButton.style.border = 'none';
    menuButton.style.borderRadius = '5px';
    menuButton.style.color = 'white';
    menuButton.style.cursor = 'pointer';
    
    menuButton.addEventListener('click', () => {
      winnerContainer.style.display = 'none';
      const menuElement = document.getElementById('main-menu');
      if (menuElement) menuElement.style.display = 'flex';
    });
    
    winnerContainer.appendChild(menuButton);
  }
}

async function initializeGame() {
  gameInitialized = true;
  
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
  
  // Get the base URL for assets
  const baseUrl = import.meta.env.BASE_URL || '/';
  
  // Load tree texture
  const treeTexture = await PIXI.Assets.load(`${baseUrl}tree.png`);
  
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
          
          // Play point sound
          playSound(pointSound);
          
          // Create a positive celebration effect
          createCelebrationEffect(particle.x, particle.y, 0x00FF00, "✨");
        } else {
          // Decrease score for catching wrong fruit
          if (playerNumber === 1) {
            score1--;
          } else {
            score2--;
          }
          
          // Play fail sound
          playSound(failSound);
          
          // Create a negative effect
          createCelebrationEffect(particle.x, particle.y, 0xFF0000, "❌");
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
  for (let j = 0; j < 3; j++) {
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

// Initialize the application
async function setup() {
  // Load audio files
  loadAudio();
  
  // Add test audio button
  testAudio();
  
  // Create the main menu
  createMainMenu();
}

setup();