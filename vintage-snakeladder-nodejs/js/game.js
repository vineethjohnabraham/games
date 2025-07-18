// Main Game Logic for Snake & Ladder Game
class SnakeLadderGame {
    constructor() {
        this.gameState = 'menu'; // 'menu', 'playing', 'paused', 'finished'
        this.gameMode = null; // 'vs-computer', 'vs-player'
        this.currentDiceValue = 0;
        this.isRolling = false;
        this.winner = null;
        this.gameStartTime = null;
        this.moveHistory = [];
        this.gameId = null;
    }

    initialize() {
        // Initialize all game components
        gameBoard.initialize();
        uiManager.initialize();
        
        // Show main menu
        uiManager.showScreen('main-menu');
        
        console.log('Snake & Ladder game initialized successfully!');
    }

    // Start a new game
    startGame(player1Name = null, player2Name = null) {
        console.log(`Starting two-player game`);
        
        this.gameMode = 'vs-player';
        this.gameState = 'playing';
        this.gameId = this.generateGameId();
        this.gameStartTime = Date.now();
        this.moveHistory = [];
        this.winner = null;

        // Create players
        playerManager.createPlayers('vs-player', player1Name, player2Name);

        // Reset board
        gameBoard.resetBoard();

        // Setup UI
        this.setupGameUI();

        // Show game screen
        uiManager.showScreen('game-screen');

        // Enable first player's turn
        uiManager.enableRollButton();

        console.log(`Game started. Current player: ${playerManager.getCurrentPlayer().name}`);
        uiManager.showNotification(`Game started! ${playerManager.getCurrentPlayer().name} goes first.`);
    }

    // Show player setup screen
    showPlayerSetup() {
        uiManager.showScreen('player-setup-screen');
        
        // Focus on first input
        setTimeout(() => {
            const player1Input = document.getElementById('player1-name');
            if (player1Input) {
                player1Input.focus();
            }
        }, 200);
    }

    // Start two player game with custom names
    startTwoPlayerGame() {
        const player1Input = document.getElementById('player1-name');
        const player2Input = document.getElementById('player2-name');
        
        const player1Name = player1Input.value.trim();
        const player2Name = player2Input.value.trim();
        
        console.log('Player input values:', { player1Name, player2Name });
        
        // Use default names if not provided
        const finalPlayer1Name = player1Name || 'Player 1';
        const finalPlayer2Name = player2Name || 'Player 2';
        
        console.log('Final player names:', { finalPlayer1Name, finalPlayer2Name });
        
        // Validate names are different (case insensitive)
        if (finalPlayer1Name.toLowerCase() === finalPlayer2Name.toLowerCase() && 
            player1Name && player2Name) {
            uiManager.showNotification('Player names must be different!', 'warning');
            player2Input.focus();
            player2Input.select();
            return;
        }
        
        // Clear the form for next time
        player1Input.value = '';
        player2Input.value = '';
        
        this.startGame(finalPlayer1Name, finalPlayer2Name);
    }

    setupGameUI() {
        // Update player names in UI
        const player1Info = document.getElementById('player1-info');
        const player2Info = document.getElementById('player2-info');

        const player1 = playerManager.getPlayer(1);
        const player2 = playerManager.getPlayer(2);

        if (player1Info && player1) {
            player1Info.querySelector('.player-name').textContent = player1.name;
        }
        if (player2Info && player2) {
            player2Info.querySelector('.player-name').textContent = player2.name;
        }
    }

    // Roll dice and handle turn
    async rollDice() {
        if (this.isRolling || this.gameState !== 'playing') {
            return;
        }

        const currentPlayer = playerManager.getCurrentPlayer();
        this.isRolling = true;
        
        // Disable roll button
        uiManager.disableRollButton('Rolling...');

        try {
            // Animate dice roll
            await this.animateDiceRoll();

            // Generate dice value
            this.currentDiceValue = Math.floor(Math.random() * 6) + 1;

            // Show dice result
            this.showDiceResult(this.currentDiceValue);

            // Record move in history
            this.recordMove(currentPlayer.number, this.currentDiceValue, currentPlayer.position);

            // Move player
            const gameWon = await currentPlayer.move(this.currentDiceValue);

            if (gameWon === true) {
                await this.handleGameWin(currentPlayer);
            } else {
                // Switch to next player
                await this.handleTurnEnd(currentPlayer);
            }

        } catch (error) {
            console.error('Error during dice roll:', error);
            uiManager.showNotification('Error during turn. Please try again.', 'error');
            uiManager.enableRollButton(); // Re-enable button on error
        } finally {
            this.isRolling = false;
        }
    }

    async animateDiceRoll() {
        const diceElement = document.getElementById('dice');
        const diceFace = diceElement.querySelector('.dice-face');

        // Play dice sound
        audioManager.playDiceRoll();

        // Add rolling animation
        diceElement.classList.add('rolling');

        // Show random numbers during roll
        const rollDuration = 1600;
        const interval = 100;
        const iterations = rollDuration / interval;

        for (let i = 0; i < iterations; i++) {
            const randomFace = Math.floor(Math.random() * 6) + 1;
            diceFace.textContent = this.getDiceFace(randomFace);
            await this.delay(interval);
        }

        // Remove rolling animation
        diceElement.classList.remove('rolling');
    }

    getDiceFace(value) {
        const faces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
        return faces[value - 1] || value.toString();
    }

    showDiceResult(value) {
        const diceElement = document.getElementById('dice');
        const diceFace = diceElement.querySelector('.dice-face');
        
        diceFace.textContent = this.getDiceFace(value);
        
        // Add bounce animation
        diceElement.classList.add('dice-bounce');
        setTimeout(() => {
            diceElement.classList.remove('dice-bounce');
        }, 800);
    }

    async handleTurnEnd(currentPlayer) {
        // Small delay before next action
        await this.delay(500);

        if (this.gameMode === 'vs-computer' && currentPlayer.number === 1) {
            // Human player finished, now computer's turn
            await this.switchToComputerTurn();
        } else if (this.gameMode === 'vs-computer' && currentPlayer.number === 2) {
            // Computer finished, back to human player
            this.switchToHumanTurn();
        } else {
            // Two player mode - simply switch turns
            this.switchTurn();
        }
    }

    async switchToComputerTurn() {
        playerManager.switchTurn();
        uiManager.disableRollButton('Computer is thinking...');

        // Computer thinking delay
        await this.delay(1500);

        // Computer makes its move automatically
        if (this.gameState === 'playing' && !this.isRolling) {
            const computerPlayer = playerManager.getCurrentPlayer();
            console.log(`Computer (${computerPlayer.name}) is making a move...`);
            
            // Generate dice value for computer
            this.currentDiceValue = Math.floor(Math.random() * 6) + 1;
            console.log(`Computer rolled: ${this.currentDiceValue}`);
            
            // Show dice result without animation for computer
            this.showDiceResult(this.currentDiceValue);
            
            // Play dice sound
            audioManager.playDiceRoll();
            
            // Record move in history
            this.recordMove(computerPlayer.number, this.currentDiceValue, computerPlayer.position);

            // Move computer player
            const gameWon = await computerPlayer.move(this.currentDiceValue);

            if (gameWon === true) {
                await this.handleGameWin(computerPlayer);
            } else {
                // Switch back to human player
                await this.delay(1000); // Brief pause to see computer's move
                this.switchToHumanTurn();
            }
        }
    }

    switchToHumanTurn() {
        if (this.gameState !== 'playing') return;
        
        playerManager.switchTurn();
        uiManager.enableRollButton();
        
        console.log(`Turn switched to human player`);
    }

    switchTurn() {
        if (this.gameState !== 'playing') return;
        
        playerManager.switchTurn();
        uiManager.enableRollButton();
        
        const currentPlayer = playerManager.getCurrentPlayer();
        uiManager.showNotification(`${currentPlayer.name}'s turn`);
        
        console.log(`Turn switched to ${currentPlayer.name}`);
    }

    async handleGameWin(winner) {
        this.gameState = 'finished';
        this.winner = winner;
        
        const gameEndTime = Date.now();
        const gameDuration = Math.floor((gameEndTime - this.gameStartTime) / 1000);

        // Record game statistics
        this.recordGameEnd(winner, gameDuration);

        // Show win animation
        await this.showWinAnimation(winner);

        // Show win screen after delay
        setTimeout(() => {
            uiManager.showWinScreen(winner);
        }, 2000);

        console.log(`Game won by ${winner.name} in ${gameDuration} seconds`);
    }

    async showWinAnimation(winner) {
        // Celebrate winner's piece
        const square = gameBoard.getSquareElement(100);
        if (square) {
            const piece = square.querySelector(`.player-piece.player${winner.number}`);
            if (piece) {
                piece.classList.add('piece-celebrate');
            }
            square.classList.add('winner-square');
        }

        // Show fireworks/confetti
        uiManager.createConfetti();

        // Play celebration sound
        audioManager.playGameWin();
    }

    // Reset current game
    resetGame() {
        if (this.gameState === 'finished' || confirm('Are you sure you want to restart the game?')) {
            this.gameState = 'playing';
            this.currentDiceValue = 0;
            this.isRolling = false;
            this.winner = null;
            this.gameStartTime = Date.now();
            this.moveHistory = [];

            // Reset players
            playerManager.resetAllPlayers();

            // Reset board
            gameBoard.resetBoard();

            // Reset dice
            const diceElement = document.getElementById('dice');
            const diceFace = diceElement.querySelector('.dice-face');
            diceFace.textContent = '?';

            // Enable first player
            uiManager.enableRollButton();

            uiManager.showNotification('Game reset! Good luck!');
        }
    }

    // Go to main menu
    goToMenu() {
        if (this.gameState === 'playing') {
            if (confirm('Are you sure you want to quit the current game?')) {
                this.quitGame();
            }
        } else {
            uiManager.showScreen('main-menu');
        }
    }

    quitGame() {
        this.gameState = 'menu';
        this.gameMode = null;
        this.winner = null;
        
        // Reset everything
        playerManager.resetAllPlayers();
        gameBoard.resetBoard();
        
        // Go to menu
        uiManager.showScreen('main-menu');
    }

    // Show rules screen
    showRules() {
        uiManager.showScreen('rules-screen');
    }

    // Show settings screen
    showSettings() {
        uiManager.showScreen('settings-screen');
    }

    // Toggle sound
    toggleSound() {
        const isEnabled = audioManager.toggle();
        uiManager.updateSoundButton();
        uiManager.showNotification(
            isEnabled ? 'Sound enabled' : 'Sound disabled',
            'info',
            1000
        );
    }

    // Settings handlers
    toggleSoundSetting() {
        this.toggleSound();
    }

    setVolume(value) {
        audioManager.setVolume(value / 100);
        uiManager.settings.volume = value;
        uiManager.saveSettings();
    }

    toggleAnimations() {
        const toggle = document.getElementById('animation-toggle');
        uiManager.settings.animationsEnabled = toggle.checked;
        document.body.classList.toggle('animations-disabled', !toggle.checked);
        uiManager.saveSettings();
    }

    toggleVibration() {
        const toggle = document.getElementById('vibration-toggle');
        uiManager.settings.vibrationEnabled = toggle.checked;
        localStorage.setItem('vibrationEnabled', toggle.checked.toString());
        uiManager.saveSettings();
    }

    // Game history and statistics
    recordMove(playerNumber, diceValue, fromPosition) {
        const move = {
            playerNumber,
            diceValue,
            fromPosition,
            toPosition: null, // Will be set after move
            timestamp: Date.now(),
            gameId: this.gameId
        };
        
        this.moveHistory.push(move);
    }

    recordGameEnd(winner, duration) {
        const gameRecord = {
            gameId: this.gameId,
            mode: this.gameMode,
            winner: winner.number,
            duration,
            moves: this.moveHistory.length,
            timestamp: Date.now()
        };

        // Save to localStorage
        const gameHistory = JSON.parse(localStorage.getItem('gameHistory') || '[]');
        gameHistory.push(gameRecord);
        
        // Keep only last 50 games
        if (gameHistory.length > 50) {
            gameHistory.splice(0, gameHistory.length - 50);
        }
        
        localStorage.setItem('gameHistory', JSON.stringify(gameHistory));
    }

    generateGameId() {
        return 'game_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Save and load game state
    saveGame() {
        const gameState = {
            gameState: this.gameState,
            gameMode: this.gameMode,
            currentDiceValue: this.currentDiceValue,
            gameStartTime: this.gameStartTime,
            moveHistory: this.moveHistory,
            gameId: this.gameId,
            playerState: playerManager.getGameState(),
            boardState: gameBoard.getBoardState(),
            timestamp: Date.now()
        };

        localStorage.setItem('savedGame', JSON.stringify(gameState));
        uiManager.showNotification('Game saved!', 'success');
    }

    loadGame() {
        const saved = localStorage.getItem('savedGame');
        if (!saved) {
            uiManager.showNotification('No saved game found', 'warning');
            return false;
        }

        try {
            const gameState = JSON.parse(saved);
            
            // Restore game state
            this.gameState = gameState.gameState;
            this.gameMode = gameState.gameMode;
            this.currentDiceValue = gameState.currentDiceValue;
            this.gameStartTime = gameState.gameStartTime;
            this.moveHistory = gameState.moveHistory || [];
            this.gameId = gameState.gameId;

            // Restore player state
            playerManager.restoreGameState(gameState.playerState);

            // Restore board state
            gameBoard.setBoardState(gameState.boardState);

            // Show game screen
            uiManager.showScreen('game-screen');
            
            // Update UI based on current state
            if (this.gameState === 'playing') {
                uiManager.enableRollButton();
            }

            uiManager.showNotification('Game loaded!', 'success');
            return true;

        } catch (error) {
            console.error('Failed to load game:', error);
            uiManager.showNotification('Failed to load game', 'error');
            return false;
        }
    }

    // Utility methods
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    getCurrentGameStats() {
        return {
            gameId: this.gameId,
            mode: this.gameMode,
            duration: this.gameStartTime ? Date.now() - this.gameStartTime : 0,
            moves: this.moveHistory.length,
            currentPlayer: playerManager.getCurrentPlayer()?.name,
            playerStats: playerManager.getAllStats()
        };
    }

    // Debug methods (for development)
    debugMovePlayer(playerNumber, position) {
        const player = playerManager.getPlayer(playerNumber);
        if (player) {
            gameBoard.movePlayer(playerNumber, player.position, position, false);
            player.position = position;
            player.updatePlayerInfo();
        }
    }

    debugWinGame(playerNumber) {
        this.debugMovePlayer(playerNumber, 100);
        const player = playerManager.getPlayer(playerNumber);
        this.handleGameWin(player);
    }
}

// Create global game instance
const game = new SnakeLadderGame();

// Global functions for HTML onclick handlers
function startGame(mode) {
    game.startGame(mode);
}

function showPlayerSetup() {
    game.showPlayerSetup();
}

function startTwoPlayerGame() {
    game.startTwoPlayerGame();
}

function rollDice() {
    game.rollDice();
}

function resetGame() {
    game.resetGame();
}

function goToMenu() {
    game.goToMenu();
}

function showRules() {
    game.showRules();
}

function showSettings() {
    game.showSettings();
}

function toggleSound() {
    game.toggleSound();
}

function toggleSoundSetting() {
    game.toggleSoundSetting();
}

function setVolume(value) {
    game.setVolume(value);
}

function toggleAnimations() {
    game.toggleAnimations();
}

function toggleVibration() {
    game.toggleVibration();
}

// Handle Enter key in player setup form
function handleSetupKeypress(event) {
    if (event.key === 'Enter') {
        startTwoPlayerGame();
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    game.initialize();
});

// Export for debugging and extensions
window.game = game;
window.rollDice = rollDice;
window.resetGame = resetGame;
