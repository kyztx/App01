import { SmallEnemy, MediumEnemy, HeavyEnemy, KamikazeEnemy, SpreadEnemy, BossEnemy, LaserBossEnemy, BulletHellBossEnemy } from '../entities/EnemyTypes.js';

export class WaveManager {
    constructor(game) {
        this.game = game;
        this.waveTimer = 0;
        this.spawnInterval = 2000;
        this.enemiesToSpawn = 10;
        this.enemiesSpawned = 0; // For current wave
        this.totalEnemiesSpawned = 0; // Across all waves
        this.bossesDefeated = 0; // Tracks if we've beaten bosses to upgrade enemies
        this.bossActive = false;
        this.waveActive = true;
    }

    update(deltaTime) {
        if (!this.waveActive || this.bossActive) return;

        // Check if all enemies spawned and destroyed to progress wave
        if (this.enemiesSpawned >= this.enemiesToSpawn && this.game.enemies.filter(e => !e.isBoss).length === 0 && !this.bossActive) {
            this.advanceWave();
            return;
        }

        if (this.enemiesSpawned < this.enemiesToSpawn) {
            this.waveTimer += deltaTime;
            if (this.waveTimer > this.spawnInterval) {
                this.waveTimer = 0;
                this.spawnEnemy();
                this.enemiesSpawned++;
            }
        }
    }

    spawnEnemy() {
        const x = Math.random() * (this.game.width - 50);
        const y = -50;
        
        const typeRoll = Math.random();
        
            
        // Scaling spawn logic based on bosses defeated (Stages)
        if (this.bossesDefeated >= 2) {
            // Stage 3+: Heavy (20%), Spread (20%), Kamikaze (30%), Medium (20%), Small (10%)
            if (typeRoll < 0.2) this.game.enemies.push(new HeavyEnemy(this.game, x, y));
            else if (typeRoll < 0.4) this.game.enemies.push(new SpreadEnemy(this.game, x, y));
            else if (typeRoll < 0.7) this.game.enemies.push(new KamikazeEnemy(this.game, x, y));
            else if (typeRoll < 0.9) this.game.enemies.push(new MediumEnemy(this.game, x, y));
            else this.game.enemies.push(new SmallEnemy(this.game, x, y));
            
        } else if (this.bossesDefeated === 1) {
            // Stage 2: Heavy (15%), Spread (15%), Kamikaze (20%), Medium (30%), Small (20%)
            if (typeRoll < 0.15) this.game.enemies.push(new HeavyEnemy(this.game, x, y));
            else if (typeRoll < 0.3) this.game.enemies.push(new SpreadEnemy(this.game, x, y));
            else if (typeRoll < 0.5) this.game.enemies.push(new KamikazeEnemy(this.game, x, y));
            else if (typeRoll < 0.8) this.game.enemies.push(new MediumEnemy(this.game, x, y));
            else this.game.enemies.push(new SmallEnemy(this.game, x, y));
            
        } else {
            // Stage 1 (Pre-Boss): Small & Medium only
            if (this.game.wave > 2 && typeRoll > 0.7) {
                this.game.enemies.push(new MediumEnemy(this.game, x, y));
            } else {
                this.game.enemies.push(new SmallEnemy(this.game, x, y));
            }
        }

        // Apply speed buffs if past Stage 1
        if (this.bossesDefeated > 0) {
            const lastEnemy = this.game.enemies[this.game.enemies.length - 1];
            // Don't buff kamikaze Y speed too much or it becomes impossible to dodge
            if (!(lastEnemy instanceof KamikazeEnemy)) {
                lastEnemy.speedY += this.bossesDefeated * 1.0; 
            }
            lastEnemy.speedX *= 1 + (this.bossesDefeated * 0.3);
        }
        
        this.totalEnemiesSpawned++;
        
        // Spawn boss every 20th enemy
        if (this.totalEnemiesSpawned % 20 === 0) {
            this.spawnBoss();
        }
    }
    
    spawnBoss() {
        this.bossActive = true;
        const x = this.game.width / 2 - 60; // center boss
        const y = -100;
        
        let boss;
        
        // Tier progression based on bossesDefeated (Stage)
        if (this.bossesDefeated === 0) {
            // Stage 1: Standard Boss
            boss = new BossEnemy(this.game, x, y);
            boss.hp += (this.game.wave / 5) * 50; 
        } else if (this.bossesDefeated === 1) {
            // Stage 2: Laser Boss
            boss = new LaserBossEnemy(this.game, x - 15, y); // Adjust center for wider boss
        } else {
            // Stage 3+: Bullet Hell Boss
            boss = new BulletHellBossEnemy(this.game, x + 10, y);
            // Massively scale Bullet Hell Boss HP for infinite late game
            boss.hp += (this.bossesDefeated - 2) * 150;
        }
        
        this.game.enemies.push(boss);
        this.game.soundManager.startBGM('boss');
    }

    advanceWave() {
        this.game.wave++;
        this.game.updateUI();
        
        this.enemiesSpawnedTotal = 0; 
        
        this.enemiesSpawned = 0; // Wave enemies spawned
        this.waveTimer = 0;
        this.waveActive = true;
        
        // Base linear progression per wave
        this.enemiesToSpawn += 5;
        this.spawnInterval = Math.max(300, this.spawnInterval - 100);
        
        // Massive Difficulty Spike multiplier for every boss defeated
        if (this.bossesDefeated > 0) {
            this.spawnInterval = Math.max(200, this.spawnInterval - (100 * this.bossesDefeated)); // Spawns happen much faster
            this.enemiesToSpawn += 10 * this.bossesDefeated; // Waves become much longer
        }
    }

    checkBossDefeat() {
        if (this.bossActive && this.game.enemies.filter(e => e.isBoss).length === 0) {
            this.bossActive = false;
            this.bossesDefeated++;
            this.game.soundManager.startBGM('normal'); // Revert back to normal BGM
            // Reward massive points, maybe spawn powerup, then wave instantly advances
            this.advanceWave();
        }
    }
}
