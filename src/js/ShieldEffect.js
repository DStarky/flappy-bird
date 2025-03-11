import * as PIXI from 'pixi.js';

export default class ShieldEffect {
	constructor(bird) {
		this.bird = bird;
		this.active = false;
		this.duration = 0;
		this.timeRemaining = 0;

		this.invulnerable = false;
		this.invulnerabilityDuration = 180;
		this.invulnerabilityTimeRemaining = 0;
		this.flashCounter = 0;

		this.circle = new PIXI.Graphics();
		this.circle.lineStyle(3, 0x4fc3f7, 0.8);
		this.circle.drawCircle(0, 0, 25);
		this.circle.visible = false;

		this.glow = new PIXI.Graphics();
		this.glow.beginFill(0x4fc3f7, 0.3);
		this.glow.drawCircle(0, 0, 30);
		this.glow.endFill();
		this.glow.visible = false;

		this.container = new PIXI.Container();
		this.container.addChild(this.glow);
		this.container.addChild(this.circle);

		this.animationTime = 0;
	}

	activate(duration = 0) {
		this.active = true;
		this.duration = duration;
		this.timeRemaining = duration;
		this.circle.visible = true;
		this.glow.visible = true;

		this.bird.game?.soundManager.play('point');

		if (this.bird.game) {
			this.bird.game.hasShieldActive = true;
			this.bird.game.uiManager.updateShieldStatus(true);
		}
	}

	deactivate() {
		this.active = false;
		this.circle.visible = false;
		this.glow.visible = false;
		this.timeRemaining = 0;

		if (this.bird.game) {
			this.bird.game.hasShieldActive = false;
			this.bird.game.uiManager.updateShieldStatus(false);
		}
	}

	makeInvulnerable() {
		this.invulnerable = true;
		this.invulnerabilityTimeRemaining = this.invulnerabilityDuration;
		this.flashCounter = 0;

		if (this.bird.game) {
			this.bird.game.isInvulnerable = true;
		}
	}

	update(delta) {
		if (this.active) {
			this.container.x = this.bird.sprite.x;
			this.container.y = this.bird.sprite.y;

			if (this.duration > 0) {
				this.timeRemaining -= delta;
				if (this.timeRemaining <= 0) {
					this.deactivate();
					return;
				}

				const flashRate = Math.max(0.1, this.timeRemaining / this.duration);
				this.animationTime += delta * (0.1 / flashRate);
			} else {
				this.animationTime += delta * 0.1;
			}

			const pulseFactor = Math.sin(this.animationTime) * 0.2 + 0.8;
			this.circle.scale.set(pulseFactor);

			this.circle.rotation += delta * 0.02;
		}

		if (this.invulnerable) {
			if (this.invulnerabilityTimeRemaining > 0) {
				this.invulnerabilityTimeRemaining -= delta;
				this.flashCounter += delta;

				if (this.flashCounter >= 8) {
					this.flashCounter = 0;
					this.bird.sprite.alpha = this.bird.sprite.alpha < 0.5 ? 1.0 : 0.3;
				}

				if (this.invulnerabilityTimeRemaining <= 0) {
					if (
						!this.active &&
						!this.bird.hasActivePepper() &&
						(!this.bird.pepperEffect || this.bird.pepperEffect.extraInvulnerabilityRemaining <= 0)
					) {
						this.invulnerable = false;
						this.bird.sprite.alpha = 1.0;

						if (this.bird.game) {
							this.bird.game.isInvulnerable = false;
							this.bird.game.hasShieldActive = false;
						}
					}
				}
			}
		}
	}

	absorb() {
		const flashEffect = new PIXI.Graphics();
		flashEffect.beginFill(0xffffff, 0.8);
		flashEffect.drawCircle(0, 0, 40);
		flashEffect.endFill();
		flashEffect.x = this.bird.sprite.x;
		flashEffect.y = this.bird.sprite.y;
		this.bird.game?.gameContainer.addChild(flashEffect);

		let alpha = 0.8;
		const fadeInterval = setInterval(() => {
			alpha -= 0.1;
			flashEffect.alpha = alpha;
			if (alpha <= 0) {
				this.bird.game?.gameContainer.removeChild(flashEffect);
				clearInterval(fadeInterval);
			}
		}, 50);

		this.deactivate();
		this.makeInvulnerable();
		this.bird.game?.soundManager.play('hit');

		return true;
	}
}
