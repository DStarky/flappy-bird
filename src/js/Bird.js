import * as PIXI from 'pixi.js';
import ShieldEffect from './ShieldEffect';
import PepperEffect from './PepperEffect';

import birdUp from '../assets/bird_up.png';
import birdMid from '../assets/bird_mid.png';
import birdDown from '../assets/bird_down.png';

export default class Bird {
	constructor(x, y, game) {
		this.x = x;
		this.y = y;
		this.vy = 0;
		this.game = game;

		const frames = [PIXI.Texture.from(birdUp), PIXI.Texture.from(birdMid), PIXI.Texture.from(birdDown)];

		this.sprite = new PIXI.AnimatedSprite(frames);
		this.sprite.animationSpeed = 0.15;
		this.sprite.play();
		this.sprite.anchor.set(0.5);
		this.sprite.x = x;
		this.sprite.y = y;

		this.shieldEffect = new ShieldEffect(this);
		this.pepperEffect = new PepperEffect(this);
	}

	flap(jumpPower) {
		this.vy = jumpPower;
		this.sprite.rotation = -0.5;
	}

	update(delta, gravity) {
		this.vy += gravity * delta;
		this.sprite.y += this.vy * delta;
		if (this.sprite.rotation < 0.5 && this.vy > 0) {
			this.sprite.rotation += 0.1 * delta;
		}

		this.shieldEffect.update(delta);
		this.pepperEffect.update(delta);
	}

	reset(x, y) {
		this.x = x;
		this.y = y;
		this.vy = 0;
		this.sprite.x = x;
		this.sprite.y = y;
		this.sprite.rotation = 0;
		this.sprite.tint = 0xffffff;
		this.sprite.alpha = 1.0;

		this.shieldEffect.deactivate();
		this.shieldEffect.invulnerable = false;

		if (this.pepperEffect.active) {
			this.pepperEffect.deactivate();
		}

		this.pepperEffect.streakLines = [];
		this.pepperEffect.streaks.clear();
		this.pepperEffect.extraInvulnerabilityRemaining = 0;
	}

	activateShield(duration = 0) {
		this.shieldEffect.activate(duration);
	}

	activatePepper() {
		this.pepperEffect.activate();
	}

	hasActiveShield() {
		return this.shieldEffect.active;
	}

	hasActivePepper() {
		return this.pepperEffect.active;
	}

	isInvulnerable() {
		return this.shieldEffect.invulnerable;
	}

	absorbHit() {
		if (this.hasActivePepper()) {
			return true;
		}

		if (this.hasActiveShield()) {
			return this.shieldEffect.absorb();
		} else if (this.isInvulnerable()) {
			return true;
		}
		return false;
	}
}
