import * as PIXI from 'pixi.js';
import Game from './js/Game';
import YandexGamesSDK from './js/YandexGamesSDK';

import bgDay from './assets/background-day.png';
import base from './assets/base.png';
import birdUp from './assets/bird_up.png';
import birdMid from './assets/bird_mid.png';
import birdDown from './assets/bird_down.png';
import pipeUp from './assets/pipe-green-up.png';
import pipeDown from './assets/pipe-green-down.png';
import gameOverImage from './assets/gameover.png';
import coinImg from './assets/MonedaD.png';
import shieldImg from './assets/shield.png';
import pepperImg from './assets/pepper.png';
import birdPowerUp from './assets/bird_power_up.png';
import musicOnImg from './assets/ui/music-on.png';
import musicOffImg from './assets/ui/music-off.png';
import soundsOnImg from './assets/ui/sounds-on.png';
import soundsOffImg from './assets/ui/sounds-off.png';

import dieSound from './assets/sounds/die.wav';
import flapSound from './assets/sounds/wing.wav';
import hitSound from './assets/sounds/hit.wav';
import pointSound from './assets/sounds/point.wav';
import swooshSound from './assets/sounds/swoosh.wav';
import backgroundMusic from './assets/music/music.mp3';

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

async function preloadAllResources() {
	return new Promise(resolve => {
		const resources = [
			bgDay,
			base,
			birdUp,
			birdMid,
			birdDown,
			pipeUp,
			pipeDown,
			gameOverImage,
			coinImg,
			shieldImg,
			pepperImg,
			birdPowerUp,
			musicOnImg,
			musicOffImg,
			soundsOnImg,
			soundsOffImg,
		];

		let loadedCount = 0;
		const totalResources = resources.length + 6; // 6 sounds

		function updateLoadingBar() {
			const loadingBar = document.getElementById('loading-bar');
			if (loadingBar) {
				const progress = Math.floor((loadedCount / totalResources) * 100);
				loadingBar.style.width = `${progress}%`;
			}
		}

		resources.forEach(resource => {
			const img = new Image();
			img.onload = () => {
				loadedCount++;
				updateLoadingBar();
				if (loadedCount === totalResources) {
					resolve();
				}
			};
			img.onerror = () => {
				loadedCount++;
				console.error(`Failed to load resource: ${resource}`);
				updateLoadingBar();
				if (loadedCount === totalResources) {
					resolve();
				}
			};
			img.src = resource;
		});

		const sounds = [dieSound, flapSound, hitSound, pointSound, swooshSound, backgroundMusic];
		sounds.forEach(sound => {
			const audio = new Audio();
			audio.oncanplaythrough = () => {
				loadedCount++;
				updateLoadingBar();
				if (loadedCount === totalResources) {
					resolve();
				}
			};
			audio.onerror = () => {
				loadedCount++;
				console.error(`Failed to load sound: ${sound}`);
				updateLoadingBar();
				if (loadedCount === totalResources) {
					resolve();
				}
			};
			audio.src = sound;
		});
	});
}

function hideLoadingScreen() {
	const loadingScreen = document.getElementById('loading-screen');
	if (loadingScreen) {
		loadingScreen.style.opacity = '0';
		loadingScreen.style.transition = 'opacity 0.5s';
		setTimeout(() => {
			loadingScreen.remove();
		}, 500);
	}
}

async function initSDK() {
	if (window.YaGames) {
		try {
			return await new Promise(resolve => {
				window.YaGames.init()
					.then(ysdk => {
						window.ysdk = ysdk;

						if (ysdk.features && ysdk.features.LoadingAPI) {
							ysdk.features.LoadingAPI.ready();
						}

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
	try {
		// Загружаем шрифт и SDK параллельно с ресурсами
		await Promise.all([preloadFont('HarreeghPoppedCyrillic'), initSDK(), preloadAllResources()]);

		// Скрываем экран загрузки
		hideLoadingScreen();

		// Создаем и инициализируем игру
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
	} catch (error) {
		console.error('Error initializing game:', error);
		hideLoadingScreen();

		const errorMessage = document.createElement('div');
		errorMessage.style.color = 'white';
		errorMessage.style.textAlign = 'center';
		errorMessage.style.padding = '20px';
		errorMessage.innerHTML =
			'<h1>Произошла ошибка при запуске игры</h1><p>Пожалуйста, обновите страницу и попробуйте снова.</p>';
		document.body.appendChild(errorMessage);
	}
}

window.addEventListener('DOMContentLoaded', initGame);
