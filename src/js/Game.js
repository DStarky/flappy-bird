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
		this.ysdk = null;

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
		this.continuedWithAd = false;

		this.timeSinceLastPipe = 0;
		this.saveDataTimer = 0;
		this.saveDataInterval = 10 * 60;

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
		this.app.stage.addChild(this.uiManager.leaderboardContainer);

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
			if (e.code === 'KeyL' && this.gameState.current === 'MENU') {
				this.openLeaderboard();
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

		this.continuedWithAd = false;

		if (this.ysdk) {
			this.ysdk.startGamePlay();
			this.ysdk.showBanner(false);
		}

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
		this.saveDataTimer = 0;

		this.bird.reset(this.width / 4, this.height / 2);
		this.pipesManager.reset();
		this.timeSinceLastPipe = 0;

		const shieldUnlocked = localStorage.getItem('shop_shield') === 'true';
		const pepperUnlocked = localStorage.getItem('shop_pepper') === 'true';

		this.pipesManager.shieldUnlocked = shieldUnlocked;
		this.pipesManager.pepperUnlocked = pepperUnlocked;

		this.app.ticker.add(this.gameLoop, this);
	}

	pauseGame() {
		if (this.gameState.current !== 'PLAY') return;
		this.gameState.transitionTo('PAUSE');
		this.uiManager.updateVisibility(this.gameState.current);
		this.soundManager.play('swoosh');
		this.soundManager.pauseMusic();

		if (this.ysdk) {
			this.ysdk.stopGamePlay();
		}
	}

	resumeGame() {
		if (this.gameState.current !== 'PAUSE') return;
		this.gameState.transitionTo('PLAY');
		this.uiManager.updateVisibility(this.gameState.current);
		this.soundManager.play('swoosh');
		this.soundManager.playMusic();

		if (this.ysdk) {
			this.ysdk.startGamePlay();
		}
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

			if (this.ysdk && this.ysdk.isAuthorized()) {
				this.saveDataTimer += delta;
				if (this.saveDataTimer >= this.saveDataInterval) {
					this.ysdk.savePlayerData();
					this.saveDataTimer = 0;
				}
			}
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

		if (this.ysdk && this.ysdk.isAuthorized()) {
			this.saveDataTimer = this.saveDataInterval - 30;
		}
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

		if (this.ysdk) {
			this.ysdk.stopGamePlay();
		}

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

			if (this.ysdk) {
				this.ysdk.setLeaderboardScore(this.score);
			}
		}

		if (this.ysdk && this.ysdk.isAuthorized()) {
			this.ysdk.savePlayerData();
		}

		this.uiManager.prepareGameOverScreen(
			this.score,
			this.bestScore,
			this.coinsCollectedThisRound,
			!this.continuedWithAd,
		);

		this.gameState.transitionTo('GAMEOVER');

		this.soundManager.play('swoosh');

		if (this.ysdk && !this.ysdk.isLocalDevelopment) {
			setTimeout(() => {
				this.ysdk.showInterstitialAd();
			}, 1000);
		}
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

		if (this.ysdk) {
			this.ysdk.showBanner(true);
		}

		setTimeout(() => {
			this.soundManager.playMusic();
		}, 500);
	}

	openShop() {
		this.soundManager.play('swoosh');
		this.uiManager.openShop();
		this.gameState.transitionTo('SHOP');
	}

	closeShop() {
		this.gameState.transitionTo('MENU');
		this.uiManager.updateVisibility(this.gameState.current);
		this.soundManager.play('swoosh');
	}

	openLeaderboard() {
		if (!this.ysdk || (!this.ysdk.initialized && !this.ysdk.isLocalDevelopment)) {
			this.soundManager.play('hit');
			return;
		}

		this.soundManager.play('swoosh');
		this.gameState.transitionTo('LEADERBOARD');
		this.uiManager.openLeaderboard();

		this.ysdk
			.getLeaderboardEntries()
			.then(entries => {
				if (entries) {
					this.uiManager.updateLeaderboardEntries(entries);
				}
			})
			.catch(error => {
				console.error('Error fetching leaderboard:', error);
				this.uiManager.updateLeaderboardEntries({ entries: [] });
			});
	}

	closeLeaderboard() {
		this.gameState.transitionTo('MENU');
		this.uiManager.updateVisibility(this.gameState.current);
		this.soundManager.play('swoosh');
	}

	authorizePlayer() {
		if (!this.ysdk || (!this.ysdk.initialized && !this.ysdk.isLocalDevelopment)) {
			this.soundManager.play('hit');
			return;
		}

		this.ysdk.authorizePlayer().then(success => {
			if (success) {
				this.soundManager.play('point');
				if (this.gameState.current === 'LEADERBOARD') {
					this.openLeaderboard();
				}
			} else {
				this.soundManager.play('hit');
			}
		});
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

	continueAfterAd() {
		if (this.gameState.current !== 'GAMEOVER') return;

		this.continuedWithAd = true;
		this.gameState.transitionTo('PLAY');
		this.uiManager.updateVisibility(this.gameState.current);
		this.soundManager.play('swoosh');
		this.soundManager.playMusic();

		if (this.ysdk) {
			this.ysdk.startGamePlay();
		}

		this.pipesManager.speed = this.pipeSpeed;
		this.groundSpeed = this.difficultyManager.getDifficultySettings().groundSpeed;

		const safeY = this.height / 2;
		this.bird.sprite.y = safeY;
		this.bird.sprite.rotation = 0;
		this.bird.vy = 0;

		this.bird.activateShield(180);
		this.hasShieldActive = true;
		this.isInvulnerable = true;

		this.uiManager.gameOverContainer.visible = false;
		this.uiManager.gameOverUIContainer.visible = false;

		this.app.ticker.remove(this.gameLoop, this);
		this.app.ticker.add(this.gameLoop, this);
	}

	showAdToContinue() {
		if (!this.ysdk || this.continuedWithAd) return;

		this.soundManager.play('swoosh');

		this.ysdk.showRewardedAd({
			onRewarded: () => {
				this.continueAfterAd();
			},
			onClose: () => {
				console.log('Ad closed');
			},
			onError: error => {
				console.error('Ad error:', error);
				this.soundManager.play('hit');
			},
		});
	}
}
