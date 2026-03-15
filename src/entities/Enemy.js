import { Particle } from './Particle.js';
import { PowerUp } from '../systems/PowerUp.js';

export class Enemy {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.speedX = 0;
        this.speedY = 2;
        this.markedForDeletion = false;
        
        // Stats to be overridden
        this.hp = 1;
        this.scoreValue = 10;
        this.color = '#f33';
        this.isBoss = false;
    }

    update(deltaTime) {
        this.x += this.speedX;
        this.y += this.speedY;

        // Bounce off walls
        if (this.x < 0 || this.x > this.game.width - this.width) {
            this.speedX *= -1;
            this.x += this.speedX;
        }

        // Remove if off bottom
        if (this.y > this.game.height + this.height) {
            this.markedForDeletion = true;
        }
    }

    draw(context) {
        context.save();
        context.translate(this.x + this.width / 2, this.y + this.height / 2);
        
        // Default diamond shape
        context.fillStyle = '#222';
        context.strokeStyle = this.color;
        context.lineWidth = 2;
        context.shadowBlur = 10;
        context.shadowColor = this.color;

        context.beginPath();
        context.moveTo(0, -this.height/2);
        context.lineTo(this.width/2, 0);
        context.lineTo(0, this.height/2);
        context.lineTo(-this.width/2, 0);
        context.closePath();
        
        context.fill();
        context.stroke();
        
        context.restore();
    }

    hit(damage) {
        this.hp -= damage;
        
        // Flashing effect could go here
        
        if (this.hp <= 0) {
            this.destroy();
        }
    }

    destroy() {
        this.game.soundManager.playExplosion();
        this.markedForDeletion = true;
        this.game.addScore(this.scoreValue);
        
        // Create Explosion Particles
        for (let i = 0; i < (this.isBoss ? 30 : 10); i++) {
            this.game.particles.push(new Particle(
                this.game, 
                this.x + this.width / 2, 
                this.y + this.height / 2, 
                this.color
            ));
        }
        
        // Check wave complete if Boss
        if (this.isBoss) {
            this.game.waveManager.checkBossDefeat(); // Added hook for boss defeat
            // Bosses always drop a powerup
            this.game.powerUps.push(new PowerUp(this.game, this.x + this.width/2, this.y + this.height/2));
        } else {
            // Drop chance starts at 80% and decays by 10% per wave down to a minimum of 10%
            const baseChance = 0.8;
            const decay = (this.game.wave - 1) * 0.1;
            const currentChance = Math.max(0.1, baseChance - decay);
            
            if (Math.random() < currentChance) {
                this.game.powerUps.push(new PowerUp(this.game, this.x + this.width/2, this.y + this.height/2));
            }
        }
    }
}
