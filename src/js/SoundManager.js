import dieSound from '../assets/sounds/die.wav';
import flapSound from '../assets/sounds/wing.wav';
import hitSound from '../assets/sounds/hit.wav';
import pointSound from '../assets/sounds/point.wav';
import swooshSound from '../assets/sounds/swoosh.wav';

export default class SoundManager {
	constructor() {
		this.sounds = {
			die: new Audio(dieSound),
			flap: new Audio(flapSound),
			hit: new Audio(hitSound),
			point: new Audio(pointSound),
			swoosh: new Audio(swooshSound),
		};

		this.isMuted = false;
	}

	play(soundName) {
		if (this.isMuted || !this.sounds[soundName]) return;

		this.sounds[soundName].currentTime = 0;
		this.sounds[soundName].play().catch(e => console.log('Sound playback failed:', e));
	}

	setMute(value) {
		this.isMuted = value;
	}

	toggleMute() {
		this.isMuted = !this.isMuted;
		return this.isMuted;
	}
}
