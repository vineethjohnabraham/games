class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Add roundRect support if not available
        if (!this.ctx.roundRect) {
            this.ctx.roundRect = function(x, y, width, height, radius) {
                this.beginPath();
                this.moveTo(x + radius, y);
                this.lineTo(x + width - radius, y);
                this.quadraticCurveTo(x + width, y, x + width, y + radius);
                this.lineTo(x + width, y + height - radius);
                this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
                this.lineTo(x + radius, y + height);
                this.quadraticCurveTo(x, y + height, x, y + height - radius);
                this.lineTo(x, y + radius);
                this.quadraticCurveTo(x, y, x + radius, y);
                this.closePath();
            };
        }
        
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
        
        // Check obstacle collision (check all 4 positions of 2x2 obstacles)
        for (const obstacle of this.obstacles) {
            for (let dx = 0; dx < 2; dx++) {
                for (let dy = 0; dy < 2; dy++) {
                    if (head.x === obstacle.x + dx && head.y === obstacle.y + dy) {
                        console.log(`Game Over: Snake hit obstacle at (${obstacle.x + dx}, ${obstacle.y + dy})`);
                        return true;
                    }
                }
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
            
            // Check obstacles (check all 4 positions of 2x2 obstacles)
            if (validPosition) {
                for (const obstacle of this.obstacles) {
                    for (let dx = 0; dx < 2; dx++) {
                        for (let dy = 0; dy < 2; dy++) {
                            if (newGem.x === obstacle.x + dx && newGem.y === obstacle.y + dy) {
                                validPosition = false;
                                break;
                            }
                        }
                        if (!validPosition) break;
                    }
                    if (!validPosition) break;
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
            // Generate 2x2 obstacle with random color
            const colors = ['#F44336', '#FFCDD2']; // Dark red and light red
            obstacle = {
                x: Math.floor(Math.random() * (this.gridWidth - 1)),
                y: Math.floor(Math.random() * (this.gridHeight - 1)),
                color: colors[Math.floor(Math.random() * colors.length)]
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
        
        // Draw snake with proper snake appearance
        for (let i = 0; i < this.snake.length; i++) {
            const segment = this.snake[i];
            const x = segment.x * this.gridSize;
            const y = segment.y * this.gridSize;
            
            if (i === 0) {
                // Draw snake head (rounded with eyes and tongue)
                this.ctx.fillStyle = '#66BB6A';
                this.ctx.beginPath();
                this.ctx.roundRect(x + 2, y + 2, this.gridSize - 4, this.gridSize - 4, 8);
                this.ctx.fill();
                
                // Draw eyes
                this.ctx.fillStyle = '#000';
                this.ctx.beginPath();
                this.ctx.arc(x + 6, y + 6, 2, 0, 2 * Math.PI);
                this.ctx.fill();
                this.ctx.beginPath();
                this.ctx.arc(x + this.gridSize - 6, y + 6, 2, 0, 2 * Math.PI);
                this.ctx.fill();
                
                // Draw tongue (if moving forward)
                if (this.direction.x === 1) {
                    this.ctx.strokeStyle = '#FF0000';
                    this.ctx.lineWidth = 2;
                    this.ctx.beginPath();
                    this.ctx.moveTo(x + this.gridSize - 2, y + this.gridSize / 2);
                    this.ctx.lineTo(x + this.gridSize + 3, y + this.gridSize / 2 - 2);
                    this.ctx.moveTo(x + this.gridSize - 2, y + this.gridSize / 2);
                    this.ctx.lineTo(x + this.gridSize + 3, y + this.gridSize / 2 + 2);
                    this.ctx.stroke();
                }
            } else {
                // Draw body segments (oval/rounded with scales pattern)
                const isEven = i % 2 === 0;
                this.ctx.fillStyle = isEven ? '#4CAF50' : '#388E3C';
                
                // Main body segment
                this.ctx.beginPath();
                this.ctx.roundRect(x + 3, y + 3, this.gridSize - 6, this.gridSize - 6, 6);
                this.ctx.fill();
                
                // Add scale pattern
                this.ctx.fillStyle = isEven ? '#388E3C' : '#2E7D32';
                this.ctx.beginPath();
                this.ctx.arc(x + this.gridSize / 2, y + this.gridSize / 2, 3, 0, 2 * Math.PI);
                this.ctx.fill();
                
                // Add smaller scale dots
                this.ctx.fillStyle = isEven ? '#2E7D32' : '#1B5E20';
                this.ctx.beginPath();
                this.ctx.arc(x + 6, y + 6, 1, 0, 2 * Math.PI);
                this.ctx.fill();
                this.ctx.beginPath();
                this.ctx.arc(x + this.gridSize - 6, y + this.gridSize - 6, 1, 0, 2 * Math.PI);
                this.ctx.fill();
            }
        }
        
        // Draw gem (solid circle)
        if (this.gem) {
            this.ctx.fillStyle = '#00FF00';
            this.ctx.shadowColor = '#00FF00';
            this.ctx.shadowBlur = 10;
            
            this.ctx.beginPath();
            this.ctx.arc(
                this.gem.x * this.gridSize + this.gridSize / 2,
                this.gem.y * this.gridSize + this.gridSize / 2,
                (this.gridSize - 6) / 2,
                0,
                2 * Math.PI
            );
            this.ctx.fill();
            
            this.ctx.shadowBlur = 0;
        }
        
        // Draw obstacles (2x2 squares with different red shades)
        for (const obstacle of this.obstacles) {
            this.ctx.fillStyle = obstacle.color;
            this.ctx.fillRect(
                obstacle.x * this.gridSize + 1,
                obstacle.y * this.gridSize + 1,
                (this.gridSize * 2) - 2,
                (this.gridSize * 2) - 2
            );
        }
        
        // Draw killer (wizard with axe)
        if (this.killer) {
            const x = this.killer.x * this.gridSize;
            const y = this.killer.y * this.gridSize;
            
            // Draw wizard body (robe)
            this.ctx.fillStyle = '#4A0E4E'; // Dark purple robe
            this.ctx.beginPath();
            this.ctx.arc(x + this.gridSize / 2, y + this.gridSize * 0.7, this.gridSize * 0.3, 0, 2 * Math.PI);
            this.ctx.fill();
            
            // Draw wizard head
            this.ctx.fillStyle = '#FFDBAC'; // Skin color
            this.ctx.beginPath();
            this.ctx.arc(x + this.gridSize / 2, y + this.gridSize * 0.3, this.gridSize * 0.15, 0, 2 * Math.PI);
            this.ctx.fill();
            
            // Draw wizard hat
            this.ctx.fillStyle = '#4A0E4E'; // Same purple as robe
            this.ctx.beginPath();
            this.ctx.moveTo(x + this.gridSize / 2 - 6, y + this.gridSize * 0.2);
            this.ctx.lineTo(x + this.gridSize / 2, y + 2);
            this.ctx.lineTo(x + this.gridSize / 2 + 6, y + this.gridSize * 0.2);
            this.ctx.closePath();
            this.ctx.fill();
            
            // Draw hat brim
            this.ctx.fillStyle = '#4A0E4E';
            this.ctx.fillRect(x + this.gridSize / 2 - 8, y + this.gridSize * 0.2, 16, 2);
            
            // Draw beard
            this.ctx.fillStyle = '#FFF'; // White beard
            this.ctx.beginPath();
            this.ctx.arc(x + this.gridSize / 2, y + this.gridSize * 0.4, this.gridSize * 0.08, 0, 2 * Math.PI);
            this.ctx.fill();
            
            // Draw eyes
            this.ctx.fillStyle = '#FF0000'; // Red glowing eyes
            this.ctx.beginPath();
            this.ctx.arc(x + this.gridSize / 2 - 3, y + this.gridSize * 0.28, 1, 0, 2 * Math.PI);
            this.ctx.fill();
            this.ctx.beginPath();
            this.ctx.arc(x + this.gridSize / 2 + 3, y + this.gridSize * 0.28, 1, 0, 2 * Math.PI);
            this.ctx.fill();
            
            // Draw axe handle
            this.ctx.fillStyle = '#8B4513'; // Brown handle
            this.ctx.fillRect(x + this.gridSize - 2, y + this.gridSize * 0.1, 2, this.gridSize * 0.8);
            
            // Draw axe blade
            this.ctx.fillStyle = '#C0C0C0'; // Silver blade
            this.ctx.beginPath();
            this.ctx.moveTo(x + this.gridSize - 1, y + this.gridSize * 0.1);
            this.ctx.lineTo(x + this.gridSize + 3, y + this.gridSize * 0.05);
            this.ctx.lineTo(x + this.gridSize + 5, y + this.gridSize * 0.25);
            this.ctx.lineTo(x + this.gridSize - 1, y + this.gridSize * 0.3);
            this.ctx.closePath();
            this.ctx.fill();
            
            // Add menacing glow effect
            this.ctx.shadowColor = '#4A0E4E';
            this.ctx.shadowBlur = 10;
            this.ctx.beginPath();
            this.ctx.arc(x + this.gridSize / 2, y + this.gridSize / 2, this.gridSize * 0.4, 0, 2 * Math.PI);
            this.ctx.fill();
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
