export default class GameState {
	constructor() {
		this.current = 'MENU';
	}

	transitionTo(state) {
		const validStates = ['MENU', 'PLAY', 'PAUSE', 'FALLING', 'GAMEOVER', 'SHOP'];

		if (!validStates.includes(state)) {
			console.error(`Invalid game state: ${state}`);
			return;
		}

		this.current = state;
	}

	is(state) {
		return this.current === state;
	}
}
