import * as PIXI from 'pixi.js';
import Bird from './Bird';
import PipesManager from './PipesManager';

// Импортируем спрайты
import bgDay from '../assets/background-day.png';
import base from '../assets/base.png';

export default class Game {
	constructor(width, height) {
		this.width = width;
		this.height = height;

		this.isGameActive = false;
		this.isGameOver = false;
		this.score = 0;
		this.bestScore = localStorage.getItem('bestScore') || 0;

		this.gravity = 0.5;
		this.jumpPower = -8;

		// Скорость труб
		this.pipeSpeed = 3;
		// Интервал (в кадрах) между появлением труб
		this.pipeSpawnInterval = 100;
		this.timeSinceLastPipe = 0;

		// Скорость прокрутки земли (можно сделать равной pipeSpeed, если хотите)
		this.groundSpeed = 2;

		this.app = new PIXI.Application({
			width: 480,
			height: 640,
			backgroundColor: 0x000000,
			resolution: window.devicePixelRatio || 1,
			autoDensity: true,
		});

		document.body.appendChild(this.app.view);

		// Контейнеры
		this.menuContainer = new PIXI.Container();
		this.gameContainer = new PIXI.Container();
		this.gameOverContainer = new PIXI.Container();

		// Добавляем
		this.app.stage.addChild(this.menuContainer);
		this.app.stage.addChild(this.gameContainer);
		this.app.stage.addChild(this.gameOverContainer);

		this.menuContainer.visible = true;
		this.gameContainer.visible = false;
		this.gameOverContainer.visible = false;

		this.setupMenu();
		this.setupGame();
		this.setupGameOver();
		this.setupEventListeners();
	}

	setupMenu() {
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

		const startButton = new PIXI.Graphics();
		startButton.beginFill(0x4caf50);
		startButton.drawRoundedRect(0, 0, 200, 60, 10);
		startButton.endFill();
		startButton.x = this.width / 2 - 100;
		startButton.y = this.height / 2;
		startButton.interactive = true;
		startButton.cursor = 'pointer';
		startButton.on('pointerdown', () => this.startGame());

		const startText = new PIXI.Text('СТАРТ', {
			fontFamily: 'Arial',
			fontSize: 30,
			fill: 0xffffff,
		});
		startText.anchor.set(0.5);
		startText.x = 100;
		startText.y = 30;
		startButton.addChild(startText);

		const instruction = new PIXI.Text('Нажимайте на экран или пробел, чтобы лететь', {
			fontFamily: 'Arial',
			fontSize: 18,
			fill: 0xffffff,
			align: 'center',
		});
		instruction.anchor.set(0.5);
		instruction.x = this.width / 2;
		instruction.y = this.height / 2 + 100;

		this.menuContainer.addChild(title, startButton, instruction);
	}

	setupGame() {
		// -------- 1) ФОН --------
		this.bgSprite = new PIXI.Sprite(PIXI.Texture.from(bgDay));
		this.bgSprite.width = 480;
		this.bgSprite.height = 640;
		this.bgSprite.x = 0;
		this.bgSprite.y = 0;
		this.gameContainer.addChild(this.bgSprite);

		// -------- 2) ПТИЦА --------
		this.bird = new Bird(this.width / 4, this.height / 2);
		this.gameContainer.addChild(this.bird.sprite);

		// -------- 3) ТРУБЫ --------
		this.pipesManager = new PipesManager(this.width, this.height, this.pipeSpeed);
		this.gameContainer.addChild(this.pipesManager.container);

		// -------- 4) ЗЕМЛЯ (движущаяся) --------
		// Вместо обычного Sprite используем TilingSprite
		const groundTexture = PIXI.Texture.from(base);
		this.groundSprite = new PIXI.TilingSprite(groundTexture, this.width, 112);
		this.groundSprite.x = 0;
		this.groundSprite.y = 640 - 112; // 528
		this.gameContainer.addChild(this.groundSprite);

		// -------- 5) ТЕКСТ СЧЁТА --------
		this.scoreText = new PIXI.Text('0', {
			fontFamily: 'Arial',
			fontSize: 40,
			fill: 0xffffff,
			stroke: 0x000000,
			strokeThickness: 4,
		});
		this.scoreText.anchor.set(0.5, 0);
		this.scoreText.x = this.width / 2;
		this.scoreText.y = 20;
		this.gameContainer.addChild(this.scoreText);

		// -------- 6) Маска (опционально) --------
		// Если хотите, чтобы трубы/птица не вылезали за пределы, можно делать маску:
		// const maskRect = new PIXI.Graphics();
		// maskRect.beginFill(0xffffff);
		// maskRect.drawRect(0, 0, this.width, this.height);
		// maskRect.endFill();
		// this.gameContainer.addChild(maskRect);
		// this.gameContainer.mask = maskRect;
	}

	setupGameOver() {
		const gameOverTitle = new PIXI.Text('GAME OVER', {
			fontFamily: 'Arial',
			fontSize: 40,
			fill: 0xffffff,
			stroke: 0x000000,
			strokeThickness: 4,
		});
		gameOverTitle.anchor.set(0.5);
		gameOverTitle.x = this.width / 2;
		gameOverTitle.y = this.height / 3;

		this.finalScoreText = new PIXI.Text('Счёт: 0\nРекорд: 0', {
			fontFamily: 'Arial',
			fontSize: 30,
			fill: 0xffffff,
			stroke: 0x000000,
			strokeThickness: 2,
			align: 'center',
		});
		this.finalScoreText.anchor.set(0.5);
		this.finalScoreText.x = this.width / 2;
		this.finalScoreText.y = this.height / 2;

		const restartButton = new PIXI.Graphics();
		restartButton.beginFill(0x4caf50);
		restartButton.drawRoundedRect(0, 0, 200, 60, 10);
		restartButton.endFill();
		restartButton.x = this.width / 2 - 100;
		restartButton.y = this.height / 2 + 80;
		restartButton.interactive = true;
		restartButton.cursor = 'pointer';
		restartButton.on('pointerdown', () => this.restartGame());

		const restartText = new PIXI.Text('ЗАНОВО', {
			fontFamily: 'Arial',
			fontSize: 30,
			fill: 0xffffff,
		});
		restartText.anchor.set(0.5);
		restartText.x = 100;
		restartText.y = 30;
		restartButton.addChild(restartText);

		this.gameOverContainer.addChild(gameOverTitle, this.finalScoreText, restartButton);
	}

	setupEventListeners() {
		// Клик / Тап
		this.app.view.addEventListener('pointerdown', () => {
			if (this.isGameActive && !this.isGameOver) {
				this.bird.flap(this.jumpPower);
			}
		});

		// Пробел
		window.addEventListener('keydown', e => {
			if (e.code === 'Space' && this.isGameActive && !this.isGameOver) {
				this.bird.flap(this.jumpPower);
			}
		});

		// Изменение размера окна
		window.addEventListener('resize', () => this.handleResize());
	}

	startGame() {
		this.menuContainer.visible = false;
		this.gameContainer.visible = true;
		this.gameOverContainer.visible = false;

		this.isGameActive = true;
		this.isGameOver = false;
		this.score = 0;
		this.scoreText.text = '0';

		// Сброс
		this.bird.reset(this.width / 4, this.height / 2);
		this.pipesManager.reset();
		this.timeSinceLastPipe = 0;

		// Сразу создаём первую трубу, чтобы не ждать
		this.pipesManager.spawnPipe();

		// Запускаем цикл
		this.app.ticker.add(this.gameLoop, this);
	}

	gameLoop(delta) {
		// Если игра не идёт или уже конец, выходим
		if (!this.isGameActive || this.isGameOver) return;

		// Обновляем птичку и трубы
		this.bird.update(delta, this.gravity);
		this.pipesManager.update(delta);

		// Прокрутка земли
		// Меняем tilePosition.x, чтобы земля "уезжала" влево
		this.groundSprite.tilePosition.x -= this.groundSpeed * delta;

		// Спавн труб по таймеру
		this.timeSinceLastPipe += delta;
		if (this.timeSinceLastPipe > this.pipeSpawnInterval) {
			this.pipesManager.spawnPipe();
			this.timeSinceLastPipe = 0;
		}

		this.checkCollisions();
		this.checkScore();
	}

	// ------------------------------
	// Проверка коллизий
	// ------------------------------
	checkCollisions() {
		// Проверка земли
		if (this.bird.sprite.y + this.bird.sprite.height / 2 > this.height - this.groundSprite.height) {
			this.gameOver();
			return;
		}

		// Проверка верха
		if (this.bird.sprite.y - this.bird.sprite.height / 2 < 0) {
			this.gameOver();
			return;
		}

		// "Сжатый" прямоугольник птицы
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

	// Простой AABB
	isColliding(a, b) {
		return !(a.x + a.width < b.x || a.x > b.x + b.width || a.y + a.height < b.y || a.y > b.y + b.height);
	}

	// "Сжимаем" прямоугольник спрайта (для более точной коллизии)
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
			}
		}
	}

	gameOver() {
		this.isGameOver = true;
		this.isGameActive = false;
		if (this.score > this.bestScore) {
			this.bestScore = this.score;
			localStorage.setItem('bestScore', this.bestScore);
		}
		this.finalScoreText.text = `Счёт: ${this.score}\nРекорд: ${this.bestScore}`;
		this.gameOverContainer.visible = true;

		this.app.ticker.remove(this.gameLoop, this);
	}

	restartGame() {
		this.gameOverContainer.visible = false;
		this.startGame();
	}

	handleResize() {
		// Получаем размеры окна
		const windowWidth = window.innerWidth;
		const windowHeight = window.innerHeight;

		// Коэффициент масштабирования
		const scale = Math.min(windowWidth / this.width, windowHeight / this.height);

		// Обновляем стили canvas
		this.app.view.style.width = `${this.width * scale}px`;
		this.app.view.style.height = `${this.height * scale}px`;

		// Центрируем canvas
		this.app.view.style.position = 'absolute';
		this.app.view.style.left = `${(windowWidth - this.width * scale) / 2}px`;
		this.app.view.style.top = `${(windowHeight - this.height * scale) / 2}px`;
	}
}
