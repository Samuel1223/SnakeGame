document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded");
    
    // Force remove loading screen - multiple approaches
    try {
        // Direct style manipulation
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
            loadingScreen.style.visibility = 'hidden';
            loadingScreen.style.opacity = '0';
            console.log("Loading screen hidden by style");
        }
        
        // Try removing it from DOM
        if (loadingScreen && loadingScreen.parentNode) {
            loadingScreen.parentNode.removeChild(loadingScreen);
            console.log("Loading screen removed from DOM");
        }
        
        // Style injection approach
        const style = document.createElement('style');
        style.textContent = '.loading-screen { display: none !important; visibility: hidden !important; }';
        document.head.appendChild(style);
        console.log("Style injected to hide loading screen");
        
        // Try to fix by class manipulation
        document.querySelectorAll('.loading-screen').forEach(el => {
            el.classList.add('hidden');
            el.style.display = 'none';
            console.log("Loading screen class updated");
        });
    } catch(e) {
        console.error("Error hiding loading screen:", e);
    }
    
    // Check if canvas exists
    const canvas = document.getElementById('game-canvas');
    if (!canvas) {
        console.error("Canvas not found!");
        alert("Game canvas not found! Please check your HTML.");
        return;
    }
    
    console.log("Canvas dimensions:", canvas.width, "x", canvas.height);
    
    const ctx = canvas.getContext('2d');
    const scoreDisplay = document.getElementById('score-display');
    const lengthStat = document.getElementById('length-stat');
    const speedStat = document.getElementById('speed-stat');
    const timeStat = document.getElementById('time-stat');
    const finalScoreDisplay = document.getElementById('final-score');
    const gameOverModal = document.getElementById('game-over-modal');
    const startButton = document.getElementById('start-button');
    const pauseButton = document.getElementById('pause-button');
    const restartButton = document.getElementById('restart-button');
    const saveScoreButton = document.getElementById('save-score-button');
    const playerNameInput = document.getElementById('player-name');
    const scoresList = document.getElementById('scores-list');
    const closeModalButton = document.getElementById('close-modal');
    const difficultySelect = document.getElementById('difficulty-select');
    const themeSelect = document.getElementById('theme-select');
    const soundToggle = document.getElementById('sound-toggle');
    const obstaclesToggle = document.getElementById('obstacles-toggle');
    const saveSettingsButton = document.getElementById('save-settings');
    const loadingProgress = document.getElementById('loading-progress');
    
    // Game constants
    const GRID_SIZE = 20;
    const GRID_WIDTH = canvas.width / GRID_SIZE;
    const GRID_HEIGHT = canvas.height / GRID_SIZE;
    
    // Game state
    let snake = [];
    let food = {};
    let powerUps = [];
    let obstacles = [];
    let direction = 'right';
    let nextDirection = 'right';
    let score = 0;
    let gameRunning = false;
    let gamePaused = false;
    
    // Initialize game for immediate display
    snake = [
        {x: 5, y: 5},
        {x: 4, y: 5},
        {x: 3, y: 5}
    ];
    
    food = {
        x: 10,
        y: 10
    };
    
    // Draw initial game state
    drawGame();
    
    // Function to draw the game
    function drawGame() {
        console.log("Drawing game");
        // Clear canvas
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw grid
        ctx.strokeStyle = 'rgba(50, 50, 50, 0.5)';
        ctx.lineWidth = 0.5;
        
        for (let x = 0; x <= canvas.width; x += GRID_SIZE) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        
        for (let y = 0; y <= canvas.height; y += GRID_SIZE) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
        
        // Draw food
        ctx.fillStyle = '#FF5722';
        ctx.beginPath();
        ctx.arc(
            food.x * GRID_SIZE + GRID_SIZE/2,
            food.y * GRID_SIZE + GRID_SIZE/2,
            GRID_SIZE/2,
            0,
            Math.PI * 2
        );
        ctx.fill();
        
        // Draw snake
        ctx.fillStyle = '#4CAF50';
        for (let part of snake) {
            ctx.fillRect(
                part.x * GRID_SIZE,
                part.y * GRID_SIZE,
                GRID_SIZE - 1,
                GRID_SIZE - 1
            );
        }
        
        // Draw snake head with different color
        ctx.fillStyle = '#2E7D32';
        ctx.fillRect(
            snake[0].x * GRID_SIZE,
            snake[0].y * GRID_SIZE,
            GRID_SIZE - 1,
            GRID_SIZE - 1
        );
    }
    
    // Start button event listener
    startButton.addEventListener('click', function() {
        console.log("Start button clicked");
        startGame();
    });
    
    // Simple game start function
    function startGame() {
        console.log("Game started");
        // Reset game state
        snake = [
            {x: 5, y: 5},
            {x: 4, y: 5},
            {x: 3, y: 5}
        ];
        
        direction = 'right';
        nextDirection = 'right';
        score = 0;
        
        // Update UI
        scoreDisplay.textContent = score;
        
        // Place initial food
        placeFood();
        
        // Start game loop
        gameRunning = true;
        gamePaused = false;
        
        setInterval(gameLoop, 150);
    }
    
    // Simple game loop
    function gameLoop() {
        if (!gameRunning || gamePaused) return;
        
        // Update direction
        direction = nextDirection;
        
        // Move snake
        moveSnake();
        
        // Check collisions
        if (checkCollision()) {
            gameRunning = false;
            return;
        }
        
        // Check if food eaten
        if (snake[0].x === food.x && snake[0].y === food.y) {
            // Don't remove tail (snake grows)
            score += 10;
            scoreDisplay.textContent = score;
            placeFood();
        } else {
            // Remove tail
            snake.pop();
        }
        
        // Draw everything
        drawGame();
    }
    
    // Move the snake
    function moveSnake() {
        const head = {x: snake[0].x, y: snake[0].y};
        
        switch (direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }
        
        snake.unshift(head);
    }
    
    // Check for collisions
    function checkCollision() {
        const head = snake[0];
        
        // Wall collision
        if (head.x < 0 || head.x >= GRID_WIDTH || head.y < 0 || head.y >= GRID_HEIGHT) {
            return true;
        }
        
        // Self collision (start from index 1 to skip head)
        for (let i = 1; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                return true;
            }
        }
        
        return false;
    }
    
    // Place food at random position
    function placeFood() {
        food = {
            x: Math.floor(Math.random() * GRID_WIDTH),
            y: Math.floor(Math.random() * GRID_HEIGHT)
        };
    }
    
    // Keyboard controls
    document.addEventListener('keydown', function(event) {
        switch (event.key) {
            case 'ArrowUp':
                if (direction !== 'down') nextDirection = 'up';
                break;
            case 'ArrowDown':
                if (direction !== 'up') nextDirection = 'down';
                break;
            case 'ArrowLeft':
                if (direction !== 'right') nextDirection = 'left';
                break;
            case 'ArrowRight':
                if (direction !== 'left') nextDirection = 'right';
                break;
        }
    });
}); 