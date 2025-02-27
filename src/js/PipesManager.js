import * as PIXI from 'pixi.js';
import pipeUp from '../assets/pipe-green-up.png';
import pipeDown from '../assets/pipe-green-down.png';

export default class PipesManager {
	constructor(screenWidth, screenHeight, speed) {
		this.screenWidth = screenWidth;
		this.screenHeight = screenHeight;
		this.speed = speed;

		this.container = new PIXI.Container();
		this.pipes = [];

		this.pipeWidth = 52;
		this.pipeHeight = 320;

		this.gapHeight = 150;

		this.minGapY = this.screenHeight - (this.pipeHeight + this.gapHeight / 2);
		this.maxGapY = this.pipeHeight + this.gapHeight / 2;
	}

	spawnPipe() {
		const gapY = Math.random() * (this.maxGapY - this.minGapY) + this.minGapY;

		const pipeX = this.screenWidth;

		const topPipe = new PIXI.Sprite(PIXI.Texture.from(pipeUp));
		topPipe.anchor.set(0.5, 1);
		topPipe.x = pipeX;
		topPipe.y = gapY - this.gapHeight / 2;

		const bottomPipe = new PIXI.Sprite(PIXI.Texture.from(pipeDown));
		bottomPipe.anchor.set(0.5, 0);
		bottomPipe.x = pipeX;
		bottomPipe.y = gapY + this.gapHeight / 2;

		this.container.addChild(topPipe, bottomPipe);

		this.pipes.push({
			topPipe,
			bottomPipe,
			passed: false,
		});
	}

	update(delta) {
		for (let i = 0; i < this.pipes.length; i++) {
			const pipe = this.pipes[i];
			pipe.topPipe.x -= this.speed * delta;
			pipe.bottomPipe.x -= this.speed * delta;

			if (pipe.topPipe.x + this.pipeWidth < 0) {
				this.container.removeChild(pipe.topPipe);
				this.container.removeChild(pipe.bottomPipe);
				this.pipes.splice(i, 1);
				i--;
			}
		}
	}

	reset() {
		for (const pipe of this.pipes) {
			this.container.removeChild(pipe.topPipe);
			this.container.removeChild(pipe.bottomPipe);
		}
		this.pipes = [];
	}
}
