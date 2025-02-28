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

		this._createButtons();
	}

	_createButtons() {
		// Создаем контейнеры для кнопок, чтобы предотвратить смещение при нажатии
		this.musicButtonContainer = new PIXI.Container();
		this.musicButtonContainer.x = this.width - 50;
		this.musicButtonContainer.y = 40;
		this.container.addChild(this.musicButtonContainer);

		this.soundButtonContainer = new PIXI.Container();
		this.soundButtonContainer.x = this.width - 50;
		this.soundButtonContainer.y = 110;
		this.container.addChild(this.soundButtonContainer);

		// Загружаем текстуры для кнопок
		this.musicOnTexture = PIXI.Texture.from(musicOnImg);
		this.musicOffTexture = PIXI.Texture.from(musicOffImg);
		this.soundOnTexture = PIXI.Texture.from(soundsOnImg);
		this.soundOffTexture = PIXI.Texture.from(soundsOffImg);

		// Создаем спрайты кнопок
		this.musicButton = new PIXI.Sprite(this.musicOnTexture);
		this.musicButton.anchor.set(0.5);
		this.musicButton.scale.set(2.0);
		this.musicButtonContainer.addChild(this.musicButton);

		this.soundButton = new PIXI.Sprite(this.soundOnTexture);
		this.soundButton.anchor.set(0.5);
		this.soundButton.scale.set(2.0);
		this.soundButtonContainer.addChild(this.soundButton);

		// Сами спрайты делаем интерактивными
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

		// Устанавливаем начальное состояние
		this.updateMusicButtonIcon(this.game.soundManager.isMusicOn());
		this.updateSoundButtonIcon(this.game.soundManager.isSoundOn());
	}

	updateMusicButtonIcon(isMusicOn) {
		this.musicButton.texture = isMusicOn ? this.musicOnTexture : this.musicOffTexture;
	}

	updateSoundButtonIcon(isSoundOn) {
		this.soundButton.texture = isSoundOn ? this.soundOnTexture : this.soundOffTexture;
	}
}
