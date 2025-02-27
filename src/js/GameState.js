// src/js/GameState.js

/**
 * Класс для управления состояниями игры
 */
export default class GameState {
	constructor() {
		// Возможные состояния: MENU, PLAY, PAUSE, FALLING, GAMEOVER
		this.current = 'MENU';
	}

	/**
	 * Переход к новому состоянию
	 * @param {string} state - Новое состояние
	 */
	transitionTo(state) {
		const validStates = ['MENU', 'PLAY', 'PAUSE', 'FALLING', 'GAMEOVER'];

		if (!validStates.includes(state)) {
			console.error(`Invalid game state: ${state}`);
			return;
		}

		this.current = state;
	}

	/**
	 * Проверка текущего состояния
	 * @param {string} state - Состояние для проверки
	 * @returns {boolean} - Результат проверки
	 */
	is(state) {
		return this.current === state;
	}
}
