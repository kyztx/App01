import { Particle } from '../entities/Particle.js';

export class PowerUp {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
        this.speedY = 1.5;
        this.markedForDeletion = false;
        
        const types = ['rapid', 'double', 'shield', 'bomb'];
        this.type = types[Math.floor(Math.random() * types.length)];
        
        switch(this.type) {
            case 'rapid': this.color = '#f80'; break;
            case 'double': this.color = '#0f0'; break;
            case 'shield': this.color = '#0ff'; break;
            case 'bomb': this.color = '#f0f'; break;
        }
    }

    update(deltaTime) {
        this.y += this.speedY;
        if (this.y > this.game.height) {
            this.markedForDeletion = true;
        }
    }

    draw(context) {
        context.save();
        context.fillStyle = this.color;
        context.shadowBlur = 10;
        context.shadowColor = this.color;
        
        context.beginPath();
        context.translate(this.x + this.width/2, this.y + this.height/2);
        context.rotate(Date.now() / 200);
        context.rect(-this.width/2, -this.height/2, this.width, this.height);
        context.fill();
        
        // Inner white dot
        context.fillStyle = '#fff';
        context.fillRect(-2, -2, 4, 4);
        
        context.restore();
    }

    applyEffect(player) {
        this.markedForDeletion = true;
        this.game.soundManager.playPowerUp();
        
        // Visual effect for pickup
        for (let i = 0; i < 10; i++) {
            this.game.particles.push(new Particle(this.game, this.x, this.y, this.color));
        }

        switch(this.type) {
            case 'rapid':
                player.rapidFire = true;
                player.rapidFireTimer = 10000; // 10s
                break;
            case 'double':
                player.doubleLaser = true;
                player.doubleLaserTimer = 10000;
                break;
            case 'shield':
                player.hasShield = true;
                break;
            case 'bomb':
                // Destroy all non-boss enemies
                this.game.enemies.forEach(enemy => {
                    if (!enemy.isBoss) {
                        enemy.destroy();
                    } else {
                        enemy.hit(20);
                    }
                });
                break;
        }
    }
}
