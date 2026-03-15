import { Projectile } from './Projectile.js';

export class Player {
    constructor(game) {
        this.game = game;
        this.width = 40;
        this.height = 40;
        
        // Start in bottom center
        this.x = this.game.width / 2 - this.width / 2;
        this.y = this.game.height - this.height - 20;
        
        this.speedX = 0;
        this.speedY = 0;
        this.maxSpeed = 5; // pixels per frame (roughly)
        
        // Shooting
        this.shootTimer = 0;
        this.shootInterval = 150; // ms between shots
        this.isShooting = false;
        
        // State
        this.isDead = false;
        this.isInvulnerable = false;
        this.invulnerableTimer = 0;
        this.invulnerableDuration = 2000;
        
        // Power-ups state
        this.rapidFire = false;
        this.rapidFireTimer = 0;
        this.doubleLaser = false;
        this.doubleLaserTimer = 0;
        this.hasShield = false;
    }

    update(deltaTime) {
        if (this.isDead) return;

        // --- Movement ---
        if (this.game.input.isPressed('left')) {
            this.speedX = -this.maxSpeed;
        } else if (this.game.input.isPressed('right')) {
            this.speedX = this.maxSpeed;
        } else {
            this.speedX = 0;
        }

        if (this.game.input.isPressed('up')) {
            this.speedY = -this.maxSpeed;
        } else if (this.game.input.isPressed('down')) {
            this.speedY = this.maxSpeed;
        } else {
            this.speedY = 0;
        }

        this.x += this.speedX;
        this.y += this.speedY;

        // Boundaries
        if (this.x < 0) this.x = 0;
        if (this.x > this.game.width - this.width) this.x = this.game.width - this.width;
        if (this.y < 0) this.y = 0;
        if (this.y > this.game.height - this.height) this.y = this.game.height - this.height;

        // --- Shooting ---
        if (this.game.input.isPressed('shoot')) {
            this.isShooting = true;
        } else {
            this.isShooting = false;
        }

        if (this.shootTimer < this.shootInterval) {
            this.shootTimer += deltaTime;
        }

        if (this.isShooting && this.shootTimer >= this.shootInterval) {
            this.shoot();
            const currentInterval = this.rapidFire ? this.shootInterval / 2 : this.shootInterval;
            this.shootTimer = this.shootInterval - currentInterval; 
        }

        // --- Timers ---
        if (this.isInvulnerable) {
            this.invulnerableTimer += deltaTime;
            if (this.invulnerableTimer > this.invulnerableDuration) {
                this.isInvulnerable = false;
                this.invulnerableTimer = 0;
            }
        }
        
        if (this.rapidFire) {
            this.rapidFireTimer -= deltaTime;
            if (this.rapidFireTimer <= 0) this.rapidFire = false;
        }
        
        if (this.doubleLaser) {
            this.doubleLaserTimer -= deltaTime;
            if (this.doubleLaserTimer <= 0) this.doubleLaser = false;
        }
    }

    draw(context) {
        if (this.isDead) return;

        context.save();
        
        // Blink if invulnerable
        if (this.isInvulnerable) {
            context.globalAlpha = Math.sin(Date.now() / 100) > 0 ? 1 : 0.5;
        }

        // Draw Spaceship (Geometric Vector Style)
        context.translate(this.x + this.width / 2, this.y + this.height / 2);

        // Engines / Thruster flame
        if (this.speedY < 0 || this.speedX !== 0) { // Moving
            context.fillStyle = '#f80';
            context.beginPath();
            context.moveTo(-8, this.height/2 - 5);
            context.lineTo(8, this.height/2 - 5);
            context.lineTo(0, this.height/2 + 10 + Math.random() * 10);
            context.fill();
            context.shadowBlur = 10;
            context.shadowColor = '#f80';
        }

        context.shadowBlur = 0;

        // Main Body
        context.fillStyle = '#222';
        context.strokeStyle = '#4df';
        context.lineWidth = 2;
        
        context.beginPath();
        context.moveTo(0, -this.height / 2); // Nose
        context.lineTo(this.width / 2, this.height / 2); // Right wing
        context.lineTo(0, this.height / 4); // Bottom indent
        context.lineTo(-this.width / 2, this.height / 2); // Left wing
        context.closePath();
        
        context.fill();
        context.stroke();

        // Cockpit
        context.fillStyle = '#0ff';
        context.beginPath();
        context.moveTo(0, -this.height / 4);
        context.lineTo(4, 0);
        context.lineTo(-4, 0);
        context.closePath();
        context.fill();

        // Shield Effect
        if (this.hasShield) {
            context.beginPath();
            context.arc(0, 0, this.width, 0, Math.PI * 2);
            context.strokeStyle = 'rgba(0, 255, 255, 0.8)';
            context.lineWidth = 3;
            context.stroke();
            context.fillStyle = 'rgba(0, 255, 255, 0.2)';
            context.fill();
        }

        context.restore();
    }

    shoot() {
        this.game.soundManager.playShoot();
        if (this.doubleLaser) {
            this.game.projectiles.push(new Projectile(this.game, this.x + 5, this.y, -10, '#0f0'));
            this.game.projectiles.push(new Projectile(this.game, this.x + this.width - 5, this.y, -10, '#0f0'));
        } else {
            this.game.projectiles.push(new Projectile(this.game, this.x + this.width / 2, this.y, -10, '#4df'));
        }
    }
    
    hit() {
        if (this.isInvulnerable || this.isDead) return;
        
        if (this.hasShield) {
            this.hasShield = false;
            this.isInvulnerable = true;
            return;
        }

        this.game.soundManager.playHit();
        this.game.loseLife();
        
        if (this.game.lives <= 0) {
            this.isDead = true;
        } else {
            // Respawn visual setup
            this.isInvulnerable = true;
            this.x = this.game.width / 2 - this.width / 2;
            this.y = this.game.height - this.height - 20;
            // Clear powerups on hit
            this.rapidFire = false;
            this.doubleLaser = false;
        }
    }
}
