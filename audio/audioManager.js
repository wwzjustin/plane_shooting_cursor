export class AudioManager {
    constructor() {
        this.sounds = {};
        this.backgroundMusic = null;
        this.musicVolume = 0.3;
        this.sfxVolume = 0.7;
        this.isMuted = false;
        this.isInitialized = false;
        
        // Initialize audio context on user interaction
        this.audioContext = null;
        this.setupAudioContext();
    }
    
    setupAudioContext() {
        // Modern browsers require user interaction before playing audio
        const initAudio = () => {
            if (!this.isInitialized) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                this.loadBackgroundMusic();
                this.createSoundEffects();
                this.isInitialized = true;
                
                // Remove event listeners after initialization
                document.removeEventListener('click', initAudio);
                document.removeEventListener('keydown', initAudio);
            }
        };
        
        document.addEventListener('click', initAudio);
        document.addEventListener('keydown', initAudio);
    }
    
    loadBackgroundMusic() {
        try {
            this.backgroundMusic = new Audio('./docs/Bullets in the Sky.mp3');
            this.backgroundMusic.loop = true;
            this.backgroundMusic.volume = this.musicVolume;
            
            // Add event listeners for debugging
            this.backgroundMusic.addEventListener('loadstart', () => {
                console.log('Background music loading started');
            });
            
            this.backgroundMusic.addEventListener('canplay', () => {
                console.log('Background music can play');
            });
            
            this.backgroundMusic.addEventListener('loadeddata', () => {
                console.log('Background music loaded successfully');
            });
            
            // Handle loading errors gracefully
            this.backgroundMusic.addEventListener('error', (e) => {
                console.error('Background music failed to load:', e);
                console.error('Error details:', this.backgroundMusic.error);
            });
            
            // Preload the audio
            this.backgroundMusic.preload = 'auto';
            
        } catch (error) {
            console.error('Error creating background music audio element:', error);
        }
    }
    
    createSoundEffects() {
        // Create sound effects using Web Audio API for better performance
        this.createBeepSound('shoot', 200, 0.1, 'square'); // Shooting sound
        this.createBeepSound('explosion', 80, 0.3, 'sawtooth'); // Explosion sound
        this.createBeepSound('reload', 400, 0.15, 'sine'); // Reload sound
        this.createBeepSound('weaponSwitch', 600, 0.1, 'triangle'); // Weapon switch sound
        this.createBeepSound('uiClick', 800, 0.05, 'sine'); // UI click sound
        this.createBeepSound('gameOver', 150, 0.5, 'square'); // Game over sound
        this.createBeepSound('victory', 500, 0.4, 'sine'); // Victory sound
    }
    
    createBeepSound(name, frequency, duration, waveType = 'sine') {
        this.sounds[name] = {
            frequency,
            duration,
            waveType,
            play: () => this.playBeep(frequency, duration, waveType)
        };
    }
    
    playBeep(frequency, duration, waveType = 'sine') {
        if (!this.audioContext || this.isMuted) return;
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = waveType;
            
            gainNode.gain.setValueAtTime(this.sfxVolume * 0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        } catch (error) {
            console.warn('Error playing sound effect:', error);
        }
    }
    
    playBackgroundMusic() {
        console.log('Attempting to play background music...');
        console.log('Background music object:', this.backgroundMusic);
        console.log('Is muted:', this.isMuted);
        
        if (this.backgroundMusic && !this.isMuted) {
            console.log('Background music ready state:', this.backgroundMusic.readyState);
            this.backgroundMusic.currentTime = 0;
            this.backgroundMusic.play().then(() => {
                console.log('Background music started playing successfully');
            }).catch(e => {
                console.error('Could not play background music:', e);
            });
        } else {
            if (!this.backgroundMusic) {
                console.warn('Background music not loaded');
            }
            if (this.isMuted) {
                console.warn('Audio is muted');
            }
        }
    }
    
    stopBackgroundMusic() {
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
            this.backgroundMusic.currentTime = 0;
        }
    }
    
    pauseBackgroundMusic() {
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
        }
    }
    
    resumeBackgroundMusic() {
        if (this.backgroundMusic && !this.isMuted) {
            this.backgroundMusic.play().catch(e => {
                console.warn('Could not resume background music:', e);
            });
        }
    }
    
    playSound(soundName) {
        if (this.sounds[soundName] && !this.isMuted) {
            this.sounds[soundName].play();
        }
    }
    
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.backgroundMusic) {
            this.backgroundMusic.volume = this.musicVolume;
        }
    }
    
    setSFXVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
    }
    
    toggleMute() {
        this.isMuted = !this.isMuted;
        
        if (this.isMuted) {
            this.pauseBackgroundMusic();
        } else {
            this.resumeBackgroundMusic();
        }
        
        return this.isMuted;
    }
    
    getMusicVolume() {
        return this.musicVolume;
    }
    
    getSFXVolume() {
        return this.sfxVolume;
    }
    
    isMusicMuted() {
        return this.isMuted;
    }
    
    dispose() {
        this.stopBackgroundMusic();
        if (this.audioContext) {
            this.audioContext.close();
        }
    }
} 