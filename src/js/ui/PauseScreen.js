// src/js/ui/PauseScreen.js
import * as PIXI from 'pixi.js';

/**
 * Класс для экрана паузы
 */
export default class PauseScreen {
	/**
	 * @param {number} width - Ширина экрана
	 * @param {number} height - Высота экрана
	 */
	constructor(width, height) {
		this.width = width;
		this.height = height;

		// Создаём контейнер
		this.container = new PIXI.Container();

		// Инициализация элементов экрана паузы
		this._setupPauseElements();
	}

	/**
	 * Инициализация элементов экрана паузы
	 */
	_setupPauseElements() {
		// Полупрозрачный фон
		const overlay = new PIXI.Graphics();
		overlay.beginFill(0x000000, 0.5);
		overlay.drawRect(0, 0, this.width, this.height);
		overlay.endFill();
		this.container.addChild(overlay);

		// Текст "ПАУЗА"
		const pauseText = new PIXI.Text('ПАУЗА', {
			fontFamily: ['HarreeghPoppedCyrillic', 'Arial'],
			fontSize: 50,
			fill: 0xffffff,
			stroke: 0x000000,
			strokeThickness: 4,
		});
		pauseText.anchor.set(0.5);
		pauseText.x = this.width / 2;
		pauseText.y = this.height / 2;
		this.container.addChild(pauseText);
	}
}
