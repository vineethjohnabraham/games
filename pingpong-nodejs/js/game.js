class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Game state
        this.gameState = 'menu'; // menu, playing, paused, gameOver
        this.animationId = null;
        
        // Game settings (removed winningScore - endless gameplay)
        this.paddleWidth = 15;
        this.paddleHeight = 80;
        this.ballRadius = 8;
        
        // Players (removed scoring)
        this.player1 = { name: 'Player 1' };
        this.player2 = { name: 'Player 2' };
        
        // Game objects
        this.leftPaddle = null;
        this.rightPaddle = null;
        this.ball = null;
        this.computerPlayer = null;
        
        // Game mode
        this.gameMode = 'twoPlayer'; // 'twoPlayer' or 'computer'
        this.difficulty = 'medium';
        
        // Input handling
        this.keys = {};
        this.touchHandler = new TouchHandler();
        
        // Performance
        this.lastFrameTime = 0;
        this.fps = 60;
        this.frameInterval = 1000 / this.fps;
        
        this.init();
    }
    
    init() {
        this.setupCanvas();
        this.setupInputHandlers();
        this.setupTouchControls();
        this.createGameObjects();
    }
    
    setupCanvas() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        window.addEventListener('orientationchange', () => {
            setTimeout(() => this.resizeCanvas(), 100);
        });
    }
    
    resizeCanvas() {
        const container = document.getElementById('gameContainer');
        const header = document.getElementById('gameHeader');
        
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        const headerHeight = header.offsetHeight;
        
        this.canvas.width = containerWidth;
        this.canvas.height = containerHeight - headerHeight;
        
        // Update game object bounds
        if (this.leftPaddle) this.leftPaddle.setCanvasBounds(this.canvas.height);
        if (this.rightPaddle) this.rightPaddle.setCanvasBounds(this.canvas.height);
        if (this.ball) this.ball.setCanvasBounds(this.canvas.width, this.canvas.height);
        
        // Reposition paddles
        this.repositionGameObjects();
    }
    
    repositionGameObjects() {
        if (!this.leftPaddle || !this.rightPaddle) return;
        
        // Left paddle
        this.leftPaddle.x = 20;
        this.leftPaddle.y = Math.min(this.leftPaddle.y, this.canvas.height - this.paddleHeight);
        
        // Right paddle
        this.rightPaddle.x = this.canvas.width - 20 - this.paddleWidth;
        this.rightPaddle.y = Math.min(this.rightPaddle.y, this.canvas.height - this.paddleHeight);
        
        // Ball - keep current position if in bounds
        if (this.ball) {
            this.ball.x = Math.max(this.ballRadius, Math.min(this.ball.x, this.canvas.width - this.ballRadius));
            this.ball.y = Math.max(this.ballRadius, Math.min(this.ball.y, this.canvas.height - this.ballRadius));
        }
    }
    
    createGameObjects() {
        // Create paddles
        this.leftPaddle = new Paddle(
            20, 
            (this.canvas.height - this.paddleHeight) / 2, 
            this.paddleWidth, 
            this.paddleHeight,
            '#4ecdc4'
        );
        
        this.rightPaddle = new Paddle(
            this.canvas.width - 20 - this.paddleWidth, 
            (this.canvas.height - this.paddleHeight) / 2, 
            this.paddleWidth, 
            this.paddleHeight,
            '#ff6b6b'
        );
        
        // Create ball
        this.ball = new Ball(
            this.canvas.width / 2, 
            this.canvas.height / 2, 
            this.ballRadius,
            '#ffd700'
        );
        
        // Set canvas bounds
        this.leftPaddle.setCanvasBounds(this.canvas.height);
        this.rightPaddle.setCanvasBounds(this.canvas.height);
        this.ball.setCanvasBounds(this.canvas.width, this.canvas.height);
        
        // Setup computer player if in computer mode
        if (this.gameMode === 'computer') {
            this.setupComputerPlayer();
        }
    }
    
    setupInputHandlers() {
        // Keyboard events
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // Prevent default behavior for game keys
        document.addEventListener('keydown', (e) => {
            if (['KeyW', 'KeyS', 'ArrowUp', 'ArrowDown', 'Space'].includes(e.code)) {
                e.preventDefault();
            }
        });
    }
    
    setupTouchControls() {
        // Set up touch move callbacks
        this.touchHandler.setLeftMoveCallback((deltaY) => {
            if (this.gameState === 'playing') {
                this.leftPaddle.moveByDelta(deltaY);
            }
        });
        
        // Handle touch controls based on game mode
        if (this.gameMode === 'twoPlayer') {
            this.touchHandler.setRightMoveCallback((deltaY) => {
                if (this.gameState === 'playing') {
                    this.rightPaddle.moveByDelta(deltaY);
                }
            });
            this.touchHandler.enableRightTouchArea();
        } else {
            // Computer mode - disable right touch area
            this.touchHandler.disableRightTouchArea();
        }
    }
    
    handleKeyDown(e) {
        this.keys[e.code] = true;
        
        if (this.gameState === 'playing') {
            // Player 1 controls (W/S)
            if (e.code === 'KeyW') this.leftPaddle.setMoveUp(true);
            if (e.code === 'KeyS') this.leftPaddle.setMoveDown(true);
            
            // Player 2 controls (Arrow keys) - only in two-player mode
            if (this.gameMode === 'twoPlayer') {
                if (e.code === 'ArrowUp') this.rightPaddle.setMoveUp(true);
                if (e.code === 'ArrowDown') this.rightPaddle.setMoveDown(true);
            }
        }
        
        // Pause toggle
        if (e.code === 'Space' && this.gameState === 'playing') {
            this.pauseGame();
        }
    }
    
    handleKeyUp(e) {
        this.keys[e.code] = false;
        
        // Player 1 controls
        if (e.code === 'KeyW') this.leftPaddle.setMoveUp(false);
        if (e.code === 'KeyS') this.leftPaddle.setMoveDown(false);
        
        // Player 2 controls - only in two-player mode
        if (this.gameMode === 'twoPlayer') {
            if (e.code === 'ArrowUp') this.rightPaddle.setMoveUp(false);
            if (e.code === 'ArrowDown') this.rightPaddle.setMoveDown(false);
        }
    }
    
    setPlayerNames(player1Name, player2Name) {
        this.player1.name = player1Name || 'Player 1';
        this.player2.name = player2Name || 'Player 2';
    }

    setGameMode(mode, difficulty = 'medium') {
        this.gameMode = mode;
        this.difficulty = difficulty;
        
        if (mode === 'computer') {
            this.setupComputerPlayer();
        }
    }

    setupComputerPlayer() {
        if (this.rightPaddle) {
            this.computerPlayer = new ComputerPlayer(this.rightPaddle, this.difficulty);
        }
    }

    start() {
        // No scores to reset - endless gameplay
        this.updateScoreDisplay();
        this.resetBall();
        this.resetPaddles();
        
        // Setup computer player after paddles are created and positioned
        if (this.gameMode === 'computer' && this.rightPaddle) {
            this.setupComputerPlayer();
        }
        
        this.gameState = 'playing';
        this.gameLoop();
    }

    startGame(player1Name, player2Name) {
        this.setPlayerNames(player1Name, player2Name);
        this.start();
    }
    
    pause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            cancelAnimationFrame(this.animationId);
        }
    }

    resume() {
        if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.gameLoop();
        }
    }

    restart() {
        // No scores to reset - endless gameplay
        this.updateScoreDisplay();
        this.resetBall();
        this.resetPaddles();
        this.gameState = 'playing';
        this.gameLoop();
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.gameState = 'menu';
    }

    pauseGame() {
        this.pause();
    }

    resumeGame() {
        this.resume();
    }

    resetGame() {
        this.restart();
    }    resetBall() {
        this.ball.reset(this.canvas.width / 2, this.canvas.height / 2);
    }
    
    resetPaddles() {
        this.leftPaddle.reset(20, (this.canvas.height - this.paddleHeight) / 2);
        this.rightPaddle.reset(this.canvas.width - 20 - this.paddleWidth, (this.canvas.height - this.paddleHeight) / 2);
        
        // Reset computer player if in computer mode
        if (this.gameMode === 'computer' && this.computerPlayer) {
            this.computerPlayer.reset();
        }
    }
    
    updateScoreDisplay() {
        document.getElementById('player1NameDisplay').textContent = this.player1.name;
        document.getElementById('player1Score').textContent = '∞'; // Endless gameplay symbol
        document.getElementById('player2NameDisplay').textContent = this.player2.name;
        document.getElementById('player2Score').textContent = '∞'; // Endless gameplay symbol
    }
    
    gameLoop(currentTime = 0) {
        if (this.gameState !== 'playing') return;
        
        // Throttle frame rate
        if (currentTime - this.lastFrameTime < this.frameInterval) {
            this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
            return;
        }
        
        this.lastFrameTime = currentTime;
        
        this.update();
        this.draw();
        
        this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    update() {
        // Update paddles
        this.leftPaddle.update();
        this.rightPaddle.update();
        
        // Update computer player if in computer mode
        if (this.gameMode === 'computer' && this.computerPlayer) {
            this.computerPlayer.update(this.ball, performance.now());
        }
        
        // Update ball
        this.ball.update();
        
        // Check paddle collisions
        this.ball.checkPaddleCollision(this.leftPaddle);
        this.ball.checkPaddleCollision(this.rightPaddle);
        
        // Check if ball goes out of bounds - just reset (no scoring)
        if (this.ball.isOutOfBounds()) {
            // Reset ball for next round
            setTimeout(() => {
                if (this.gameState === 'playing') {
                    this.resetBall();
                }
            }, 1000);
        }
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw center line
        this.drawCenterLine();
        
        // Draw game objects
        this.leftPaddle.draw(this.ctx);
        this.rightPaddle.draw(this.ctx);
        this.ball.draw(this.ctx);
    }
    
    drawCenterLine() {
        this.ctx.strokeStyle = '#444';
        this.ctx.lineWidth = 3;
        this.ctx.setLineDash([10, 10]);
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width / 2, 0);
        this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
        this.ctx.stroke();
        
        this.ctx.setLineDash([]);
    }
    
    endGame() {
        this.gameState = 'gameOver';
        cancelAnimationFrame(this.animationId);
        
        const winner = this.player1.score >= this.winningScore ? this.player1 : this.player2;
        
        // Use the global showGameOver function if available
        if (typeof window.showGameOver === 'function') {
            window.showGameOver(winner.name, this.player1.score, this.player2.score);
        } else {
            // Fallback to direct DOM manipulation
            document.getElementById('winnerDisplay').textContent = `🎉 ${winner.name} Wins!`;
            document.getElementById('finalScore').textContent = `Final Score: ${this.player1.name} ${this.player1.score} - ${this.player2.score} ${this.player2.name}`;
            document.getElementById('gameOverScreen').classList.remove('hidden');
        }
    }
    
    getGameState() {
        return this.gameState;
    }
    
    setGameState(state) {
        this.gameState = state;
    }
}
