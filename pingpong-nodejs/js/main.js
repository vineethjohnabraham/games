// Main game initialization and event handlers
class GameApp {
    constructor() {
        this.game = null;
        this.gameMode = 'twoPlayer'; // 'twoPlayer' or 'computer'
        this.difficulty = 'medium';
        this.setupEventListeners();
        this.detectDevice();
        this.setupModeSelection();
        this.setupDifficultySelection();
        
        // Initialize UI to default state
        this.selectGameMode('twoPlayer');
    }

    detectDevice() {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        if (isMobile || isTouchDevice) {
            document.body.classList.add('mobile');
            this.showTouchControls();
        } else {
            document.body.classList.add('desktop');
        }
    }

    showTouchControls() {
        const touchControls = document.getElementById('touchControls');
        if (touchControls) {
            touchControls.classList.remove('hidden');
        }
    }

    setupEventListeners() {
        // Start game button
        const startGameBtn = document.getElementById('startGameBtn');
        if (startGameBtn) {
            startGameBtn.addEventListener('click', () => this.startGame());
        }

        // Pause button
        const pauseBtn = document.getElementById('pauseBtn');
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => this.pauseGame());
        }

        // Resume button
        const resumeBtn = document.getElementById('resumeBtn');
        if (resumeBtn) {
            resumeBtn.addEventListener('click', () => this.resumeGame());
        }

        // Restart button
        const restartBtn = document.getElementById('restartBtn');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => this.restartGame());
        }

        // Main menu button
        const mainMenuBtn = document.getElementById('mainMenuBtn');
        if (mainMenuBtn) {
            mainMenuBtn.addEventListener('click', () => this.goToMainMenu());
        }

        // Play again button
        const playAgainBtn = document.getElementById('playAgainBtn');
        if (playAgainBtn) {
            playAgainBtn.addEventListener('click', () => this.playAgain());
        }

        // New game button
        const newGameBtn = document.getElementById('newGameBtn');
        if (newGameBtn) {
            newGameBtn.addEventListener('click', () => this.newGame());
        }

        // Enter key to start game from name inputs
        const nameInputs = document.querySelectorAll('#player1Name, #player2Name');
        nameInputs.forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.startGame();
                }
            });
        });
    }

    setupModeSelection() {
        const twoPlayerBtn = document.getElementById('twoPlayerBtn');
        const computerBtn = document.getElementById('computerBtn');
        
        if (!twoPlayerBtn || !computerBtn) {
            console.error('Mode buttons not found!');
            return;
        }
        
        twoPlayerBtn.addEventListener('click', () => this.selectGameMode('twoPlayer'));
        computerBtn.addEventListener('click', () => this.selectGameMode('computer'));
    }
    
    selectGameMode(mode) {
        this.gameMode = mode;
        
        // Update button states
        document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
        
        const player2Input = document.getElementById('player2Input');
        const difficultySection = document.getElementById('difficultySection');
        
        if (mode === 'twoPlayer') {
            document.getElementById('twoPlayerBtn').classList.add('active');
            difficultySection.classList.add('hidden');
            player2Input.classList.remove('hidden');
            this.updateControlsDisplay('twoPlayer');
            this.updateTouchControlsDisplay('twoPlayer');
        } else {
            document.getElementById('computerBtn').classList.add('active');
            difficultySection.classList.remove('hidden');
            player2Input.classList.add('hidden');
            this.updateControlsDisplay('computer');
            this.updateTouchControlsDisplay('computer');
        }
    }
    
    setupDifficultySelection() {
        const difficultyBtns = document.querySelectorAll('.difficulty-btn');
        const descriptions = {
            easy: '🟢 Easy: Slow and predictable AI',
            medium: '🟡 Medium: Balanced speed and reaction time',
            hard: '🔴 Hard: Fast and accurate AI',
            expert: '🔥 Expert: Lightning fast with perfect timing'
        };
        
        difficultyBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const level = btn.dataset.level;
                this.selectDifficulty(level);
                
                // Update description
                document.getElementById('difficultyDescription').textContent = descriptions[level];
            });
        });
    }
    
    selectDifficulty(level) {
        this.difficulty = level;
        
        // Update button states
        document.querySelectorAll('.difficulty-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-level="${level}"]`).classList.add('active');
    }
    
    updateControlsDisplay(mode) {
        const player1Controls = document.getElementById('player1Controls');
        const player2Controls = document.getElementById('player2Controls');
        const mobileControls = document.getElementById('mobileControls');
        
        if (mode === 'computer') {
            player1Controls.innerHTML = '<strong>Player:</strong> W (Up) / S (Down)';
            player2Controls.innerHTML = '<strong>Computer:</strong> AI Controlled';
            mobileControls.textContent = 'Touch left side of screen to move your paddle';
        } else {
            player1Controls.innerHTML = '<strong>Player 1:</strong> W (Up) / S (Down)';
            player2Controls.innerHTML = '<strong>Player 2:</strong> ↑ (Up) / ↓ (Down)';
            mobileControls.textContent = 'Touch left/right side of screen to move paddles';
        }
    }

    updateTouchControlsDisplay(mode) {
        const rightTouchArea = document.getElementById('rightTouchArea');
        const leftPlayerName = rightTouchArea?.querySelector('.player-name');
        const rightPlayerName = rightTouchArea?.querySelector('.player-name');
        
        if (mode === 'computer') {
            // Hide the right touch area in computer mode
            if (rightTouchArea) {
                rightTouchArea.style.display = 'none';
            }
            // Update left touch area to show just "Player"
            const leftTouchArea = document.getElementById('leftTouchArea');
            const leftPlayerNameElement = leftTouchArea?.querySelector('.player-name');
            if (leftPlayerNameElement) {
                leftPlayerNameElement.textContent = 'Player';
            }
        } else {
            // Show the right touch area in two-player mode
            if (rightTouchArea) {
                rightTouchArea.style.display = 'flex';
            }
            // Update left touch area to show "P1"
            const leftTouchArea = document.getElementById('leftTouchArea');
            const leftPlayerNameElement = leftTouchArea?.querySelector('.player-name');
            if (leftPlayerNameElement) {
                leftPlayerNameElement.textContent = 'P1';
            }
        }
    }

    updateGameScreenForMode() {
        const touchControls = document.getElementById('touchControls');
        const rightTouchArea = document.getElementById('rightTouchArea');
        
        if (this.gameMode === 'computer') {
            // Hide right touch area in computer mode
            if (rightTouchArea) {
                rightTouchArea.style.display = 'none';
            }
            // Update touch controls layout for single player
            if (touchControls) {
                touchControls.classList.add('single-player-mode');
            }
        } else {
            // Show right touch area in two-player mode
            if (rightTouchArea) {
                rightTouchArea.style.display = 'flex';
            }
            // Remove single player styling
            if (touchControls) {
                touchControls.classList.remove('single-player-mode');
            }
        }
    }

    startGame() {
        const player1Name = document.getElementById('player1Name').value.trim() || 'Player';
        let player2Name;
        
        if (this.gameMode === 'computer') {
            player2Name = 'Computer';
        } else {
            player2Name = document.getElementById('player2Name').value.trim() || 'Player 2';
            
            // Validate names for two-player mode
            if (player1Name === player2Name) {
                alert('Players must have different names!');
                return;
            }
        }

        // Hide start screen and show game screen
        this.showScreen('gameScreen');

        // Update player name displays
        document.getElementById('player1NameDisplay').textContent = player1Name;
        document.getElementById('player2NameDisplay').textContent = player2Name;
        
        // Update the score section styling for computer mode
        this.updateGameScreenForMode();

        // Initialize and start the game
        if (this.game) {
            this.game.destroy();
        }
        
        this.game = new Game();
        this.game.setPlayerNames(player1Name, player2Name);
        this.game.setGameMode(this.gameMode, this.difficulty);
        this.game.start();
    }

    pauseGame() {
        if (this.game && this.game.gameState === 'playing') {
            this.game.pause();
            this.showScreen('pauseScreen');
        }
    }

    resumeGame() {
        if (this.game && this.game.gameState === 'paused') {
            this.game.resume();
            this.showScreen('gameScreen');
        }
    }

    restartGame() {
        if (this.game) {
            this.game.restart();
            this.showScreen('gameScreen');
        }
    }

    goToMainMenu() {
        if (this.game) {
            this.game.destroy();
            this.game = null;
        }
        this.showScreen('startScreen');
    }

    playAgain() {
        if (this.game) {
            this.game.restart();
            this.showScreen('gameScreen');
        }
    }

    newGame() {
        if (this.game) {
            this.game.destroy();
            this.game = null;
        }
        this.showScreen('startScreen');
        
        // Clear player names
        document.getElementById('player1Name').value = '';
        document.getElementById('player2Name').value = '';
    }

    showScreen(screenId) {
        // Hide all screens
        const screens = document.querySelectorAll('.screen');
        screens.forEach(screen => screen.classList.add('hidden'));

        // Show the requested screen
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.remove('hidden');
        }
    }

    showGameOver(winner, player1Score, player2Score) {
        const winnerDisplay = document.getElementById('winnerDisplay');
        const finalScore = document.getElementById('finalScore');
        
        if (winnerDisplay) {
            winnerDisplay.innerHTML = `<h3>🎉 ${winner} Wins!</h3>`;
        }
        
        // Hide final score display since we don't track scores
        if (finalScore) {
            finalScore.style.display = 'none';
        }
        
        this.showScreen('gameOverScreen');
    }
}

// Initialize the game app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.gameApp = new GameApp();
});

// Make sure the game app is accessible globally for the Game class
window.showGameOver = (winner, player1Score, player2Score) => {
    if (window.gameApp) {
        window.gameApp.showGameOver(winner, player1Score, player2Score);
    }
};
