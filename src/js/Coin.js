import * as PIXI from 'pixi.js';
import coinImg from '../assets/MonedaD.png';

export default class Coin {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.collected = false;

		const baseTexture = PIXI.BaseTexture.from(coinImg);
		const frameWidth = 16;
		const frameHeight = 16;
		const frames = [];

		for (let i = 0; i < 5; i++) {
			const frame = new PIXI.Texture(baseTexture, new PIXI.Rectangle(i * frameWidth, 0, frameWidth, frameHeight));
			frames.push(frame);
		}

		this.sprite = new PIXI.AnimatedSprite(frames);
		this.sprite.animationSpeed = 0.1;
		this.sprite.play();
		this.sprite.anchor.set(0.5);
		this.sprite.x = x;
		this.sprite.y = y;

		this.sprite.scale.set(1.5);
	}

	update(delta, speed) {
		this.sprite.x -= speed * delta;
	}

	collect() {
		if (!this.collected) {
			this.collected = true;
			this.sprite.alpha = 0.7;
			this.sprite.scale.set(2);
			return true;
		}
		return false;
	}
}
