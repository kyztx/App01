import { Player } from './entities/Player.js';
import { WaveManager } from './systems/WaveManager.js';
import { Background } from './systems/Background.js';
import { SoundManager } from './systems/Audio.js';

export class Game {
    constructor(width, height, input) {
        this.width = width;
        this.height = height;
        this.input = input;

        // UI References
        this.scoreElement = document.getElementById('score');
        this.waveElement = document.getElementById('wave');
        this.livesElement = document.getElementById('lives');

        // State
        this.isGameOver = false;
        this.score = 0;
        this.wave = 1; // Restored
        this.lives = 3;

        this.soundManager = new SoundManager();
        this.player = new Player(this);
        this.waveManager = new WaveManager(this);

        // Entities arrays
        this.projectiles = [];
        this.enemies = [];
        this.particles = [];
        this.powerUps = [];
        
        this.backgrounds = [new Background(this)];
        
        // Temp logic array for update/draw
        this.entities = [];

        this.updateUI();
    }

    update(deltaTime) {
        if (this.isGameOver) return;
        
        // --- 1. Update entities ---
        this.player.update(deltaTime);
        this.waveManager.update(deltaTime);
        
        // Update all other entities
        this.entities = [
            ...this.backgrounds,
            ...this.powerUps,
            ...this.projectiles,
            ...this.enemies,
            ...this.particles
        ];

        this.entities.forEach(entity => entity.update(deltaTime));

        // --- 2. Remove inactive entities ---
        this.projectiles = this.projectiles.filter(p => !p.markedForDeletion);
        this.enemies = this.enemies.filter(e => !e.markedForDeletion);
        this.particles = this.particles.filter(p => !p.markedForDeletion);
        this.powerUps = this.powerUps.filter(p => !p.markedForDeletion);

        // --- 3. Collision Detection ---
        this.checkCollisions();

        // --- 4. Game Over Logic ---
        if (this.lives <= 0) {
            this.isGameOver = true;
        }
    }

    draw(context) {
        // Draw background elements first
        this.backgrounds.forEach(bg => bg.draw(context));
        
        this.player.draw(context);

        // Draw everything else
        this.entities.forEach(entity => entity.draw(context));
    }

    checkCollisions() {
        const checkRectCollision = (rect1, rect2) => {
            return (
                rect1.x < rect2.x + rect2.width &&
                rect1.x + rect1.width > rect2.x &&
                rect1.y < rect2.y + rect2.height &&
                rect1.y + rect1.height > rect2.y
            );
        };

        this.enemies.forEach(enemy => {
            if (!this.player.isDead && !this.player.isInvulnerable && checkRectCollision(this.player, enemy)) {
                this.player.hit();
                enemy.hit(1);
            }
        });

        this.projectiles.forEach(projectile => {
            if (projectile.speedY < 0) { // Player projectile
                this.enemies.forEach(enemy => {
                    if (!projectile.markedForDeletion && !enemy.markedForDeletion && checkRectCollision(projectile, enemy)) {
                        projectile.markedForDeletion = true;
                        enemy.hit(projectile.damage);
                    }
                });
            } else { // Enemy projectile
                if (!projectile.markedForDeletion && !this.player.isDead && !this.player.isInvulnerable && checkRectCollision(projectile, this.player)) {
                    projectile.markedForDeletion = true;
                    this.player.hit();
                }
            }
        });
        
        this.powerUps.forEach(powerUp => {
            if (!powerUp.markedForDeletion && !this.player.isDead && checkRectCollision(this.player, powerUp)) {
                powerUp.applyEffect(this.player);
                powerUp.markedForDeletion = true;
            }
        });
    }

    addScore(points) {
        this.score += points;
        this.updateUI();
    }

    loseLife() {
        this.lives -= 1;
        this.updateUI();
    }

    updateUI() {
        this.scoreElement.innerText = this.score;
        this.waveElement.innerText = this.wave;
        this.livesElement.innerText = this.lives;
    }
}
