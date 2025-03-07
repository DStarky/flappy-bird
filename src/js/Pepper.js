import * as PIXI from 'pixi.js';
import pepperImg from '../assets/pepper.png';

export default class Pepper {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.collected = false;

		this.sprite = new PIXI.Sprite(PIXI.Texture.from(pepperImg));
		this.sprite.anchor.set(0.5);
		this.sprite.x = x;
		this.sprite.y = y;

		this.sprite.scale.set(0.6);

		this.animationTime = 0;
	}

	update(delta, speed) {
		this.sprite.x -= speed * delta;

		this.animationTime += delta * 0.05;
		const scale = 0.6 + Math.sin(this.animationTime) * 0.1;
		this.sprite.scale.set(scale);

		this.sprite.rotation += 0.02 * delta;
	}

	collect() {
		if (!this.collected) {
			this.collected = true;
			this.sprite.alpha = 0.7;
			this.sprite.scale.set(1.5);
			return true;
		}
		return false;
	}
}
