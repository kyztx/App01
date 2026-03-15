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

export class HeavyEnemy extends Enemy {
    constructor(game, x, y) {
        super(game, x, y);
        this.width = 50;
        this.height = 50;
        this.speedY = 1; // Slow
        this.speedX = Math.random() > 0.5 ? 0.5 : -0.5; // Slight drift
        this.hp = 8; // Very tanky
        this.scoreValue = 80;
        this.color = '#0ff'; // Cyan
        
        this.shootTimer = 0;
        this.shootInterval = 1500;
    }

    update(deltaTime) {
        super.update(deltaTime);
        
        // Downward dual shots
        this.shootTimer += deltaTime;
        if (this.shootTimer > this.shootInterval && this.y > 0 && this.y < this.game.height - 100) {
            this.shootTimer = 0;
            this.game.soundManager.playEnemyShoot();
            this.game.projectiles.push(new Projectile(this.game, this.x + 10, this.y + this.height, 4, this.color));
            this.game.projectiles.push(new Projectile(this.game, this.x + this.width - 10, this.y + this.height, 4, this.color));
        }
    }

    draw(context) {
        context.save();
        context.translate(this.x + this.width / 2, this.y + this.height / 2);
        
        context.fillStyle = '#222';
        context.strokeStyle = this.color;
        context.lineWidth = 3;
        context.shadowBlur = 10;
        context.shadowColor = this.color;

        // Hexagon shape
        context.beginPath();
        context.moveTo(0, -this.height/2);
        context.lineTo(this.width/2, -this.height/4);
        context.lineTo(this.width/2, this.height/4);
        context.lineTo(0, this.height/2);
        context.lineTo(-this.width/2, this.height/4);
        context.lineTo(-this.width/2, -this.height/4);
        context.closePath();
        
        context.fill();
        context.stroke();
        context.restore();
    }
}

export class KamikazeEnemy extends Enemy {
    constructor(game, x, y) {
        super(game, x, y);
        this.width = 20;
        this.height = 20;
        this.speedY = 4 + Math.random() * 2; // Very fast
        this.hp = 1;
        this.scoreValue = 20;
        this.color = '#f80'; // Orange
        
        // Target acquiring phase
        this.tracking = true;
    }

    update(deltaTime) {
        if (this.tracking) {
            // Track player's X position until half-way down screen
            if (this.game.player && this.y < this.game.height / 2) {
                const dx = this.game.player.x - this.x;
                if (Math.abs(dx) > 5) {
                    this.x += dx * 0.05; // Smooth tracking
                }
            } else {
                this.tracking = false; // Lock in and dive
                this.speedY += 2; // Dive faster
            }
        }
        
        super.update(deltaTime);
    }

    draw(context) {
        context.save();
        context.translate(this.x + this.width / 2, this.y + this.height / 2);
        
        context.fillStyle = '#222';
        context.strokeStyle = this.color;
        context.lineWidth = 2;
        context.shadowBlur = 8;
        context.shadowColor = this.color;

        // Arrow shape
        context.beginPath();
        context.moveTo(0, this.height/2 + 5);
        context.lineTo(this.width/2, -this.height/2);
        context.lineTo(0, -this.height/4);
        context.lineTo(-this.width/2, -this.height/2);
        context.closePath();
        
        context.fill();
        context.stroke();
        context.restore();
    }
}

export class SpreadEnemy extends Enemy {
    constructor(game, x, y) {
        super(game, x, y);
        this.width = 45;
        this.height = 35;
        this.speedY = 1.2;
        this.speedX = Math.random() > 0.5 ? 1.5 : -1.5;
        this.hp = 5;
        this.scoreValue = 50;
        this.color = '#0f0'; // Green
        
        this.shootTimer = 0;
        this.shootInterval = 2500;
    }

    update(deltaTime) {
        super.update(deltaTime);
        
        this.shootTimer += deltaTime;
        if (this.shootTimer > this.shootInterval && this.y > 0 && this.y < this.game.height - 100) {
            this.shootTimer = 0;
            this.game.soundManager.playEnemyShoot();
            
            // 3-way spread
            const pSpeed = 4;
            let centerP = new Projectile(this.game, this.x + this.width/2, this.y + this.height, pSpeed, this.color);
            let leftP = new Projectile(this.game, this.x + 10, this.y + this.height, pSpeed, this.color);
            leftP.speedX = -1.5;
            let rightP = new Projectile(this.game, this.x + this.width - 10, this.y + this.height, pSpeed, this.color);
            rightP.speedX = 1.5;
            
            this.game.projectiles.push(centerP, leftP, rightP);
        }
    }

    draw(context) {
        context.save();
        context.translate(this.x + this.width / 2, this.y + this.height / 2);
        
        context.fillStyle = '#222';
        context.strokeStyle = this.color;
        context.lineWidth = 2;
        context.shadowBlur = 10;
        context.shadowColor = this.color;

        // W shape ship
        context.beginPath();
        context.moveTo(-this.width/2, -this.height/2);
        context.lineTo(-this.width/4, this.height/2);
        context.lineTo(0, 0);
        context.lineTo(this.width/4, this.height/2);
        context.lineTo(this.width/2, -this.height/2);
        context.lineTo(0, this.height/4);
        context.closePath();
        
        context.fill();
        context.stroke();
        context.restore();
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

export class LaserBossEnemy extends Enemy {
    constructor(game, x, y) {
        super(game, x, y);
        this.width = 150;
        this.height = 100;
        this.speedY = 0.5;
        this.speedX = 1.5;
        this.hp = 120; // Tougher than Tier 1
        this.scoreValue = 1000;
        this.color = '#0ff'; // Cyan
        this.isBoss = true;
        
        this.state = 'moving'; // 'moving', 'charging', 'firing'
        this.stateTimer = 0;
        
        this.beamActive = false;
        this.beamWidth = 60;
    }

    update(deltaTime) {
        this.stateTimer += deltaTime;

        if (this.state === 'moving') {
            if (this.y < 50) this.y += this.speedY;
            else {
                this.x += this.speedX;
                if (this.x < 0 || this.x > this.game.width - this.width) this.speedX *= -1;
            }

            // Move for 4 seconds, then stop to charge
            if (this.stateTimer > 4000 && this.y >= 50) {
                this.state = 'charging';
                this.stateTimer = 0;
                // Play windup sound
                this.game.soundManager.playPowerUp(); 
            }
        } 
        else if (this.state === 'charging') {
            // Shake effect while charging
            this.x += (Math.random() - 0.5) * 4;
            
            // Charge for 1.5 seconds
            if (this.stateTimer > 1500) {
                this.state = 'firing';
                this.stateTimer = 0;
                this.beamActive = true;
                this.game.soundManager.playExplosion(); // booming laser sound
            }
        }
        else if (this.state === 'firing') {
            // Fire massive beam for 2 seconds
            if (this.stateTimer > 2000) {
                this.state = 'moving';
                this.stateTimer = 0;
                this.beamActive = false;
            }
        }
        
        // Handle Beam Hit Detection manually since it's not a projectile
        if (this.beamActive && !this.game.player.isDead && !this.game.player.isInvulnerable) {
            const beamX = this.x + this.width/2 - this.beamWidth/2;
            const px = this.game.player.x;
            const pw = this.game.player.width;
            
            // If player horizontally overlaps the beam
            if (px + pw > beamX && px < beamX + this.beamWidth) {
                this.game.player.hit();
            }
        }
    }

    draw(context) {
        context.save();
        context.translate(this.x + this.width / 2, this.y + this.height / 2);
        
        context.fillStyle = '#222';
        context.strokeStyle = this.state === 'charging' ? '#fff' : this.color;
        context.lineWidth = 3;
        context.shadowBlur = this.state === 'charging' ? 20 : 15;
        context.shadowColor = context.strokeStyle;

        // Blocky sturdy body
        context.fillRect(-this.width/2, -this.height/2, this.width, this.height/2);
        context.strokeRect(-this.width/2, -this.height/2, this.width, this.height/2);
        
        // Cannon mouth
        context.beginPath();
        context.moveTo(-this.beamWidth/2 - 10, 0);
        context.lineTo(this.beamWidth/2 + 10, 0);
        context.lineTo(this.beamWidth/2, this.height/2);
        context.lineTo(-this.beamWidth/2, this.height/2);
        context.closePath();
        context.fill();
        context.stroke();
        
        // Draw the laser beam
        if (this.beamActive) {
            context.fillStyle = `rgba(0, 255, 255, ${0.7 + Math.random() * 0.3})`;
            context.shadowBlur = 30;
            // Beam shoots down to bottom of screen
            const depth = this.game.height - this.y;
            context.fillRect(-this.beamWidth/2, this.height/2, this.beamWidth, depth);
            
            // Inner hot core
            context.fillStyle = '#fff';
            context.fillRect(-this.beamWidth/4, this.height/2, this.beamWidth/2, depth);
        }
        
        // Health bar
        const hpPercent = this.hp / 120;
        context.fillStyle = '#0ff';
        context.fillRect(-this.width/2, -this.height/2 - 15, this.width * hpPercent, 5);
        
        context.restore();
    }
}

export class BulletHellBossEnemy extends Enemy {
    constructor(game, x, y) {
        super(game, x, y);
        this.width = 100;
        this.height = 100;
        this.speedY = 0.5;
        this.speedX = 1.0;
        // HP massively scales depending on wave in WaveManager
        this.hp = 250; 
        this.scoreValue = 2500;
        this.color = '#f0f'; // Magenta
        this.isBoss = true;
        
        this.shootTimer = 0;
        this.shootInterval = 100; // Extremely fast bursts
        this.angle = 0;
        this.spinSpeed = 0.2;
    }

    update(deltaTime) {
        if (this.y < 80) this.y += this.speedY;
        else {
            this.x += this.speedX;
            if (this.x < 0 || this.x > this.game.width - this.width) this.speedX *= -1;
        }
        
        this.angle += this.spinSpeed;
        
        this.shootTimer += deltaTime;
        if (this.shootTimer > this.shootInterval && this.y >= 80) {
            this.shootTimer = 0;
            // Play a much lighter click sound so it doesn't blow out speakers
            if (Math.random() > 0.8) this.game.soundManager.playEnemyShoot();
            
            // Fire in a rotating star pattern (4 directions at once)
            for (let i = 0; i < 4; i++) {
                const fireAngle = this.angle + (i * Math.PI / 2);
                const pSpeed = 3;
                const pSpeedX = Math.cos(fireAngle) * pSpeed;
                const pSpeedY = Math.sin(fireAngle) * pSpeed;
                
                let p = new Projectile(this.game, this.x + this.width/2, this.y + this.height/2, pSpeedY, this.color);
                p.speedX = pSpeedX;
                this.game.projectiles.push(p);
            }
        }
    }

    draw(context) {
        context.save();
        context.translate(this.x + this.width / 2, this.y + this.height / 2);
        
        // Spin the boss visually
        context.rotate(this.angle * 0.5);
        
        context.fillStyle = '#222';
        context.strokeStyle = this.color;
        context.lineWidth = 4;
        context.shadowBlur = 20;
        context.shadowColor = this.color;

        // Octagon shape
        context.beginPath();
        const numSides = 8;
        const radius = this.width / 2;
        for (let i = 0; i < numSides; i++) {
            const currentAngle = (i * 2 * Math.PI) / numSides;
            const px = Math.cos(currentAngle) * radius;
            const py = Math.sin(currentAngle) * radius;
            if (i === 0) context.moveTo(px, py);
            else context.lineTo(px, py);
        }
        context.closePath();
        
        context.fill();
        context.stroke();
        
        // Inner spinning core
        context.rotate(-this.angle); // counter spin
        context.beginPath();
        context.rect(-radius/3, -radius/3, radius*(2/3), radius*(2/3));
        context.fillStyle = this.color;
        context.fill();

        context.restore();
        
        // Draw health bar explicitly without rotation
        context.save();
        context.translate(this.x + this.width / 2, this.y + this.height / 2);
        const maxHp = 250 * (1 + (this.game.waveManager.bossesDefeated - 2) * 0.5); // Estimate max HP
        const hpPercent = Math.min(Math.max(this.hp / maxHp, 0), 1);
        context.fillStyle = this.color;
        context.fillRect(-this.width/2, -this.height/2 - 20, this.width * hpPercent, 5);
        context.restore();
    }
}
