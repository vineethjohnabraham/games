class Ball {
    constructor(x, y, radius, color = '#fff') {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        
        // Velocity
        this.vx = 0;
        this.vy = 0;
        this.baseSpeed = 15; // Increased from 5 to 15 (3x speed)
        this.maxSpeed = 36; // Increased from 12 to 36 (3x speed)
        this.speedIncrease = 0.6; // Increased from 0.2 to 0.6 (3x speed increase rate)
        
        // Canvas bounds (set by game)
        this.canvasWidth = 0;
        this.canvasHeight = 0;
        
        // Trail effect
        this.trail = [];
        this.maxTrailLength = 8;
    }
    
    setCanvasBounds(width, height) {
        this.canvasWidth = width;
        this.canvasHeight = height;
    }
    
    reset(x, y) {
        this.x = x;
        this.y = y;
        this.trail = [];
        
        // Random initial direction
        const angle = (Math.random() - 0.5) * Math.PI / 3; // ±30 degrees
        const direction = Math.random() < 0.5 ? 1 : -1; // Left or right
        
        this.vx = Math.cos(angle) * this.baseSpeed * direction;
        this.vy = Math.sin(angle) * this.baseSpeed;
    }
    
    update() {
        // Add current position to trail
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }
        
        // Update position
        this.x += this.vx;
        this.y += this.vy;
        
        // Bounce off top and bottom walls
        if (this.y - this.radius <= 0 || this.y + this.radius >= this.canvasHeight) {
            this.vy = -this.vy;
            this.y = Math.max(this.radius, Math.min(this.y, this.canvasHeight - this.radius));
            
            // Add some randomness to prevent infinite vertical bouncing
            this.vy += (Math.random() - 0.5) * 0.5;
        }
    }
    
    draw(ctx) {
        // Draw trail
        this.drawTrail(ctx);
        
        // Draw ball with glow effect
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(0.7, this.color);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0.1)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Outer glow
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
    
    drawTrail(ctx) {
        if (this.trail.length < 2) return;
        
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        
        for (let i = 0; i < this.trail.length - 1; i++) {
            const alpha = (i + 1) / this.trail.length * 0.3;
            ctx.globalAlpha = alpha;
            
            ctx.beginPath();
            ctx.moveTo(this.trail[i].x, this.trail[i].y);
            ctx.lineTo(this.trail[i + 1].x, this.trail[i + 1].y);
            ctx.stroke();
        }
        
        ctx.globalAlpha = 1;
    }
    
    // Check collision with paddle
    checkPaddleCollision(paddle) {
        const paddleRect = paddle.getRect();
        
        // Check if ball is within paddle bounds
        const ballLeft = this.x - this.radius;
        const ballRight = this.x + this.radius;
        const ballTop = this.y - this.radius;
        const ballBottom = this.y + this.radius;
        
        if (ballRight >= paddleRect.x && 
            ballLeft <= paddleRect.x + paddleRect.width &&
            ballBottom >= paddleRect.y && 
            ballTop <= paddleRect.y + paddleRect.height) {
            
            // Calculate hit position on paddle (0 = top, 1 = bottom)
            const hitPos = (this.y - paddleRect.y) / paddleRect.height;
            
            // Reverse horizontal direction
            this.vx = -this.vx;
            
            // Adjust vertical velocity based on hit position
            const maxAngle = Math.PI / 3; // 60 degrees max
            const angle = (hitPos - 0.5) * maxAngle;
            const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            
            this.vx = Math.sign(this.vx) * Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
            
            // Increase speed slightly
            const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            if (currentSpeed < this.maxSpeed) {
                const newSpeed = Math.min(currentSpeed + this.speedIncrease, this.maxSpeed);
                const speedRatio = newSpeed / currentSpeed;
                this.vx *= speedRatio;
                this.vy *= speedRatio;
            }
            
            // Move ball out of paddle to prevent multiple collisions
            if (this.vx > 0) {
                this.x = paddleRect.x + paddleRect.width + this.radius;
            } else {
                this.x = paddleRect.x - this.radius;
            }
            
            return true;
        }
        
        return false;
    }
    
    // Check if ball is out of bounds (scored)
    isOutOfBounds() {
        return this.x + this.radius < 0 || this.x - this.radius > this.canvasWidth;
    }
    
    // Get which side the ball went out on
    getOutSide() {
        if (this.x + this.radius < 0) return 'left';
        if (this.x - this.radius > this.canvasWidth) return 'right';
        return null;
    }
    
    // Get current position
    getPosition() {
        return { x: this.x, y: this.y };
    }
    
    // Get current velocity
    getVelocity() {
        return { vx: this.vx, vy: this.vy };
    }
}
