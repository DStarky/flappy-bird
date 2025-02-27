import Game from './js/Game';

function preloadFont(fontFamily) {
	return new Promise(resolve => {
		const testElement = document.createElement('span');
		testElement.innerHTML = 'FLAPPY BIRD';
		testElement.style.fontFamily = `${fontFamily}, Arial`;
		testElement.style.fontSize = '0px';
		testElement.style.position = 'absolute';
		testElement.style.top = '-100px';
		document.body.appendChild(testElement);

		if (document.fonts && document.fonts.ready) {
			document.fonts.ready.then(() => {
				document.body.removeChild(testElement);
				resolve();
			});
		} else {
			setTimeout(() => {
				document.body.removeChild(testElement);
				resolve();
			}, 1000);
		}
	});
}

window.addEventListener('DOMContentLoaded', async () => {
	await preloadFont('HarreeghPoppedCyrillic');

	const gameWidth = 480;
	const gameHeight = 640;

	const game = new Game(gameWidth, gameHeight);
	game.handleResize();
});
