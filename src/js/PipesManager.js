import * as PIXI from 'pixi.js';
import pipeUp from '../assets/pipe-green-up.png';
import pipeDown from '../assets/pipe-green-down.png';
import Coin from './Coin';
import Shield from './Shield';
import Pepper from './Pepper';

export default class PipesManager {
	constructor(screenWidth, screenHeight, speed, game) {
		this.screenWidth = screenWidth;
		this.screenHeight = screenHeight;
		this.speed = speed;
		this.game = game;

		this.container = new PIXI.Container();
		this.pipes = [];
		this.coins = [];
		this.shields = [];
		this.peppers = [];

		this.pipeWidth = 52;
		this.pipeHeight = 320;

		this.gapHeight = 150;

		this.updateMinMaxGapY();

		this.coinSpawnChance = 0.9;
		this.shieldSpawnChance = 0.15;
		this.pepperSpawnChance = 0.12;
		this.pipesSinceLastShield = 0;
		this.pipesSinceLastPepper = 0;
		
		this.shieldUnlocked = localStorage.getItem('shop_shield') === 'true';
		this.pepperUnlocked = localStorage.getItem('shop_pepper') === 'true';
	}

	updateGapHeight(gapHeight) {
		this.gapHeight = gapHeight;
		this.updateMinMaxGapY();
	}

	updateMinMaxGapY() {
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

		if (Math.random() < this.coinSpawnChance) {
			this.spawnCoin(pipeX, gapY);
		}

		const shieldNeeded = !this.game.hasShieldActive && !this.game.isInvulnerable;
		const hasActiveShields = this.shields.some(shield => !shield.collected);
		const pepperNeeded = !this.game.isPepperActive;
		const hasActivePeppers = this.peppers.some(pepper => !pepper.collected);

		const anyPowerupActive = hasActiveShields || hasActivePeppers;

		// Only spawn shield if it's unlocked in the shop or player has shield active
		if (this.shieldUnlocked && shieldNeeded && !anyPowerupActive) {
			this.pipesSinceLastShield++;

			const adjustedShieldChance = Math.min(0.5, this.shieldSpawnChance * (1 + this.pipesSinceLastShield * 0.1));

			if (Math.random() < adjustedShieldChance) {
				setTimeout(() => {
					if (this.game.gameState.current === 'PLAY') {
						this.spawnShieldBetweenPipes();
					}
				}, (this.game.pipeSpawnInterval * 16.67) / 2);

				this.pipesSinceLastShield = 0;
				this.pipesSinceLastPepper = 0;
			}
		}

		// Only spawn pepper if it's unlocked in the shop or player has pepper active
		if (this.pepperUnlocked && pepperNeeded && !anyPowerupActive) {
			this.pipesSinceLastPepper++;

			const adjustedPepperChance = Math.min(0.4, this.pepperSpawnChance * (1 + this.pipesSinceLastPepper * 0.1));

			if (Math.random() < adjustedPepperChance) {
				setTimeout(() => {
					if (this.game.gameState.current === 'PLAY') {
						this.spawnPepperBetweenPipes();
					}
				}, (this.game.pipeSpawnInterval * 16.67) / 3);

				this.pipesSinceLastPepper = 0;
				this.pipesSinceLastShield = 0;
			}
		}
	}

	spawnShieldBetweenPipes() {
		const hasActiveShields = this.shields.some(shield => !shield.collected);
		if (hasActiveShields) {
			return null;
		}
		const shieldX = this.screenWidth + 50;

		const randomHeightFactor = Math.random();
		let shieldY;

		if (randomHeightFactor < 0.4) {
			shieldY = this.screenHeight * 0.25 + Math.random() * 30;
		} else if (randomHeightFactor < 0.8) {
			shieldY = this.screenHeight * 0.5 + Math.random() * 30 - 15;
		} else {
			shieldY = this.screenHeight * 0.75 - Math.random() * 30 - this.screenHeight * 0.1;
		}

		shieldY = Math.max(30, Math.min(this.screenHeight - 112 - 30, shieldY));

		const shield = new Shield(shieldX, shieldY);
		this.shields.push(shield);
		this.container.addChild(shield.sprite);

		return shield;
	}

	spawnPepperBetweenPipes() {
		const hasActivePeppers = this.peppers.some(pepper => !pepper.collected);
		if (hasActivePeppers) {
			return null;
		}

		const pepperX = this.screenWidth + 50;

		const randomHeightFactor = Math.random();
		let pepperY;

		if (randomHeightFactor < 0.3) {
			pepperY = this.screenHeight * 0.15 + Math.random() * 20;
		} else if (randomHeightFactor < 0.7) {
			pepperY = this.screenHeight * 0.5 + Math.random() * 30 - 15;
		} else {
			pepperY = this.screenHeight * 0.8 - Math.random() * 20;
		}

		pepperY = Math.max(30, Math.min(this.screenHeight - 112 - 30, pepperY));

		const pepper = new Pepper(pepperX, pepperY);
		this.peppers.push(pepper);
		this.container.addChild(pepper.sprite);

		return pepper;
	}

	spawnCoin(pipeX, gapY) {
		const coin = new Coin(pipeX, gapY);
		this.coins.push(coin);
		this.container.addChild(coin.sprite);

		return coin;
	}

	spawnShield(pipeX, gapY) {
		const shield = new Shield(pipeX, gapY);
		this.shields.push(shield);
		this.container.addChild(shield.sprite);

		return shield;
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

		for (let i = 0; i < this.shields.length; i++) {
			const shield = this.shields[i];
			shield.update(delta, this.speed);

			if (shield.sprite.x + shield.sprite.width < 0 || (shield.collected && shield.sprite.alpha <= 0)) {
				this.container.removeChild(shield.sprite);
				this.shields.splice(i, 1);
				i--;
			} else if (shield.collected) {
				shield.sprite.alpha -= 0.05 * delta;
				shield.sprite.y -= 1 * delta;
			}
		}

		for (let i = 0; i < this.peppers.length; i++) {
			const pepper = this.peppers[i];
			pepper.update(delta, this.speed);

			if (pepper.sprite.x + pepper.sprite.width < 0 || (pepper.collected && pepper.sprite.alpha <= 0)) {
				this.container.removeChild(pepper.sprite);
				this.peppers.splice(i, 1);
				i--;
			} else if (pepper.collected) {
				pepper.sprite.alpha -= 0.05 * delta;
				pepper.sprite.y -= 1 * delta;
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

		for (const shield of this.shields) {
			this.container.removeChild(shield.sprite);
		}
		this.shields = [];

		for (const pepper of this.peppers) {
			this.container.removeChild(pepper.sprite);
		}
		this.peppers = [];

		this.pipesSinceLastShield = 0;
		this.pipesSinceLastPepper = 0;
		
		this.shieldUnlocked = localStorage.getItem('shop_shield') === 'true';
		this.pepperUnlocked = localStorage.getItem('shop_pepper') === 'true';
	}
}