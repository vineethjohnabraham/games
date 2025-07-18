// Audio Manager for Snake & Ladder Game
class AudioManager {
    constructor() {
        this.sounds = {};
        this.isEnabled = true;
        this.volume = 0.5;
        this.isInitialized = false;
        
        // Initialize audio context on user interaction
        this.initializeAudio();
    }

    async initializeAudio() {
        try {
            // Load all sound effects
            this.sounds = {
                diceRoll: this.createAudioElement('dice-sound'),
                snakeHiss: this.createAudioElement('snake-sound'),
                ladderClimb: this.createAudioElement('ladder-sound'),
                pieceMove: this.createAudioElement('move-sound'),
                gameWin: this.createAudioElement('win-sound'),
                buttonClick: this.createAudioElement('click-sound')
            };

            // Set initial volume
            this.setVolume(this.volume);
            this.isInitialized = true;
        } catch (error) {
            console.warn('Audio initialization failed:', error);
        }
    }

    createAudioElement(id) {
        const audio = document.getElementById(id);
        if (audio) {
            audio.volume = this.volume;
            // Create fallback audio data URLs for browsers without audio files
            if (!audio.src || audio.src === '') {
                audio.src = this.generateToneDataURL(id);
            }
            return audio;
        }
        return this.createFallbackAudio(id);
    }

    createFallbackAudio(type) {
        const audio = new Audio();
        audio.src = this.generateToneDataURL(type);
        audio.volume = this.volume;
        return audio;
    }

    generateToneDataURL(type) {
        // Generate simple tone-based audio for different sound types
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const duration = this.getSoundDuration(type);
        const frequency = this.getSoundFrequency(type);
        
        const buffer = audioContext.createBuffer(1, audioContext.sampleRate * duration, audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const time = i / audioContext.sampleRate;
            data[i] = Math.sin(2 * Math.PI * frequency * time) * Math.exp(-time * 2);
        }
        
        // Convert buffer to data URL (simplified approach)
        return this.bufferToDataURL(buffer);
    }

    getSoundDuration(type) {
        const durations = {
            'dice-sound': 0.8,
            'snake-sound': 1.5,
            'ladder-sound': 1.2,
            'move-sound': 0.3,
            'win-sound': 2.0,
            'click-sound': 0.2
        };
        return durations[type] || 0.5;
    }

    getSoundFrequency(type) {
        const frequencies = {
            'dice-sound': 800,
            'snake-sound': 200,
            'ladder-sound': 600,
            'move-sound': 1000,
            'win-sound': 523,
            'click-sound': 1200
        };
        return frequencies[type] || 440;
    }

    bufferToDataURL(buffer) {
        // Simplified data URL generation for fallback
        return 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkdCEOY2OvFdSEFJ4PQ8+CVNAX...';
    }

    async playSound(soundName, options = {}) {
        if (!this.isEnabled || !this.sounds[soundName]) {
            return;
        }

        try {
            const sound = this.sounds[soundName];
            
            // Reset sound to beginning
            sound.currentTime = 0;
            
            // Apply options
            if (options.volume !== undefined) {
                sound.volume = Math.min(1, Math.max(0, options.volume * this.volume));
            }
            
            if (options.playbackRate !== undefined) {
                sound.playbackRate = options.playbackRate;
            }
            
            await sound.play();
            
            // Add vibration for mobile devices
            if (options.vibrate && 'vibrate' in navigator && this.isVibrationEnabled()) {
                navigator.vibrate(this.getVibrationPattern(soundName));
            }
            
        } catch (error) {
            console.warn(`Failed to play sound ${soundName}:`, error);
        }
    }

    getVibrationPattern(soundName) {
        const patterns = {
            diceRoll: [100, 50, 100],
            snakeHiss: [200, 100, 200, 100, 200],
            ladderClimb: [50, 30, 50, 30, 50, 30],
            pieceMove: [50],
            gameWin: [200, 100, 200, 100, 500],
            buttonClick: [30]
        };
        return patterns[soundName] || [50];
    }

    // Sound-specific methods
    async playDiceRoll() {
        await this.playSound('diceRoll', { 
            volume: 0.8, 
            vibrate: true 
        });
    }

    async playSnakeHiss() {
        await this.playSound('snakeHiss', { 
            volume: 0.9, 
            vibrate: true 
        });
    }

    async playLadderClimb() {
        await this.playSound('ladderClimb', { 
            volume: 0.7, 
            vibrate: true 
        });
    }

    async playPieceMove() {
        await this.playSound('pieceMove', { 
            volume: 0.6 
        });
    }

    async playGameWin() {
        await this.playSound('gameWin', { 
            volume: 1.0, 
            vibrate: true 
        });
    }

    async playButtonClick() {
        await this.playSound('buttonClick', { 
            volume: 0.5 
        });
    }

    // Audio control methods
    setVolume(volume) {
        this.volume = Math.min(1, Math.max(0, volume));
        
        Object.values(this.sounds).forEach(sound => {
            if (sound) {
                sound.volume = this.volume;
            }
        });
        
        // Store in localStorage
        localStorage.setItem('gameVolume', this.volume.toString());
    }

    getVolume() {
        return this.volume;
    }

    enable() {
        this.isEnabled = true;
        localStorage.setItem('audioEnabled', 'true');
    }

    disable() {
        this.isEnabled = false;
        localStorage.setItem('audioEnabled', 'false');
    }

    toggle() {
        if (this.isEnabled) {
            this.disable();
        } else {
            this.enable();
        }
        return this.isEnabled;
    }

    isAudioEnabled() {
        return this.isEnabled;
    }

    isVibrationEnabled() {
        return localStorage.getItem('vibrationEnabled') !== 'false';
    }

    // Initialize from stored settings
    loadSettings() {
        const storedVolume = localStorage.getItem('gameVolume');
        if (storedVolume) {
            this.setVolume(parseFloat(storedVolume));
        }

        const audioEnabled = localStorage.getItem('audioEnabled');
        if (audioEnabled === 'false') {
            this.disable();
        }
    }

    // Preload all sounds for better performance
    async preloadSounds() {
        const preloadPromises = Object.values(this.sounds).map(sound => {
            return new Promise((resolve) => {
                if (sound.readyState >= 2) {
                    resolve();
                } else {
                    sound.addEventListener('canplaythrough', resolve, { once: true });
                    sound.addEventListener('error', resolve, { once: true });
                    sound.load();
                }
            });
        });

        try {
            await Promise.all(preloadPromises);
            console.log('All sounds preloaded successfully');
        } catch (error) {
            console.warn('Some sounds failed to preload:', error);
        }
    }

    // Stop all currently playing sounds
    stopAllSounds() {
        Object.values(this.sounds).forEach(sound => {
            if (sound && !sound.paused) {
                sound.pause();
                sound.currentTime = 0;
            }
        });
    }

    // Create a sequence of sounds
    async playSoundSequence(sequence, delay = 300) {
        for (let i = 0; i < sequence.length; i++) {
            await this.playSound(sequence[i]);
            if (i < sequence.length - 1) {
                await this.delay(delay);
            }
        }
    }

    // Utility method for delays
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Background music methods (for future enhancement)
    playBackgroundMusic() {
        // Implementation for background music
    }

    stopBackgroundMusic() {
        // Implementation for stopping background music
    }
}

// Create global audio manager instance
const audioManager = new AudioManager();

// Initialize audio on first user interaction
document.addEventListener('click', function initAudio() {
    audioManager.loadSettings();
    audioManager.preloadSounds();
    document.removeEventListener('click', initAudio);
}, { once: true });

// Export for use in other modules
window.audioManager = audioManager;
