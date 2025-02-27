import * as PIXI from 'pixi.js';

export default class CollisionManager {
	constructor(game) {
		this.game = game;
	}

	checkCollisions() {
		if (
			this.game.bird.sprite.y + this.game.bird.sprite.height / 2 > this.game.height - this.game.groundSprite.height ||
			this.game.bird.sprite.y - this.game.bird.sprite.height / 2 < 0
		) {
			this.game.gameOver();
			return;
		}

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
