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
        
        // Let's create a synthwave-style 16-step sequencer (4/4 time, 16th notes)
        // Tempo: 120 BPM -> 1 beat = 500ms -> 16th note = 125ms
        const stepTime = 125; 
        
        // Frequencies for a driving Cm progression: C3, Eb3, G3, Bb3, C4
        const C2 = 65.41;
        const C3 = 130.81;
        const Eb3 = 155.56;
        const G3 = 196.00;
        const Bb3 = 233.08;
        const C4 = 261.63;
        const Eb4 = 311.13;
        
        // Bassline pattern (16 steps), driving bass
        const bassPattern = [
            C2, C2, C3, C2, C2, C2, C3, C2,
            Eb3, Eb3, C3, Eb3, Bb3, Bb3, G3, Bb3
        ];
        
        // Arpeggiator pattern (16 steps), 0 means rest
        const arpPattern = [
            C4, 0, Eb4, 0, C4, G3, C4, Eb4,
            Bb3, 0, Eb4, 0, Bb3, G3, Bb3, C4
        ];
        
        this.bgmIntervalId = setInterval(() => {
            if (!this.bgmPlaying) return;
            
            const step = this.bgmIndex % 16;
            
            // 4 on the floor Kick Drum (every 4th step = quarter notes)
            if (step % 4 === 0) {
                this.playTone(80, 'square', 0.1, 0.15, 0.1); 
            }
            
            // Snare Drum (Hit on 2 and 4 = steps 4 and 12)
            if (step === 4 || step === 12) {
                // Short noise burst effect for snare using high freq square
                this.playTone(400, 'square', 0.05, 0.1, 0.2);
            }
            
            // Bassline
            const bassNote = bassPattern[step];
            this.playTone(bassNote, 'square', 0.1, 0.1); // Short punchy bass
            
            // Arpeggio / Melody
            const arpNote = arpPattern[step];
            if (arpNote !== 0) {
                this.playTone(arpNote, 'sawtooth', 0.15, 0.05); 
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
