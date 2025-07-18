// Game Board Management for Snake & Ladder Game
class GameBoard {
    constructor() {
        this.size = 10;
        this.totalSquares = 100;
        this.boardElement = null;
        this.squares = [];
        
        // Snake and Ladder mappings based on the provided board image
        this.snakes = {
            98: 79,   // Snake from 98 to 79
            95: 75,   // Snake from 95 to 75
            92: 88,   // Snake from 92 to 88
            89: 68,   // Snake from 89 to 68
            74: 53,   // Snake from 74 to 53
            64: 60,   // Snake from 64 to 60
            62: 19,   // Snake from 62 to 19
            54: 34,   // Snake from 54 to 34
            17: 7     // Snake from 17 to 7
        };
        
        this.ladders = {
            1: 38,    // Ladder from 1 to 38
            4: 14,    // Ladder from 4 to 14
            9: 31,    // Ladder from 9 to 31
            16: 6,    // Ladder from 16 to 6 (small ladder)
            21: 42,   // Ladder from 21 to 42
            28: 84,   // Ladder from 28 to 84
            36: 44,   // Ladder from 36 to 44
            51: 67,   // Ladder from 51 to 67
            71: 91,   // Ladder from 71 to 91
            80: 100   // Ladder from 80 to 100
        };
        
        this.playerPositions = { 1: 0, 2: 0 };
        this.isAnimating = false;
    }

    initialize() {
        this.boardElement = document.getElementById('game-board');
        this.createBoard();
        this.setupEventListeners();
    }

    createBoard() {
        if (!this.boardElement) return;

        this.boardElement.innerHTML = '';
        this.squares = [];

        // Create 100 squares
        for (let i = 1; i <= this.totalSquares; i++) {
            const square = this.createSquare(i);
            this.squares.push(square);
            this.boardElement.appendChild(square);
        }

        this.positionSquares();
    }

    createSquare(number) {
        const square = document.createElement('div');
        square.className = 'board-square';
        square.dataset.position = number;
        
        // Add number to square
        const numberElement = document.createElement('span');
        numberElement.className = 'square-number';
        numberElement.textContent = number;
        square.appendChild(numberElement);

        // Add special styling based on position
        this.addSpecialStyling(square, number);

        return square;
    }

    addSpecialStyling(square, number) {
        // Start square
        if (number === 1) {
            square.classList.add('start');
        }
        
        // Finish square
        if (number === 100) {
            square.classList.add('finish');
        }
        
        // Snake heads
        if (this.snakes[number]) {
            square.classList.add('snake-head');
            square.dataset.snakeTail = this.snakes[number];
        }
        
        // Snake tails
        if (Object.values(this.snakes).includes(number)) {
            square.classList.add('snake-tail');
        }
        
        // Ladder bottoms
        if (this.ladders[number]) {
            square.classList.add('ladder-bottom');
            square.dataset.ladderTop = this.ladders[number];
        }
        
        // Ladder tops
        if (Object.values(this.ladders).includes(number)) {
            square.classList.add('ladder-top');
        }
    }

    positionSquares() {
        // Position squares in snake-and-ladder board pattern
        // Bottom row (1-10): left to right
        // Second row (11-20): right to left
        // Third row (21-30): left to right
        // And so on...
        
        this.squares.forEach((square, index) => {
            const position = index + 1;
            const row = Math.floor((position - 1) / this.size);
            const col = (position - 1) % this.size;
            
            // Calculate grid position (inverted row for bottom-to-top layout)
            const gridRow = this.size - row;
            let gridCol = col + 1;
            
            // Reverse column order for even rows (zigzag pattern)
            if (row % 2 === 1) {
                gridCol = this.size - col;
            }
            
            square.style.gridRow = gridRow;
            square.style.gridColumn = gridCol;
        });
    }

    setupEventListeners() {
        // Add click listeners for debugging/development
        this.squares.forEach(square => {
            square.addEventListener('click', (e) => {
                const position = parseInt(e.target.closest('.board-square').dataset.position);
                console.log(`Clicked square ${position}`);
                this.highlightSquare(position);
            });
        });
    }

    highlightSquare(position, duration = 2000) {
        const square = this.getSquareElement(position);
        if (!square) return;

        const highlight = document.createElement('div');
        highlight.className = 'square-highlight';
        square.appendChild(highlight);

        setTimeout(() => {
            if (highlight.parentNode) {
                highlight.parentNode.removeChild(highlight);
            }
        }, duration);
    }

    getSquareElement(position) {
        return this.squares.find(square => 
            parseInt(square.dataset.position) === position
        );
    }

    async movePlayer(playerNumber, fromPosition, toPosition, animate = true) {
        if (this.isAnimating && animate) {
            console.log('Animation in progress, please wait...');
            return fromPosition; // Return current position instead of false
        }

        this.isAnimating = animate;

        try {
            // Remove player from current position (only if not starting position)
            if (fromPosition > 0) {
                this.removePlayerFromSquare(playerNumber, fromPosition);
            }
            
            if (animate) {
                // Animate movement step by step
                await this.animatePlayerMovement(playerNumber, fromPosition, toPosition);
            } else {
                // Direct movement without animation
                this.addPlayerToSquare(playerNumber, toPosition);
            }

            // Update position
            this.playerPositions[playerNumber] = toPosition;

            // Check for snake or ladder
            const finalPosition = await this.checkSnakeOrLadder(playerNumber, toPosition);
            
            return finalPosition;
        } finally {
            this.isAnimating = false;
        }
    }

    async animatePlayerMovement(playerNumber, fromPosition, toPosition) {
        const stepDelay = 200; // milliseconds between steps
        
        for (let pos = fromPosition + 1; pos <= toPosition; pos++) {
            // Remove from previous position
            if (pos > fromPosition + 1) {
                this.removePlayerFromSquare(playerNumber, pos - 1);
            }
            
            // Add to current position
            this.addPlayerToSquare(playerNumber, pos);
            
            // Play movement sound
            audioManager.playPieceMove();
            
            // Add movement animation
            this.animateSquare(pos, 'square-pop');
            
            // Wait before next step
            if (pos < toPosition) {
                await this.delay(stepDelay);
            }
        }
    }

    addPlayerToSquare(playerNumber, position) {
        const square = this.getSquareElement(position);
        if (!square) return;

        // Remove existing player piece if any
        const existingPiece = square.querySelector(`.player-piece.player${playerNumber}`);
        if (existingPiece) {
            existingPiece.remove();
        }

        // Create player piece
        const piece = document.createElement('div');
        piece.className = `player-piece player${playerNumber}`;
        piece.textContent = playerNumber;
        
        square.appendChild(piece);
        
        // Add spawn animation
        piece.classList.add('piece-spawn');
        
        // Remove animation class after animation completes
        setTimeout(() => {
            piece.classList.remove('piece-spawn');
        }, 800);
    }

    removePlayerFromSquare(playerNumber, position) {
        // Don't try to remove from position 0 (starting position)
        if (position <= 0) return;
        
        const square = this.getSquareElement(position);
        if (!square) return;

        const piece = square.querySelector(`.player-piece.player${playerNumber}`);
        if (piece) {
            piece.remove();
        }
    }

    async checkSnakeOrLadder(playerNumber, position) {
        let finalPosition = position;
        
        // Check for snake
        if (this.snakes[position]) {
            finalPosition = this.snakes[position];
            
            // Play snake sound
            audioManager.playSnakeHiss();
            
            // Animate snake encounter
            await this.animateSnakeEncounter(playerNumber, position, finalPosition);
            
            // Show notification
            this.showNotification(`🐍 Snake bite! Player ${playerNumber} slides down to ${finalPosition}`);
        }
        // Check for ladder
        else if (this.ladders[position]) {
            finalPosition = this.ladders[position];
            
            // Play ladder sound
            audioManager.playLadderClimb();
            
            // Animate ladder climb
            await this.animateLadderClimb(playerNumber, position, finalPosition);
            
            // Show notification
            this.showNotification(`🪜 Ladder climb! Player ${playerNumber} climbs up to ${finalPosition}`);
        }

        // Update player position if changed
        if (finalPosition !== position) {
            this.removePlayerFromSquare(playerNumber, position);
            this.addPlayerToSquare(playerNumber, finalPosition);
            this.playerPositions[playerNumber] = finalPosition;
        }

        return finalPosition;
    }

    async animateSnakeEncounter(playerNumber, fromPosition, toPosition) {
        const fromSquare = this.getSquareElement(fromPosition);
        const toSquare = this.getSquareElement(toPosition);
        
        if (fromSquare && toSquare) {
            // Add snake attack animation to from square
            fromSquare.classList.add('snake-attack');
            
            // Wait for animation
            await this.delay(1500);
            
            // Remove animation class
            fromSquare.classList.remove('snake-attack');
            
            // Move player piece
            this.removePlayerFromSquare(playerNumber, fromPosition);
            this.addPlayerToSquare(playerNumber, toPosition);
            
            // Add landing animation
            toSquare.classList.add('snake-slide');
            setTimeout(() => {
                toSquare.classList.remove('snake-slide');
            }, 1200);
        }
    }

    async animateLadderClimb(playerNumber, fromPosition, toPosition) {
        const fromSquare = this.getSquareElement(fromPosition);
        const toSquare = this.getSquareElement(toPosition);
        
        if (fromSquare && toSquare) {
            // Add ladder glow animation to from square
            fromSquare.classList.add('ladder-glow');
            
            // Wait for animation
            await this.delay(1500);
            
            // Remove animation class
            fromSquare.classList.remove('ladder-glow');
            
            // Move player piece
            this.removePlayerFromSquare(playerNumber, fromPosition);
            this.addPlayerToSquare(playerNumber, toPosition);
            
            // Add climb animation
            toSquare.classList.add('ladder-climb');
            setTimeout(() => {
                toSquare.classList.remove('ladder-climb');
            }, 1000);
        }
    }

    animateSquare(position, animationClass) {
        const square = this.getSquareElement(position);
        if (!square) return;

        square.classList.add(animationClass);
        setTimeout(() => {
            square.classList.remove(animationClass);
        }, 400);
    }

    showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'game-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--card-background);
            color: var(--text-color);
            padding: 1rem 1.5rem;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow);
            z-index: 1000;
            animation: notificationSlide 0.5s ease-out;
            max-width: 300px;
            font-weight: bold;
        `;

        document.body.appendChild(notification);

        // Remove notification after delay
        setTimeout(() => {
            notification.style.animation = 'slideOutUp 0.3s ease-out forwards';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    getPlayerPosition(playerNumber) {
        return this.playerPositions[playerNumber] || 0;
    }

    resetBoard() {
        // Remove all player pieces
        this.squares.forEach(square => {
            const pieces = square.querySelectorAll('.player-piece');
            pieces.forEach(piece => piece.remove());
        });

        // Reset positions
        this.playerPositions = { 1: 0, 2: 0 };
        
        // Remove any active animations
        this.squares.forEach(square => {
            square.classList.remove('snake-attack', 'ladder-glow', 'snake-slide', 'ladder-climb');
        });
        
        this.isAnimating = false;
    }

    isSquareOccupied(position, excludePlayer = null) {
        const square = this.getSquareElement(position);
        if (!square) return false;

        const pieces = square.querySelectorAll('.player-piece');
        if (excludePlayer) {
            // Count pieces excluding the specified player
            const otherPieces = Array.from(pieces).filter(piece => 
                !piece.classList.contains(`player${excludePlayer}`)
            );
            return otherPieces.length > 0;
        }
        
        return pieces.length > 0;
    }

    highlightValidMoves(playerNumber, diceValue) {
        const currentPosition = this.getPlayerPosition(playerNumber);
        const targetPosition = currentPosition + diceValue;
        
        if (targetPosition <= 100) {
            this.highlightSquare(targetPosition, 1000);
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Get board state for saving/loading
    getBoardState() {
        return {
            playerPositions: { ...this.playerPositions },
            isAnimating: this.isAnimating
        };
    }

    // Restore board state
    setBoardState(state) {
        this.playerPositions = { ...state.playerPositions };
        
        // Update visual representation
        this.resetBoard();
        Object.entries(this.playerPositions).forEach(([playerNumber, position]) => {
            if (position > 0) {
                this.addPlayerToSquare(parseInt(playerNumber), position);
            }
        });
    }
}

// Create global board instance
const gameBoard = new GameBoard();

// Export for use in other modules
window.gameBoard = gameBoard;
