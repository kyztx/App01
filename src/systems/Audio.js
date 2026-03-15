export class SoundManager {
    constructor() {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.audioCtx.createGain();
        this.masterGain.gain.value = 0.3; // Default volume
        this.masterGain.connect(this.audioCtx.destination);
        
        // BGM State
        this.bgmPlaying = false;
        this.bgmNotes = [220, 261.63, 329.63, 392.00, 329.63, 261.63]; // A minor pentatonic approx
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
    
    startBGM() {
        if (this.bgmPlaying) return;
        this.bgmPlaying = true;
        if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
        
        this.bgmIntervalId = setInterval(() => {
            if (!this.bgmPlaying) return;
            // Play a quiet bass thud and a note
            this.playTone(50, 'square', 0.1, 0.1, 0.5); // Bass drum
            
            const freq = this.bgmNotes[this.bgmIndex];
            this.playTone(freq, 'sawtooth', 0.15, 0.05); // Melody note (very quiet to not overpower sfx)
            
            this.bgmIndex = (this.bgmIndex + 1) % this.bgmNotes.length;
        }, 300); // 150 BPM 8th notes
    }
    
    stopBGM() {
        this.bgmPlaying = false;
        if (this.bgmIntervalId) {
            clearInterval(this.bgmIntervalId);
            this.bgmIntervalId = null;
        }
    }
}
