import * as PIXI from 'pixi.js';

import birdUp from '../assets/bird_up.png';
import birdMid from '../assets/bird_mid.png';
import birdDown from '../assets/bird_down.png';

export default class Bird {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.vy = 0;

		const frames = [PIXI.Texture.from(birdUp), PIXI.Texture.from(birdMid), PIXI.Texture.from(birdDown)];

		this.sprite = new PIXI.AnimatedSprite(frames);
		this.sprite.animationSpeed = 0.15;
		this.sprite.play();
		this.sprite.anchor.set(0.5);
		this.sprite.x = x;
		this.sprite.y = y;
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
	}

	reset(x, y) {
		this.x = x;
		this.y = y;
		this.vy = 0;
		this.sprite.x = x;
		this.sprite.y = y;
		this.sprite.rotation = 0;
	}
}
