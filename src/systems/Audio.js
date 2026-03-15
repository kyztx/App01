export class SoundManager {
    constructor() {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.audioCtx.createGain();
        this.masterGain.gain.value = 0.3; // Default volume
        this.masterGain.connect(this.audioCtx.destination);
        
        // BGM State
        this.bgmPlaying = false;
        this.bgmMode = 'normal';
        this.bgmIndex = 0;
        this.bgmIntervalId = null;
    }

    playTone(frequency, type, duration, vol = 1, slide = 0) {
        if (this.audioCtx.state === 'suspended') this.audioCtx.resume();

        const osc = this.audioCtx.createOscillator();
        const gainNode = this.audioCtx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(frequency, this.audioCtx.currentTime);
        
        if (slide !== 0) {
            osc.frequency.exponentialRampToValueAtTime(frequency * slide, this.audioCtx.currentTime + duration);
        }

        gainNode.gain.setValueAtTime(vol, this.audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + duration);

        osc.connect(gainNode);
        gainNode.connect(this.masterGain);

        osc.start();
        osc.stop(this.audioCtx.currentTime + duration);
    }

    playShoot() {
        // High pitched short beep sliding down
        this.playTone(800, 'square', 0.1, 0.4, 0.5);
    }

    playEnemyShoot() {
        // Lower pitched beep
        this.playTone(400, 'sawtooth', 0.15, 0.3, 0.8);
    }

    playExplosion() {
        // Pseudo noise for explosion
        if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
        const bufferSize = this.audioCtx.sampleRate * 0.5; // 0.5 seconds
        const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.audioCtx.createBufferSource();
        noise.buffer = buffer;

        // Lowpass filter for muffled explosion sound
        const filter = this.audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 800;

        const gainNode = this.audioCtx.createGain();
        gainNode.gain.setValueAtTime(0.8, this.audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.4);

        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.masterGain);

        noise.start();
    }

    playPowerUp() {
        // Arpeggio up
        this.playTone(400, 'sine', 0.1, 0.5, 1.5);
        setTimeout(() => this.playTone(600, 'sine', 0.1, 0.5, 1.5), 100);
        setTimeout(() => this.playTone(800, 'square', 0.2, 0.5, 1.5), 200);
    }

    playHit() {
        this.playTone(200, 'sawtooth', 0.1, 0.5, 0.8);
    }
    
    startBGM(mode = 'normal') {
        if (this.bgmPlaying && this.bgmMode === mode) return;
        
        this.stopBGM(); // Stop existing track to change modes
        this.bgmMode = mode;
        this.bgmPlaying = true;
        this.bgmIndex = 0;
        
        if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
        
        // Normal Mode: 120 BPM. Boss mode: 136 BPM (faster)
        const stepTime = mode === 'normal' ? 125 : 110; 
        
        // --- Normal Mode Data ---
        const C2 = 65.41, C3 = 130.81, Eb3 = 155.56, G3 = 196.00, Bb3 = 233.08, C4 = 261.63, Eb4 = 311.13;
        const normalBassPattern = [
            C2, C2, C3, C2, C2, C2, C3, C2,
            Eb3, Eb3, C3, Eb3, Bb3, Bb3, G3, Bb3
        ];
        const normalArpPattern = [
            C4, 0, Eb4, 0, C4, G3, C4, Eb4,
            Bb3, 0, Eb4, 0, Bb3, G3, Bb3, C4
        ];
        
        // --- Boss Mode Data (Intense, Heavy, Driving) ---
        const D2 = 73.42, F2 = 87.31, C2_boss = 65.41, G2_boss = 98.00;
        const D3 = 146.83, A3 = 220.00, C4_boss = 261.63, D4 = 293.66, F4 = 349.23, G4 = 392.00;
        
        // Driving, continuous 16th chug for boss bassline
        const bossBassPattern = [
            D2, D2, D3, D2, D2, D3, D2, D2,
            F2, F2, C2_boss, C2_boss, G2_boss, G2_boss, F2, C2_boss
        ];
        // Intense syncopated arpeggio lead
        const bossArpPattern = [
            D4, A3, C4_boss, D4, D4, A3, C4_boss, D4,
            F4, C4_boss, D4, F4, G4, F4, D4, C4_boss
        ];
        
        this.bgmIntervalId = setInterval(() => {
            if (!this.bgmPlaying) return;
            
            const step = this.bgmIndex % 16;
            
            if (this.bgmMode === 'normal') {
                // 4 on the floor Kick Drum
                if (step % 4 === 0) this.playTone(80, 'square', 0.1, 0.15, 0.1); 
                // Snare Drum
                if (step === 4 || step === 12) this.playTone(400, 'square', 0.05, 0.1, 0.2);
                
                // Bassline & Arp
                if (normalBassPattern[step] !== 0) this.playTone(normalBassPattern[step], 'square', 0.1, 0.1); 
                if (normalArpPattern[step] !== 0) this.playTone(normalArpPattern[step], 'sawtooth', 0.15, 0.05); 
            } else {
                // BOSS MODE
                // Aggressive Double Kick drum (every 8th note, plus an extra hit for urgency)
                if (step % 2 === 0 || step === 15) this.playTone(60, 'square', 0.1, 0.25, 0.15); 
                // Heavy layered Snare
                if (step === 4 || step === 12) {
                    this.playTone(300, 'square', 0.08, 0.2, 0.3);
                    this.playTone(150, 'sawtooth', 0.1, 0.15, 0.1);
                }
                
                // Nasty sawtooth bass chug
                if (bossBassPattern[step] !== 0) this.playTone(bossBassPattern[step], 'sawtooth', 0.15, 0.15);
                // Piercing lead Arp
                if (bossArpPattern[step] !== 0) this.playTone(bossArpPattern[step], 'square', 0.2, 0.08);
            }
            
            this.bgmIndex++;
        }, stepTime);
    }
    
    stopBGM() {
        this.bgmPlaying = false;
        if (this.bgmIntervalId) {
            clearInterval(this.bgmIntervalId);
            this.bgmIntervalId = null;
        }
    }
}
