// src/js/CollisionManager.js
import * as PIXI from 'pixi.js';

/**
 * Класс для обработки столкновений
 */
export default class CollisionManager {
	/**
	 * @param {Object} game - Экземпляр основного класса игры
	 */
	constructor(game) {
		this.game = game;
	}

	/**
	 * Проверка всех возможных столкновений
	 */
	checkCollisions() {
		// Проверка на столкновение с землей или потолком
		if (
			this.game.bird.sprite.y + this.game.bird.sprite.height / 2 > this.game.height - this.game.groundSprite.height ||
			this.game.bird.sprite.y - this.game.bird.sprite.height / 2 < 0
		) {
			this.game.gameOver();
			return;
		}

		// Проверка на столкновение с трубами
		const birdBounds = this.getShrinkedBounds(this.game.bird.sprite, 5);
		for (let pipe of this.game.pipesManager.pipes) {
			const topBounds = this.getShrinkedBounds(pipe.topPipe, 2);
			const bottomBounds = this.getShrinkedBounds(pipe.bottomPipe, 2);
			if (this.isColliding(birdBounds, topBounds) || this.isColliding(birdBounds, bottomBounds)) {
				this.game.gameOver();
				return;
			}
		}
	}

	/**
	 * Проверка пересечения двух прямоугольников
	 * @param {PIXI.Rectangle} a - Первый прямоугольник
	 * @param {PIXI.Rectangle} b - Второй прямоугольник
	 * @returns {boolean} - Результат проверки
	 */
	isColliding(a, b) {
		return !(a.x + a.width < b.x || a.x > b.x + b.width || a.y + a.height < b.y || a.y > b.y + b.height);
	}

	/**
	 * Получение уменьшенных границ спрайта для более точного определения коллизий
	 * @param {PIXI.Sprite} sprite - Спрайт
	 * @param {number} margin - Отступ от краев
	 * @returns {PIXI.Rectangle} - Уменьшенные границы
	 */
	getShrinkedBounds(sprite, margin = 5) {
		const bounds = sprite.getBounds();
		return new PIXI.Rectangle(
			bounds.x + margin,
			bounds.y + margin,
			bounds.width - margin * 2,
			bounds.height - margin * 2,
		);
	}
}
