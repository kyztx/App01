export class Projectile {
    constructor(game, x, y, speedY, color = '#4df') {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = 4;
        this.height = 15;
        this.speedY = speedY;
        this.color = color;
        this.markedForDeletion = false;
        this.damage = 1;
        
        // Offset so x is center
        this.x -= this.width / 2;
    }

    update(deltaTime) {
        this.y += this.speedY;

        // If it goes off screen
        if (this.y < -this.height || this.y > this.game.height + this.height) {
            this.markedForDeletion = true;
        }
    }

    draw(context) {
        context.save();
        context.shadowBlur = 10;
        context.shadowColor = this.color;
        context.fillStyle = '#fff';
        context.fillRect(this.x, this.y, this.width, this.height);
        
        // Inner core
        context.fillStyle = this.color;
        context.fillRect(this.x + 1, this.y + 1, this.width - 2, this.height - 2);
        
        context.restore();
    }
}
