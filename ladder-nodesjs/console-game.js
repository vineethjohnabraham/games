// 🏁 GARAGE RACE ADVENTURE - Console Version 🏁
// An innovative racing-themed board game

const readline = require('readline');

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

        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    displayWelcome() {
        console.clear();
        console.log("🏁".repeat(50));
        console.log("🏎️  WELCOME TO GARAGE RACE ADVENTURE!  🏎️");
        console.log("🏁".repeat(50));
        console.log("");
        console.log("🚗 Race your way to position 100!");
        console.log("⚡ Hit TURBO BOOSTS to speed ahead!");
        console.log("🛢️  Avoid OIL SPILLS that slow you down!");
        console.log("🔧 Land on special garage events for surprises!");
        console.log("");
    }

    async getNumberOfPlayers() {
        return new Promise((resolve) => {
            this.rl.question("How many racers want to compete? (2-6 players): ", (answer) => {
                const numPlayers = parseInt(answer);
                if (numPlayers >= 2 && numPlayers <= 6) {
                    resolve(numPlayers);
                } else {
                    console.log("Please enter a number between 2 and 6!");
                    this.getNumberOfPlayers().then(resolve);
                }
            });
        });
    }

    async getPlayerName(playerNumber) {
        return new Promise((resolve) => {
            this.rl.question(`Enter name for Racer ${playerNumber}: `, (name) => {
                resolve(name.trim() || `Racer ${playerNumber}`);
            });
        });
    }

    async setupPlayers() {
        const numPlayers = await this.getNumberOfPlayers();
        
        for (let i = 1; i <= numPlayers; i++) {
            const name = await this.getPlayerName(i);
            this.players.push({
                name: name,
                position: 0,
                car: this.getCarEmoji(i),
                id: i
            });
        }
        
        console.log("\n🏁 RACERS READY! 🏁");
        this.players.forEach(player => {
            console.log(`${player.car} ${player.name} is ready to race!`);
        });
        
        await this.waitForEnter("\nPress Enter to start the race...");
    }

    getCarEmoji(playerNumber) {
        const cars = ["🏎️", "🚗", "🚙", "🚕", "🚐", "🚓"];
        return cars[playerNumber - 1] || "🚗";
    }

    rollDice() {
        return Math.floor(Math.random() * 6) + 1;
    }

    async waitForEnter(message) {
        return new Promise((resolve) => {
            this.rl.question(message, () => {
                resolve();
            });
        });
    }

    displayBoard() {
        console.clear();
        console.log("🏁 GARAGE RACE ADVENTURE - CURRENT POSITIONS 🏁\n");
        
        // Show player positions
        this.players.forEach(player => {
            const progressBar = "▓".repeat(Math.floor(player.position / 2)) + 
                              "░".repeat(50 - Math.floor(player.position / 2));
            console.log(`${player.car} ${player.name.padEnd(15)} [${progressBar}] ${player.position}/100`);
        });
        
        console.log("\n" + "=".repeat(60));
    }

    checkSpecialSquare(position) {
        let message = "";
        let newPosition = position;
        
        // Check for oil spills
        if (this.oilSpills[position]) {
            newPosition = this.oilSpills[position];
            message = `🛢️ OH NO! Hit an oil spill! Slide back to position ${newPosition}!`;
        }
        // Check for turbo boosts
        else if (this.turboBoosts[position]) {
            newPosition = this.turboBoosts[position];
            message = `⚡ TURBO BOOST! Rocket forward to position ${newPosition}!`;
        }
        // Check for special events
        else if (this.specialEvents[position]) {
            message = this.specialEvents[position];
            if (position === 50) newPosition += 5;  // Fuel station
            if (position === 75) newPosition += 10; // Championship boost
        }
        
        return { newPosition, message };
    }

    async playTurn() {
        const currentPlayer = this.players[this.currentPlayerIndex];
        
        console.log(`\n🎯 ${currentPlayer.car} ${currentPlayer.name}'s turn!`);
        await this.waitForEnter("Press Enter to roll the dice...");
        
        const diceRoll = this.rollDice();
        console.log(`🎲 Rolled: ${diceRoll}`);
        
        let newPosition = currentPlayer.position + diceRoll;
        
        // Check if player wins
        if (newPosition >= this.boardSize) {
            newPosition = this.boardSize;
            currentPlayer.position = newPosition;
            return true; // Game over
        }
        
        // Check for special squares
        const specialResult = this.checkSpecialSquare(newPosition);
        currentPlayer.position = specialResult.newPosition;
        
        if (specialResult.message) {
            console.log(specialResult.message);
        }
        
        console.log(`${currentPlayer.car} ${currentPlayer.name} moves to position ${currentPlayer.position}!`);
        
        // Handle special events that give extra turns
        if (newPosition === 25) { // Pit stop - roll again
            console.log("🔧 Extra turn! Roll again!");
            await this.waitForEnter("Press Enter to continue...");
            return false; // Don't advance to next player
        }
        
        await this.waitForEnter("Press Enter to continue...");
        
        // Move to next player
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        
        return false; // Continue game
    }

    displayWinner() {
        const winner = this.players[this.currentPlayerIndex];
        console.clear();
        console.log("🏆".repeat(50));
        console.log("🏁           RACE FINISHED!           🏁");
        console.log("🏆".repeat(50));
        console.log("");
        console.log(`🥇 CHAMPION: ${winner.car} ${winner.name}! 🥇`);
        console.log("");
        console.log("🏁 Final Positions:");
        
        // Sort players by position for final standings
        const sortedPlayers = [...this.players].sort((a, b) => b.position - a.position);
        const medals = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣", "6️⃣"];
        
        sortedPlayers.forEach((player, index) => {
            console.log(`${medals[index] || "🏁"} ${player.car} ${player.name} - Position ${player.position}`);
        });
        
        console.log("\n🏆 Thanks for racing! 🏆");
    }

    async startGame() {
        this.displayWelcome();
        await this.setupPlayers();
        
        let gameOver = false;
        while (!gameOver) {
            this.displayBoard();
            gameOver = await this.playTurn();
        }
        
        this.displayWinner();
        this.rl.close();
    }
}

// Start the game
const game = new GarageRaceGame();
game.startGame().catch(console.error);
