import * as PIXI from 'pixi.js';
import menuBg from '../../assets/background-day.png';
import base from '../../assets/base.png';
import musicOnImg from '../../assets/ui/music-on.png';
import musicOffImg from '../../assets/ui/music-off.png';
import soundsOnImg from '../../assets/ui/sounds-on.png';
import soundsOffImg from '../../assets/ui/sounds-off.png';

export default class MenuScreen {
	constructor(width, height, game) {
		this.width = width;
		this.height = height;
		this.game = game;
		this.container = new PIXI.Container();
		this._setupMenuElements();
	}

	_setupMenuElements() {
		const menuBackground = new PIXI.Sprite(PIXI.Texture.from(menuBg));
		menuBackground.width = this.width;
		menuBackground.height = this.height;
		this.container.addChild(menuBackground);
		const groundTexture = PIXI.Texture.from(base);
		this.groundSprite = new PIXI.TilingSprite(groundTexture, this.width, 112);
		this.groundSprite.x = 0;
		this.groundSprite.y = this.height - 112;
		this.container.addChild(this.groundSprite);
		this.title = new PIXI.Text('FLAPPY BIRD', {
			fontFamily: ['HarreeghPoppedCyrillic', 'Arial'],
			fontSize: 40,
			fill: 0xffffff,
			stroke: 0x000000,
			strokeThickness: 4,
		});
		this.title.anchor.set(0.5);
		this.title.x = this.width / 2;
		this.title.y = this.height / 3 - 20;
		this.container.addChild(this.title);
		this.difficultyContainer = new PIXI.Container();
		this.difficultyContainer.x = this.width / 2;
		this.difficultyContainer.y = this.height / 3 + 30;
		this.container.addChild(this.difficultyContainer);
		this.difficultyText = new PIXI.Text('ВЫБЕРИТЕ СЛОЖНОСТЬ:', {
			fontFamily: ['HarreeghPoppedCyrillic', 'Arial'],
			fontSize: 20,
			fill: 0xffffff,
			stroke: 0x000000,
			strokeThickness: 2,
		});
		this.difficultyText.anchor.set(0.5);
		this.difficultyContainer.addChild(this.difficultyText);
		const buttonWidth = 80;
		const buttonSpacing = 10;
		const totalWidth = buttonWidth * 3 + buttonSpacing * 2;
		const startX = -totalWidth / 2;
		this.easyButton = new PIXI.Graphics();
		this.easyButton.beginFill(0x27ae60);
		this.easyButton.drawRoundedRect(0, 0, buttonWidth, 40, 8);
		this.easyButton.endFill();
		this.easyButton.x = startX;
		this.easyButton.y = 30;
		this.easyButton.interactive = true;
		this.easyButton.cursor = 'pointer';
		this.easyButton.on('pointerdown', () => {
			this.game.setDifficulty('easy');
		});
		this.difficultyContainer.addChild(this.easyButton);
		const easyText = new PIXI.Text('ЛЕГКИЙ', {
			fontFamily: ['HarreeghPoppedCyrillic', 'Arial'],
			fontSize: 14,
			fill: 0xffffff,
		});
		easyText.anchor.set(0.5);
		easyText.x = buttonWidth / 2;
		easyText.y = 20;
		this.easyButton.addChild(easyText);
		this.mediumButton = new PIXI.Graphics();
		this.mediumButton.beginFill(0xf39c12);
		this.mediumButton.drawRoundedRect(0, 0, buttonWidth, 40, 8);
		this.mediumButton.endFill();
		this.mediumButton.x = startX + buttonWidth + buttonSpacing;
		this.mediumButton.y = 30;
		this.mediumButton.interactive = true;
		this.mediumButton.cursor = 'pointer';
		this.mediumButton.on('pointerdown', () => {
			const mediumUnlocked = localStorage.getItem('shop_medium_difficulty') === 'true';
			if (mediumUnlocked) {
				this.game.setDifficulty('medium');
			} else {
				this._shakeButton(this.mediumButton);
			}
		});
		this.difficultyContainer.addChild(this.mediumButton);
		const mediumText = new PIXI.Text('СРЕДНИЙ', {
			fontFamily: ['HarreeghPoppedCyrillic', 'Arial'],
			fontSize: 14,
			fill: 0xffffff,
		});
		mediumText.anchor.set(0.5);
		mediumText.x = buttonWidth / 2;
		mediumText.y = 20;
		this.mediumButton.addChild(mediumText);
		this.hardButton = new PIXI.Graphics();
		this.hardButton.beginFill(0xe74c3c);
		this.hardButton.drawRoundedRect(0, 0, buttonWidth, 40, 8);
		this.hardButton.endFill();
		this.hardButton.x = startX + (buttonWidth + buttonSpacing) * 2;
		this.hardButton.y = 30;
		this.hardButton.interactive = true;
		this.hardButton.cursor = 'pointer';
		this.hardButton.on('pointerdown', () => {
			const hardUnlocked = localStorage.getItem('shop_hard_difficulty') === 'true';
			if (hardUnlocked) {
				this.game.setDifficulty('hard');
			} else {
				this._shakeButton(this.hardButton);
			}
		});
		this.difficultyContainer.addChild(this.hardButton);
		const hardText = new PIXI.Text('ТЯЖЕЛЫЙ', {
			fontFamily: ['HarreeghPoppedCyrillic', 'Arial'],
			fontSize: 14,
			fill: 0xffffff,
		});
		hardText.anchor.set(0.5);
		hardText.x = buttonWidth / 2;
		hardText.y = 20;
		this.hardButton.addChild(hardText);
		const startButton = new PIXI.Graphics();
		startButton.beginFill(0x4caf50);
		startButton.drawRoundedRect(0, 0, 200, 60, 10);
		startButton.endFill();
		startButton.x = this.width / 2 - 100;
		startButton.y = this.height / 2 + 20;
		startButton.interactive = true;
		startButton.cursor = 'pointer';
		startButton.on('pointerdown', () => this.game.startGame());
		this.container.addChild(startButton);
		const startText = new PIXI.Text('ИГРАТЬ', {
			fontFamily: ['HarreeghPoppedCyrillic', 'Arial'],
			fontSize: 30,
			fill: 0xffffff,
		});
		startText.anchor.set(0.5);
		startText.x = 100;
		startText.y = 30;
		startButton.addChild(startText);
		const shopButton = new PIXI.Graphics();
		shopButton.beginFill(0x9b59b6);
		shopButton.drawRoundedRect(0, 0, 200, 50, 10);
		shopButton.endFill();
		shopButton.x = this.width / 2 - 100;
		shopButton.y = this.height / 2 + 100;
		shopButton.interactive = true;
		shopButton.cursor = 'pointer';
		shopButton.on('pointerdown', () => this.game.openShop());
		this.container.addChild(shopButton);
		const shopText = new PIXI.Text('МАГАЗИН', {
			fontFamily: ['HarreeghPoppedCyrillic', 'Arial'],
			fontSize: 24,
			fill: 0xffffff,
		});
		shopText.anchor.set(0.5);
		shopText.x = 100;
		shopText.y = 25;
		shopButton.addChild(shopText);
		this._createButtons();
	}

	updateSelectedDifficulty(difficulty) {
		this.easyButton.alpha = difficulty === 'easy' ? 1.0 : 0.6;
		this.mediumButton.alpha = difficulty === 'medium' ? 1.0 : 0.6;
		this.hardButton.alpha = difficulty === 'hard' ? 1.0 : 0.6;
		const mediumUnlocked = localStorage.getItem('shop_medium_difficulty') === 'true';
		const hardUnlocked = localStorage.getItem('shop_hard_difficulty') === 'true';
		this.mediumButton.cursor = mediumUnlocked ? 'pointer' : 'not-allowed';
		this.mediumButton.tint = mediumUnlocked ? 0xffffff : 0x888888;
		this.mediumButton.alpha = mediumUnlocked ? this.mediumButton.alpha : 0.5;
		this.hardButton.cursor = hardUnlocked ? 'pointer' : 'not-allowed';
		this.hardButton.tint = hardUnlocked ? 0xffffff : 0x888888;
		this.hardButton.alpha = hardUnlocked ? this.hardButton.alpha : 0.5;
	}

	_createButtons() {
		this.musicButtonContainer = new PIXI.Container();
		this.musicButtonContainer.x = this.width - 50;
		this.musicButtonContainer.y = 40;
		this.container.addChild(this.musicButtonContainer);
		this.soundButtonContainer = new PIXI.Container();
		this.soundButtonContainer.x = this.width - 50;
		this.soundButtonContainer.y = 110;
		this.container.addChild(this.soundButtonContainer);
		this.musicOnTexture = PIXI.Texture.from(musicOnImg);
		this.musicOffTexture = PIXI.Texture.from(musicOffImg);
		this.soundOnTexture = PIXI.Texture.from(soundsOnImg);
		this.soundOffTexture = PIXI.Texture.from(soundsOffImg);
		this.musicButton = new PIXI.Sprite(this.musicOnTexture);
		this.musicButton.anchor.set(0.5);
		this.musicButton.scale.set(2.0);
		this.musicButtonContainer.addChild(this.musicButton);
		this.soundButton = new PIXI.Sprite(this.soundOnTexture);
		this.soundButton.anchor.set(0.5);
		this.soundButton.scale.set(2.0);
		this.soundButtonContainer.addChild(this.soundButton);
		this.musicButton.interactive = true;
		this.musicButton.cursor = 'pointer';
		this.musicButton.on('pointerdown', () => {
			const isMusicOn = this.game.soundManager.toggleMusic();
			this.updateMusicButtonIcon(isMusicOn);
		});
		this.soundButton.interactive = true;
		this.soundButton.cursor = 'pointer';
		this.soundButton.on('pointerdown', () => {
			const isSoundOn = this.game.soundManager.toggleSound();
			this.updateSoundButtonIcon(isSoundOn);
		});
		this.updateMusicButtonIcon(this.game.soundManager.isMusicOn());
		this.updateSoundButtonIcon(this.game.soundManager.isSoundOn());
	}

	updateMusicButtonIcon(isMusicOn) {
		this.musicButton.texture = isMusicOn ? this.musicOnTexture : this.musicOffTexture;
	}

	updateSoundButtonIcon(isSoundOn) {
		this.soundButton.texture = isSoundOn ? this.soundOnTexture : this.soundOffTexture;
	}

	_shakeButton(button) {
		if (button._shakeTicker) return;
		this.game.soundManager.play('hit');
		const originalX = button.x;
		let time = 0;
		const duration = 0.8;
		const amplitude = 6;
		const frequency = 8;
		const ticker = this.game.app && this.game.app.ticker ? this.game.app.ticker : PIXI.Ticker.shared;
		button._shakeTicker = delta => {
			time += delta / 60;
			if (time >= duration) {
				ticker.remove(button._shakeTicker);
				button._shakeTicker = null;
				button.x = originalX;
				return;
			}
			const progress = time / duration;
			const damping = 1 - progress;
			button.x = originalX + Math.sin(time * frequency) * amplitude * damping;
		};
		ticker.add(button._shakeTicker);
	}
}
