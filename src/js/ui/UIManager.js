// src/js/ui/UIManager.js
import * as PIXI from 'pixi.js';
import MenuScreen from './MenuScreen';
import PauseScreen from './PauseScreen';
import GameOverScreen from './GameOverScreen';

// Импорт ассетов
import gameOverImage from '../../assets/gameover.png';

/**
 * Класс для управления пользовательским интерфейсом
 */
export default class UIManager {
	/**
	 * @param {number} width - Ширина экрана
	 * @param {number} height - Высота экрана
	 * @param {Object} game - Экземпляр основного класса игры
	 */
	constructor(width, height, game) {
		this.width = width;
		this.height = height;
		this.game = game;

		// Инициализация контейнеров для разных экранов
		this.menuContainer = new PIXI.Container();
		this.gameHUD = new PIXI.Container();
		this.pauseContainer = new PIXI.Container();
		this.gameOverContainer = new PIXI.Container();

		// Изначально скрываем все экраны
		this.menuContainer.visible = false;
		this.gameHUD.visible = false;
		this.pauseContainer.visible = false;
		this.gameOverContainer.visible = false;

		// Создаём экраны
		this.menuScreen = new MenuScreen(width, height, game);
		this.menuContainer.addChild(this.menuScreen.container);

		this.pauseScreen = new PauseScreen(width, height);
		this.pauseContainer.addChild(this.pauseScreen.container);

		this.gameOverScreen = new GameOverScreen(width, height, game);
		this.gameOverContainer.addChild(this.gameOverScreen.container);

		// Создаём игровой HUD (счёт)
		this._setupGameHUD();

		// Подготовка элементов для анимации экрана окончания игры
		this.gameOverUIContainer = this.gameOverScreen.container;
		this.gameOverImageContainer = this.gameOverScreen.gameOverImageContainer;
		this.scoreContainer = this.gameOverScreen.scoreContainer;
		this.restartButton = this.gameOverScreen.restartButton;
	}

	/**
	 * Создание элементов игрового HUD
	 */
	_setupGameHUD() {
		// Текст для отображения счёта
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

	/**
	 * Обновление видимости контейнеров в зависимости от состояния
	 * @param {string} state - Текущее состояние игры
	 */
	updateVisibility(state) {
		// Обновляем видимость контейнеров
		this.menuContainer.visible = state === 'MENU';
		this.gameHUD.visible = state === 'PLAY' || state === 'FALLING';
		this.pauseContainer.visible = state === 'PAUSE';

		// Если не GAMEOVER и не FALLING, скрываем экран окончания игры
		if (state !== 'GAMEOVER' && state !== 'FALLING') {
			this.gameOverContainer.visible = false;
			this.gameOverUIContainer.visible = false;
		}
	}

	/**
	 * Обновление счёта
	 * @param {number} score - Текущий счёт
	 */
	updateScore(score) {
		this.scoreText.text = score.toString();
	}

	/**
	 * Подготовка экрана окончания игры
	 * @param {number} score - Текущий счёт
	 * @param {number} bestScore - Лучший счёт
	 */
	prepareGameOverScreen() {
		this.gameOverScreen.prepare(this.game.score, this.game.bestScore);
	}

	/**
	 * Обновление анимаций на экране окончания игры
	 * @param {number} delta - Временной шаг
	 */
	updateGameOverAnimations(delta) {
		this.gameOverScreen.updateAnimations(delta);
	}
}
