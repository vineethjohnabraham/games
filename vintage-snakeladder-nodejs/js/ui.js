// UI Management for Snake & Ladder Game
class UIManager {
    constructor() {
        this.currentScreen = 'main-menu';
        this.isTransitioning = false;
        this.settings = {
            soundEnabled: true,
            animationsEnabled: true,
            vibrationEnabled: true,
            volume: 50
        };
        
        this.loadSettings();
    }

    initialize() {
        this.setupEventListeners();
        this.loadSettings();
        this.updateSettingsUI();
    }

    setupEventListeners() {
        // Handle screen transitions
        document.addEventListener('click', (e) => {
            // Add click sound to buttons
            if (e.target.matches('button, .menu-btn, .action-btn, .win-btn, .back-btn, .roll-btn')) {
                audioManager.playButtonClick();
            }
        });

        // Handle settings changes
        this.setupSettingsListeners();
        
        // Handle keyboard shortcuts
        this.setupKeyboardShortcuts();
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Handle visibility change (tab switching)
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });
    }

    setupSettingsListeners() {
        // Sound toggle
        const soundToggle = document.getElementById('sound-toggle');
        if (soundToggle) {
            soundToggle.addEventListener('change', (e) => {
                this.settings.soundEnabled = e.target.checked;
                if (e.target.checked) {
                    audioManager.enable();
                } else {
                    audioManager.disable();
                }
                this.saveSettings();
            });
        }

        // Volume slider
        const volumeSlider = document.getElementById('volume-slider');
        if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => {
                this.settings.volume = parseInt(e.target.value);
                audioManager.setVolume(this.settings.volume / 100);
                this.saveSettings();
            });
        }

        // Animation toggle
        const animationToggle = document.getElementById('animation-toggle');
        if (animationToggle) {
            animationToggle.addEventListener('change', (e) => {
                this.settings.animationsEnabled = e.target.checked;
                document.body.classList.toggle('animations-disabled', !e.target.checked);
                this.saveSettings();
            });
        }

        // Vibration toggle
        const vibrationToggle = document.getElementById('vibration-toggle');
        if (vibrationToggle) {
            vibrationToggle.addEventListener('change', (e) => {
                this.settings.vibrationEnabled = e.target.checked;
                localStorage.setItem('vibrationEnabled', e.target.checked.toString());
                this.saveSettings();
            });
        }
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            switch (e.key) {
                case ' ':
                case 'Enter':
                    if (this.currentScreen === 'game-screen') {
                        e.preventDefault();
                        this.handleRollDice();
                    }
                    break;
                case 'Escape':
                    if (this.currentScreen === 'game-screen') {
                        this.showScreen('main-menu');
                    }
                    break;
                case 'r':
                case 'R':
                    if (this.currentScreen === 'game-screen' && e.ctrlKey) {
                        e.preventDefault();
                        this.handleResetGame();
                    }
                    break;
                case 's':
                case 'S':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        this.showScreen('settings-screen');
                    }
                    break;
            }
        });
    }

    showScreen(screenId) {
        if (this.isTransitioning) return;
        
        this.isTransitioning = true;
        
        // Hide current screen
        const currentScreen = document.querySelector('.screen.active');
        if (currentScreen) {
            currentScreen.classList.remove('active');
        }
        
        // Show new screen after short delay
        setTimeout(() => {
            const newScreen = document.getElementById(screenId);
            if (newScreen) {
                newScreen.classList.add('active');
                this.currentScreen = screenId;
            }
            this.isTransitioning = false;
        }, 150);

        // Handle specific screen logic
        this.handleScreenChange(screenId);
    }

    handleScreenChange(screenId) {
        switch (screenId) {
            case 'game-screen':
                this.focusGameControls();
                break;
            case 'main-menu':
                this.resetGameState();
                break;
            case 'settings-screen':
                this.updateSettingsUI();
                break;
        }
    }

    focusGameControls() {
        // Focus on roll dice button
        setTimeout(() => {
            const rollBtn = document.getElementById('roll-btn');
            if (rollBtn && !rollBtn.disabled) {
                rollBtn.focus();
            }
        }, 200);
    }

    resetGameState() {
        // This will be called when returning to main menu
        // Reset any game-specific UI states
    }

    updateSettingsUI() {
        // Update sound toggle
        const soundToggle = document.getElementById('sound-toggle');
        if (soundToggle) {
            soundToggle.checked = this.settings.soundEnabled;
        }

        // Update volume slider
        const volumeSlider = document.getElementById('volume-slider');
        if (volumeSlider) {
            volumeSlider.value = this.settings.volume;
        }

        // Update animation toggle
        const animationToggle = document.getElementById('animation-toggle');
        if (animationToggle) {
            animationToggle.checked = this.settings.animationsEnabled;
        }

        // Update vibration toggle
        const vibrationToggle = document.getElementById('vibration-toggle');
        if (vibrationToggle) {
            vibrationToggle.checked = this.settings.vibrationEnabled;
        }

        // Update sound button icon
        this.updateSoundButton();
    }

    updateSoundButton() {
        const soundBtn = document.getElementById('sound-btn');
        if (soundBtn) {
            soundBtn.textContent = this.settings.soundEnabled ? '🔊' : '🔇';
        }
    }

    handleResize() {
        // Handle responsive adjustments
        const gameBoard = document.getElementById('game-board');
        if (gameBoard && this.currentScreen === 'game-screen') {
            this.adjustBoardSize();
        }
    }

    adjustBoardSize() {
        const gameBoard = document.getElementById('game-board');
        const container = document.querySelector('.game-board-container');
        
        if (gameBoard && container) {
            const containerRect = container.getBoundingClientRect();
            const maxSize = Math.min(containerRect.width, containerRect.height) * 0.9;
            
            gameBoard.style.width = maxSize + 'px';
            gameBoard.style.height = maxSize + 'px';
        }
    }

    handleVisibilityChange() {
        if (document.hidden) {
            // Pause any ongoing animations or sounds
            audioManager.stopAllSounds();
        }
    }

    // Game-specific UI methods
    enableRollButton() {
        const rollBtn = document.getElementById('roll-btn');
        if (rollBtn) {
            rollBtn.disabled = false;
            rollBtn.textContent = '🎲 Roll Dice';
            rollBtn.classList.remove('loading');
        }
    }

    disableRollButton(text = 'Rolling...') {
        const rollBtn = document.getElementById('roll-btn');
        if (rollBtn) {
            rollBtn.disabled = true;
            rollBtn.textContent = text;
            rollBtn.classList.add('loading');
        }
    }

    updatePlayerInfo(playerNumber, position, name = null) {
        const playerInfo = document.getElementById(`player${playerNumber}-info`);
        if (playerInfo) {
            const positionElement = playerInfo.querySelector('.player-position');
            if (positionElement) {
                positionElement.textContent = `Position: ${position}`;
            }

            if (name) {
                const nameElement = playerInfo.querySelector('.player-name');
                if (nameElement) {
                    nameElement.textContent = name;
                }
            }
        }
    }

    showWinScreen(winner) {
        const winScreen = document.getElementById('win-screen');
        const winnerMessage = document.getElementById('winner-message');
        
        if (winScreen && winnerMessage) {
            winnerMessage.textContent = `${winner.name} Wins!`;
            this.showScreen('win-screen');
            
            // Add confetti effect
            this.createConfetti();
        }
    }

    createConfetti() {
        const colors = ['#ff6b35', '#4CAF50', '#2196F3', '#ff9800', '#9C27B0'];
        const confettiContainer = document.createElement('div');
        confettiContainer.className = 'confetti-container';
        confettiContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 9999;
        `;

        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.style.cssText = `
                position: absolute;
                width: 10px;
                height: 10px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                top: -10px;
                left: ${Math.random() * 100}%;
                animation: confetti ${Math.random() * 3 + 2}s ease-out forwards;
                transform: rotate(${Math.random() * 360}deg);
            `;
            confettiContainer.appendChild(confetti);
        }

        document.body.appendChild(confettiContainer);

        // Remove confetti after animation
        setTimeout(() => {
            if (confettiContainer.parentNode) {
                confettiContainer.parentNode.removeChild(confettiContainer);
            }
        }, 5000);
    }

    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        const notificationStyles = {
            info: 'background: var(--primary-color); color: white;',
            success: 'background: var(--success-color); color: white;',
            warning: 'background: var(--warning-color); color: white;',
            error: 'background: var(--danger-color); color: white;'
        };
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow);
            z-index: 1000;
            animation: notificationSlide 0.5s ease-out;
            max-width: 300px;
            font-weight: bold;
            ${notificationStyles[type]}
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutUp 0.3s ease-out forwards';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
    }

    showLoadingSpinner(container, text = 'Loading...') {
        const spinner = document.createElement('div');
        spinner.className = 'loading-spinner';
        spinner.innerHTML = `
            <div class="spinner"></div>
            <p>${text}</p>
        `;
        spinner.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
            z-index: 100;
        `;

        container.style.position = 'relative';
        container.appendChild(spinner);

        return spinner;
    }

    hideLoadingSpinner(container) {
        const spinner = container.querySelector('.loading-spinner');
        if (spinner) {
            spinner.remove();
        }
    }

    // Settings management
    saveSettings() {
        localStorage.setItem('gameSettings', JSON.stringify(this.settings));
    }

    loadSettings() {
        const saved = localStorage.getItem('gameSettings');
        if (saved) {
            try {
                this.settings = { ...this.settings, ...JSON.parse(saved) };
            } catch (error) {
                console.warn('Failed to load settings:', error);
            }
        }

        // Apply loaded settings
        this.applySettings();
    }

    applySettings() {
        // Apply sound settings
        if (this.settings.soundEnabled) {
            audioManager.enable();
        } else {
            audioManager.disable();
        }
        
        audioManager.setVolume(this.settings.volume / 100);

        // Apply animation settings
        document.body.classList.toggle('animations-disabled', !this.settings.animationsEnabled);

        // Apply vibration settings
        localStorage.setItem('vibrationEnabled', this.settings.vibrationEnabled.toString());
    }

    // Handle game events
    handleRollDice() {
        // This will be implemented in game.js
        if (window.rollDice) {
            window.rollDice();
        }
    }

    handleResetGame() {
        // This will be implemented in game.js
        if (window.resetGame) {
            window.resetGame();
        }
    }

    // Responsive utilities
    isMobile() {
        return window.innerWidth <= 768;
    }

    isTablet() {
        return window.innerWidth > 768 && window.innerWidth <= 1024;
    }

    isDesktop() {
        return window.innerWidth > 1024;
    }

    // Accessibility helpers
    announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.style.cssText = `
            position: absolute;
            left: -10000px;
            width: 1px;
            height: 1px;
            overflow: hidden;
        `;
        announcement.textContent = message;
        
        document.body.appendChild(announcement);
        
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }

    // Performance monitoring
    measurePerformance(name, fn) {
        const start = performance.now();
        const result = fn();
        const end = performance.now();
        console.log(`${name} took ${end - start} milliseconds`);
        return result;
    }
}

// Create global UI manager instance
const uiManager = new UIManager();

// Export for use in other modules
window.uiManager = uiManager;
