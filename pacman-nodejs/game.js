class PacManGame {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.gameState = 'start'; // start, playing, paused, gameOver
        this.player = {
            name: '',
            score: 0,
            lives: 3,
            level: 1
        };
        
        // Game settings
        this.cellSize = 25;
        this.rows = 21;
        this.cols = 19;
        
        // Pac-Man properties
        this.pacman = {
            x: 9,
            y: 15,
            direction: 'right',
            nextDirection: 'right',
            speed: 150, // milliseconds between moves
            mouthOpen: true
        };
        
        // Ghosts
        this.ghosts = [
            { x: 9, y: 9, direction: 'up', color: '#ff0000', name: 'blinky' },
            { x: 8, y: 9, direction: 'down', color: '#ffb8ff', name: 'pinky' },
            { x: 10, y: 9, direction: 'up', color: '#00ffff', name: 'inky' },
            { x: 9, y: 10, direction: 'left', color: '#ffb852', name: 'clyde' }
        ];
        
        this.gameSpeed = 150;
        this.lastMoveTime = 0;
        this.lastGhostMoveTime = 0;
        this.animationId = null;
        
        // Game map (0 = wall, 1 = dot, 2 = empty, 3 = power pellet, 4 = ghost area)
        this.originalMap = [
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,0],
            [0,3,0,0,1,0,0,0,1,0,1,0,0,0,1,0,0,3,0],
            [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
            [0,1,0,0,1,0,1,0,0,0,0,0,1,0,1,0,0,1,0],
            [0,1,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,1,0],
            [0,0,0,0,1,0,0,0,1,0,1,0,0,0,1,0,0,0,0],
            [2,2,2,0,1,0,1,1,1,1,1,1,1,0,1,0,2,2,2],
            [0,0,0,0,1,0,1,0,4,4,4,0,1,0,1,0,0,0,0],
            [1,1,1,1,1,1,1,0,4,4,4,0,1,1,1,1,1,1,1],
            [0,0,0,0,1,0,1,0,4,4,4,0,1,0,1,0,0,0,0],
            [2,2,2,0,1,0,1,1,1,1,1,1,1,0,1,0,2,2,2],
            [0,0,0,0,1,0,0,0,1,0,1,0,0,0,1,0,0,0,0],
            [0,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,0],
            [0,1,0,0,1,0,0,0,1,0,1,0,0,0,1,0,0,1,0],
            [0,3,1,0,1,1,1,1,1,1,1,1,1,1,1,0,1,3,0],
            [0,0,1,0,1,0,1,0,0,0,0,0,1,0,1,0,1,0,0],
            [0,1,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,1,0],
            [0,1,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,1,0],
            [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
        ];
        
        this.gameMap = [];
        this.dotsRemaining = 0;
        
        this.initializeGame();
    }
    
    initializeGame() {
        // Get DOM elements
        this.startScreen = document.getElementById('startScreen');
        this.gameScreen = document.getElementById('gameScreen');
        this.gameOverScreen = document.getElementById('gameOverScreen');
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.touchControls = document.getElementById('touchControls');
        
        // Touch gesture tracking
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchThreshold = 30; // Minimum distance for swipe detection
        
        // Bind event listeners
        document.getElementById('startButton').addEventListener('click', () => this.startGame());
        document.getElementById('pauseButton').addEventListener('click', () => this.togglePause());
        document.getElementById('restartButton').addEventListener('click', () => this.restartGame());
        document.getElementById('playAgainButton').addEventListener('click', () => this.resetToStart());
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // Touch controls
        this.initializeTouchControls();
        
        // Touch/swipe gestures
        this.initializeTouchGestures();
        
        this.resetMap();
    }
    
    initializeTouchControls() {
        // Touch control buttons
        document.getElementById('touchUp').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleDirectionInput('up');
        });
        
        document.getElementById('touchDown').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleDirectionInput('down');
        });
        
        document.getElementById('touchLeft').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleDirectionInput('left');
        });
        
        document.getElementById('touchRight').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleDirectionInput('right');
        });
        
        document.getElementById('touchPause').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.togglePause();
        });
        
        // Also add click events for desktop testing
        document.getElementById('touchUp').addEventListener('click', () => this.handleDirectionInput('up'));
        document.getElementById('touchDown').addEventListener('click', () => this.handleDirectionInput('down'));
        document.getElementById('touchLeft').addEventListener('click', () => this.handleDirectionInput('left'));
        document.getElementById('touchRight').addEventListener('click', () => this.handleDirectionInput('right'));
        document.getElementById('touchPause').addEventListener('click', () => this.togglePause());
    }
    
    initializeTouchGestures() {
        // Swipe gestures on the canvas
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.touchStartX = touch.clientX;
            this.touchStartY = touch.clientY;
        }, { passive: false });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (!e.changedTouches) return;
            
            const touch = e.changedTouches[0];
            const touchEndX = touch.clientX;
            const touchEndY = touch.clientY;
            
            const deltaX = touchEndX - this.touchStartX;
            const deltaY = touchEndY - this.touchStartY;
            
            // Check if the swipe distance meets the threshold
            if (Math.abs(deltaX) < this.touchThreshold && Math.abs(deltaY) < this.touchThreshold) {
                return;
            }
            
            // Determine swipe direction
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // Horizontal swipe
                if (deltaX > 0) {
                    this.handleDirectionInput('right');
                } else {
                    this.handleDirectionInput('left');
                }
            } else {
                // Vertical swipe
                if (deltaY > 0) {
                    this.handleDirectionInput('down');
                } else {
                    this.handleDirectionInput('up');
                }
            }
        }, { passive: false });
        
        // Prevent default touch behaviors on the canvas
        this.canvas.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
        this.canvas.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
        this.canvas.addEventListener('touchend', (e) => e.preventDefault(), { passive: false });
    }
    
    handleDirectionInput(direction) {
        if (this.gameState !== 'playing') return;
        this.pacman.nextDirection = direction;
    }
    
    startGame() {
        const playerName = document.getElementById('playerName').value.trim();
        const selectedLevel = parseInt(document.getElementById('gameLevel').value);
        
        if (!playerName) {
            alert('Please enter your name!');
            return;
        }
        
        this.player.name = playerName;
        this.player.level = selectedLevel;
        this.setGameSpeed(selectedLevel);
        
        document.getElementById('displayName').textContent = playerName;
        document.getElementById('currentLevel').textContent = selectedLevel;
        
        this.startScreen.style.display = 'none';
        this.gameScreen.style.display = 'block';
        
        // Show touch controls on mobile devices
        this.showTouchControlsIfMobile();
        
        this.gameState = 'playing';
        this.gameLoop();
    }
    
    showTouchControlsIfMobile() {
        // Detect if device likely supports touch
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                         'ontouchstart' in window || 
                         navigator.maxTouchPoints > 0;
        
        if (isMobile || window.innerWidth <= 768) {
            this.touchControls.style.display = 'flex';
        } else {
            this.touchControls.style.display = 'none';
        }
    }
    
    setGameSpeed(level) {
        // Adjust speed based on level (lower number = faster)
        const speeds = {
            1: 200,  // Slow
            2: 150,  // Medium
            3: 100,  // Fast
            4: 75,   // Very Fast
            5: 50    // Insane
        };
        this.gameSpeed = speeds[level] || 150;
        this.pacman.speed = this.gameSpeed;
    }
    
    resetMap() {
        this.gameMap = this.originalMap.map(row => [...row]);
        this.dotsRemaining = 0;
        
        // Count dots
        for (let row of this.gameMap) {
            for (let cell of row) {
                if (cell === 1 || cell === 3) {
                    this.dotsRemaining++;
                }
            }
        }
        
        // Reset Pac-Man position
        this.pacman.x = 9;
        this.pacman.y = 15;
        this.pacman.direction = 'right';
        this.pacman.nextDirection = 'right';
        
        // Reset ghosts
        this.ghosts = [
            { x: 9, y: 9, direction: 'up', color: '#ff0000', name: 'blinky' },
            { x: 8, y: 9, direction: 'down', color: '#ffb8ff', name: 'pinky' },
            { x: 10, y: 9, direction: 'up', color: '#00ffff', name: 'inky' },
            { x: 9, y: 10, direction: 'left', color: '#ffb852', name: 'clyde' }
        ];
    }
    
    handleKeyPress(e) {
        if (this.gameState !== 'playing') return;
        
        switch(e.key) {
            case 'ArrowUp':
                this.pacman.nextDirection = 'up';
                e.preventDefault();
                break;
            case 'ArrowDown':
                this.pacman.nextDirection = 'down';
                e.preventDefault();
                break;
            case 'ArrowLeft':
                this.pacman.nextDirection = 'left';
                e.preventDefault();
                break;
            case 'ArrowRight':
                this.pacman.nextDirection = 'right';
                e.preventDefault();
                break;
            case ' ':
                this.togglePause();
                e.preventDefault();
                break;
        }
    }
    
    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            document.getElementById('pauseButton').textContent = 'Resume';
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
            document.getElementById('pauseButton').textContent = 'Pause';
            this.gameLoop();
        }
    }
    
    canMove(x, y) {
        if (x < 0 || x >= this.cols || y < 0 || y >= this.rows) {
            return false;
        }
        return this.gameMap[y][x] !== 0;
    }
    
    movePacman(currentTime) {
        if (currentTime - this.lastMoveTime < this.pacman.speed) return;
        
        let newX = this.pacman.x;
        let newY = this.pacman.y;
        
        // Try to change direction if possible
        let tempX = this.pacman.x;
        let tempY = this.pacman.y;
        
        switch(this.pacman.nextDirection) {
            case 'up': tempY--; break;
            case 'down': tempY++; break;
            case 'left': tempX--; break;
            case 'right': tempX++; break;
        }
        
        if (this.canMove(tempX, tempY)) {
            this.pacman.direction = this.pacman.nextDirection;
        }
        
        // Move in current direction
        switch(this.pacman.direction) {
            case 'up': newY--; break;
            case 'down': newY++; break;
            case 'left': newX--; break;
            case 'right': newX++; break;
        }
        
        // Tunnel effect (left-right wrap around)
        if (newX < 0) newX = this.cols - 1;
        if (newX >= this.cols) newX = 0;
        
        if (this.canMove(newX, newY)) {
            this.pacman.x = newX;
            this.pacman.y = newY;
            this.pacman.mouthOpen = !this.pacman.mouthOpen;
            
            // Check for dots
            if (this.gameMap[newY][newX] === 1) {
                this.gameMap[newY][newX] = 2;
                this.player.score += 10;
                this.dotsRemaining--;
            } else if (this.gameMap[newY][newX] === 3) {
                this.gameMap[newY][newX] = 2;
                this.player.score += 50;
                this.dotsRemaining--;
            }
            
            this.updateUI();
            
            // Check win condition
            if (this.dotsRemaining === 0) {
                this.nextLevel();
            }
        }
        
        this.lastMoveTime = currentTime;
    }
    
    moveGhosts(currentTime) {
        if (currentTime - this.lastGhostMoveTime < this.gameSpeed + 50) return;
        
        this.ghosts.forEach(ghost => {
            const directions = ['up', 'down', 'left', 'right'];
            let possibleMoves = [];
            
            directions.forEach(dir => {
                let newX = ghost.x;
                let newY = ghost.y;
                
                switch(dir) {
                    case 'up': newY--; break;
                    case 'down': newY++; break;
                    case 'left': newX--; break;
                    case 'right': newX++; break;
                }
                
                // Tunnel effect for ghosts too
                if (newX < 0) newX = this.cols - 1;
                if (newX >= this.cols) newX = 0;
                
                if (this.canMove(newX, newY) && this.gameMap[newY][newX] !== 4) {
                    possibleMoves.push({direction: dir, x: newX, y: newY});
                }
            });
            
            if (possibleMoves.length > 0) {
                // Simple AI: sometimes move towards Pac-Man, sometimes random
                let chosenMove;
                if (Math.random() < 0.3) {
                    // Move towards Pac-Man
                    let bestMove = possibleMoves[0];
                    let bestDistance = this.getDistance(bestMove.x, bestMove.y, this.pacman.x, this.pacman.y);
                    
                    possibleMoves.forEach(move => {
                        let distance = this.getDistance(move.x, move.y, this.pacman.x, this.pacman.y);
                        if (distance < bestDistance) {
                            bestDistance = distance;
                            bestMove = move;
                        }
                    });
                    chosenMove = bestMove;
                } else {
                    // Random move
                    chosenMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
                }
                
                ghost.x = chosenMove.x;
                ghost.y = chosenMove.y;
                ghost.direction = chosenMove.direction;
            }
        });
        
        this.lastGhostMoveTime = currentTime;
    }
    
    getDistance(x1, y1, x2, y2) {
        return Math.abs(x1 - x2) + Math.abs(y1 - y2);
    }
    
    checkCollisions() {
        this.ghosts.forEach(ghost => {
            if (ghost.x === this.pacman.x && ghost.y === this.pacman.y) {
                this.player.lives--;
                this.updateUI();
                
                if (this.player.lives <= 0) {
                    this.gameOver();
                } else {
                    // Reset positions
                    this.pacman.x = 9;
                    this.pacman.y = 15;
                    ghost.x = 9;
                    ghost.y = 9;
                }
            }
        });
    }
    
    nextLevel() {
        this.player.level++;
        this.player.score += 100; // Bonus for completing level
        this.setGameSpeed(this.player.level);
        this.resetMap();
        this.updateUI();
        
        // Show level completion message
        alert(`Level ${this.player.level - 1} Complete! Moving to Level ${this.player.level}`);
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        cancelAnimationFrame(this.animationId);
        
        document.getElementById('finalScore').textContent = this.player.score;
        document.getElementById('levelReached').textContent = this.player.level;
        
        this.gameScreen.style.display = 'none';
        this.gameOverScreen.style.display = 'block';
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.player.score;
        document.getElementById('lives').textContent = this.player.lives;
        document.getElementById('currentLevel').textContent = this.player.level;
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw maze
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                const cellValue = this.gameMap[y][x];
                const pixelX = x * this.cellSize;
                const pixelY = y * this.cellSize;
                
                switch(cellValue) {
                    case 0: // Wall
                        this.ctx.fillStyle = '#0000ff';
                        this.ctx.fillRect(pixelX, pixelY, this.cellSize, this.cellSize);
                        break;
                    case 1: // Dot
                        this.ctx.fillStyle = '#ffff00';
                        this.ctx.beginPath();
                        this.ctx.arc(pixelX + this.cellSize/2, pixelY + this.cellSize/2, 2, 0, Math.PI * 2);
                        this.ctx.fill();
                        break;
                    case 3: // Power pellet
                        this.ctx.fillStyle = '#ffff00';
                        this.ctx.beginPath();
                        this.ctx.arc(pixelX + this.cellSize/2, pixelY + this.cellSize/2, 6, 0, Math.PI * 2);
                        this.ctx.fill();
                        break;
                    case 4: // Ghost area
                        this.ctx.fillStyle = '#333';
                        this.ctx.fillRect(pixelX, pixelY, this.cellSize, this.cellSize);
                        break;
                }
            }
        }
        
        // Draw Pac-Man
        this.drawPacman();
        
        // Draw ghosts
        this.ghosts.forEach(ghost => this.drawGhost(ghost));
    }
    
    drawPacman() {
        const pixelX = this.pacman.x * this.cellSize + this.cellSize/2;
        const pixelY = this.pacman.y * this.cellSize + this.cellSize/2;
        const radius = this.cellSize/2 - 2;
        
        this.ctx.fillStyle = '#ffff00';
        this.ctx.beginPath();
        
        if (this.pacman.mouthOpen) {
            let startAngle, endAngle;
            switch(this.pacman.direction) {
                case 'right':
                    startAngle = 0.2 * Math.PI;
                    endAngle = 1.8 * Math.PI;
                    break;
                case 'left':
                    startAngle = 1.2 * Math.PI;
                    endAngle = 0.8 * Math.PI;
                    break;
                case 'up':
                    startAngle = 1.7 * Math.PI;
                    endAngle = 1.3 * Math.PI;
                    break;
                case 'down':
                    startAngle = 0.7 * Math.PI;
                    endAngle = 0.3 * Math.PI;
                    break;
            }
            this.ctx.arc(pixelX, pixelY, radius, startAngle, endAngle);
            this.ctx.lineTo(pixelX, pixelY);
        } else {
            this.ctx.arc(pixelX, pixelY, radius, 0, Math.PI * 2);
        }
        
        this.ctx.fill();
    }
    
    drawGhost(ghost) {
        const pixelX = ghost.x * this.cellSize + this.cellSize/2;
        const pixelY = ghost.y * this.cellSize + this.cellSize/2;
        const radius = this.cellSize/2 - 2;
        
        this.ctx.fillStyle = ghost.color;
        this.ctx.beginPath();
        this.ctx.arc(pixelX, pixelY, radius, Math.PI, 0);
        this.ctx.lineTo(pixelX + radius, pixelY + radius);
        this.ctx.lineTo(pixelX + radius/2, pixelY + radius - 4);
        this.ctx.lineTo(pixelX, pixelY + radius);
        this.ctx.lineTo(pixelX - radius/2, pixelY + radius - 4);
        this.ctx.lineTo(pixelX - radius, pixelY + radius);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Eyes
        this.ctx.fillStyle = '#fff';
        this.ctx.beginPath();
        this.ctx.arc(pixelX - 4, pixelY - 4, 3, 0, Math.PI * 2);
        this.ctx.arc(pixelX + 4, pixelY - 4, 3, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#000';
        this.ctx.beginPath();
        this.ctx.arc(pixelX - 4, pixelY - 4, 1, 0, Math.PI * 2);
        this.ctx.arc(pixelX + 4, pixelY - 4, 1, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    gameLoop() {
        if (this.gameState !== 'playing') return;
        
        const currentTime = Date.now();
        
        this.movePacman(currentTime);
        this.moveGhosts(currentTime);
        this.checkCollisions();
        this.draw();
        
        this.animationId = requestAnimationFrame(() => this.gameLoop());
    }
    
    restartGame() {
        this.gameState = 'playing';
        this.player.score = 0;
        this.player.lives = 3;
        this.resetMap();
        this.updateUI();
        document.getElementById('pauseButton').textContent = 'Pause';
        this.gameLoop();
    }
    
    resetToStart() {
        this.gameState = 'start';
        this.player = {
            name: '',
            score: 0,
            lives: 3,
            level: 1
        };
        this.resetMap();
        
        this.gameOverScreen.style.display = 'none';
        this.gameScreen.style.display = 'none';
        this.startScreen.style.display = 'block';
        this.touchControls.style.display = 'none';
        
        document.getElementById('playerName').value = '';
        document.getElementById('gameLevel').value = '1';
    }
}

// Handle window resize for responsive touch controls
window.addEventListener('resize', () => {
    const touchControls = document.getElementById('touchControls');
    if (touchControls) {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                         'ontouchstart' in window || 
                         navigator.maxTouchPoints > 0;
        
        if ((isMobile || window.innerWidth <= 768) && document.getElementById('gameScreen').style.display === 'block') {
            touchControls.style.display = 'flex';
        } else {
            touchControls.style.display = 'none';
        }
    }
});

// Initialize the game when the page loads
window.addEventListener('load', () => {
    new PacManGame();
});
