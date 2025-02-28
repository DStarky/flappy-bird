import * as PIXI from 'pixi.js';

import menuBg from '../../assets/background-day.png';
import base from '../../assets/base.png';

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
		this.title.y = this.height / 3;
		this.container.addChild(this.title);

		const startButton = new PIXI.Graphics();
		startButton.beginFill(0x4caf50);
		startButton.drawRoundedRect(0, 0, 200, 60, 10);
		startButton.endFill();
		startButton.x = this.width / 2 - 100;
		startButton.y = this.height / 2;
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

		this.musicButton = new PIXI.Graphics();
		this.musicButton.beginFill(0x3f51b5);
		this.musicButton.drawRoundedRect(0, 0, 50, 50, 10);
		this.musicButton.endFill();
		this.musicButton.x = this.width - 70;
		this.musicButton.y = 20;
		this.musicButton.interactive = true;
		this.musicButton.cursor = 'pointer';
		this.musicButton.on('pointerdown', () => {
			const isMusicOn = this.game.soundManager.toggleMusic();
			this.updateMusicButtonIcon(isMusicOn);
		});
		this.container.addChild(this.musicButton);

		this.musicIcon = new PIXI.Text('♪', {
			fontFamily: 'Arial',
			fontSize: 30,
			fill: 0xffffff,
		});
		this.musicIcon.anchor.set(0.5);
		this.musicIcon.x = 25;
		this.musicIcon.y = 25;
		this.musicButton.addChild(this.musicIcon);

		this.soundButton = new PIXI.Graphics();
		this.soundButton.beginFill(0xf44336);
		this.soundButton.drawRoundedRect(0, 0, 50, 50, 10);
		this.soundButton.endFill();
		this.soundButton.x = this.width - 70;
		this.soundButton.y = 80;
		this.soundButton.interactive = true;
		this.soundButton.cursor = 'pointer';
		this.soundButton.on('pointerdown', () => {
			const isSoundOn = this.game.soundManager.toggleSound();
			this.updateSoundButtonIcon(isSoundOn);
		});
		this.container.addChild(this.soundButton);

		this.soundIcon = new PIXI.Text('🔊', {
			fontFamily: 'Arial',
			fontSize: 24,
			fill: 0xffffff,
		});
		this.soundIcon.anchor.set(0.5);
		this.soundIcon.x = 25;
		this.soundIcon.y = 25;
		this.soundButton.addChild(this.soundIcon);

		// Инициализация состояния кнопок
		this.updateMusicButtonIcon(true);
		this.updateSoundButtonIcon(true);
	}

	updateMusicButtonIcon(isMusicOn) {
		this.musicIcon.text = isMusicOn ? '♪' : '♪̸';
		this.musicButton.clear();
		this.musicButton.beginFill(isMusicOn ? 0x3f51b5 : 0x9e9e9e);
		this.musicButton.drawRoundedRect(0, 0, 50, 50, 10);
		this.musicButton.endFill();
	}

	updateSoundButtonIcon(isSoundOn) {
		this.soundIcon.text = isSoundOn ? '🔊' : '🔇';
		this.soundButton.clear();
		this.soundButton.beginFill(isSoundOn ? 0xf44336 : 0x9e9e9e);
		this.soundButton.drawRoundedRect(0, 0, 50, 50, 10);
		this.soundButton.endFill();
	}
}
