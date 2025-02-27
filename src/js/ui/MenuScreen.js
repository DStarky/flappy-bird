// src/js/ui/MenuScreen.js
import * as PIXI from 'pixi.js';

// Импорт ассетов
import menuBg from '../../assets/background-day.png';

/**
 * Класс для экрана меню
 */
export default class MenuScreen {
	/**
	 * @param {number} width - Ширина экрана
	 * @param {number} height - Высота экрана
	 * @param {Object} game - Экземпляр основного класса игры
	 */
	constructor(width, height, game) {
		this.width = width;
		this.height = height;
		this.game = game;

		// Создаём контейнер
		this.container = new PIXI.Container();

		// Инициализация элементов меню
		this._setupMenuElements();
	}

	/**
	 * Инициализация элементов меню
	 */
	_setupMenuElements() {
		// Фон меню
		const menuBackground = new PIXI.Sprite(PIXI.Texture.from(menuBg));
		menuBackground.width = this.width;
		menuBackground.height = this.height;
		this.container.addChild(menuBackground);

		// Заголовок
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

		// Кнопка "ИГРАТЬ"
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

		// Применяем стили с небольшой задержкой
		setTimeout(() => {
			this.title.style = new PIXI.TextStyle({
				fontFamily: ['HarreeghPoppedCyrillic', 'Arial'],
				fontSize: 48,
				fill: 0xffffff,
			});

			startText.style = new PIXI.TextStyle({
				fontFamily: ['HarreeghPoppedCyrillic', 'Arial'],
				fontSize: 30,
				fill: 0xffffff,
			});
		}, 100);
	}
}
