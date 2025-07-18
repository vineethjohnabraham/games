// Player Management for Snake & Ladder Game
class Player {
    constructor(number, name = null, isComputer = false) {
        this.number = number;
        this.name = name || `Player ${number}`;
        this.position = 0;
        this.isComputer = isComputer;
        this.avatar = number === 1 ? '🔴' : '🔵';
        this.wins = 0;
        this.gamesPlayed = 0;
        this.totalMoves = 0;
        this.snakeEncounters = 0;
        this.ladderClimbs = 0;
        this.isActive = false;
    }

    // Move player by dice value
    async move(diceValue, animate = true) {
        const oldPosition = this.position;
        let newPosition = oldPosition + diceValue;

        console.log(`${this.name} rolling ${diceValue}, moving from ${oldPosition} to ${newPosition}`);

        // Check if move is valid (can't exceed 100)
        if (newPosition > 100) {
            // Bounce back rule: if you roll more than needed, bounce back
            const excess = newPosition - 100;
            newPosition = 100 - excess;
            
            console.log(`${this.name} bounces back to ${newPosition}`);
            
            // Show bounce back notification
            if (newPosition !== oldPosition) {
                gameBoard.showNotification(`${this.name} bounces back to ${newPosition}!`);
            }
        }

        // Only move if position actually changes
        if (newPosition !== oldPosition) {
            const finalPosition = await gameBoard.movePlayer(this.number, oldPosition, newPosition, animate);
            this.position = finalPosition;
            this.totalMoves++;

            console.log(`${this.name} final position: ${this.position}`);

            // Track statistics
            if (gameBoard.snakes[newPosition]) {
                this.snakeEncounters++;
            }
            if (gameBoard.ladders[newPosition]) {
                this.ladderClimbs++;
            }

            // Update UI
            this.updatePlayerInfo();

            // Check for win condition - only if actually reached 100
            if (this.position === 100) {
                console.log(`${this.name} reached 100! Winning!`);
                return this.handleWin();
            }
        }

        return false; // Return false to indicate no win
    }

    // Handle winning
    handleWin() {
        this.wins++;
        this.gamesPlayed++;
        
        console.log(`${this.name} wins! Position: ${this.position}`);
        
        // Play win sound
        audioManager.playGameWin();
        
        // Add celebration animation to player piece
        const square = gameBoard.getSquareElement(100);
        if (square) {
            const piece = square.querySelector(`.player-piece.player${this.number}`);
            if (piece) {
                piece.classList.add('piece-celebrate');
            }
            square.classList.add('winner-square');
        }

        // Update statistics
        this.saveStatistics();

        return true; // Indicates game won
    }

    // Computer AI move
    async makeComputerMove(diceValue) {
        if (!this.isComputer) return;

        // Add thinking delay for realism
        const thinkingTime = Math.random() * 1000 + 500; // 0.5-1.5 seconds
        await this.delay(thinkingTime);

        // Highlight the move before making it
        gameBoard.highlightValidMoves(this.number, diceValue);

        // Add another small delay
        await this.delay(300);

        return await this.move(diceValue);
    }

    // Update player info in UI
    updatePlayerInfo() {
        const playerInfo = document.getElementById(`player${this.number}-info`);
        if (playerInfo) {
            const positionElement = playerInfo.querySelector('.player-position');
            if (positionElement) {
                positionElement.textContent = `Position: ${this.position}`;
            }

            const nameElement = playerInfo.querySelector('.player-name');
            if (nameElement) {
                nameElement.textContent = this.name;
            }
        }
    }

    // Set active state
    setActive(active) {
        this.isActive = active;
        const playerInfo = document.getElementById(`player${this.number}-info`);
        if (playerInfo) {
            if (active) {
                playerInfo.classList.add('active');
            } else {
                playerInfo.classList.remove('active');
            }
        }

        // Update player piece visual state
        const squares = document.querySelectorAll('.board-square');
        squares.forEach(square => {
            const piece = square.querySelector(`.player-piece.player${this.number}`);
            if (piece) {
                if (active) {
                    piece.classList.add('active');
                } else {
                    piece.classList.remove('active');
                }
            }
        });
    }

    // Reset player for new game
    reset() {
        const oldPosition = this.position;
        this.position = 0;
        this.totalMoves = 0;
        this.snakeEncounters = 0;
        this.ladderClimbs = 0;
        this.isActive = false;

        // Remove from board
        if (oldPosition > 0) {
            gameBoard.removePlayerFromSquare(this.number, oldPosition);
        }

        // Update UI
        this.updatePlayerInfo();
        this.setActive(false);
    }

    // Get player statistics
    getStatistics() {
        return {
            name: this.name,
            wins: this.wins,
            gamesPlayed: this.gamesPlayed,
            winRate: this.gamesPlayed > 0 ? (this.wins / this.gamesPlayed * 100).toFixed(1) : 0,
            totalMoves: this.totalMoves,
            snakeEncounters: this.snakeEncounters,
            ladderClimbs: this.ladderClimbs,
            position: this.position
        };
    }

    // Save statistics to localStorage
    saveStatistics() {
        const stats = this.getStatistics();
        const key = `player${this.number}Stats`;
        localStorage.setItem(key, JSON.stringify(stats));
    }

    // Load statistics from localStorage
    loadStatistics() {
        const key = `player${this.number}Stats`;
        const saved = localStorage.getItem(key);
        if (saved) {
            try {
                const stats = JSON.parse(saved);
                this.wins = stats.wins || 0;
                this.gamesPlayed = stats.gamesPlayed || 0;
                this.name = stats.name || this.name;
            } catch (error) {
                console.warn('Failed to load player statistics:', error);
            }
        }
    }

    // Set custom name
    setName(name) {
        this.name = name;
        this.updatePlayerInfo();
        this.saveStatistics();
    }

    // Set computer difficulty (affects thinking time and strategy)
    setDifficulty(level) {
        if (!this.isComputer) return;
        
        this.difficulty = level;
        // Adjust AI behavior based on difficulty
        switch (level) {
            case 'easy':
                this.thinkingTimeMultiplier = 1.5;
                break;
            case 'medium':
                this.thinkingTimeMultiplier = 1.0;
                break;
            case 'hard':
                this.thinkingTimeMultiplier = 0.5;
                break;
        }
    }

    // AI strategy (for future enhancement)
    evaluateMove(diceValue) {
        const currentPosition = this.position;
        const targetPosition = currentPosition + diceValue;
        
        let score = 0;
        
        // Prefer moves that avoid snakes
        if (gameBoard.snakes[targetPosition]) {
            score -= 10;
        }
        
        // Prefer moves that hit ladders
        if (gameBoard.ladders[targetPosition]) {
            score += 10;
        }
        
        // Prefer moves closer to finish
        score += (targetPosition - currentPosition);
        
        return score;
    }

    // Handle special moves (for game variants)
    handleSpecialMove(moveType) {
        switch (moveType) {
            case 'double-turn':
                return true; // Player gets another turn
            case 'skip-turn':
                return false; // Player loses next turn
            case 'extra-dice':
                return 'extra-dice'; // Player gets to roll again
            default:
                return false;
        }
    }

    // Get player state for saving
    getState() {
        return {
            number: this.number,
            name: this.name,
            position: this.position,
            isComputer: this.isComputer,
            avatar: this.avatar,
            wins: this.wins,
            gamesPlayed: this.gamesPlayed,
            totalMoves: this.totalMoves,
            snakeEncounters: this.snakeEncounters,
            ladderClimbs: this.ladderClimbs,
            isActive: this.isActive
        };
    }

    // Restore player state
    setState(state) {
        this.number = state.number;
        this.name = state.name;
        this.position = state.position;
        this.isComputer = state.isComputer;
        this.avatar = state.avatar;
        this.wins = state.wins || 0;
        this.gamesPlayed = state.gamesPlayed || 0;
        this.totalMoves = state.totalMoves || 0;
        this.snakeEncounters = state.snakeEncounters || 0;
        this.ladderClimbs = state.ladderClimbs || 0;
        this.isActive = state.isActive || false;
        
        this.updatePlayerInfo();
        this.setActive(this.isActive);
    }

    // Utility method for delays
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Display player tooltip with statistics
    showTooltip() {
        const stats = this.getStatistics();
        const tooltip = document.createElement('div');
        tooltip.className = 'player-tooltip';
        tooltip.innerHTML = `
            <h4>${this.name}</h4>
            <p>Games: ${stats.gamesPlayed}</p>
            <p>Wins: ${stats.wins}</p>
            <p>Win Rate: ${stats.winRate}%</p>
            <p>Snakes: ${stats.snakeEncounters}</p>
            <p>Ladders: ${stats.ladderClimbs}</p>
        `;
        
        // Position and show tooltip
        document.body.appendChild(tooltip);
        
        // Remove tooltip after delay
        setTimeout(() => {
            if (tooltip.parentNode) {
                tooltip.parentNode.removeChild(tooltip);
            }
        }, 3000);
    }
}

// Player Manager Class
class PlayerManager {
    constructor() {
        this.players = {};
        this.currentPlayerNumber = 1;
        this.gameMode = null;
    }

    createPlayers(gameMode, player1Name = null, player2Name = null) {
        console.log('Creating players with:', { gameMode, player1Name, player2Name });
        
        this.gameMode = gameMode;
        this.players = {};

        if (gameMode === 'vs-computer') {
            this.players[1] = new Player(1, player1Name || 'You', false);
            this.players[2] = new Player(2, 'Computer', true);
        } else {
            this.players[1] = new Player(1, player1Name || 'Player 1', false);
            this.players[2] = new Player(2, player2Name || 'Player 2', false);
        }

        console.log('Created players:', {
            player1: this.players[1].name,
            player2: this.players[2].name
        });

        // Load saved statistics
        Object.values(this.players).forEach(player => {
            player.loadStatistics();
            player.updatePlayerInfo();
        });

        this.currentPlayerNumber = 1;
        this.setCurrentPlayer(1);
    }

    getCurrentPlayer() {
        return this.players[this.currentPlayerNumber];
    }

    getPlayer(number) {
        return this.players[number];
    }

    switchTurn() {
        // Deactivate current player
        this.players[this.currentPlayerNumber].setActive(false);
        
        // Switch to next player
        this.currentPlayerNumber = this.currentPlayerNumber === 1 ? 2 : 1;
        
        // Activate new current player
        this.setCurrentPlayer(this.currentPlayerNumber);
        
        return this.currentPlayerNumber;
    }

    setCurrentPlayer(playerNumber) {
        this.currentPlayerNumber = playerNumber;
        
        // Update all players' active state
        Object.values(this.players).forEach(player => {
            player.setActive(player.number === playerNumber);
        });

        // Update turn indicator
        this.updateTurnIndicator();
    }

    updateTurnIndicator() {
        const indicator = document.getElementById('turn-indicator');
        if (indicator) {
            const currentPlayer = this.getCurrentPlayer();
            const turnText = indicator.querySelector('.current-turn');
            if (turnText) {
                turnText.textContent = `${currentPlayer.name}'s Turn`;
            }
        }
    }

    resetAllPlayers() {
        Object.values(this.players).forEach(player => {
            player.reset();
        });
        this.currentPlayerNumber = 1;
        this.setCurrentPlayer(1);
    }

    getAllStats() {
        const stats = {};
        Object.values(this.players).forEach(player => {
            stats[player.number] = player.getStatistics();
        });
        return stats;
    }

    getGameState() {
        const state = {
            gameMode: this.gameMode,
            currentPlayerNumber: this.currentPlayerNumber,
            players: {}
        };

        Object.entries(this.players).forEach(([number, player]) => {
            state.players[number] = player.getState();
        });

        return state;
    }

    restoreGameState(state) {
        this.gameMode = state.gameMode;
        this.currentPlayerNumber = state.currentPlayerNumber;
        
        Object.entries(state.players).forEach(([number, playerState]) => {
            if (this.players[number]) {
                this.players[number].setState(playerState);
            }
        });

        this.setCurrentPlayer(this.currentPlayerNumber);
    }
}

// Create global player manager instance
const playerManager = new PlayerManager();

// Export for use in other modules
window.playerManager = playerManager;
window.Player = Player;
