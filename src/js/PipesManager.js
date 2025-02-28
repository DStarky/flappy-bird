import * as PIXI from 'pixi.js';
import pipeUp from '../assets/pipe-green-up.png';
import pipeDown from '../assets/pipe-green-down.png';
import Coin from './Coin';

export default class PipesManager {
	constructor(screenWidth, screenHeight, speed) {
		this.screenWidth = screenWidth;
		this.screenHeight = screenHeight;
		this.speed = speed;

		this.container = new PIXI.Container();
		this.pipes = [];
		this.coins = [];

		this.pipeWidth = 52;
		this.pipeHeight = 320;

		this.gapHeight = 150;

		this.minGapY = this.screenHeight - (this.pipeHeight + this.gapHeight / 2);
		this.maxGapY = this.pipeHeight + this.gapHeight / 2;

		this.coinSpawnChance = 0.9;
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

		if (Math.random() < this.coinSpawnChance) {
			this.spawnCoin(pipeX, gapY);
		}
	}

	spawnCoin(pipeX, gapY) {
		const coin = new Coin(pipeX, gapY);
		this.coins.push(coin);
		this.container.addChild(coin.sprite);

		return coin;
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

		for (let i = 0; i < this.coins.length; i++) {
			const coin = this.coins[i];
			coin.update(delta, this.speed);

			if (coin.sprite.x + coin.sprite.width < 0 || (coin.collected && coin.sprite.alpha <= 0)) {
				this.container.removeChild(coin.sprite);
				this.coins.splice(i, 1);
				i--;
			} else if (coin.collected) {
				coin.sprite.alpha -= 0.05 * delta;
				coin.sprite.y -= 1 * delta;
			}
		}
	}

	reset() {
		for (const pipe of this.pipes) {
			this.container.removeChild(pipe.topPipe);
			this.container.removeChild(pipe.bottomPipe);
		}
		this.pipes = [];

		for (const coin of this.coins) {
			this.container.removeChild(coin.sprite);
		}
		this.coins = [];
	}
}
