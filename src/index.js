import Game from './js/Game';

window.addEventListener('DOMContentLoaded', async () => {

	const gameWidth = 480;
	const gameHeight = 640;

	const game = new Game(gameWidth, gameHeight);
	game.handleResize();
});
