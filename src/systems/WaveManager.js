import { SmallEnemy, MediumEnemy, BossEnemy } from '../entities/EnemyTypes.js';

export class WaveManager {
    constructor(game) {
        this.game = game;
        this.waveTimer = 0;
        this.spawnInterval = 2000;
        this.enemiesToSpawn = 10;
        this.enemiesSpawned = 0; // For current wave
        this.totalEnemiesSpawned = 0; // Across all waves
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
        
        // Higher waves = logic for more medium enemies
        const typeRoll = Math.random();
        
        if (this.game.wave > 2 && typeRoll > 0.7) {
            this.game.enemies.push(new MediumEnemy(this.game, x, y));
        } else {
            this.game.enemies.push(new SmallEnemy(this.game, x, y));
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
        
        const boss = new BossEnemy(this.game, x, y);
        // Scale boss hp with wave
        boss.hp += (this.game.wave / 5) * 50; 
        
        this.game.enemies.push(boss);
    }

    advanceWave() {
        this.game.wave++;
        this.game.updateUI();
        
        this.enemiesSpawnedTotal = 0; // Reset for the wave if we want, or keep counting. Let's keep it per wave for simplicity, but wait, the prompt says "every 20th enemy". If we spawn 20 per wave, it's the same. Let's make it so every 20 enemies spawned across all waves triggers a boss.
        
        this.enemiesSpawned = 0; // Wave enemies spawned
        this.waveTimer = 0;
        this.waveActive = true;
        
        // Increase difficulty
        this.enemiesToSpawn += 5;
        this.spawnInterval = Math.max(500, this.spawnInterval - 100);
    }

    checkBossDefeat() {
        if (this.bossActive && this.game.enemies.filter(e => e.isBoss).length === 0) {
            this.bossActive = false;
            // Reward massive points, maybe spawn powerup, then wave instantly advances
            this.advanceWave();
        }
    }
}
