class ComputerPlayer {
    constructor(paddle, difficulty = 'medium') {
        this.paddle = paddle;
        this.difficulty = difficulty;
        
        // AI settings based on difficulty
        this.settings = this.getDifficultySettings(difficulty);
        
        // AI state
        this.targetY = 0;
        this.reactionTime = 0;
        this.lastReactionTime = 0;
        this.errorMargin = 0;
        this.isTracking = false;
    }
    
    getDifficultySettings(difficulty) {
        const settings = {
            easy: {
                speed: 8, // Increased from 4 to 8 (2x speed)
                reactionDelay: 300,
                errorMargin: 40,
                trackingAccuracy: 0.6,
                maxSpeed: 12, // Increased from 6 to 12 (2x speed)
                anticipation: 0.1
            },
            medium: {
                speed: 12, // Increased from 6 to 12 (2x speed)
                reactionDelay: 200,
                errorMargin: 25,
                trackingAccuracy: 0.75,
                maxSpeed: 16, // Increased from 8 to 16 (2x speed)
                anticipation: 0.3
            },
            hard: {
                speed: 16, // Increased from 8 to 16 (2x speed)
                reactionDelay: 150,
                errorMargin: 15,
                trackingAccuracy: 0.85,
                maxSpeed: 20, // Increased from 10 to 20 (2x speed)
                anticipation: 0.5
            },
            expert: {
                speed: 20, // Increased from 10 to 20 (2x speed)
                reactionDelay: 100,
                errorMargin: 8,
                trackingAccuracy: 0.95,
                maxSpeed: 24, // Increased from 12 to 24 (2x speed)
                anticipation: 0.7
            }
        };
        
        return settings[difficulty] || settings.medium;
    }
    
    setDifficulty(difficulty) {
        this.difficulty = difficulty;
        this.settings = this.getDifficultySettings(difficulty);
    }
    
    update(ball, currentTime) {
        // Initialize target if not set
        if (this.targetY === 0) {
            this.targetY = (this.paddle.canvasHeight - this.paddle.height) / 2;
        }
        
        // Only react if ball is moving towards the AI paddle (right side)
        const isMovingTowardsAI = ball.vx > 0; // Ball moving right towards AI
        
        if (!isMovingTowardsAI) {
            // Move towards center when ball is not coming
            this.targetY = (this.paddle.canvasHeight - this.paddle.height) / 2;
            this.moveTowardsTarget(this.settings.speed * 0.5);
            return;
        }
        
        // Check if enough time has passed for reaction
        if (currentTime - this.lastReactionTime > this.settings.reactionDelay) {
            this.calculateTarget(ball);
            this.lastReactionTime = currentTime;
        }
        
        // Move towards target
        this.moveTowardsTarget(this.settings.speed);
    }
    
    calculateTarget(ball) {
        // Simple target calculation - aim for the ball's Y position
        let targetY = ball.y;
        
        // If ball is moving towards paddle, predict where it will be
        if (ball.vx > 0) {
            const timeToReach = Math.abs((this.paddle.x - ball.x) / (ball.vx || 1));
            targetY = ball.y + (ball.vy * timeToReach * this.settings.anticipation);
        }
        
        // Add some error based on difficulty  
        const error = (Math.random() - 0.5) * this.settings.errorMargin;
        targetY += error;
        
        // Apply tracking accuracy
        if (Math.random() > this.settings.trackingAccuracy) {
            targetY = ball.y; // Sometimes just follow ball directly
        }
        
        // Ensure target is within bounds
        this.targetY = Math.max(0, Math.min(targetY - this.paddle.height / 2, 
                                           this.paddle.canvasHeight - this.paddle.height));
    }
    
    moveTowardsTarget(speed) {
        const paddleCenter = this.paddle.y + this.paddle.height / 2;
        const targetCenter = this.targetY + this.paddle.height / 2;
        const distance = targetCenter - paddleCenter;
        
        // Stop any existing movement first
        this.paddle.setMoveUp(false);
        this.paddle.setMoveDown(false);
        
        // Move towards target if far enough away
        if (Math.abs(distance) > 10) { // Increased threshold for better stability
            if (distance > 0) {
                // Target is below, move down
                this.paddle.setMoveDown(true);
            } else {
                // Target is above, move up  
                this.paddle.setMoveUp(true);
            }
        }
    }
    
    reset() {
        this.targetY = (this.paddle.canvasHeight - this.paddle.height) / 2;
        this.lastReactionTime = 0;
        this.paddle.setMoveUp(false);
        this.paddle.setMoveDown(false);
    }
    
    // Debug method to visualize AI target (optional)
    drawDebug(ctx) {
        if (this.targetY > 0) {
            ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
            ctx.fillRect(this.paddle.x - 5, this.targetY, this.paddle.width + 10, 5);
        }
    }
}
