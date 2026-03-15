export class Particle {
    constructor(game, x, y, color) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.size = Math.random() * 5 + 2;
        this.baseSpeed = Math.random() * 4 + 1;
        
        // Random direction for explosion burst
        const angle = Math.random() * Math.PI * 2;
        this.speedX = Math.cos(angle) * this.baseSpeed;
        this.speedY = Math.sin(angle) * this.baseSpeed;
        
        this.color = color;
        this.markedForDeletion = false;
        
        this.life = 0;
        this.maxLife = Math.random() * 20 + 20; // Frames approx
        
        // Added drift down like debris
        this.gravity = 0.05;
    }

    update(deltaTime) {
        this.life++;
        this.speedY += this.gravity;
        
        this.x += this.speedX;
        this.y += this.speedY;

        this.size *= 0.95; // Shrink
        
        if (this.life > this.maxLife || this.size < 0.5) {
            this.markedForDeletion = true;
        }
    }

    draw(context) {
        context.save();
        context.globalAlpha = 1 - (this.life / this.maxLife);
        context.fillStyle = this.color;
        context.shadowBlur = 10;
        context.shadowColor = this.color;
        
        context.beginPath();
        context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        context.fill();
        context.restore();
    }
}
