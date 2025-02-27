import * as PIXI from 'pixi.js';
import Bird from './Bird';
import PipesManager from './PipesManager';
import UIManager from './ui/UIManager';
import SoundManager from './SoundManager';
import CollisionManager from './CollisionManager';
import GameState from './GameState';

import bgDay from '../assets/background-day.png';
import base from '../assets/base.png';

export default class Game {
	constructor(width, height) {
		this.width = width;
		this.height = height;

		this.gameState = new GameState();
		this.soundManager = new SoundManager();

		this.gravity = 0.5;
		this.jumpPower = -8;
		this.pipeSpeed = 3;
		this.pipeSpawnInterval = 100;
		this.groundSpeed = 2;

		this.score = 0;
		this.bestScore = localStorage.getItem('bestScore') || 0;
		this.timeSinceLastPipe = 0;

		this.app = new PIXI.Application({
			width: this.width,
			height: this.height,
			backgroundColor: 0x000000,
			resolution: window.devicePixelRatio || 1,
			autoDensity: true,
		});
		document.body.appendChild(this.app.view);

		this._initializeGameWorld();

		this.uiManager = new UIManager(this.width, this.height, this);
		this.app.stage.addChild(this.uiManager.menuContainer);
		this.app.stage.addChild(this.uiManager.gameHUD);
		this.app.stage.addChild(this.uiManager.pauseContainer);
		this.app.stage.addChild(this.uiManager.gameOverContainer);

		this.collisionManager = new CollisionManager(this);

		this._setupEventListeners();

		this.handleResize();

		this.gameState.transitionTo('MENU');
		this.uiManager.updateVisibility(this.gameState.current);
	}

	_initializeGameWorld() {
		this.gameContainer = new PIXI.Container();
		this.app.stage.addChild(this.gameContainer);

		this.bgSprite = new PIXI.Sprite(PIXI.Texture.from(bgDay));
		this.bgSprite.width = this.width;
		this.bgSprite.height = this.height;
		this.gameContainer.addChild(this.bgSprite);

		this.bird = new Bird(this.width / 4, this.height / 2);
		this.gameContainer.addChild(this.bird.sprite);

		this.pipesManager = new PipesManager(this.width, this.height, this.pipeSpeed);
		this.gameContainer.addChild(this.pipesManager.container);

		const groundTexture = PIXI.Texture.from(base);
		this.groundSprite = new PIXI.TilingSprite(groundTexture, this.width, 112);
		this.groundSprite.x = 0;
		this.groundSprite.y = this.height - 112;
		this.gameContainer.addChild(this.groundSprite);
	}

	_setupEventListeners() {
		this.app.view.addEventListener('pointerdown', () => {
			if (this.gameState.current === 'PLAY') {
				this.bird.flap(this.jumpPower);
				this.soundManager.play('flap');
			}
		});

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

		window.addEventListener('resize', () => this.handleResize());
	}

	startGame() {
		this.app.ticker.remove(this.gameLoop, this);

		this.gameState.transitionTo('PLAY');
		this.uiManager.updateVisibility(this.gameState.current);
		this.soundManager.play('swoosh');

		this.score = 0;
		this.uiManager.updateScore(this.score);

		this.pipeSpeed = 3;
		this.groundSpeed = 2;
		this.pipesManager.speed = this.pipeSpeed;

		this.bird.reset(this.width / 4, this.height / 2);
		this.pipesManager.reset();
		this.timeSinceLastPipe = 0;

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
			this.bird.update(delta, this.gravity);

			this.pipesManager.update(delta);

			this.groundSprite.tilePosition.x -= this.groundSpeed * delta;

			this.timeSinceLastPipe += delta;
			if (this.timeSinceLastPipe > this.pipeSpawnInterval) {
				this.pipesManager.spawnPipe();
				this.timeSinceLastPipe = 0;
			}

			this.collisionManager.checkCollisions();
			this.checkScore();
		} else if (this.gameState.current === 'FALLING') {
			this.bird.update(delta, this.gravity * 1.5);

			if (this.bird.sprite.y + this.bird.sprite.height / 2 >= this.height - this.groundSprite.height) {
				this.bird.sprite.y = this.height - this.groundSprite.height - this.bird.sprite.height / 2;
				this.bird.vy = 0;

				this.soundManager.play('die');

				setTimeout(() => this.showGameOverScreen(), 300);
			}
		} else if (this.gameState.current === 'GAMEOVER') {
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

		this.soundManager.play('hit');

		this.gameState.transitionTo('FALLING');

		this.pipesManager.speed = 0;
		this.groundSpeed = 0;

		this.bird.vy = 5;
		this.bird.sprite.rotation = Math.PI / 2;

		this.uiManager.gameOverContainer.visible = true;
		this.uiManager.gameOverUIContainer.visible = false;
	}

	showGameOverScreen() {
		if (this.score > this.bestScore) {
			this.bestScore = this.score;
			localStorage.setItem('bestScore', this.bestScore);
		}

		this.uiManager.prepareGameOverScreen(this.score, this.bestScore);

		this.gameState.transitionTo('GAMEOVER');

		this.soundManager.play('swoosh');
	}

	restartGame() {
		this.uiManager.gameOverContainer.visible = false;
		this.uiManager.gameOverUIContainer.visible = false;

		this.uiManager.gameOverScreen.resetAnimationSound();

		this.soundManager.play('swoosh');

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
