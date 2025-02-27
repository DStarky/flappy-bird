// src/js/ui/GameOverScreen.js
import * as PIXI from 'pixi.js';

// Импорт ассетов
import gameOverImage from '../../assets/gameover.png';

/**
 * Класс для экрана окончания игры
 */
export default class GameOverScreen {
	/**
	 * @param {number} width - Ширина экрана
	 * @param {number} height - Высота экрана
	 * @param {Object} game - Экземпляр основного класса игры
	 */
	constructor(width, height, game) {
		this.width = width;
		this.height = height;
		this.game = game;

		// Создаём контейнер для всего экрана game over
		this.container = new PIXI.Container();

		// Изначально скрываем UI
		this.container.visible = false;

		// Инициализация элементов экрана окончания игры
		this._setupGameOverElements();
	}

	/**
	 * Инициализация элементов экрана окончания игры
	 */
	_setupGameOverElements() {
		// Контейнер для надписи Game Over (для анимации)
		this.gameOverImageContainer = new PIXI.Container();
		this.container.addChild(this.gameOverImageContainer);

		// Создаем спрайт "Game Over"
		const gameOverSprite = new PIXI.Sprite(PIXI.Texture.from(gameOverImage));
		gameOverSprite.anchor.set(0.5);
		gameOverSprite.x = this.width / 2;
		gameOverSprite.y = 0; // Будет настроено внутри контейнера
		this.gameOverImageContainer.addChild(gameOverSprite);

		// Начальная позиция контейнера изображения Game Over (за пределами экрана снизу)
		this.gameOverImageContainer.y = this.height + 100;

		// Контейнер для текста счета
		this.scoreContainer = new PIXI.Container();
		this.container.addChild(this.scoreContainer);

		// Текст счета
		this.finalScoreText = new PIXI.Text('', {
			fontFamily: ['HarreeghPoppedCyrillic', 'Arial'],
			fontSize: 28,
			fill: 0xffffff,
			align: 'center',
		});
		this.finalScoreText.anchor.set(0.5);
		this.finalScoreText.x = this.width / 2;
		this.finalScoreText.y = 0;
		this.scoreContainer.addChild(this.finalScoreText);

		// Изначально размещаем контейнер счета за пределами экрана (снизу)
		this.scoreContainer.y = this.height + 200; // Позиционируем ниже Game Over для задержки

		// Кнопка "ЗАНОВО"
		this.restartButton = new PIXI.Graphics();
		this.restartButton.beginFill(0x4caf50);
		this.restartButton.drawRoundedRect(0, 0, 200, 60, 10);
		this.restartButton.endFill();
		this.restartButton.x = this.width / 2 - 100;
		this.restartButton.y = this.height / 2 + 120;
		this.restartButton.interactive = true;
		this.restartButton.cursor = 'pointer';
		this.restartButton.on('pointerdown', () => this.game.restartGame());
		this.container.addChild(this.restartButton);

		const restartText = new PIXI.Text('ЗАНОВО', {
			fontFamily: ['HarreeghPoppedCyrillic', 'Arial'],
			fontSize: 30,
			fill: 0xffffff,
		});
		restartText.anchor.set(0.5);
		restartText.x = 100;
		restartText.y = 30;
		this.restartButton.addChild(restartText);

		// Скрываем кнопку перезапуска изначально
		this.restartButton.visible = false;
	}

	/**
	 * Подготовка экрана к отображению
	 * @param {number} score - Текущий счёт
	 * @param {number} bestScore - Лучший счёт
	 */
	prepare(score, bestScore) {
		// Обновляем текст счета
		this.finalScoreText.text = `Счёт: ${score}\nРекорд: ${bestScore}`;

		// Начальное положение для анимации
		this.gameOverImageContainer.y = this.height + 100;
		this.scoreContainer.y = this.height + 200;
		this.restartButton.visible = false;

		// Сбрасываем флаг проигрывания звука
		this._animationSoundPlayed = false;

		// Показываем весь UI
		this.container.visible = true;
	}

	/**
	 * Обновление анимаций экрана окончания игры
	 * @param {number} delta - Временной шаг
	 */
	updateAnimations(delta) {
		// Анимация появления Game Over
		if (this.gameOverImageContainer.y > this.height / 2 - 100) {
			this.gameOverImageContainer.y -= 20 * delta;
			if (this.gameOverImageContainer.y <= this.height / 2 - 100) {
				this.gameOverImageContainer.y = this.height / 2 - 100;
			}
		}

		// Анимация появления счета с небольшой задержкой после Game Over
		if (this.gameOverImageContainer.y <= this.height / 2 - 100 && this.scoreContainer.y > this.height / 2) {
			this.scoreContainer.y -= 20 * delta;

			// Когда счет достигает нужной позиции, останавливаем анимацию и показываем кнопку
			if (this.scoreContainer.y <= this.height / 2) {
				this.scoreContainer.y = this.height / 2;
				this.restartButton.visible = true; // Показываем кнопку перезапуска

				// Проверяем, что звук еще не был проигран для этой анимации
				if (!this._animationSoundPlayed) {
					this.game.soundManager.play('swoosh');
					this._animationSoundPlayed = true;
				}
			}
		}
	}

	/**
	 * Сброс флага проигрывания звука анимации
	 */
	resetAnimationSound() {
		this._animationSoundPlayed = false;
	}
}
