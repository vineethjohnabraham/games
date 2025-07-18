// Main script for the game collection index page
class GamePreview {
    constructor() {
        this.initializeSnakePreview();
    }
    
    initializeSnakePreview() {
        const canvas = document.getElementById('snake-preview');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const gridSize = 8;
        const gridWidth = canvas.width / gridSize;
        const gridHeight = canvas.height / gridSize;
        
        // Create a mini snake game preview
        let snake = [
            { x: 5, y: 5 },
            { x: 4, y: 5 },
            { x: 3, y: 5 },
            { x: 2, y: 5 },
            { x: 1, y: 5 }
        ];
        
        let gem = { x: 10, y: 3 };
        let obstacles = [
            { x: 8, y: 7, color: '#F44336' },  // Dark red
            { x: 12, y: 2, color: '#FFCDD2' }  // Light red
        ];
        
        let killer = { x: 0, y: 5 };
        let frame = 0;
        
        // Add roundRect support if not available
        if (!ctx.roundRect) {
            ctx.roundRect = function(x, y, width, height, radius) {
                this.beginPath();
                this.moveTo(x + radius, y);
                this.lineTo(x + width - radius, y);
                this.quadraticCurveTo(x + width, y, x + width, y + radius);
                this.lineTo(x + width, y + height - radius);
                this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
                this.lineTo(x + radius, y + height);
                this.quadraticCurveTo(x, y + height, x, y + height - radius);
                this.lineTo(x, y + radius);
                this.quadraticCurveTo(x, y, x + radius, y);
                this.closePath();
            };
        }
        
        const animate = () => {
            // Clear canvas
            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw subtle grid
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1;
            for (let i = 0; i <= gridWidth; i++) {
                ctx.beginPath();
                ctx.moveTo(i * gridSize, 0);
                ctx.lineTo(i * gridSize, canvas.height);
                ctx.stroke();
            }
            for (let i = 0; i <= gridHeight; i++) {
                ctx.beginPath();
                ctx.moveTo(0, i * gridSize);
                ctx.lineTo(canvas.width, i * gridSize);
                ctx.stroke();
            }
            
            // Draw snake with snake-like appearance
            snake.forEach((segment, index) => {
                const x = segment.x * gridSize;
                const y = segment.y * gridSize;
                
                if (index === 0) {
                    // Draw snake head (simplified for preview)
                    ctx.fillStyle = '#66BB6A';
                    ctx.beginPath();
                    ctx.roundRect(x + 1, y + 1, gridSize - 2, gridSize - 2, 3);
                    ctx.fill();
                    
                    // Draw eyes
                    ctx.fillStyle = '#000';
                    ctx.beginPath();
                    ctx.arc(x + 2, y + 2, 1, 0, 2 * Math.PI);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(x + gridSize - 2, y + 2, 1, 0, 2 * Math.PI);
                    ctx.fill();
                } else {
                    // Draw body segments with pattern
                    const isEven = index % 2 === 0;
                    ctx.fillStyle = isEven ? '#4CAF50' : '#388E3C';
                    ctx.beginPath();
                    ctx.roundRect(x + 1, y + 1, gridSize - 2, gridSize - 2, 2);
                    ctx.fill();
                    
                    // Add scale pattern
                    ctx.fillStyle = isEven ? '#388E3C' : '#2E7D32';
                    ctx.beginPath();
                    ctx.arc(x + gridSize / 2, y + gridSize / 2, 1, 0, 2 * Math.PI);
                    ctx.fill();
                }
            });
            
            // Draw solid gem (circle)
            ctx.fillStyle = '#00FF00';
            ctx.beginPath();
            ctx.arc(
                gem.x * gridSize + gridSize / 2,
                gem.y * gridSize + gridSize / 2,
                (gridSize - 4) / 2,
                0,
                2 * Math.PI
            );
            ctx.fill();
            
            // Draw obstacles with different shades of red
            obstacles.forEach(obstacle => {
                ctx.fillStyle = obstacle.color;
                ctx.fillRect(
                    obstacle.x * gridSize + 1,
                    obstacle.y * gridSize + 1,
                    gridSize - 2,
                    gridSize - 2
                );
            });
            
            // Draw killer (mini wizard)
            const x = killer.x * gridSize;
            const y = killer.y * gridSize;
            
            // Draw wizard body (simplified for preview)
            ctx.fillStyle = '#4A0E4E'; // Dark purple robe
            ctx.beginPath();
            ctx.arc(x + gridSize / 2, y + gridSize * 0.7, gridSize * 0.25, 0, 2 * Math.PI);
            ctx.fill();
            
            // Draw wizard head
            ctx.fillStyle = '#FFDBAC'; // Skin color
            ctx.beginPath();
            ctx.arc(x + gridSize / 2, y + gridSize * 0.3, gridSize * 0.12, 0, 2 * Math.PI);
            ctx.fill();
            
            // Draw wizard hat
            ctx.fillStyle = '#4A0E4E';
            ctx.beginPath();
            ctx.moveTo(x + gridSize / 2 - 2, y + gridSize * 0.2);
            ctx.lineTo(x + gridSize / 2, y + 1);
            ctx.lineTo(x + gridSize / 2 + 2, y + gridSize * 0.2);
            ctx.closePath();
            ctx.fill();
            
            // Draw tiny axe
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(x + gridSize - 1, y + gridSize * 0.2, 1, gridSize * 0.6);
            ctx.fillStyle = '#C0C0C0';
            ctx.fillRect(x + gridSize - 1, y + gridSize * 0.1, 2, 2);
            
            // Simple animation
            frame++;
            if (frame % 30 === 0) {
                // Move snake forward
                const head = { ...snake[0] };
                head.x += 1;
                if (head.x >= gridWidth) head.x = 0;
                
                snake.unshift(head);
                snake.pop();
                
                // Move killer
                if (killer.x < gridWidth - 1) {
                    killer.x += 1;
                } else {
                    killer.x = 0;
                }
            }
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }
}

// Function to open a game
function openGame(gameUrl) {
    window.location.href = gameUrl;
}

// Add click animation to game cards
document.addEventListener('DOMContentLoaded', () => {
    const gamePreview = new GamePreview();
    
    // Add click effect to game cards
    const gameCards = document.querySelectorAll('.game-card:not(.coming-soon)');
    gameCards.forEach(card => {
        card.addEventListener('click', (e) => {
            // Create ripple effect
            const ripple = document.createElement('div');
            const rect = card.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.6);
                transform: scale(0);
                animation: ripple 0.6s linear;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                pointer-events: none;
            `;
            
            card.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
    
    // Add ripple animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
});
