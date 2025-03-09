import Game from './js/Game';
import YandexGamesSDK from './js/YandexGamesSDK';

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

async function initSDK() {
	if (window.YaGames) {
		try {
			await new Promise(resolve => {
				window.YaGames.init()
					.then(ysdk => {
						window.ysdk = ysdk;
						resolve();
					})
					.catch(() => {
						console.log('Ошибка при инициализации SDK Яндекс.Игр');
						resolve();
					});
			});
		} catch (e) {
			console.log('Ошибка при инициализации SDK Яндекс.Игр:', e);
		}
	} else {
		console.log('SDK Яндекс.Игр не найден, запуск в локальном режиме');
	}
}

async function initGame() {
	await Promise.all([preloadFont('HarreeghPoppedCyrillic'), initSDK()]);

	const gameWidth = 480;
	const gameHeight = 640;

	const game = new Game(gameWidth, gameHeight);

	const ysdk = new YandexGamesSDK(game);
	game.ysdk = ysdk;

	await ysdk.init();

	document.addEventListener('visibilitychange', () => {
		if (document.hidden) {
			if (game.gameState.current === 'PLAY') {
				game.pauseGame();
			}
		}
	});

	game.handleResize();
}

window.addEventListener('DOMContentLoaded', initGame);
