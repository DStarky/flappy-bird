import * as PIXI from 'pixi.js';

export default class CollisionManager {
	constructor(game) {
		this.game = game;
	}

	checkCollisions() {
		const groundY = this.game.height - this.game.groundSprite.height;
		if (this.game.bird.sprite.y + this.game.bird.sprite.height / 2 > groundY) {
			this.game.bird.sprite.y = groundY - this.game.bird.sprite.height / 2;

			if (this.game.bird.hasActiveShield() || this.game.bird.isInvulnerable()) {
				this.game.bird.absorbHit();
				this.game.bird.vy = -Math.abs(this.game.bird.vy) * 0.5;
			} else {
				this.game.gameOver();
			}
			return;
		}

		if (this.game.bird.sprite.y - this.game.bird.sprite.height / 2 < 0) {
			if (this.game.bird.hasActiveShield() || this.game.bird.isInvulnerable()) {
				this.game.bird.absorbHit();
				this.game.bird.vy = Math.abs(this.game.bird.vy) * 0.5;
			} else {
				this.game.gameOver();
			}
			return;
		}

		const birdBounds = this.getShrinkedBounds(this.game.bird.sprite, 5);
		for (let pipe of this.game.pipesManager.pipes) {
			const topBounds = this.getShrinkedBounds(pipe.topPipe, 2);
			const bottomBounds = this.getShrinkedBounds(pipe.bottomPipe, 2);

			if (this.isColliding(birdBounds, topBounds) || this.isColliding(birdBounds, bottomBounds)) {
				if (this.game.isPepperActive) {
					if (this.isColliding(birdBounds, topBounds)) {
						this.game.bird.vy = Math.abs(this.game.bird.vy) * 0.5;
					} else {
						this.game.bird.vy = -Math.abs(this.game.bird.vy) * 0.5;
					}
				} else if (this.game.bird.hasActiveShield() || this.game.bird.isInvulnerable()) {
					this.game.bird.absorbHit();

					if (this.isColliding(birdBounds, topBounds)) {
						this.game.bird.vy = Math.abs(this.game.bird.vy) * 0.5;
					} else {
						this.game.bird.vy = -Math.abs(this.game.bird.vy) * 0.5;
					}
				} else {
					this.game.gameOver();
				}
				return;
			}
		}

		this.checkCollectibles(birdBounds);
	}

	checkCollectibles(birdBounds) {
		for (let coin of this.game.pipesManager.coins) {
			if (coin.collected) continue;

			const coinBounds = this.getShrinkedBounds(coin.sprite, 2);
			if (this.isColliding(birdBounds, coinBounds)) {
				if (coin.collect()) {
					this.game.collectCoin();
					this.game.soundManager.play('point');
				}
			}
		}

		if (!this.game.hasShieldActive && !this.game.isInvulnerable) {
			for (let shield of this.game.pipesManager.shields) {
				if (shield.collected) continue;

				const shieldBounds = this.getShrinkedBounds(shield.sprite, 2);
				if (this.isColliding(birdBounds, shieldBounds)) {
					if (shield.collect()) {
						this.game.collectShield();
					}
				}
			}
		}

		if (!this.game.isPepperActive) {
			for (let pepper of this.game.pipesManager.peppers) {
				if (pepper.collected) continue;

				const pepperBounds = this.getShrinkedBounds(pepper.sprite, 2);
				if (this.isColliding(birdBounds, pepperBounds)) {
					if (pepper.collect()) {
						this.game.collectPepper();
					}
				}
			}
		}
	}

	isColliding(a, b) {
		return !(a.x + a.width < b.x || a.x > b.x + b.width || a.y + a.height < b.y || a.y > b.y + b.height);
	}

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
