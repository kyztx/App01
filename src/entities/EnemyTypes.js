import { Enemy } from './Enemy.js';
import { Projectile } from './Projectile.js';

export class SmallEnemy extends Enemy {
    constructor(game, x, y) {
        super(game, x, y);
        this.width = 25;
        this.height = 30;
        this.speedY = 3 + Math.random() * 2; // Fast
        this.hp = 1;
        this.scoreValue = 10;
        this.color = '#ff0';
    }

    draw(context) {
        context.save();
        context.translate(this.x + this.width / 2, this.y + this.height / 2);
        
        context.fillStyle = '#222';
        context.strokeStyle = this.color;
        context.lineWidth = 2;
        context.shadowBlur = 5;
        context.shadowColor = this.color;

        // V shape
        context.beginPath();
        context.moveTo(0, this.height/2);
        context.lineTo(this.width/2, -this.height/2);
        context.lineTo(0, -this.height/4);
        context.lineTo(-this.width/2, -this.height/2);
        context.closePath();
        
        context.fill();
        context.stroke();
        context.restore();
    }
}

export class MediumEnemy extends Enemy {
    constructor(game, x, y) {
        super(game, x, y);
        this.width = 40;
        this.height = 40;
        this.speedY = 1.5;
        this.speedX = Math.random() > 0.5 ? 1 : -1;
        this.hp = 3;
        this.scoreValue = 30;
        this.color = '#f3f';
        
        this.shootTimer = Math.random() * 1000;
        this.shootInterval = 2000;
    }

    update(deltaTime) {
        super.update(deltaTime);
        
        this.shootTimer += deltaTime;
        if (this.shootTimer > this.shootInterval && this.y > 0 && this.y < this.game.height - 100) {
            this.shootTimer = 0;
            this.game.soundManager.playEnemyShoot();
            this.game.projectiles.push(new Projectile(
                this.game, 
                this.x + this.width / 2, 
                this.y + this.height, 
                5, // Moving down
                this.color
            ));
        }
    }
}

export class BossEnemy extends Enemy {
    constructor(game, x, y) {
        super(game, x, y);
        this.width = 120;
        this.height = 80;
        this.speedY = 0.5;
        this.speedX = 2;
        this.hp = 50; // Scalable by wave later
        this.scoreValue = 500;
        this.color = '#f00';
        this.isBoss = true;
        
        this.shootTimer = 0;
        this.shootInterval = 1000;
    }

    update(deltaTime) {
        // Stop moving down after reaching certain point
        if (this.y < 50) {
            this.y += this.speedY;
        } else {
            // Strafe left and right
            this.x += this.speedX;
            if (this.x < 0 || this.x > this.game.width - this.width) {
                this.speedX *= -1;
            }
        }
        
        // Multi-shot logic
        this.shootTimer += deltaTime;
        if (this.shootTimer > this.shootInterval && this.y >= 50) {
            this.shootTimer = 0;
            this.game.soundManager.playEnemyShoot();
            // 3 Spread shots
            this.game.projectiles.push(new Projectile(this.game, this.x + 10, this.y + this.height, 6, this.color));
            this.game.projectiles.push(new Projectile(this.game, this.x + this.width / 2, this.y + this.height, 6, this.color));
            this.game.projectiles.push(new Projectile(this.game, this.x + this.width - 10, this.y + this.height, 6, this.color));
        }
    }

    draw(context) {
        context.save();
        context.translate(this.x + this.width / 2, this.y + this.height / 2);
        
        context.fillStyle = '#222';
        context.strokeStyle = this.color;
        context.lineWidth = 3;
        context.shadowBlur = 15;
        context.shadowColor = this.color;

        // Big intimidating shape
        context.beginPath();
        context.moveTo(0, -this.height/2);
        context.lineTo(this.width/2, -this.height/4);
        context.lineTo(this.width/2, this.height/4);
        context.lineTo(this.width/4, this.height/2);
        context.lineTo(-this.width/4, this.height/2);
        context.lineTo(-this.width/2, this.height/4);
        context.lineTo(-this.width/2, -this.height/4);
        context.closePath();
        
        context.fill();
        context.stroke();
        
        // Draw health bar for Boss
        const hpPercent = this.hp / 50; // Simplified
        context.fillStyle = '#f00';
        context.fillRect(-this.width/2, -this.height/2 - 15, this.width * hpPercent, 5);
        
        context.restore();
    }
}
