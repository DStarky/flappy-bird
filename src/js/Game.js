import * as PIXI from 'pixi.js';
import Bird from './Bird';
import PipesManager from './PipesManager';

// Импорт ассетов
import bgDay from '../assets/background-day.png';
import base from '../assets/base.png';
import menuBg from '../assets/background-day.png';
import gameOverImage from '../assets/gameover.png';

// Импорт звуков
import dieSound from '../assets/sounds/die.wav';
import flapSound from '../assets/sounds/wing.wav';
import hitSound from '../assets/sounds/hit.wav';
import pointSound from '../assets/sounds/point.wav';
import swooshSound from '../assets/sounds/swoosh.wav';

export default class Game {
	constructor(width, height) {
		this.width = width;
		this.height = height;

		// Состояния
		this.state = 'MENU'; // MENU, PLAY, PAUSE, FALLING, GAMEOVER

		this.score = 0;
		this.bestScore = localStorage.getItem('bestScore') || 0;

		this.gravity = 0.5;
		this.jumpPower = -8;

		// Скорости
		this.pipeSpeed = 3;
		this.pipeSpawnInterval = 100;
		this.timeSinceLastPipe = 0;
		this.groundSpeed = 2;

		// Инициализация звуков
		this.sounds = {
			die: new Audio(dieSound),
			flap: new Audio(flapSound),
			hit: new Audio(hitSound),
			point: new Audio(pointSound),
			swoosh: new Audio(swooshSound),
		};

		// Создаём приложение Pixi
		this.app = new PIXI.Application({
			width: this.width,
			height: this.height,
			backgroundColor: 0x000000,
			resolution: window.devicePixelRatio || 1,
			autoDensity: true,
		});
		document.body.appendChild(this.app.view);

		// Контейнеры
		this.menuContainer = new PIXI.Container();
		this.gameContainer = new PIXI.Container();
		this.pauseContainer = new PIXI.Container();
		this.gameOverContainer = new PIXI.Container();

		this.app.stage.addChild(this.menuContainer);
		this.app.stage.addChild(this.gameContainer);
		this.app.stage.addChild(this.pauseContainer);
		this.app.stage.addChild(this.gameOverContainer);

		// Изначально видим только меню
		this.menuContainer.visible = true;
		this.gameContainer.visible = false;
		this.pauseContainer.visible = false;
		this.gameOverContainer.visible = false;

		this.setupMenu();
		this.setupGame();
		this.setupPause();
		this.setupGameOver();
		this.setupEventListeners();
	}

	// Вспомогательный метод для воспроизведения звуков
	playSound(soundName) {
		// Сбрасываем звук для возможности повторного воспроизведения
		this.sounds[soundName].currentTime = 0;
		this.sounds[soundName].play().catch(e => console.log('Sound playback failed:', e));
	}

	// -------------------------
	// MENU
	// -------------------------
	setupMenu() {
		// Фон меню
		const menuBackground = new PIXI.Sprite(PIXI.Texture.from(menuBg));
		menuBackground.width = this.width;
		menuBackground.height = this.height;
		this.menuContainer.addChild(menuBackground);

		// Заголовок (сразу создаём)
		this.title = new PIXI.Text('FLAPPY BIRD', {
			fontFamily: ['HarreeghPoppedCyrillic', 'Arial'],
			fontSize: 40,
			fill: 0xffffff,
			stroke: 0x000000,
			strokeThickness: 4,
		});
		this.title.anchor.set(0.5);
		this.title.x = this.width / 2;
		this.title.y = this.height / 3;
		this.menuContainer.addChild(this.title);

		// Кнопка "ИГРАТЬ"
		const startButton = new PIXI.Graphics();
		startButton.beginFill(0x4caf50);
		startButton.drawRoundedRect(0, 0, 200, 60, 10);
		startButton.endFill();
		startButton.x = this.width / 2 - 100;
		startButton.y = this.height / 2;
		startButton.interactive = true;
		startButton.cursor = 'pointer';
		startButton.on('pointerdown', () => this.startGame());
		this.menuContainer.addChild(startButton);

		const startText = new PIXI.Text('ИГРАТЬ', {
			fontFamily: ['HarreeghPoppedCyrillic', 'Arial'],
			fontSize: 30,
			fill: 0xffffff,
		});
		startText.anchor.set(0.5);
		startText.x = 100;
		startText.y = 30;
		startButton.addChild(startText);

		setTimeout(() => {
			this.title.style = new PIXI.TextStyle({
				fontFamily: ['HarreeghPoppedCyrillic', 'Arial'],
				fontSize: 48,
				fill: 0xffffff,
			});

			// Обновляем стиль у кнопки
			startText.style = new PIXI.TextStyle({
				fontFamily: ['HarreeghPoppedCyrillic', 'Arial'],
				fontSize: 30,
				fill: 0xffffff,
			});
		}, 100);
	}

	// -------------------------
	// GAME
	// -------------------------
	setupGame() {
		this.bgSprite = new PIXI.Sprite(PIXI.Texture.from(bgDay));
		this.bgSprite.width = this.width;
		this.bgSprite.height = this.height;
		this.bgSprite.x = 0;
		this.bgSprite.y = 0;
		this.gameContainer.addChild(this.bgSprite);

		// Птица
		this.bird = new Bird(this.width / 4, this.height / 2);
		this.gameContainer.addChild(this.bird.sprite);

		// Трубы
		this.pipesManager = new PipesManager(this.width, this.height, this.pipeSpeed);
		this.gameContainer.addChild(this.pipesManager.container);

		// Земля (TilingSprite)
		const groundTexture = PIXI.Texture.from(base);
		this.groundSprite = new PIXI.TilingSprite(groundTexture, this.width, 112);
		this.groundSprite.x = 0;
		this.groundSprite.y = this.height - 112;
		this.gameContainer.addChild(this.groundSprite);

		// Текст для счёта
		this.scoreText = new PIXI.Text('0', {
			fontFamily: ['HarreeghPoppedCyrillic', 'Arial'],
			fontSize: 40,
			fill: 0xffffff,
			stroke: 0x000000,
			strokeThickness: 4,
		});
		this.scoreText.anchor.set(0.5, 0);
		this.scoreText.x = this.width / 2;
		this.scoreText.y = 40;
		this.gameContainer.addChild(this.scoreText);
	}

	// -------------------------
	// PAUSE
	// -------------------------
	setupPause() {
		const overlay = new PIXI.Graphics();
		overlay.beginFill(0x000000, 0.5);
		overlay.drawRect(0, 0, this.width, this.height);
		overlay.endFill();
		this.pauseContainer.addChild(overlay);

		const pauseText = new PIXI.Text('ПАУЗА', {
			fontFamily: ['HarreeghPoppedCyrillic', 'Arial'],
			fontSize: 50,
			fill: 0xffffff,
			stroke: 0x000000,
			strokeThickness: 4,
		});
		pauseText.anchor.set(0.5);
		pauseText.x = this.width / 2;
		pauseText.y = this.height / 2;
		this.pauseContainer.addChild(pauseText);
	}

	// -------------------------
	// GAME OVER
	// -------------------------
	setupGameOver() {
		this.gameOverContainer.removeChildren();

		// Создаем контейнер для всего экрана game over
		this.gameOverUIContainer = new PIXI.Container();
		this.gameOverContainer.addChild(this.gameOverUIContainer);

		// Изначально скрываем весь UI gameover
		this.gameOverUIContainer.visible = false;

		// Контейнер для надписи Game Over (для анимации)
		this.gameOverImageContainer = new PIXI.Container();
		this.gameOverUIContainer.addChild(this.gameOverImageContainer);

		// Создаем спрайт "Game Over"
		const gameOverSprite = new PIXI.Sprite(PIXI.Texture.from(gameOverImage));
		gameOverSprite.anchor.set(0.5);
		gameOverSprite.x = this.width / 2;
		gameOverSprite.y = 0; // Будет настроено внутри контейнера
		this.gameOverImageContainer.addChild(gameOverSprite);

		// Начальная позиция контейнера изображения Game Over (за пределами экрана снизу)
		this.gameOverImageContainer.y = this.height + 100;

		// Контейнер для текста счета
		this.scoreContainer = new PIXI.Container();
		this.gameOverUIContainer.addChild(this.scoreContainer);

		// Текст счета
		this.finalScoreText = new PIXI.Text('', {
			fontFamily: ['HarreeghPoppedCyrillic', 'Arial'],
			fontSize: 28,
			fill: 0xffffff,
			align: 'center',
		});
		this.finalScoreText.anchor.set(0.5);
		this.finalScoreText.x = this.width / 2;
		this.finalScoreText.y = 0;
		this.scoreContainer.addChild(this.finalScoreText);

		// Изначально размещаем контейнер счета за пределами экрана (снизу)
		this.scoreContainer.y = this.height + 200; // Позиционируем ниже Game Over для задержки

		// Кнопка "ЗАНОВО"
		const restartButton = new PIXI.Graphics();
		restartButton.beginFill(0x4caf50);
		restartButton.drawRoundedRect(0, 0, 200, 60, 10);
		restartButton.endFill();
		restartButton.x = this.width / 2 - 100;
		restartButton.y = this.height / 2 + 120;
		restartButton.interactive = true;
		restartButton.cursor = 'pointer';
		restartButton.on('pointerdown', () => this.restartGame());
		this.gameOverUIContainer.addChild(restartButton);

		const restartText = new PIXI.Text('ЗАНОВО', {
			fontFamily: ['HarreeghPoppedCyrillic', 'Arial'],
			fontSize: 30,
			fill: 0xffffff,
		});
		restartText.anchor.set(0.5);
		restartText.x = 100;
		restartText.y = 30;
		restartButton.addChild(restartText);

		// Скрываем кнопку перезапуска изначально
		restartButton.visible = false;
		// Сохраняем ссылку на кнопку для последующей анимации
		this.restartButton = restartButton;
	}

	// -------------------------
	// События
	// -------------------------
	setupEventListeners() {
		this.app.view.addEventListener('pointerdown', () => {
			if (this.state === 'PLAY') {
				this.bird.flap(this.jumpPower);
				this.playSound('flap');
			}
		});

		window.addEventListener('keydown', e => {
			if (e.code === 'Space' && this.state === 'PLAY') {
				this.bird.flap(this.jumpPower);
				this.playSound('flap');
			}
			if (e.code === 'KeyP') {
				if (this.state === 'PLAY') {
					this.pauseGame();
				} else if (this.state === 'PAUSE') {
					this.resumeGame();
				}
			}
		});

		window.addEventListener('resize', () => this.handleResize());
	}

	// -------------------------
	// START
	// -------------------------
	startGame() {
		// Очищаем все предыдущие обработчики
		this.app.ticker.remove(this.gameLoop, this);

		this.menuContainer.visible = false;
		this.gameOverContainer.visible = false;
		this.pauseContainer.visible = false;
		this.gameContainer.visible = true;

		// Проигрываем звук перехода в игру
		this.playSound('swoosh');

		this.state = 'PLAY';
		this.score = 0;
		this.scoreText.text = '0';

		// Восстанавливаем скорости, которые могли быть изменены при завершении игры
		this.pipeSpeed = 3;
		this.groundSpeed = 2;
		this.pipesManager.speed = this.pipeSpeed;

		this.bird.reset(this.width / 4, this.height / 2);
		this.pipesManager.reset();
		this.timeSinceLastPipe = 0;

		// Добавляем обработчик игрового цикла
		this.app.ticker.add(this.gameLoop, this);
	}

	pauseGame() {
		if (this.state !== 'PLAY') return;
		this.state = 'PAUSE';
		this.pauseContainer.visible = true;
		this.playSound('swoosh');
	}

	resumeGame() {
		if (this.state !== 'PAUSE') return;
		this.state = 'PLAY';
		this.pauseContainer.visible = false;
		this.playSound('swoosh');
	}

	// -------------------------
	// MAIN LOOP
	// -------------------------
	gameLoop = delta => {
		if (this.state === 'PLAY') {
			this.bird.update(delta, this.gravity);
			this.pipesManager.update(delta);
			this.groundSprite.tilePosition.x -= this.groundSpeed * delta;

			this.timeSinceLastPipe += delta;
			if (this.timeSinceLastPipe > this.pipeSpawnInterval) {
				this.pipesManager.spawnPipe();
				this.timeSinceLastPipe = 0;
			}

			this.checkCollisions();
			this.checkScore();
		} else if (this.state === 'FALLING') {
			// Птица падает до земли
			this.bird.update(delta, this.gravity * 1.5); // Увеличиваем гравитацию для более быстрого падения

			// Проверяем, достигла ли птица земли
			if (this.bird.sprite.y + this.bird.sprite.height / 2 >= this.height - this.groundSprite.height) {
				// Фиксируем позицию птицы на земле
				this.bird.sprite.y = this.height - this.groundSprite.height - this.bird.sprite.height / 2;

				// Останавливаем падение
				this.bird.vy = 0;

				// Воспроизводим звук падения на землю
				this.playSound('die');

				// Показываем экран окончания игры через короткую задержку
				setTimeout(() => this.showGameOverScreen(), 300);
			}
		} else if (this.state === 'GAMEOVER') {
			// Анимация появления Game Over
			if (this.gameOverImageContainer.y > this.height / 2 - 100) {
				this.gameOverImageContainer.y -= 20 * delta;
				if (this.gameOverImageContainer.y <= this.height / 2 - 100) {
					this.gameOverImageContainer.y = this.height / 2 - 100;
				}
			}

			// Анимация появления счета с небольшой задержкой после Game Over
			if (this.gameOverImageContainer.y <= this.height / 2 - 100 && this.scoreContainer.y > this.height / 2) {
				this.scoreContainer.y -= 20 * delta;

				// Когда счет достигает нужной позиции, останавливаем анимацию и показываем кнопку
				if (this.scoreContainer.y <= this.height / 2) {
					this.scoreContainer.y = this.height / 2;
					this.restartButton.visible = true; // Показываем кнопку перезапуска
					this.playSound('swoosh'); // Проигрываем звук появления
				}
			}
		}
	};

	checkCollisions() {
		// Проверка на столкновение с землей или потолком
		if (
			this.bird.sprite.y + this.bird.sprite.height / 2 > this.height - this.groundSprite.height ||
			this.bird.sprite.y - this.bird.sprite.height / 2 < 0
		) {
			this.gameOver();
			return;
		}

		// Проверка на столкновение с трубами
		const birdBounds = this.getShrinkedBounds(this.bird.sprite, 5);
		for (let pipe of this.pipesManager.pipes) {
			const topBounds = this.getShrinkedBounds(pipe.topPipe, 2);
			const bottomBounds = this.getShrinkedBounds(pipe.bottomPipe, 2);
			if (this.isColliding(birdBounds, topBounds) || this.isColliding(birdBounds, bottomBounds)) {
				this.gameOver();
				return;
			}
		}
	}

	isColliding(a, b) {
		return !(a.x + a.width < b.x || a.x > b.x + b.width || a.y + a.height < b.y || a.y > b.y + b.height);
	}

	getShrinkedBounds(sprite, margin = 5) {
		const bounds = sprite.getBounds();
		return new PIXI.Rectangle(
			bounds.x + margin,
			bounds.y + margin,
			bounds.width - margin * 2,
			bounds.height - margin * 2,
		);
	}

	checkScore() {
		for (let pipe of this.pipesManager.pipes) {
			if (!pipe.passed && pipe.topPipe.x + pipe.topPipe.width < this.bird.sprite.x) {
				pipe.passed = true;
				this.score++;
				this.scoreText.text = this.score.toString();
				// Проигрываем звук набора очка
				this.playSound('point');
			}
		}
	}

	// -------------------------
	// GAME OVER
	// -------------------------
	gameOver() {
		if (this.state === 'GAMEOVER' || this.state === 'FALLING') return;

		// Воспроизводим звук столкновения
		this.playSound('hit');

		// Переходим в состояние падения
		this.state = 'FALLING';

		// Останавливаем движение труб, но продолжаем анимацию падения
		this.pipesManager.speed = 0;
		this.groundSpeed = 0;

		// Задаем высокую скорость падения
		this.bird.vy = 5;

		// Устанавливаем поворот птички строго вниз (вертикально)
		this.bird.sprite.rotation = Math.PI / 2; // 90 градусов в радианах

		// Игровой контейнер остаётся видимым, а контейнер GameOver скрыт
		this.gameOverContainer.visible = true;
		this.gameOverUIContainer.visible = false;
	}

	// -------------------------
	// SHOW GAME OVER SCREEN
	// -------------------------
	showGameOverScreen() {
		// Подготавливаем UI Game Over
		if (this.score > this.bestScore) {
			this.bestScore = this.score;
			localStorage.setItem('bestScore', this.bestScore);
		}

		// Обновляем текст счета
		this.finalScoreText.text = `Счёт: ${this.score}\nРекорд: ${this.bestScore}`;

		// Начальное положение для анимации
		this.gameOverImageContainer.y = this.height + 100;
		this.scoreContainer.y = this.height + 200;
		this.restartButton.visible = false;

		// Показываем весь UI сразу после падения
		this.gameOverUIContainer.visible = true;

		// Устанавливаем состояние GAMEOVER для начала анимации
		this.state = 'GAMEOVER';

		// Воспроизводим звук при показе экрана
		this.playSound('swoosh');
	}

	// -------------------------
	// RESTART
	// -------------------------
	restartGame() {
		this.gameOverContainer.visible = false;
		this.gameOverUIContainer.visible = false;
		this.playSound('swoosh');
		this.startGame();
	}

	// -------------------------
	// RESIZE
	// -------------------------
	handleResize() {
		const windowWidth = window.innerWidth;
		const windowHeight = window.innerHeight;
		const scale = Math.min(windowWidth / this.width, windowHeight / this.height);
		this.app.view.style.width = `${this.width * scale}px`;
		this.app.view.style.height = `${this.height * scale}px`;
		this.app.view.style.position = 'absolute';
		this.app.view.style.left = `${(windowWidth - this.width * scale) / 2}px`;
		this.app.view.style.top = `${(windowHeight - this.height * scale) / 2}px`;
	}
}
