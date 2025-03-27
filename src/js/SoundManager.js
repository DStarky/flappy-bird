import dieSound from '../assets/sounds/die.wav';
import flapSound from '../assets/sounds/wing.wav';
import hitSound from '../assets/sounds/hit.wav';
import pointSound from '../assets/sounds/point.wav';
import swooshSound from '../assets/sounds/swoosh.wav';
import backgroundMusic from '../assets/music/music.mp3';

export default class SoundManager {
	constructor() {
		this.audioContext = null;
		this.sounds = {};
		this.musicBuffer = null;
		this.musicSource = null;
		this.musicGainNode = null;

		this.isSoundMuted = false;
		this.isMusicMuted = false;
		this.isMusicPlaying = false;
		this.wasPlayingBeforeHidden = false;
		this.musicStartTime = 0;
		this.musicPauseTime = 0;

		this.initWebAudio();

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

	async initWebAudio() {
		try {
			this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

			const soundFiles = {
				die: dieSound,
				flap: flapSound,
				hit: hitSound,
				point: pointSound,
				swoosh: swooshSound,
			};

			for (const [name, url] of Object.entries(soundFiles)) {
				try {
					const response = await fetch(url);
					const arrayBuffer = await response.arrayBuffer();
					const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
					this.sounds[name] = audioBuffer;
				} catch (err) {
					console.error(`Failed to load sound: ${name}`, err);
				}
			}

			try {
				const response = await fetch(backgroundMusic);
				const arrayBuffer = await response.arrayBuffer();
				this.musicBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
			} catch (err) {
				console.error('Failed to load background music', err);
			}
		} catch (err) {
			console.error('Web Audio API is not supported in this browser', err);
		}
	}

	play(soundName) {
		if (this.isSoundMuted || !this.sounds[soundName] || !this.audioContext) return;

		try {
			if (this.audioContext.state === 'suspended') {
				this.audioContext.resume();
			}

			const source = this.audioContext.createBufferSource();
			source.buffer = this.sounds[soundName];

			const gainNode = this.audioContext.createGain();
			gainNode.gain.value = 1.0;

			source.connect(gainNode);
			gainNode.connect(this.audioContext.destination);

			source.start(0);
		} catch (err) {
			console.error(`Error playing sound: ${soundName}`, err);
		}
	}

	playMusic() {
		if (this.isMusicMuted || document.hidden || !this.audioContext || !this.musicBuffer) return;

		try {
			this.stopMusicSource();

			if (this.audioContext.state === 'suspended') {
				this.audioContext.resume();
			}

			this.musicSource = this.audioContext.createBufferSource();
			this.musicSource.buffer = this.musicBuffer;
			this.musicSource.loop = true;

			this.musicGainNode = this.audioContext.createGain();
			this.musicGainNode.gain.value = 0.5;

			this.musicSource.connect(this.musicGainNode);
			this.musicGainNode.connect(this.audioContext.destination);

			if (this.musicPauseTime > 0) {
				const offsetTime = this.musicPauseTime % this.musicBuffer.duration;
				this.musicSource.start(0, offsetTime);
				this.musicStartTime = this.audioContext.currentTime - offsetTime;
			} else {
				this.musicSource.start(0);
				this.musicStartTime = this.audioContext.currentTime;
			}

			this.isMusicPlaying = true;
		} catch (err) {
			console.error('Error playing background music', err);
			this.isMusicPlaying = false;
		}
	}

	pauseMusic() {
		if (!this.isMusicPlaying || !this.musicSource) return;

		try {
			this.musicPauseTime = this.audioContext.currentTime - this.musicStartTime;

			this.stopMusicSource();
			this.isMusicPlaying = false;
		} catch (err) {
			console.error('Error pausing background music', err);
		}
	}

	stopMusicSource() {
		if (this.musicSource) {
			try {
				this.musicSource.stop();
			} catch (err) {}
			this.musicSource.disconnect();
			this.musicSource = null;
		}

		if (this.musicGainNode) {
			this.musicGainNode.disconnect();
			this.musicGainNode = null;
		}
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
		if (this.musicGainNode) {
			this.musicGainNode.gain.value = Math.max(0, Math.min(1, volume));
		}
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
