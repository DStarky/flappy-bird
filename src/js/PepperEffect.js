import * as PIXI from 'pixi.js';
import birdPowerUp from '../assets/bird_power_up.png';

export default class PepperEffect {
	constructor(bird) {
		this.bird = bird;
		this.active = false;
		this.duration = 3 * 60;
		this.timeRemaining = 0;
		this.extraInvulnerabilityDuration = 2 * 60;
		this.extraInvulnerabilityRemaining = 0;

		this.container = new PIXI.Container();

		this.streaks = new PIXI.Graphics();
		this.container.addChild(this.streaks);

		this.streakLines = [];
		this.normalTexture = null;
		this.powerTexture = PIXI.Texture.from(birdPowerUp);

		this.flashCounter = 0;
	}

	activate() {
		this.active = true;
		this.timeRemaining = this.duration;
		this.extraInvulnerabilityRemaining = 0;
		this.streakLines = [];

		if (this.bird.game) {
			this.bird.game.isPepperActive = true;

			this.normalTexture = this.bird.sprite.textures;
			this.bird.sprite.textures = [this.powerTexture];
			this.bird.sprite.gotoAndPlay(0);

			this.originalPipeSpeed = this.bird.game.pipeSpeed;
			this.originalGroundSpeed = this.bird.game.groundSpeed;
			this.originalPipeSpawnInterval = this.bird.game.pipeSpawnInterval;

			this.bird.game.pipeSpeed = this.originalPipeSpeed * 2.5;
			this.bird.game.groundSpeed = this.originalGroundSpeed * 2.5;
			this.bird.game.pipesManager.speed = this.bird.game.pipeSpeed;

			this.bird.shieldEffect.makeInvulnerable();

			this.bird.game.soundManager.play('point');
		}

		this.container.removeChild(this.streaks);
		this.streaks = new PIXI.Graphics();
		this.container.addChild(this.streaks);
	}

	deactivate() {
		this.active = false;

		if (this.bird.game) {
			this.bird.game.isPepperActive = false;

			if (this.normalTexture) {
				this.bird.sprite.textures = this.normalTexture;
				this.bird.sprite.gotoAndPlay(0);
			}

			this.bird.game.pipeSpeed = this.originalPipeSpeed;
			this.bird.game.groundSpeed = this.originalGroundSpeed;
			this.bird.game.pipeSpawnInterval = this.originalPipeSpawnInterval;
			this.bird.game.pipesManager.speed = this.bird.game.pipeSpeed;

			this.extraInvulnerabilityRemaining = this.extraInvulnerabilityDuration;

			this.bird.shieldEffect.invulnerabilityTimeRemaining = this.extraInvulnerabilityDuration;
		}

		this.streakLines = [];

		this.container.removeChild(this.streaks);
		this.streaks = new PIXI.Graphics();
		this.container.addChild(this.streaks);
	}

	update(delta) {
		if (this.active) {
			this.container.x = this.bird.sprite.x;
			this.container.y = this.bird.sprite.y;

			this.timeRemaining -= delta;
			if (this.timeRemaining <= 0) {
				this.deactivate();
				return;
			}

			this.updateStreaks(delta);
		} else if (this.extraInvulnerabilityRemaining > 0) {
			this.extraInvulnerabilityRemaining -= delta;

			this.bird.shieldEffect.invulnerable = true;
			if (this.bird.game) {
				this.bird.game.isInvulnerable = true;
			}

			this.flashCounter += delta;
			if (this.flashCounter >= 8) {
				this.flashCounter = 0;
				this.bird.sprite.alpha = this.bird.sprite.alpha < 0.5 ? 1.0 : 0.3;
			}

			if (this.extraInvulnerabilityRemaining <= 0) {
				if (!this.bird.shieldEffect.active) {
					this.bird.shieldEffect.invulnerable = false;
					if (this.bird.game) {
						this.bird.game.isInvulnerable = false;
					}
					this.bird.sprite.alpha = 1.0;
				}
			}
		}
	}

	updateStreaks(delta) {
		if (!this.active) {
			this.streakLines = [];
			this.streaks.clear();
			return;
		}

		if (Math.random() < 0.3) {
			const offsets = [-8, -4, 0, 4, 8];

			for (const offset of offsets) {
				if (Math.random() < 0.5) {
					const streak = {
						x: this.bird.sprite.x - 10,
						y: this.bird.sprite.y + offset,
						length: 20 + Math.random() * 25,
						width: 1.5 + Math.random() * 2,
						alpha: 0.7 + Math.random() * 0.3,
						speed: 2 + Math.random() * 3,
					};
					this.streakLines.push(streak);
				}
			}
		}

		this.streaks.clear();

		for (let i = 0; i < this.streakLines.length; i++) {
			const streak = this.streakLines[i];

			streak.x -= streak.speed * delta;

			const distFromBird = this.bird.sprite.x - streak.x;

			streak.alpha = Math.max(0, 1 - distFromBird / 100);

			if (streak.alpha > 0) {
				this.streaks.lineStyle(streak.width, 0xffffff, streak.alpha);
				this.streaks.moveTo(streak.x - this.bird.sprite.x, streak.y - this.bird.sprite.y);
				this.streaks.lineTo(streak.x - streak.length - this.bird.sprite.x, streak.y - this.bird.sprite.y);
			}
		}

		this.streakLines = this.streakLines.filter(streak => streak.alpha > 0 && this.bird.sprite.x - streak.x < 150);
	}
}
