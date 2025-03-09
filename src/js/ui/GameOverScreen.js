import * as PIXI from 'pixi.js';

import gameOverImage from '../../assets/gameover.png';
import coinImg from '../../assets/MonedaD.png';
import shieldImg from '../../assets/shield.png';

export default class GameOverScreen {
	constructor(width, height, game) {
		this.width = width;
		this.height = height;
		this.game = game;

		this.container = new PIXI.Container();

		this.container.visible = false;

		this._setupGameOverElements();
	}

	_setupGameOverElements() {
		this.gameOverImageContainer = new PIXI.Container();
		this.container.addChild(this.gameOverImageContainer);

		const gameOverSprite = new PIXI.Sprite(PIXI.Texture.from(gameOverImage));
		gameOverSprite.anchor.set(0.5);
		gameOverSprite.x = this.width / 2;
		gameOverSprite.y = 0;
		this.gameOverImageContainer.addChild(gameOverSprite);

		this.gameOverImageContainer.y = this.height + 100;

		this.scoreContainer = new PIXI.Container();
		this.container.addChild(this.scoreContainer);

		this.finalScoreText = new PIXI.Text('', {
			fontFamily: ['HarreeghPoppedCyrillic', 'Arial'],
			fontSize: 28,
			fill: 0xfca146,
			align: 'center',
			stroke: 0x000000,
			strokeThickness: 6,
			dropShadow: true,
			dropShadowColor: 0xffffff,
			dropShadowDistance: 0,
			dropShadowBlur: 4,
			dropShadowAlpha: 1,
		});
		this.finalScoreText.anchor.set(0.5);
		this.finalScoreText.x = this.width / 2;
		this.finalScoreText.y = 0;
		this.scoreContainer.addChild(this.finalScoreText);

		this.collectiblesContainer = new PIXI.Container();
		this.collectiblesContainer.x = this.width / 2;
		this.collectiblesContainer.y = 100;
		this.scoreContainer.addChild(this.collectiblesContainer);

		this.coinInfoContainer = new PIXI.Container();
		this.coinInfoContainer.y = 0;
		this.collectiblesContainer.addChild(this.coinInfoContainer);

		const coinBaseTexture = PIXI.BaseTexture.from(coinImg);
		const coinTexture = new PIXI.Texture(coinBaseTexture, new PIXI.Rectangle(0, 0, 16, 16));
		this.coinIcon = new PIXI.Sprite(coinTexture);
		this.coinIcon.scale.set(1.5);
		this.coinIcon.anchor.set(1, 0.5);
		this.coinIcon.x = -5;
		this.coinInfoContainer.addChild(this.coinIcon);

		this.coinsCollectedText = new PIXI.Text('0', {
			fontFamily: ['HarreeghPoppedCyrillic', 'Arial'],
			fontSize: 24,
			fill: 0xffd700,
			stroke: 0x000000,
			strokeThickness: 3,
		});
		this.coinsCollectedText.anchor.set(0, 0.5);
		this.coinsCollectedText.x = 5;
		this.coinInfoContainer.addChild(this.coinsCollectedText);

		this.shieldInfoContainer = new PIXI.Container();
		this.shieldInfoContainer.y = 35;
		this.collectiblesContainer.addChild(this.shieldInfoContainer);

		this.shieldIcon = new PIXI.Sprite(PIXI.Texture.from(shieldImg));
		this.shieldIcon.scale.set(1);
		this.shieldIcon.anchor.set(1, 0.5);
		this.shieldIcon.x = -5;
		this.shieldInfoContainer.addChild(this.shieldIcon);

		this.shieldsCollectedText = new PIXI.Text('0', {
			fontFamily: ['HarreeghPoppedCyrillic', 'Arial'],
			fontSize: 24,
			fill: 0x4fc3f7,
			stroke: 0x000000,
			strokeThickness: 3,
		});
		this.shieldsCollectedText.anchor.set(0, 0.5);
		this.shieldsCollectedText.x = 5;
		this.shieldInfoContainer.addChild(this.shieldsCollectedText);

		this.scoreContainer.y = this.height + 200;

		this.restartButton = new PIXI.Graphics();
		this.restartButton.beginFill(0x4caf50);
		this.restartButton.drawRoundedRect(0, 0, 200, 60, 10);
		this.restartButton.endFill();
		this.restartButton.x = this.width / 2 - 100;
		this.restartButton.y = this.height / 2 + 120;
		this.restartButton.interactive = true;
		this.restartButton.cursor = 'pointer';
		this.restartButton.on('pointerdown', () => this.game.restartGame());
		this.container.addChild(this.restartButton);

		const restartText = new PIXI.Text('ЗАНОВО', {
			fontFamily: ['HarreeghPoppedCyrillic', 'Arial'],
			fontSize: 30,
			fill: 0xffffff,
		});
		restartText.anchor.set(0.5);
		restartText.x = 100;
		restartText.y = 30;
		this.restartButton.addChild(restartText);

		this.restartButton.visible = false;
	}

	prepare(score, bestScore, coinsCollected = 0) {
		this.finalScoreText.text = `Счёт: ${score}\nРекорд: ${bestScore}`;

		this.coinsCollectedText.text = `+${coinsCollected}`;
		this.coinInfoContainer.visible = coinsCollected > 0;

		this.shieldInfoContainer.visible = false;

		this.gameOverImageContainer.y = this.height + 100;
		this.scoreContainer.y = this.height + 200;
		this.restartButton.visible = false;

		this._animationSoundPlayed = false;

		this.container.visible = true;
	}

	updateAnimations(delta) {
		if (this.gameOverImageContainer.y > this.height / 2 - 100) {
			this.gameOverImageContainer.y -= 20 * delta;
			if (this.gameOverImageContainer.y <= this.height / 2 - 100) {
				this.gameOverImageContainer.y = this.height / 2 - 100;
			}
		}

		if (this.gameOverImageContainer.y <= this.height / 2 - 100 && this.scoreContainer.y > this.height / 2) {
			this.scoreContainer.y -= 20 * delta;

			if (this.scoreContainer.y <= this.height / 2) {
				this.scoreContainer.y = this.height / 2;
				this.restartButton.visible = true;

				if (!this._animationSoundPlayed) {
					this.game.soundManager.play('swoosh');
					this._animationSoundPlayed = true;
				}
			}
		}
	}

	resetAnimationSound() {
		this._animationSoundPlayed = false;
	}
}
