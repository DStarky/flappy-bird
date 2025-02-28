import dieSound from '../assets/sounds/die.wav';
import flapSound from '../assets/sounds/wing.wav';
import hitSound from '../assets/sounds/hit.wav';
import pointSound from '../assets/sounds/point.wav';
import swooshSound from '../assets/sounds/swoosh.wav';
import backgroundMusic from '../assets/music/music.mp3';

export default class SoundManager {
	constructor() {
		this.sounds = {
			die: new Audio(dieSound),
			flap: new Audio(flapSound),
			hit: new Audio(hitSound),
			point: new Audio(pointSound),
			swoosh: new Audio(swooshSound),
		};

		this.backgroundMusic = new Audio(backgroundMusic);
		this.backgroundMusic.loop = true;
		this.backgroundMusic.volume = 0.5;

		this.isSoundMuted = false;
		this.isMusicMuted = false;
		this.isMusicPlaying = false;
		this.wasPlayingBeforeHidden = false;

		document.addEventListener('visibilitychange', () => {
			if (document.hidden) {
				this.wasPlayingBeforeHidden = this.isMusicPlaying;
				this.pauseMusic();
			} else {
				if (this.wasPlayingBeforeHidden && !this.isMusicMuted) {
					this.playMusic();
				}
			}
		});
	}

	play(soundName) {
		if (this.isSoundMuted || !this.sounds[soundName]) return;

		this.sounds[soundName].currentTime = 0;
		this.sounds[soundName].play().catch(e => console.log('Sound playback failed:', e));
	}

	playMusic() {
		if (this.isMusicMuted || document.hidden) return;

		this.backgroundMusic.play().catch(e => console.log('Music playback failed:', e));
		this.isMusicPlaying = true;
	}

	pauseMusic() {
		this.backgroundMusic.pause();
		this.isMusicPlaying = false;
	}

	toggleMusic() {
		if (this.isMusicMuted) {
			this.isMusicMuted = false;
			this.playMusic();
		} else {
			this.isMusicMuted = true;
			this.pauseMusic();
		}
		return !this.isMusicMuted;
	}

	toggleSound() {
		this.isSoundMuted = !this.isSoundMuted;
		return !this.isSoundMuted;
	}

	setMusicVolume(volume) {
		this.backgroundMusic.volume = Math.max(0, Math.min(1, volume));
	}

	setMute(value) {
		this.isSoundMuted = value;
		this.isMusicMuted = value;
		if (this.isMusicMuted) {
			this.pauseMusic();
		}
	}

	toggleMute() {
		this.isSoundMuted = !this.isSoundMuted;
		this.isMusicMuted = this.isSoundMuted;
		if (this.isMusicMuted) {
			this.pauseMusic();
		} else if (!this.isMusicMuted) {
			this.playMusic();
		}
		return this.isSoundMuted;
	}

	isMusicOn() {
		return !this.isMusicMuted;
	}

	isSoundOn() {
		return !this.isSoundMuted;
	}
}
