class Paddle {
    constructor(x, y, width, height, color = '#fff') {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.speed = 0;
        this.maxSpeed = 16; // Increased from 8 to 16 (2x speed)
        this.acceleration = 1.0; // Increased from 0.5 to 1.0 (2x acceleration)
        this.friction = 0.8;
        
        // Movement flags
        this.moveUp = false;
        this.moveDown = false;
        
        // Canvas bounds (set by game)
        this.canvasHeight = 0;
    }
    
    setCanvasBounds(height) {
        this.canvasHeight = height;
    }
    
    update() {
        // Handle movement based on input
        if (this.moveUp && !this.moveDown) {
            this.speed = Math.max(this.speed - this.acceleration, -this.maxSpeed);
        } else if (this.moveDown && !this.moveUp) {
            this.speed = Math.min(this.speed + this.acceleration, this.maxSpeed);
        } else {
            // Apply friction when no input
            this.speed *= this.friction;
            if (Math.abs(this.speed) < 0.1) {
                this.speed = 0;
            }
        }
        
        // Update position
        this.y += this.speed;
        
        // Keep paddle within canvas bounds
        this.y = Math.max(0, Math.min(this.y, this.canvasHeight - this.height));
    }
    
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Add a subtle glow effect
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.shadowBlur = 0;
    }
    
    setMoveUp(moving) {
        this.moveUp = moving;
    }
    
    setMoveDown(moving) {
        this.moveDown = moving;
    }
    
    // For touch controls - direct movement
    moveByDelta(deltaY) {
        const sensitivity = 1.5; // Adjust for touch sensitivity
        this.y += deltaY * sensitivity;
        this.y = Math.max(0, Math.min(this.y, this.canvasHeight - this.height));
    }
    
    // Get center Y coordinate
    getCenterY() {
        return this.y + this.height / 2;
    }
    
    // Get collision rectangle
    getRect() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
    
    // Reset paddle position
    reset(x, y) {
        this.x = x;
        this.y = y;
        this.speed = 0;
        this.moveUp = false;
        this.moveDown = false;
    }
}
