import * as PIXI from 'pixi.js';
import MenuScreen from './MenuScreen';
import PauseScreen from './PauseScreen';
import GameOverScreen from './GameOverScreen';
import ShopScreen from './ShopScreen';
import LeaderboardScreen from './LeaderboardScreen';

import coinImg from '../../assets/MonedaD.png';

export default class UIManager {
	constructor(width, height, game) {
		this.width = width;
		this.height = height;
		this.game = game;

		this.menuContainer = new PIXI.Container();
		this.gameHUD = new PIXI.Container();
		this.pauseContainer = new PIXI.Container();
		this.gameOverContainer = new PIXI.Container();
		this.shopContainer = new PIXI.Container();
		this.leaderboardContainer = new PIXI.Container();

		this.menuContainer.visible = false;
		this.gameHUD.visible = false;
		this.pauseContainer.visible = false;
		this.gameOverContainer.visible = false;
		this.shopContainer.visible = false;
		this.leaderboardContainer.visible = false;

		this.menuScreen = new MenuScreen(width, height, game);
		this.menuContainer.addChild(this.menuScreen.container);

		this.pauseScreen = new PauseScreen(width, height);
		this.pauseContainer.addChild(this.pauseScreen.container);

		this.gameOverScreen = new GameOverScreen(width, height, game);
		this.gameOverContainer.addChild(this.gameOverScreen.container);

		this.shopScreen = new ShopScreen(width, height, game);
		this.shopContainer.addChild(this.shopScreen.container);

		this.leaderboardScreen = new LeaderboardScreen(width, height, game);
		this.leaderboardContainer.addChild(this.leaderboardScreen.container);

		this._setupGameHUD();

		this.gameOverUIContainer = this.gameOverScreen.container;
		this.gameOverImageContainer = this.gameOverScreen.gameOverImageContainer;
		this.scoreContainer = this.gameOverScreen.scoreContainer;
		this.restartButton = this.gameOverScreen.restartButton;
	}

	_setupGameHUD() {
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
		this.gameHUD.addChild(this.scoreText);

		this.coinContainer = new PIXI.Container();
		this.coinContainer.x = 20;
		this.coinContainer.y = 20;
		this.gameHUD.addChild(this.coinContainer);

		const coinBaseTexture = PIXI.BaseTexture.from(coinImg);
		const coinTexture = new PIXI.Texture(coinBaseTexture, new PIXI.Rectangle(0, 0, 16, 16));
		this.coinIcon = new PIXI.Sprite(coinTexture);
		this.coinIcon.scale.set(1.5);
		this.coinContainer.addChild(this.coinIcon);

		this.coinText = new PIXI.Text('0', {
			fontFamily: ['HarreeghPoppedCyrillic', 'Arial'],
			fontSize: 24,
			fill: 0xffffff,
			stroke: 0x000000,
			strokeThickness: 4,
		});
		this.coinText.x = 28;
		this.coinText.y = -4;
		this.coinContainer.addChild(this.coinText);

		this.menuCoinContainer = new PIXI.Container();
		this.menuCoinContainer.x = 20;
		this.menuCoinContainer.y = 20;
		this.menuContainer.addChild(this.menuCoinContainer);

		const menuCoinIcon = new PIXI.Sprite(coinTexture);
		menuCoinIcon.scale.set(1.5);
		this.menuCoinContainer.addChild(menuCoinIcon);

		this.menuCoinText = new PIXI.Text('0', {
			fontFamily: ['HarreeghPoppedCyrillic', 'Arial'],
			fontSize: 24,
			fill: 0xffffff,
			stroke: 0x000000,
			strokeThickness: 4,
		});
		this.menuCoinText.x = 28;
		this.menuCoinText.y = -4;
		this.menuCoinContainer.addChild(this.menuCoinText);
	}

	updateVisibility(state) {
		this.menuContainer.visible = state === 'MENU';
		this.gameHUD.visible = state === 'PLAY' || state === 'FALLING';
		this.pauseContainer.visible = state === 'PAUSE';
		this.shopContainer.visible = state === 'SHOP';
		this.leaderboardContainer.visible = state === 'LEADERBOARD';

		if (state !== 'GAMEOVER' && state !== 'FALLING') {
			this.gameOverContainer.visible = false;
			this.gameOverUIContainer.visible = false;
		}

		if (state === 'MENU') {
			this.menuScreen.updateMusicButtonIcon(this.game.soundManager.isMusicOn());
			this.menuScreen.updateSoundButtonIcon(this.game.soundManager.isSoundOn());
		}
	}

	updateScore(score) {
		this.scoreText.text = score.toString();
	}

	updateCoins(coins) {
		this.coinText.text = coins.toString();
		this.menuCoinText.text = coins.toString();
		if (this.shopScreen) {
			this.shopScreen.updateCoins(coins);
		}
	}

	updateDifficultyButtons(difficulty) {
		this.menuScreen.updateSelectedDifficulty(difficulty);
	}

	updateShieldStatus(isActive) {}

	prepareGameOverScreen(score, bestScore, coinsCollected = 0, canContinue = true) {
		this.gameOverScreen.prepare(score, bestScore, coinsCollected, canContinue);
	}

	updateGameOverAnimations(delta) {
		this.gameOverScreen.updateAnimations(delta);
	}

	openShop() {
		this.shopScreen.open();
		this.updateVisibility('SHOP');
	}

	openLeaderboard() {
		this.leaderboardScreen.open();
		this.updateVisibility('LEADERBOARD');
	}

	updateLeaderboardEntries(entries) {
		this.leaderboardScreen.updateEntries(entries);
	}
}
