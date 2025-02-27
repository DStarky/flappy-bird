// src/js/SoundManager.js

// Импорт звуков
import dieSound from '../assets/sounds/die.wav';
import flapSound from '../assets/sounds/wing.wav';
import hitSound from '../assets/sounds/hit.wav';
import pointSound from '../assets/sounds/point.wav';
import swooshSound from '../assets/sounds/swoosh.wav';

/**
 * Класс для управления звуками в игре
 */
export default class SoundManager {
	constructor() {
		// Инициализация звуков
		this.sounds = {
			die: new Audio(dieSound),
			flap: new Audio(flapSound),
			hit: new Audio(hitSound),
			point: new Audio(pointSound),
			swoosh: new Audio(swooshSound),
		};

		// Флаг для включения/выключения звука
		this.isMuted = false;
	}

	/**
	 * Воспроизведение звука
	 * @param {string} soundName - Название звука
	 */
	play(soundName) {
		if (this.isMuted || !this.sounds[soundName]) return;

		// Сбрасываем звук для возможности повторного воспроизведения
		this.sounds[soundName].currentTime = 0;
		this.sounds[soundName].play().catch(e => console.log('Sound playback failed:', e));
	}

	/**
	 * Включение/выключение звука
	 * @param {boolean} value - Установить в mute (true) или unmute (false)
	 */
	setMute(value) {
		this.isMuted = value;
	}

	/**
	 * Переключение состояния звука
	 */
	toggleMute() {
		this.isMuted = !this.isMuted;
		return this.isMuted;
	}
}
