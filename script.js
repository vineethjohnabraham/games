class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Game settings
        this.gridSize = 20;
        this.gridWidth = this.canvas.width / this.gridSize;
        this.gridHeight = this.canvas.height / this.gridSize;
        
        // Game state
        this.gameRunning = false;
        this.gamePaused = false;
        this.playerName = '';
        this.speedLevel = 1;
        this.score = 0;
        this.gameLoop = null;
        
        // Snake
        this.snake = [{ x: 10, y: 10 }];
        this.direction = { x: 1, y: 0 };
        this.snakePath = []; // For killer to follow
        
        // Game objects
        this.gem = null;
        this.obstacles = [];
        this.killer = null;
        this.gemBlink = true;
        this.blinkTimer = 0;
        
        this.initializeEventListeners();
        this.generateGem();
        this.generateObstacles();
        this.initializeKiller();
    }
    
    initializeEventListeners() {
        // Welcome screen
        document.getElementById('start-game').addEventListener('click', () => this.startGame());
        
        // Game controls
        document.getElementById('pause-game').addEventListener('click', () => this.togglePause());
        document.getElementById('restart-game').addEventListener('click', () => this.restartGame());
        
        // Game over screen
        document.getElementById('play-again').addEventListener('click', () => this.playAgain());
        document.getElementById('new-player').addEventListener('click', () => this.newPlayer());
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // Prevent player name input from triggering game controls
        document.getElementById('player-name').addEventListener('keydown', (e) => {
            e.stopPropagation();
        });
    }
    
    handleKeyPress(e) {
        if (!this.gameRunning || this.gamePaused) return;
        
        const key = e.key.toLowerCase();
        
        // Arrow keys and WASD
        switch (key) {
            case 'arrowup':
            case 'w':
                if (this.direction.y !== 1) this.direction = { x: 0, y: -1 };
                break;
            case 'arrowdown':
            case 's':
                if (this.direction.y !== -1) this.direction = { x: 0, y: 1 };
                break;
            case 'arrowleft':
            case 'a':
                if (this.direction.x !== 1) this.direction = { x: -1, y: 0 };
                break;
            case 'arrowright':
            case 'd':
                if (this.direction.x !== -1) this.direction = { x: 1, y: 0 };
                break;
        }
    }
    
    startGame() {
        const nameInput = document.getElementById('player-name').value.trim();
        if (!nameInput) {
            alert('Please enter your name!');
            return;
        }
        
        this.playerName = nameInput;
        this.speedLevel = parseInt(document.getElementById('speed-level').value);
        
        // Update UI
        document.getElementById('display-name').textContent = this.playerName;
        document.getElementById('display-speed').textContent = this.speedLevel;
        
        // Switch screens
        document.getElementById('welcome-screen').classList.add('hidden');
        document.getElementById('game-screen').classList.remove('hidden');
        
        this.resetGame();
        this.gameRunning = true;
        this.startGameLoop();
    }
    
    resetGame() {
        this.snake = [{ x: 10, y: 10 }];
        this.direction = { x: 1, y: 0 };
        this.snakePath = [];
        this.score = 0;
        this.gamePaused = false;
        
        this.updateScore();
        this.generateGem();
        this.generateObstacles();
        this.initializeKiller();
    }
    
    startGameLoop() {
        const speeds = { 1: 150, 2: 100, 3: 50 }; // milliseconds
        const interval = speeds[this.speedLevel];
        
        this.gameLoop = setInterval(() => {
            if (!this.gamePaused) {
                this.update();
                this.render();
            }
        }, interval);
    }
    
    update() {
        // Store current head position for killer's path
        this.snakePath.push({ ...this.snake[0] });
        
        // Move snake
        const head = { ...this.snake[0] };
        head.x += this.direction.x;
        head.y += this.direction.y;
        
        // Wrap around borders
        head.x = (head.x + this.gridWidth) % this.gridWidth;
        head.y = (head.y + this.gridHeight) % this.gridHeight;
        
        this.snake.unshift(head);
        
        // Check gem collision
        if (head.x === this.gem.x && head.y === this.gem.y) {
            this.score++;
            this.updateScore();
            this.generateGem();
            this.regenerateObstacles(); // Move obstacles when gem is eaten
        } else {
            this.snake.pop();
        }
        
        // Update killer
        this.updateKiller();
        
        // Check collisions
        if (this.checkCollisions()) {
            this.gameOver();
        }
        
        // Update gem blink
        this.blinkTimer++;
        if (this.blinkTimer >= 10) { // Blink every ~10 frames
            this.gemBlink = !this.gemBlink;
            this.blinkTimer = 0;
        }
    }
    
    updateKiller() {
        if (this.snakePath.length > 10) { // Give snake a head start
            const targetPosition = this.snakePath.shift(); // Follow exact path
            if (targetPosition) {
                this.killer = targetPosition;
            }
        }
    }
    
    checkCollisions() {
        const head = this.snake[0];
        
        // Check self collision
        for (let i = 1; i < this.snake.length; i++) {
            if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
                return true;
            }
        }
        
        // Check obstacle collision
        for (const obstacle of this.obstacles) {
            if (head.x === obstacle.x && head.y === obstacle.y) {
                return true;
            }
        }
        
        // Check killer collision
        if (this.killer && head.x === this.killer.x && head.y === this.killer.y) {
            return true;
        }
        
        return false;
    }
    
    generateGem() {
        let validPosition = false;
        let newGem;
        
        while (!validPosition) {
            newGem = {
                x: Math.floor(Math.random() * this.gridWidth),
                y: Math.floor(Math.random() * this.gridHeight)
            };
            
            // Check if position is clear
            validPosition = true;
            
            // Check snake
            for (const segment of this.snake) {
                if (newGem.x === segment.x && newGem.y === segment.y) {
                    validPosition = false;
                    break;
                }
            }
            
            // Check obstacles
            if (validPosition) {
                for (const obstacle of this.obstacles) {
                    if (newGem.x === obstacle.x && newGem.y === obstacle.y) {
                        validPosition = false;
                        break;
                    }
                }
            }
            
            // Check killer
            if (validPosition && this.killer) {
                if (newGem.x === this.killer.x && newGem.y === this.killer.y) {
                    validPosition = false;
                }
            }
        }
        
        this.gem = newGem;
    }
    
    generateObstacles() {
        this.obstacles = [];
        for (let i = 0; i < 2; i++) {
            this.generateSingleObstacle();
        }
    }
    
    regenerateObstacles() {
        this.obstacles = [];
        for (let i = 0; i < 2; i++) {
            this.generateSingleObstacle();
        }
    }
    
    generateSingleObstacle() {
        let validPosition = false;
        let obstacle;
        
        while (!validPosition) {
            // Generate 2x2 obstacle
            obstacle = {
                x: Math.floor(Math.random() * (this.gridWidth - 1)),
                y: Math.floor(Math.random() * (this.gridHeight - 1))
            };
            
            validPosition = true;
            
            // Check all 4 positions of the 2x2 obstacle
            for (let dx = 0; dx < 2; dx++) {
                for (let dy = 0; dy < 2; dy++) {
                    const checkX = obstacle.x + dx;
                    const checkY = obstacle.y + dy;
                    
                    // Check snake
                    for (const segment of this.snake) {
                        if (checkX === segment.x && checkY === segment.y) {
                            validPosition = false;
                            break;
                        }
                    }
                    
                    // Check gem
                    if (validPosition && this.gem) {
                        if (checkX === this.gem.x && checkY === this.gem.y) {
                            validPosition = false;
                            break;
                        }
                    }
                    
                    // Check existing obstacles
                    if (validPosition) {
                        for (const existingObstacle of this.obstacles) {
                            for (let ex = 0; ex < 2; ex++) {
                                for (let ey = 0; ey < 2; ey++) {
                                    if (checkX === existingObstacle.x + ex && checkY === existingObstacle.y + ey) {
                                        validPosition = false;
                                        break;
                                    }
                                }
                                if (!validPosition) break;
                            }
                            if (!validPosition) break;
                        }
                    }
                    
                    if (!validPosition) break;
                }
                if (!validPosition) break;
            }
        }
        
        this.obstacles.push(obstacle);
    }
    
    initializeKiller() {
        this.killer = null;
        this.snakePath = [];
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid lines (subtle)
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 1;
        for (let i = 0; i <= this.gridWidth; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.gridSize, 0);
            this.ctx.lineTo(i * this.gridSize, this.canvas.height);
            this.ctx.stroke();
        }
        for (let i = 0; i <= this.gridHeight; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.gridSize);
            this.ctx.lineTo(this.canvas.width, i * this.gridSize);
            this.ctx.stroke();
        }
        
        // Draw snake
        this.ctx.fillStyle = '#4CAF50';
        for (let i = 0; i < this.snake.length; i++) {
            const segment = this.snake[i];
            // Head is slightly different color
            if (i === 0) {
                this.ctx.fillStyle = '#66BB6A';
            } else {
                this.ctx.fillStyle = '#4CAF50';
            }
            this.ctx.fillRect(
                segment.x * this.gridSize + 1,
                segment.y * this.gridSize + 1,
                this.gridSize - 2,
                this.gridSize - 2
            );
        }
        
        // Draw gem (blinking)
        if (this.gemBlink && this.gem) {
            this.ctx.fillStyle = '#00FF00';
            this.ctx.fillRect(
                this.gem.x * this.gridSize + 2,
                this.gem.y * this.gridSize + 2,
                this.gridSize - 4,
                this.gridSize - 4
            );
            
            // Add gem glow effect
            this.ctx.shadowColor = '#00FF00';
            this.ctx.shadowBlur = 10;
            this.ctx.fillRect(
                this.gem.x * this.gridSize + 4,
                this.gem.y * this.gridSize + 4,
                this.gridSize - 8,
                this.gridSize - 8
            );
            this.ctx.shadowBlur = 0;
        }
        
        // Draw obstacles (2x2 red squares)
        this.ctx.fillStyle = '#F44336';
        for (const obstacle of this.obstacles) {
            this.ctx.fillRect(
                obstacle.x * this.gridSize + 1,
                obstacle.y * this.gridSize + 1,
                (this.gridSize * 2) - 2,
                (this.gridSize * 2) - 2
            );
        }
        
        // Draw killer
        if (this.killer) {
            this.ctx.fillStyle = '#FF5722';
            this.ctx.fillRect(
                this.killer.x * this.gridSize + 1,
                this.killer.y * this.gridSize + 1,
                this.gridSize - 2,
                this.gridSize - 2
            );
            
            // Add killer glow effect
            this.ctx.shadowColor = '#FF5722';
            this.ctx.shadowBlur = 15;
            this.ctx.fillRect(
                this.killer.x * this.gridSize + 3,
                this.killer.y * this.gridSize + 3,
                this.gridSize - 6,
                this.gridSize - 6
            );
            this.ctx.shadowBlur = 0;
        }
    }
    
    updateScore() {
        document.getElementById('score').textContent = this.score;
    }
    
    togglePause() {
        this.gamePaused = !this.gamePaused;
        document.getElementById('pause-game').textContent = this.gamePaused ? 'Resume' : 'Pause';
    }
    
    restartGame() {
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
        }
        this.resetGame();
        this.startGameLoop();
    }
    
    gameOver() {
        this.gameRunning = false;
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
        }
        
        // Update game over screen
        document.getElementById('final-name').textContent = this.playerName;
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('final-speed').textContent = this.speedLevel;
        
        // Switch screens
        document.getElementById('game-screen').classList.add('hidden');
        document.getElementById('game-over-screen').classList.remove('hidden');
    }
    
    playAgain() {
        document.getElementById('game-over-screen').classList.add('hidden');
        document.getElementById('game-screen').classList.remove('hidden');
        this.resetGame();
        this.gameRunning = true;
        this.startGameLoop();
    }
    
    newPlayer() {
        document.getElementById('game-over-screen').classList.add('hidden');
        document.getElementById('welcome-screen').classList.remove('hidden');
        document.getElementById('player-name').value = '';
        document.getElementById('speed-level').value = '1';
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    const game = new SnakeGame();
});
