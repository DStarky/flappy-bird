import * as PIXI from 'pixi.js';

import gameOverImage from '../../assets/gameover.png';

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
			fill: 0xffffff,
			align: 'center',
		});
		this.finalScoreText.anchor.set(0.5);
		this.finalScoreText.x = this.width / 2;
		this.finalScoreText.y = 0;
		this.scoreContainer.addChild(this.finalScoreText);

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

	prepare(score, bestScore) {
		this.finalScoreText.text = `Счёт: ${score}\nРекорд: ${bestScore}`;

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
