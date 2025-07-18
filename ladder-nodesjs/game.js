// 🏁 Garage Race Adventure - Web Version
class GarageRaceGame {
    constructor() {
        this.boardSize = 100;
        this.players = [];
        this.currentPlayerIndex = 0;
        
        // Innovative garage-themed elements
        this.oilSpills = {
            16: 6, 47: 26, 49: 11, 56: 53, 62: 19,
            64: 60, 87: 24, 93: 73, 95: 75, 98: 78
        };
        
        this.turboBoosts = {
            2: 38, 7: 14, 8: 31, 15: 26, 21: 42,
            28: 84, 36: 44, 51: 67, 71: 91, 78: 98
        };

        this.specialEvents = {
            25: "🔧 Pit Stop! Roll again!",
            50: "⛽ Fuel Station! Advance 5 spaces!",
            75: "🏆 Championship Boost! Advance 10 spaces!"
        };

        this.carEmojis = ["🏎️", "🚗", "🚙", "🚕", "🚐", "🚓"];
        this.isRolling = false;
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Welcome screen
        document.getElementById('start-game-btn').addEventListener('click', () => {
            this.showScreen('setup-screen');
        });

        // Setup screen
        document.getElementById('player-count').addEventListener('change', (e) => {
            this.generatePlayerInputs(parseInt(e.target.value));
        });

        document.getElementById('start-race-btn').addEventListener('click', () => {
            this.setupPlayers();
        });

        // Game screen
        document.getElementById('roll-dice-btn').addEventListener('click', () => {
            this.rollDice();
        });

        // Winner screen
        document.getElementById('play-again-btn').addEventListener('click', () => {
            this.resetGame();
        });

        // Initialize with 2 players
        this.generatePlayerInputs(2);
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }

    generatePlayerInputs(numPlayers) {
        const container = document.getElementById('player-names-section');
        container.innerHTML = '';

        for (let i = 1; i <= numPlayers; i++) {
            const playerDiv = document.createElement('div');
            playerDiv.className = 'player-input';
            playerDiv.innerHTML = `
                <span class="player-car">${this.carEmojis[i-1]}</span>
                <label>Racer ${i}:</label>
                <input type="text" class="name-input" placeholder="Enter name" value="Player ${i}">
            `;
            container.appendChild(playerDiv);
        }
    }

    setupPlayers() {
        const nameInputs = document.querySelectorAll('.name-input');
        this.players = [];
        
        nameInputs.forEach((input, index) => {
            this.players.push({
                name: input.value.trim() || `Player ${index + 1}`,
                position: 0,
                car: this.carEmojis[index],
                id: index + 1
            });
        });

        this.currentPlayerIndex = 0;
        this.showScreen('game-screen');
        this.updateGameDisplay();
        this.generateBoard();
    }

    updateGameDisplay() {
        // Update current player display
        const currentPlayer = this.players[this.currentPlayerIndex];
        document.getElementById('current-player-car').textContent = currentPlayer.car;
        document.getElementById('current-player-name').textContent = currentPlayer.name;
        
        // Update players status panel
        const playersStatusContainer = document.getElementById('players-status');
        if (playersStatusContainer) {
            playersStatusContainer.innerHTML = '';

            this.players.forEach((player, index) => {
                const playerDiv = document.createElement('div');
                playerDiv.className = 'player-status-item';
                if (index === this.currentPlayerIndex) {
                    playerDiv.classList.add('current');
                }
                
                playerDiv.innerHTML = `
                    <span class="player-status-car">${player.car}</span>
                    <div class="player-status-info">
                        <span class="player-status-name">${player.name}</span>
                        <span class="player-status-position">Pos: ${player.position}</span>
                    </div>
                `;
                playersStatusContainer.appendChild(playerDiv);
            });
        }

        this.updateBoard();
    }

    generateBoard() {
        const boardGrid = document.getElementById('board-grid');
        boardGrid.innerHTML = '';

        // Generate board squares (1-100)
        for (let i = 100; i >= 1; i--) {
            const square = document.createElement('div');
            square.className = 'board-square';
            square.dataset.position = i;
            square.textContent = i;

            // Add special square styling
            if (this.oilSpills[i]) {
                square.classList.add('oil');
                square.innerHTML = `${i}<br>🛢️`;
            } else if (this.turboBoosts[i]) {
                square.classList.add('turbo');
                square.innerHTML = `${i}<br>⚡`;
            } else if (this.specialEvents[i]) {
                square.classList.add('special');
                if (i === 25) square.innerHTML = `${i}<br>🔧`;
                if (i === 50) square.innerHTML = `${i}<br>⛽`;
                if (i === 75) square.innerHTML = `${i}<br>🏆`;
            }

            boardGrid.appendChild(square);
        }
    }

    updateBoard() {
        // Reset all squares
        document.querySelectorAll('.board-square').forEach(square => {
            square.classList.remove('player');
            const position = parseInt(square.dataset.position);
            
            // Reset content for special squares
            if (this.oilSpills[position]) {
                square.innerHTML = `${position}<br>🛢️`;
            } else if (this.turboBoosts[position]) {
                square.innerHTML = `${position}<br>⚡`;
            } else if (this.specialEvents[position]) {
                if (position === 25) square.innerHTML = `${position}<br>🔧`;
                if (position === 50) square.innerHTML = `${position}<br>⛽`;
                if (position === 75) square.innerHTML = `${position}<br>🏆`;
            } else {
                square.textContent = position;
            }
        });

        // Add players to their positions
        this.players.forEach(player => {
            if (player.position > 0) {
                const square = document.querySelector(`[data-position="${player.position}"]`);
                if (square) {
                    square.classList.add('player');
                    square.innerHTML += `<br>${player.car}`;
                }
            }
        });
    }

    async rollDice() {
        if (this.isRolling) return;
        
        this.isRolling = true;
        const rollBtn = document.getElementById('roll-dice-btn');
        const diceDisplay = document.getElementById('dice-display');
        const diceResult = document.getElementById('dice-result');
        const messageDiv = document.getElementById('game-message');
        
        rollBtn.disabled = true;
        rollBtn.textContent = '🎲 Rolling...';
        diceResult.textContent = '';

        // Animate dice roll
        let rollAnimation = 0;
        const rollInterval = setInterval(() => {
            diceDisplay.textContent = '🎲';
            diceDisplay.style.animation = 'spin 0.1s ease-in-out';
            rollAnimation++;
            
            if (rollAnimation > 10) {
                clearInterval(rollInterval);
                const diceValue = Math.floor(Math.random() * 6) + 1;
                diceDisplay.textContent = `🎲`;
                diceResult.textContent = `Rolled: ${diceValue}`;
                this.processMove(diceValue);
            }
        }, 100);
    }

    async processMove(diceRoll) {
        const currentPlayer = this.players[this.currentPlayerIndex];
        const messageDiv = document.getElementById('game-message');
        
        messageDiv.innerHTML = `${currentPlayer.car} ${currentPlayer.name} rolled ${diceRoll}!`;
        
        setTimeout(() => {
            let newPosition = currentPlayer.position + diceRoll;
            
            // Check if player wins
            if (newPosition >= this.boardSize) {
                newPosition = this.boardSize;
                currentPlayer.position = newPosition;
                this.endGame();
                return;
            }
            
            // Check for special squares
            const specialResult = this.checkSpecialSquare(newPosition);
            currentPlayer.position = specialResult.newPosition;
            
            if (specialResult.message) {
                messageDiv.innerHTML = `${currentPlayer.car} ${currentPlayer.name} ${specialResult.message}`;
            } else {
                messageDiv.innerHTML = `${currentPlayer.car} ${currentPlayer.name} moves to position ${currentPlayer.position}!`;
            }
            
            this.updateGameDisplay();
            
            // Handle special events that give extra turns
            if (newPosition === 25) { // Pit stop - roll again
                setTimeout(() => {
                    messageDiv.innerHTML += '<br>🔧 Extra turn! Roll again!';
                    this.enableNextRoll();
                }, 1000);
                return;
            }
            
            // Move to next player after a delay
            setTimeout(() => {
                this.nextPlayer();
            }, 2000);
            
        }, 1000);
    }

    checkSpecialSquare(position) {
        let message = "";
        let newPosition = position;
        
        // Check for oil spills
        if (this.oilSpills[position]) {
            newPosition = this.oilSpills[position];
            message = `hit an oil spill! 🛢️ Slides back to position ${newPosition}!`;
        }
        // Check for turbo boosts
        else if (this.turboBoosts[position]) {
            newPosition = this.turboBoosts[position];
            message = `activated turbo boost! ⚡ Rockets forward to position ${newPosition}!`;
        }
        // Check for special events
        else if (this.specialEvents[position]) {
            if (position === 50) {
                newPosition += 5;  // Fuel station
                message = `stopped at fuel station! ⛽ Advances 5 more spaces to ${newPosition}!`;
            } else if (position === 75) {
                newPosition += 10; // Championship boost
                message = `got championship boost! 🏆 Advances 10 more spaces to ${newPosition}!`;
            }
        }
        
        return { newPosition, message };
    }

    nextPlayer() {
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        this.updateGameDisplay();
        this.enableNextRoll();
    }

    enableNextRoll() {
        this.isRolling = false;
        const rollBtn = document.getElementById('roll-dice-btn');
        const diceResult = document.getElementById('dice-result');
        
        rollBtn.disabled = false;
        rollBtn.textContent = '🎲 ROLL DICE';
        diceResult.textContent = ''; // Clear previous dice result
    }

    endGame() {
        const winner = this.players[this.currentPlayerIndex];
        
        // Sort players by position for final standings
        const sortedPlayers = [...this.players].sort((a, b) => b.position - a.position);
        const medals = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣", "6️⃣"];
        
        document.getElementById('winner-announcement').innerHTML = 
            `🥇 CHAMPION: ${winner.car} ${winner.name}! 🥇`;
        
        const standingsDiv = document.getElementById('final-standings');
        standingsDiv.innerHTML = '<h3>🏁 Final Standings:</h3>';
        
        sortedPlayers.forEach((player, index) => {
            const standingDiv = document.createElement('div');
            standingDiv.className = 'standing-item';
            standingDiv.innerHTML = `
                <span class="medal">${medals[index] || "🏁"}</span>
                <span class="player-car">${player.car}</span>
                <span>${player.name}</span>
                <span style="margin-left: auto;">Position ${player.position}</span>
            `;
            standingsDiv.appendChild(standingDiv);
        });
        
        this.showScreen('winner-screen');
    }

    resetGame() {
        this.players = [];
        this.currentPlayerIndex = 0;
        this.isRolling = false;
        
        // Reset forms
        document.getElementById('player-count').value = '2';
        this.generatePlayerInputs(2);
        
        // Reset messages
        document.getElementById('game-message').textContent = '';
        document.getElementById('dice-display').textContent = '🎲';
        
        this.showScreen('welcome-screen');
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new GarageRaceGame();
});

// Add some fun sound effects (optional)
function playSound(type) {
    // You can add sound effects here if desired
    // For now, we'll use vibration on mobile devices
    if (navigator.vibrate) {
        switch(type) {
            case 'roll':
                navigator.vibrate([50, 50, 50]);
                break;
            case 'special':
                navigator.vibrate([100, 50, 100]);
                break;
            case 'win':
                navigator.vibrate([200, 100, 200, 100, 200]);
                break;
        }
    }
}
