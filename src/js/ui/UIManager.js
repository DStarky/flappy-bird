import * as PIXI from 'pixi.js';
import MenuScreen from './MenuScreen';
import PauseScreen from './PauseScreen';
import GameOverScreen from './GameOverScreen';

export default class UIManager {
	constructor(width, height, game) {
		this.width = width;
		this.height = height;
		this.game = game;

		this.menuContainer = new PIXI.Container();
		this.gameHUD = new PIXI.Container();
		this.pauseContainer = new PIXI.Container();
		this.gameOverContainer = new PIXI.Container();

		this.menuContainer.visible = false;
		this.gameHUD.visible = false;
		this.pauseContainer.visible = false;
		this.gameOverContainer.visible = false;

		this.menuScreen = new MenuScreen(width, height, game);
		this.menuContainer.addChild(this.menuScreen.container);

		this.pauseScreen = new PauseScreen(width, height);
		this.pauseContainer.addChild(this.pauseScreen.container);

		this.gameOverScreen = new GameOverScreen(width, height, game);
		this.gameOverContainer.addChild(this.gameOverScreen.container);

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
	}

	updateVisibility(state) {
		this.menuContainer.visible = state === 'MENU';
		this.gameHUD.visible = state === 'PLAY' || state === 'FALLING';
		this.pauseContainer.visible = state === 'PAUSE';

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

	prepareGameOverScreen(score, bestScore) {
		this.gameOverScreen.prepare(score, bestScore);
	}

	updateGameOverAnimations(delta) {
		this.gameOverScreen.updateAnimations(delta);
	}
}
