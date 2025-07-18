// Tetris Game Implementation
class TetrisGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score');
        this.linesElement = document.getElementById('lines');
        this.levelElement = document.getElementById('level');
        this.gameOverElement = document.getElementById('gameOver');
        
        // Game constants
        this.BOARD_WIDTH = 10;
        this.BOARD_HEIGHT = 20;
        this.BLOCK_SIZE = 30;
        
        // Game state
        this.board = this.createBoard();
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.dropTime = 0;
        this.dropInterval = 1000; // milliseconds
        this.lastTime = 0;
        this.gameRunning = true;
        this.paused = false;
        
        // Current piece
        this.currentPiece = null;
        this.currentX = 0;
        this.currentY = 0;
        
        // Tetris pieces (Tetrominoes)
        this.pieces = [
            // I-piece
            [
                [1, 1, 1, 1]
            ],
            // O-piece
            [
                [1, 1],
                [1, 1]
            ],
            // T-piece
            [
                [0, 1, 0],
                [1, 1, 1]
            ],
            // S-piece
            [
                [0, 1, 1],
                [1, 1, 0]
            ],
            // Z-piece
            [
                [1, 1, 0],
                [0, 1, 1]
            ],
            // J-piece
            [
                [1, 0, 0],
                [1, 1, 1]
            ],
            // L-piece
            [
                [0, 0, 1],
                [1, 1, 1]
            ]
        ];
        
        // Colors for each piece
        this.colors = [
            '#00f5ff', // I-piece (cyan)
            '#ffff00', // O-piece (yellow)
            '#800080', // T-piece (purple)
            '#00ff00', // S-piece (green)
            '#ff0000', // Z-piece (red)
            '#0000ff', // J-piece (blue)
            '#ffa500'  // L-piece (orange)
        ];
        
        this.init();
    }
    
    createBoard() {
        return Array(this.BOARD_HEIGHT).fill().map(() => Array(this.BOARD_WIDTH).fill(0));
    }
    
    init() {
        this.spawnPiece();
        this.setupControls();
        this.gameLoop();
    }
    
    spawnPiece() {
        const pieceIndex = Math.floor(Math.random() * this.pieces.length);
        this.currentPiece = {
            shape: this.pieces[pieceIndex],
            color: this.colors[pieceIndex]
        };
        this.currentX = Math.floor(this.BOARD_WIDTH / 2) - Math.floor(this.currentPiece.shape[0].length / 2);
        this.currentY = 0;
        
        // Check if game over
        if (this.collision()) {
            this.gameOver();
        }
    }
    
    collision() {
        for (let y = 0; y < this.currentPiece.shape.length; y++) {
            for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                if (this.currentPiece.shape[y][x]) {
                    const newX = this.currentX + x;
                    const newY = this.currentY + y;
                    
                    if (newX < 0 || newX >= this.BOARD_WIDTH || 
                        newY >= this.BOARD_HEIGHT || 
                        (newY >= 0 && this.board[newY][newX])) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    
    placePiece() {
        for (let y = 0; y < this.currentPiece.shape.length; y++) {
            for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                if (this.currentPiece.shape[y][x]) {
                    const boardY = this.currentY + y;
                    const boardX = this.currentX + x;
                    if (boardY >= 0) {
                        this.board[boardY][boardX] = this.currentPiece.color;
                    }
                }
            }
        }
        
        this.clearLines();
        this.spawnPiece();
    }
    
    clearLines() {
        let linesCleared = 0;
        
        for (let y = this.BOARD_HEIGHT - 1; y >= 0; y--) {
            if (this.board[y].every(cell => cell !== 0)) {
                this.board.splice(y, 1);
                this.board.unshift(Array(this.BOARD_WIDTH).fill(0));
                linesCleared++;
                y++; // Check the same line again
            }
        }
        
        if (linesCleared > 0) {
            this.lines += linesCleared;
            this.score += linesCleared * 100 * this.level;
            this.level = Math.floor(this.lines / 10) + 1;
            this.dropInterval = Math.max(50, 1000 - (this.level - 1) * 50);
            this.updateUI();
        }
    }
    
    rotatePiece() {
        const rotated = [];
        const shape = this.currentPiece.shape;
        
        for (let x = 0; x < shape[0].length; x++) {
            rotated[x] = [];
            for (let y = shape.length - 1; y >= 0; y--) {
                rotated[x][shape.length - 1 - y] = shape[y][x];
            }
        }
        
        const originalShape = this.currentPiece.shape;
        this.currentPiece.shape = rotated;
        
        if (this.collision()) {
            this.currentPiece.shape = originalShape;
        }
    }
    
    movePiece(dx, dy) {
        this.currentX += dx;
        this.currentY += dy;
        
        if (this.collision()) {
            this.currentX -= dx;
            this.currentY -= dy;
            
            if (dy > 0) {
                this.placePiece();
            }
        }
    }
    
    hardDrop() {
        while (!this.collision()) {
            this.currentY++;
        }
        this.currentY--;
        this.placePiece();
    }
    
    setupControls() {
        document.addEventListener('keydown', (e) => {
            if (!this.gameRunning || this.paused) {
                if (e.key === 'r' || e.key === 'R') {
                    this.restart();
                }
                if (e.key === 'p' || e.key === 'P') {
                    this.togglePause();
                }
                return;
            }
            
            switch (e.key) {
                case 'ArrowLeft':
                    this.movePiece(-1, 0);
                    break;
                case 'ArrowRight':
                    this.movePiece(1, 0);
                    break;
                case 'ArrowDown':
                    this.movePiece(0, 1);
                    break;
                case 'ArrowUp':
                    this.rotatePiece();
                    break;
                case ' ':
                    this.hardDrop();
                    break;
                case 'p':
                case 'P':
                    this.togglePause();
                    break;
                case 'r':
                case 'R':
                    this.restart();
                    break;
            }
        });
    }
    
    togglePause() {
        this.paused = !this.paused;
    }
    
    restart() {
        this.board = this.createBoard();
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.dropInterval = 1000;
        this.gameRunning = true;
        this.paused = false;
        this.gameOverElement.style.display = 'none';
        this.updateUI();
        this.spawnPiece();
    }
    
    gameOver() {
        this.gameRunning = false;
        this.gameOverElement.style.display = 'block';
    }
    
    updateUI() {
        this.scoreElement.textContent = this.score;
        this.linesElement.textContent = this.lines;
        this.levelElement.textContent = this.level;
    }
    
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw board
        for (let y = 0; y < this.BOARD_HEIGHT; y++) {
            for (let x = 0; x < this.BOARD_WIDTH; x++) {
                if (this.board[y][x]) {
                    this.ctx.fillStyle = this.board[y][x];
                    this.ctx.fillRect(
                        x * this.BLOCK_SIZE,
                        y * this.BLOCK_SIZE,
                        this.BLOCK_SIZE - 1,
                        this.BLOCK_SIZE - 1
                    );
                }
            }
        }
        
        // Draw current piece
        if (this.currentPiece && this.gameRunning) {
            this.ctx.fillStyle = this.currentPiece.color;
            for (let y = 0; y < this.currentPiece.shape.length; y++) {
                for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                    if (this.currentPiece.shape[y][x]) {
                        this.ctx.fillRect(
                            (this.currentX + x) * this.BLOCK_SIZE,
                            (this.currentY + y) * this.BLOCK_SIZE,
                            this.BLOCK_SIZE - 1,
                            this.BLOCK_SIZE - 1
                        );
                    }
                }
            }
        }
        
        // Draw grid
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 1;
        for (let x = 0; x <= this.BOARD_WIDTH; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.BLOCK_SIZE, 0);
            this.ctx.lineTo(x * this.BLOCK_SIZE, this.canvas.height);
            this.ctx.stroke();
        }
        for (let y = 0; y <= this.BOARD_HEIGHT; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * this.BLOCK_SIZE);
            this.ctx.lineTo(this.canvas.width, y * this.BLOCK_SIZE);
            this.ctx.stroke();
        }
        
        // Draw pause overlay
        if (this.paused) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = 'white';
            this.ctx.font = '30px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
        }
    }
    
    gameLoop(currentTime = 0) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        if (this.gameRunning && !this.paused) {
            this.dropTime += deltaTime;
            
            if (this.dropTime >= this.dropInterval) {
                this.movePiece(0, 1);
                this.dropTime = 0;
            }
        }
        
        this.draw();
        requestAnimationFrame((time) => this.gameLoop(time));
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    new TetrisGame();
});
