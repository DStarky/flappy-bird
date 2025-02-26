import * as PIXI from 'pixi.js';
import Bird from './Bird';
import PipesManager from './PipesManager';

// Импорт ассетов
import bgDay from '../assets/background-day.png';
import base from '../assets/base.png';
import menuBg from '../assets/background-day.png';
import gameOverImage from '../assets/gameover.png';

// Импорт числовых ассетов
import number0 from '../assets/numbers/0.png';
import number1 from '../assets/numbers/1.png';
import number2 from '../assets/numbers/2.png';
import number3 from '../assets/numbers/3.png';
import number4 from '../assets/numbers/4.png';
import number5 from '../assets/numbers/5.png';
import number6 from '../assets/numbers/6.png';
import number7 from '../assets/numbers/7.png';
import number8 from '../assets/numbers/8.png';
import number9 from '../assets/numbers/9.png';

export default class Game {
	constructor(width, height) {
		this.width = width;
		this.height = height;

		// Состояния игры: "MENU", "PLAY", "PAUSE", "GAMEOVER"
		this.state = 'MENU';

		this.score = 0;
		this.bestScore = localStorage.getItem('bestScore') || 0;

		this.gravity = 0.5;
		this.jumpPower = -8;

		// Скорость труб
		this.pipeSpeed = 3;
		this.pipeSpawnInterval = 100;
		this.timeSinceLastPipe = 0;

		// Скорость прокрутки земли
		this.groundSpeed = 2;

		// Создаем PIXI-приложение
		this.app = new PIXI.Application({
			width: this.width,
			height: this.height,
			backgroundColor: 0x000000,
			resolution: window.devicePixelRatio || 1,
			autoDensity: true,
		});
		document.body.appendChild(this.app.view);

		// Основные контейнеры
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

		// Загружаем текстуры для цифр (0-9)
		this.numberTextures = [
			PIXI.Texture.from(number0),
			PIXI.Texture.from(number1),
			PIXI.Texture.from(number2),
			PIXI.Texture.from(number3),
			PIXI.Texture.from(number4),
			PIXI.Texture.from(number5),
			PIXI.Texture.from(number6),
			PIXI.Texture.from(number7),
			PIXI.Texture.from(number8),
			PIXI.Texture.from(number9),
		];

		this.setupMenu();
		this.setupGame();
		this.setupPause();
		this.setupGameOver();
		this.setupEventListeners();
	}

	setupMenu() {
		// Фон меню
		const menuBackground = new PIXI.Sprite(PIXI.Texture.from(menuBg));
		menuBackground.width = this.width;
		menuBackground.height = this.height;
		this.menuContainer.addChild(menuBackground);

		// Заголовок
		const title = new PIXI.Text('FLAPPY BIRD', {
			fontFamily: 'Arial',
			fontSize: 40,
			fill: 0xffffff,
			stroke: 0x000000,
			strokeThickness: 4,
		});
		title.anchor.set(0.5);
		title.x = this.width / 2;
		title.y = this.height / 3;
		this.menuContainer.addChild(title);

		// Кнопка "Играть"
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
			fontFamily: 'Arial',
			fontSize: 30,
			fill: 0xffffff,
		});
		startText.anchor.set(0.5);
		startText.x = 100;
		startText.y = 30;
		startButton.addChild(startText);
	}

	setupGame() {
		// Фон игры
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

		// Земля как TilingSprite для бесконечной прокрутки
		const groundTexture = PIXI.Texture.from(base);
		this.groundSprite = new PIXI.TilingSprite(groundTexture, this.width, 112);
		this.groundSprite.x = 0;
		this.groundSprite.y = this.height - 112;
		this.gameContainer.addChild(this.groundSprite);

		// Контейнер для "живого" счёта (во время игры)
		this.inGameScoreContainer = new PIXI.Container();
		// Разместим его ближе к верху экрана
		this.inGameScoreContainer.x = this.width / 2;
		this.inGameScoreContainer.y = 60;
		this.gameContainer.addChild(this.inGameScoreContainer);
	}

	setupPause() {
		// Затемненный оверлей
		const overlay = new PIXI.Graphics();
		overlay.beginFill(0x000000, 0.5);
		overlay.drawRect(0, 0, this.width, this.height);
		overlay.endFill();
		this.pauseContainer.addChild(overlay);

		// Надпись "ПАУЗА"
		const pauseText = new PIXI.Text('ПАУЗА', {
			fontFamily: 'Arial',
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

	setupGameOver() {
		// Очищаем контейнер
		this.gameOverContainer.removeChildren();

		// Картинка "Game Over" — разместим её чуть выше центра
		const gameOverSprite = new PIXI.Sprite(PIXI.Texture.from(gameOverImage));
		gameOverSprite.anchor.set(0.5);
		gameOverSprite.x = this.width / 2;
		gameOverSprite.y = this.height / 2 - 100;
		this.gameOverContainer.addChild(gameOverSprite);

		// Контейнер для отображения финального счета (счёт и рекорд)
		this.scoreDisplayContainer = new PIXI.Container();
		// Разместим его по центру, немного ниже "Game Over"
		this.scoreDisplayContainer.x = this.width / 2;
		this.scoreDisplayContainer.y = this.height / 2 + 0;
		this.gameOverContainer.addChild(this.scoreDisplayContainer);

		// Кнопка "Заново" — ещё ниже
		const restartButton = new PIXI.Graphics();
		restartButton.beginFill(0x4caf50);
		restartButton.drawRoundedRect(0, 0, 200, 60, 10);
		restartButton.endFill();
		restartButton.x = this.width / 2 - 100;
		restartButton.y = this.height / 2 + 180;
		restartButton.interactive = true;
		restartButton.cursor = 'pointer';
		restartButton.on('pointerdown', () => this.restartGame());
		this.gameOverContainer.addChild(restartButton);

		const restartText = new PIXI.Text('ЗАНОВО', {
			fontFamily: 'Arial',
			fontSize: 30,
			fill: 0xffffff,
		});
		restartText.anchor.set(0.5);
		restartText.x = 100;
		restartText.y = 30;
		restartButton.addChild(restartText);
	}

	setupEventListeners() {
		// Тап/клик для полета
		this.app.view.addEventListener('pointerdown', () => {
			if (this.state === 'PLAY') {
				this.bird.flap(this.jumpPower);
			}
		});

		// Пробел для полета, клавиша P для паузы/возобновления
		window.addEventListener('keydown', e => {
			if (e.code === 'Space' && this.state === 'PLAY') {
				this.bird.flap(this.jumpPower);
			}
			if (e.code === 'KeyP') {
				if (this.state === 'PLAY') {
					this.pauseGame();
				} else if (this.state === 'PAUSE') {
					this.resumeGame();
				}
			}
		});

		// Изменение размера окна
		window.addEventListener('resize', () => this.handleResize());
	}

	startGame() {
		// Переход из меню в игру
		this.menuContainer.visible = false;
		this.gameOverContainer.visible = false;
		this.pauseContainer.visible = false;
		this.gameContainer.visible = true;

		this.state = 'PLAY';
		this.score = 0;
		this.updateInGameScore(); // Обновим счет, чтобы отобразить "0"

		this.bird.reset(this.width / 4, this.height / 2);
		this.pipesManager.reset();
		this.timeSinceLastPipe = 0;

		// Запуск игрового цикла
		this.app.ticker.add(this.gameLoop, this);
	}

	pauseGame() {
		if (this.state !== 'PLAY') return;
		this.state = 'PAUSE';
		this.pauseContainer.visible = true;
	}

	resumeGame() {
		if (this.state !== 'PAUSE') return;
		this.state = 'PLAY';
		this.pauseContainer.visible = false;
	}

	gameLoop(delta) {
		if (this.state !== 'PLAY') return;

		// Обновляем объекты
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
	}

	checkCollisions() {
		// Проверка столкновения с землей или потолком
		if (
			this.bird.sprite.y + this.bird.sprite.height / 2 > this.height - this.groundSprite.height ||
			this.bird.sprite.y - this.bird.sprite.height / 2 < 0
		) {
			this.gameOver();
			return;
		}

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

	// Проверка прохождения труб (увеличиваем счет)
	checkScore() {
		for (let pipe of this.pipesManager.pipes) {
			if (!pipe.passed && pipe.topPipe.x + pipe.topPipe.width < this.bird.sprite.x) {
				pipe.passed = true;
				this.score++;
				this.updateInGameScore();
			}
		}
	}

	// Отрисовка счета во время игры картинками
	updateInGameScore() {
		this.inGameScoreContainer.removeChildren();
		const scoreStr = this.score.toString();
		const digitSpacing = 10;
		let totalWidth = 0;
		const digits = [];

		for (let char of scoreStr) {
			const digit = parseInt(char);
			const sprite = new PIXI.Sprite(this.numberTextures[digit]);
			sprite.anchor.set(0.5);
			digits.push(sprite);
			totalWidth += sprite.width + digitSpacing;
		}
		totalWidth -= digitSpacing;

		let xPos = -totalWidth / 2;
		digits.forEach(sprite => {
			sprite.x = xPos + sprite.width / 2;
			sprite.y = 0;
			xPos += sprite.width + digitSpacing;
			this.inGameScoreContainer.addChild(sprite);
		});
	}

	gameOver() {
		this.state = 'GAMEOVER';
		this.app.ticker.remove(this.gameLoop, this);

		if (this.score > this.bestScore) {
			this.bestScore = this.score;
			localStorage.setItem('bestScore', this.bestScore);
		}

		// Показываем экран Game Over
		this.gameContainer.visible = false;
		this.pauseContainer.visible = false;
		this.menuContainer.visible = false;
		this.gameOverContainer.visible = true;

		this.showFinalScore();
	}

	// Показываем финальный счет и рекорд
	showFinalScore() {
		this.scoreDisplayContainer.removeChildren();

		// --- Метка "Счёт"
		const currentScoreLabel = new PIXI.Text('Счёт:', {
			fontFamily: 'Arial',
			fontSize: 28,
			fill: 0xffffff,
		});
		currentScoreLabel.anchor.set(0.5);
		currentScoreLabel.x = 0;
		currentScoreLabel.y = -40;
		this.scoreDisplayContainer.addChild(currentScoreLabel);

		// Цифры текущего счёта
		const currentScoreContainer = this.createNumberContainer(this.score);
		currentScoreContainer.y = -5;
		this.scoreDisplayContainer.addChild(currentScoreContainer);

		// --- Метка "Рекорд"
		const bestScoreLabel = new PIXI.Text('Рекорд:', {
			fontFamily: 'Arial',
			fontSize: 28,
			fill: 0xffffff,
		});
		bestScoreLabel.anchor.set(0.5);
		bestScoreLabel.x = 0;
		bestScoreLabel.y = 60;
		this.scoreDisplayContainer.addChild(bestScoreLabel);

		// Цифры рекорда
		const bestScoreContainer = this.createNumberContainer(this.bestScore);
		bestScoreContainer.y = 95;
		this.scoreDisplayContainer.addChild(bestScoreContainer);
	}

	// Вспомогательная функция: создать контейнер с цифрами для числа
	createNumberContainer(number) {
		const container = new PIXI.Container();
		const numberStr = number.toString();
		const digitSpacing = 10;
		let totalWidth = 0;
		const digits = [];

		for (let char of numberStr) {
			const digit = parseInt(char);
			const sprite = new PIXI.Sprite(this.numberTextures[digit]);
			sprite.anchor.set(0.5);
			digits.push(sprite);
			totalWidth += sprite.width + digitSpacing;
		}
		totalWidth -= digitSpacing;

		let xPos = -totalWidth / 2;
		digits.forEach(sprite => {
			sprite.x = xPos + sprite.width / 2;
			sprite.y = 0;
			xPos += sprite.width + digitSpacing;
			container.addChild(sprite);
		});
		return container;
	}

	restartGame() {
		this.gameOverContainer.visible = false;
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
