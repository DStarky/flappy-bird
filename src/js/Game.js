// src/js/Game.js
import * as PIXI from 'pixi.js';
import Bird from './Bird';
import PipesManager from './PipesManager';
import UIManager from './ui/UIManager';
import SoundManager from './SoundManager';
import CollisionManager from './CollisionManager';
import GameState from './GameState';

// Импорт ассетов
import bgDay from '../assets/background-day.png';
import base from '../assets/base.png';

export default class Game {
	constructor(width, height) {
		this.width = width;
		this.height = height;

		// Инициализация менеджеров
		this.gameState = new GameState();
		this.soundManager = new SoundManager();

		// Параметры игры
		this.gravity = 0.5;
		this.jumpPower = -8;
		this.pipeSpeed = 3;
		this.pipeSpawnInterval = 100;
		this.groundSpeed = 2;

		// Игровые переменные
		this.score = 0;
		this.bestScore = localStorage.getItem('bestScore') || 0;
		this.timeSinceLastPipe = 0;

		// Создаём приложение Pixi
		this.app = new PIXI.Application({
			width: this.width,
			height: this.height,
			backgroundColor: 0x000000,
			resolution: window.devicePixelRatio || 1,
			autoDensity: true,
		});
		document.body.appendChild(this.app.view);

		// Инициализация игрового мира
		this._initializeGameWorld();

		// Инициализация UI
		this.uiManager = new UIManager(this.width, this.height, this);
		this.app.stage.addChild(this.uiManager.menuContainer);
		this.app.stage.addChild(this.uiManager.gameHUD);
		this.app.stage.addChild(this.uiManager.pauseContainer);
		this.app.stage.addChild(this.uiManager.gameOverContainer);

		// Менеджер коллизий
		this.collisionManager = new CollisionManager(this);

		// Установка обработчиков событий
		this._setupEventListeners();

		// Реагируем на изменение размера окна
		this.handleResize();

		// Переход в меню
		this.gameState.transitionTo('MENU');
		this.uiManager.updateVisibility(this.gameState.current);
	}

	_initializeGameWorld() {
		// Контейнер для игрового мира
		this.gameContainer = new PIXI.Container();
		this.app.stage.addChild(this.gameContainer);

		// Фон
		this.bgSprite = new PIXI.Sprite(PIXI.Texture.from(bgDay));
		this.bgSprite.width = this.width;
		this.bgSprite.height = this.height;
		this.gameContainer.addChild(this.bgSprite);

		// Птица
		this.bird = new Bird(this.width / 4, this.height / 2);
		this.gameContainer.addChild(this.bird.sprite);

		// Трубы
		this.pipesManager = new PipesManager(this.width, this.height, this.pipeSpeed);
		this.gameContainer.addChild(this.pipesManager.container);

		// Земля
		const groundTexture = PIXI.Texture.from(base);
		this.groundSprite = new PIXI.TilingSprite(groundTexture, this.width, 112);
		this.groundSprite.x = 0;
		this.groundSprite.y = this.height - 112;
		this.gameContainer.addChild(this.groundSprite);
	}

	_setupEventListeners() {
		// Обработка клика по экрану
		this.app.view.addEventListener('pointerdown', () => {
			if (this.gameState.current === 'PLAY') {
				this.bird.flap(this.jumpPower);
				this.soundManager.play('flap');
			}
		});

		// Обработка клавиатуры
		window.addEventListener('keydown', e => {
			if (e.code === 'Space' && this.gameState.current === 'PLAY') {
				this.bird.flap(this.jumpPower);
				this.soundManager.play('flap');
			}
			if (e.code === 'KeyP') {
				if (this.gameState.current === 'PLAY') {
					this.pauseGame();
				} else if (this.gameState.current === 'PAUSE') {
					this.resumeGame();
				}
			}
		});

		// Обработка изменения размера окна
		window.addEventListener('resize', () => this.handleResize());
	}

	startGame() {
		// Очищаем предыдущие обработчики
		this.app.ticker.remove(this.gameLoop, this);

		// Обновляем состояние игры
		this.gameState.transitionTo('PLAY');
		this.uiManager.updateVisibility(this.gameState.current);
		this.soundManager.play('swoosh');

		// Сбрасываем игровые параметры
		this.score = 0;
		this.uiManager.updateScore(this.score);

		// Восстанавливаем скорости
		this.pipeSpeed = 3;
		this.groundSpeed = 2;
		this.pipesManager.speed = this.pipeSpeed;

		// Сбрасываем позиции объектов
		this.bird.reset(this.width / 4, this.height / 2);
		this.pipesManager.reset();
		this.timeSinceLastPipe = 0;

		// Запускаем игровой цикл
		this.app.ticker.add(this.gameLoop, this);
	}

	pauseGame() {
		if (this.gameState.current !== 'PLAY') return;
		this.gameState.transitionTo('PAUSE');
		this.uiManager.updateVisibility(this.gameState.current);
		this.soundManager.play('swoosh');
	}

	resumeGame() {
		if (this.gameState.current !== 'PAUSE') return;
		this.gameState.transitionTo('PLAY');
		this.uiManager.updateVisibility(this.gameState.current);
		this.soundManager.play('swoosh');
	}

	gameLoop = delta => {
		if (this.gameState.current === 'PLAY') {
			// Обновляем птицу
			this.bird.update(delta, this.gravity);

			// Обновляем трубы
			this.pipesManager.update(delta);

			// Движение земли
			this.groundSprite.tilePosition.x -= this.groundSpeed * delta;

			// Создаем новые трубы с интервалом
			this.timeSinceLastPipe += delta;
			if (this.timeSinceLastPipe > this.pipeSpawnInterval) {
				this.pipesManager.spawnPipe();
				this.timeSinceLastPipe = 0;
			}

			// Проверка коллизий и подсчет очков
			this.collisionManager.checkCollisions();
			this.checkScore();
		} else if (this.gameState.current === 'FALLING') {
			// Птица падает до земли
			this.bird.update(delta, this.gravity * 1.5);

			// Проверка столкновения с землей
			if (this.bird.sprite.y + this.bird.sprite.height / 2 >= this.height - this.groundSprite.height) {
				// Фиксируем позицию птицы
				this.bird.sprite.y = this.height - this.groundSprite.height - this.bird.sprite.height / 2;
				this.bird.vy = 0;

				// Звук падения
				this.soundManager.play('die');

				// Показываем экран окончания
				setTimeout(() => this.showGameOverScreen(), 300);
			}
		} else if (this.gameState.current === 'GAMEOVER') {
			// Обработка анимаций на экране окончания игры
			this.uiManager.updateGameOverAnimations(delta);
		}
	};

	checkScore() {
		for (let pipe of this.pipesManager.pipes) {
			if (!pipe.passed && pipe.topPipe.x + pipe.topPipe.width < this.bird.sprite.x) {
				pipe.passed = true;
				this.score++;
				this.uiManager.updateScore(this.score);
				this.soundManager.play('point');
			}
		}
	}

	gameOver() {
		if (this.gameState.current === 'GAMEOVER' || this.gameState.current === 'FALLING') return;

		// Звук столкновения
		this.soundManager.play('hit');

		// Переход в состояние падения
		this.gameState.transitionTo('FALLING');

		// Останавливаем движение труб
		this.pipesManager.speed = 0;
		this.groundSpeed = 0;

		// Устанавливаем падение птицы
		this.bird.vy = 5;
		this.bird.sprite.rotation = Math.PI / 2;

		// Подготавливаем экран окончания игры
		this.uiManager.gameOverContainer.visible = true;
		this.uiManager.gameOverUIContainer.visible = false;
	}

	showGameOverScreen() {
		// Обновляем рекорд
		if (this.score > this.bestScore) {
			this.bestScore = this.score;
			localStorage.setItem('bestScore', this.bestScore);
		}

		// Подготавливаем UI
		this.uiManager.prepareGameOverScreen(this.score, this.bestScore);

		// Переход в состояние окончания игры
		this.gameState.transitionTo('GAMEOVER');

		// Звук
		this.soundManager.play('swoosh');
	}

	restartGame() {
		// Скрываем контейнер с UI экрана GameOver перед запуском игры
		this.uiManager.gameOverContainer.visible = false;
		this.uiManager.gameOverUIContainer.visible = false;

		// Сбрасываем флаг проигрывания звука анимации
		this.uiManager.gameOverScreen.resetAnimationSound();

		// Воспроизводим звук
		this.soundManager.play('swoosh');

		// Запускаем игру
		this.startGame();
	}

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
