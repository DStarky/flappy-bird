import * as PIXI from 'pixi.js';
import Bird from './Bird';
import PipesManager from './PipesManager';
import UIManager from './ui/UIManager';
import SoundManager from './SoundManager';
import CollisionManager from './CollisionManager';
import GameState from './GameState';
import DifficultyManager from './DifficultyManager';

import bgDay from '../assets/background-day.png';
import base from '../assets/base.png';

export default class Game {
	constructor(width, height) {
		this.width = width;
		this.height = height;

		this.gameState = new GameState();
		this.soundManager = new SoundManager();
		this.difficultyManager = new DifficultyManager();

		const difficultySettings = this.difficultyManager.getDifficultySettings();
		this.gravity = difficultySettings.gravity;
		this.jumpPower = difficultySettings.jumpPower;
		this.pipeSpeed = difficultySettings.pipeSpeed;
		this.pipeSpawnInterval = difficultySettings.pipeSpawnInterval;
		this.groundSpeed = difficultySettings.groundSpeed;
		this.scoreMultiplier = difficultySettings.scoreMultiplier || 1;
		this.coinMultiplier = difficultySettings.coinMultiplier || 1;

		this.score = 0;
		this.bestScore = localStorage.getItem('bestScore') || 0;

		this.coins = parseInt(localStorage.getItem('coins')) || 0;
		this.hasShieldActive = false;
		this.isInvulnerable = false;
		this.isPepperActive = false;

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
		this.app.stage.addChild(this.uiManager.shopContainer);

		this.collisionManager = new CollisionManager(this);

		this._setupEventListeners();

		this.handleResize();

		this.gameState.transitionTo('MENU');
		this.uiManager.updateVisibility(this.gameState.current);

		this.uiManager.updateCoins(this.coins);
		this.uiManager.updateDifficultyButtons(this.difficultyManager.currentDifficulty);

		setTimeout(() => {
			this.soundManager.playMusic();
		}, 500);
	}

	_initializeGameWorld() {
		this.gameContainer = new PIXI.Container();
		this.app.stage.addChild(this.gameContainer);

		this.bgSprite = new PIXI.Sprite(PIXI.Texture.from(bgDay));
		this.bgSprite.width = this.width;
		this.bgSprite.height = this.height;
		this.gameContainer.addChild(this.bgSprite);

		this.bird = new Bird(this.width / 4, this.height / 2, this);
		this.gameContainer.addChild(this.bird.sprite);

		this.gameContainer.addChild(this.bird.shieldEffect.container);
		this.gameContainer.addChild(this.bird.pepperEffect.container);

		this.pipesManager = new PipesManager(this.width, this.height, this.pipeSpeed, this);
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
			if (e.code === 'KeyU' && this.gameState.current === 'MENU') {
				const isMusicOn = this.soundManager.toggleMusic();
				if (this.uiManager && this.uiManager.menuScreen) {
					this.uiManager.menuScreen.updateMusicButtonIcon(isMusicOn);
				}
			}
			if (e.code === 'KeyS' && this.gameState.current === 'MENU') {
				const isSoundOn = this.soundManager.toggleSound();
				if (this.uiManager && this.uiManager.menuScreen) {
					this.uiManager.menuScreen.updateSoundButtonIcon(isSoundOn);
				}
			}
			if (e.code === 'Digit1' && this.gameState.current === 'MENU') {
				this.setDifficulty('easy');
			}
			if (e.code === 'Digit2' && this.gameState.current === 'MENU') {
				this.setDifficulty('medium');
			}
			if (e.code === 'Digit3' && this.gameState.current === 'MENU') {
				this.setDifficulty('hard');
			}
			if (e.code === 'KeyM' && (this.gameState.current === 'MENU' || this.gameState.current === 'SHOP')) {
				if (this.gameState.current === 'MENU') {
					this.openShop();
				} else {
					this.closeShop();
				}
			}
		});

		window.addEventListener('resize', () => this.handleResize());
	}

	setDifficulty(difficulty) {
		if (!this.difficultyManager.isDifficultyUnlocked(difficulty)) {
			this.soundManager.play('hit');
			// Просто воспроизводим звук ошибки без анимации движения
			return;
		}

		if (this.difficultyManager.setDifficulty(difficulty)) {
			const difficultySettings = this.difficultyManager.getDifficultySettings();
			this.gravity = difficultySettings.gravity;
			this.jumpPower = difficultySettings.jumpPower;
			this.pipeSpeed = difficultySettings.pipeSpeed;
			this.pipeSpawnInterval = difficultySettings.pipeSpawnInterval;
			this.groundSpeed = difficultySettings.groundSpeed;
			this.scoreMultiplier = difficultySettings.scoreMultiplier || 1;
			this.coinMultiplier = difficultySettings.coinMultiplier || 1;

			this.pipesManager.updateGapHeight(difficultySettings.gapHeight);
			this.uiManager.updateDifficultyButtons(difficulty);

			this.soundManager.play('swoosh');
		} else {
			this.soundManager.play('hit');
		}
	}

	startGame() {
		this.app.ticker.remove(this.gameLoop, this);

		this.gameState.transitionTo('PLAY');
		this.uiManager.updateVisibility(this.gameState.current);
		this.soundManager.play('swoosh');
		this.soundManager.playMusic();

		const difficultySettings = this.difficultyManager.getDifficultySettings();

		this.gravity = difficultySettings.gravity;
		this.jumpPower = difficultySettings.jumpPower;
		this.pipeSpeed = difficultySettings.pipeSpeed;
		this.pipeSpawnInterval = difficultySettings.pipeSpawnInterval;
		this.groundSpeed = difficultySettings.groundSpeed;
		this.scoreMultiplier = difficultySettings.scoreMultiplier || 1;
		this.coinMultiplier = difficultySettings.coinMultiplier || 1;

		this.pipesManager.updateGapHeight(difficultySettings.gapHeight);
		this.pipesManager.speed = this.pipeSpeed;

		this.score = 0;
		this.uiManager.updateScore(this.score);

		this.coinsCollectedThisRound = 0;
		this.hasShieldActive = false;
		this.isInvulnerable = false;
		this.isPepperActive = false;

		this.bird.reset(this.width / 4, this.height / 2);
		this.pipesManager.reset();
		this.timeSinceLastPipe = 0;

		// Apply unlocked powerups
		const startWithShield = localStorage.getItem('shop_shield') === 'true';
		const startWithPepper = localStorage.getItem('shop_pepper') === 'true';

		if (startWithShield) {
			this.collectShield();
		}

		if (startWithPepper) {
			this.collectPepper();
		}

		this.app.ticker.add(this.gameLoop, this);
	}

	pauseGame() {
		if (this.gameState.current !== 'PLAY') return;
		this.gameState.transitionTo('PAUSE');
		this.uiManager.updateVisibility(this.gameState.current);
		this.soundManager.play('swoosh');
		this.soundManager.pauseMusic();
	}

	resumeGame() {
		if (this.gameState.current !== 'PAUSE') return;
		this.gameState.transitionTo('PLAY');
		this.uiManager.updateVisibility(this.gameState.current);
		this.soundManager.play('swoosh');
		this.soundManager.playMusic();
	}

	gameLoop = delta => {
		if (this.gameState.current === 'PLAY') {
			this.bird.update(delta, this.gravity);

			this.pipesManager.update(delta);

			this.groundSprite.tilePosition.x -= this.groundSpeed * delta;

			const previousInterval = this.isPepperActive ? this.pipeSpawnInterval / 2.5 : this.pipeSpawnInterval;
			const hasPepperStatusChanged = this.bird.pepperEffect.justActivated || this.bird.pepperEffect.justDeactivated;

			const effectiveInterval = this.isPepperActive ? this.pipeSpawnInterval / 2.5 : this.pipeSpawnInterval;

			if (hasPepperStatusChanged) {
				this.timeSinceLastPipe = (this.timeSinceLastPipe / previousInterval) * effectiveInterval;

				this.bird.pepperEffect.justActivated = false;
				this.bird.pepperEffect.justDeactivated = false;
			}

			this.timeSinceLastPipe += delta;
			if (this.timeSinceLastPipe > effectiveInterval) {
				this.pipesManager.spawnPipe();
				this.timeSinceLastPipe = 0;
			}

			this.collisionManager.checkCollisions();
			this.checkScore();
		} else if (this.gameState.current === 'FALLING') {
			this.bird.update(delta, this.gravity * 1.5);

			const groundY = this.height - this.groundSprite.height;
			if (this.bird.sprite.y + this.bird.sprite.height / 2 >= groundY) {
				this.bird.sprite.y = groundY - this.bird.sprite.height / 2;
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
			if (!pipe.passed && pipe.topPipe.x + pipe.topPipe.width / 2 < this.bird.sprite.x) {
				pipe.passed = true;
				this.score += this.scoreMultiplier;
				this.uiManager.updateScore(this.score);
			}
		}
	}

	collectCoin() {
		this.coins += this.coinMultiplier;
		this.coinsCollectedThisRound = (this.coinsCollectedThisRound || 0) + this.coinMultiplier;

		this.uiManager.updateCoins(this.coins);

		localStorage.setItem('coins', this.coins);
	}

	collectShield() {
		if (!this.hasShieldActive && !this.isInvulnerable) {
			this.bird.activateShield();
			this.hasShieldActive = true;

			this.soundManager.play('point');

			if (this.uiManager.updateShieldStatus) {
				this.uiManager.updateShieldStatus(true);
			}

			return true;
		}
		return false;
	}

	collectPepper() {
		if (!this.isPepperActive) {
			this.bird.activatePepper();
			this.isPepperActive = true;

			this.soundManager.play('point');

			return true;
		}
		return false;
	}

	gameOver() {
		if (this.gameState.current === 'GAMEOVER' || this.gameState.current === 'FALLING') return;

		this.soundManager.play('hit');
		this.soundManager.pauseMusic();

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

		this.uiManager.prepareGameOverScreen(this.score, this.bestScore, this.coinsCollectedThisRound);

		this.gameState.transitionTo('GAMEOVER');

		this.soundManager.play('swoosh');
	}

	restartGame() {
		this.uiManager.gameOverContainer.visible = false;
		this.uiManager.gameOverUIContainer.visible = false;

		this.uiManager.gameOverScreen.resetAnimationSound();

		this.soundManager.play('swoosh');
		this.soundManager.pauseMusic();

		this.gameState.transitionTo('MENU');
		this.uiManager.updateVisibility(this.gameState.current);

		this.bird.reset(this.width / 4, this.height / 2);
		this.pipesManager.reset();
		this.score = 0;
		this.hasShieldActive = false;

		setTimeout(() => {
			this.soundManager.playMusic();
		}, 500);
	}

	openShop() {
		this.soundManager.play('swoosh');
		this.uiManager.openShop();
	}

	closeShop() {
		this.gameState.transitionTo('MENU');
		this.uiManager.updateVisibility(this.gameState.current);
		this.soundManager.play('swoosh');
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
