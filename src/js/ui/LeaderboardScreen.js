import * as PIXI from 'pixi.js';

export default class LeaderboardScreen {
	constructor(width, height, game) {
		this.width = width;
		this.height = height;
		this.game = game;

		this.container = new PIXI.Container();
		this._setupLeaderboardElements();
	}

	_setupLeaderboardElements() {
		const overlay = new PIXI.Graphics();
		overlay.beginFill(0x000000, 0.85);
		overlay.drawRect(0, 0, this.width, this.height);
		overlay.endFill();
		this.container.addChild(overlay);

		this.title = new PIXI.Text('ТАБЛИЦА ЛИДЕРОВ', {
			fontFamily: ['HarreeghPoppedCyrillic', 'Arial'],
			fontSize: 40,
			fill: 0xffffff,
			stroke: 0x000000,
			strokeThickness: 4,
		});
		this.title.anchor.set(0.5, 0);
		this.title.x = this.width / 2;
		this.title.y = 20;
		this.container.addChild(this.title);

		this.authContainer = new PIXI.Container();
		this.authContainer.x = this.width / 2;
		this.authContainer.y = 80;
		this.container.addChild(this.authContainer);

		this.authText = new PIXI.Text('Чтобы увидеть свой результат в таблице, необходимо авторизоваться:', {
			fontFamily: ['HarreeghPoppedCyrillic', 'Arial'],
			fontSize: 16,
			fill: 0xcccccc,
			align: 'center',
			wordWrap: true,
			wordWrapWidth: 400,
		});
		this.authText.anchor.set(0.5, 0);
		this.authContainer.addChild(this.authText);

		this.authButton = new PIXI.Graphics();
		this.authButton.beginFill(0x4caf50);
		this.authButton.drawRoundedRect(0, 0, 200, 50, 10);
		this.authButton.endFill();
		this.authButton.x = -100;
		this.authButton.y = 50;
		this.authButton.interactive = true;
		this.authButton.cursor = 'pointer';
		this.authButton.on('pointerdown', () => this.game.authorizePlayer());
		this.authContainer.addChild(this.authButton);

		const authButtonText = new PIXI.Text('АВТОРИЗОВАТЬСЯ', {
			fontFamily: ['HarreeghPoppedCyrillic', 'Arial'],
			fontSize: 20,
			fill: 0xffffff,
		});
		authButtonText.anchor.set(0.5);
		authButtonText.x = 100;
		authButtonText.y = 25;
		this.authButton.addChild(authButtonText);

		this.leaderboardContainer = new PIXI.Container();
		this.leaderboardContainer.x = this.width / 2 - 200;
		this.leaderboardContainer.y = 130;
		this.container.addChild(this.leaderboardContainer);

		this.loadingText = new PIXI.Text('Загрузка данных...', {
			fontFamily: ['HarreeghPoppedCyrillic', 'Arial'],
			fontSize: 20,
			fill: 0xffffff,
		});
		this.loadingText.x = 200;
		this.loadingText.y = 50;
		this.loadingText.anchor.set(0.5);
		this.leaderboardContainer.addChild(this.loadingText);

		const headerContainer = new PIXI.Container();
		headerContainer.y = 0;
		this.leaderboardContainer.addChild(headerContainer);

		const rankHeader = new PIXI.Text('РАНГ', {
			fontFamily: ['HarreeghPoppedCyrillic', 'Arial'],
			fontSize: 18,
			fill: 0xffd700,
			stroke: 0x000000,
			strokeThickness: 2,
		});
		rankHeader.x = 20;
		headerContainer.addChild(rankHeader);

		const nameHeader = new PIXI.Text('ИГРОК', {
			fontFamily: ['HarreeghPoppedCyrillic', 'Arial'],
			fontSize: 18,
			fill: 0xffd700,
			stroke: 0x000000,
			strokeThickness: 2,
		});
		nameHeader.x = 100;
		headerContainer.addChild(nameHeader);

		const scoreHeader = new PIXI.Text('СЧЁТ', {
			fontFamily: ['HarreeghPoppedCyrillic', 'Arial'],
			fontSize: 18,
			fill: 0xffd700,
			stroke: 0x000000,
			strokeThickness: 2,
		});
		scoreHeader.x = 350;
		headerContainer.addChild(scoreHeader);

		this.entriesContainer = new PIXI.Container();
		this.entriesContainer.y = 30;
		this.leaderboardContainer.addChild(this.entriesContainer);

		const closeButton = new PIXI.Graphics();
		closeButton.beginFill(0xe74c3c);
		closeButton.drawRoundedRect(0, 0, 200, 60, 10);
		closeButton.endFill();
		closeButton.x = this.width / 2 - 100;
		closeButton.y = this.height - 100;
		closeButton.interactive = true;
		closeButton.cursor = 'pointer';
		closeButton.on('pointerdown', () => this.game.closeLeaderboard());
		this.container.addChild(closeButton);

		const closeText = new PIXI.Text('ЗАКРЫТЬ', {
			fontFamily: ['HarreeghPoppedCyrillic', 'Arial'],
			fontSize: 26,
			fill: 0xffffff,
		});
		closeText.anchor.set(0.5);
		closeText.x = 100;
		closeText.y = 30;
		closeButton.addChild(closeText);
	}

	updateEntries(entries) {
		while (this.entriesContainer.children.length > 0) {
			this.entriesContainer.removeChildAt(0);
		}

		if (!entries || !entries.entries || entries.entries.length === 0) {
			const noDataText = new PIXI.Text('Нет данных', {
				fontFamily: ['HarreeghPoppedCyrillic', 'Arial'],
				fontSize: 20,
				fill: 0xffffff,
			});
			noDataText.x = 200;
			noDataText.anchor.set(0.5, 0);
			this.entriesContainer.addChild(noDataText);
			this.loadingText.visible = false;
			return;
		}

		this.loadingText.visible = false;

		const isAuthorized = this.game.ysdk && this.game.ysdk.isAuthorized();
		let playerRank = null;

		if (entries.userRank) {
			playerRank = entries.userRank;
		}

		let entryY = 0;
		const entryHeight = 40;

		entries.entries.forEach((entry, index) => {
			const isCurrentPlayer = isAuthorized && entry.player.uniqueID === entries.userRank?.player.uniqueID;

			const entryContainer = this._createEntryRow(entry, index + 1, isCurrentPlayer);
			entryContainer.y = entryY;
			this.entriesContainer.addChild(entryContainer);

			entryY += entryHeight;
		});

		if (isAuthorized && playerRank && !entries.entries.find(e => e.player.uniqueID === playerRank.player.uniqueID)) {
			const separator = new PIXI.Graphics();
			separator.beginFill(0xffffff, 0.3);
			separator.drawRect(0, 0, 400, 2);
			separator.endFill();
			separator.y = entryY + 10;
			this.entriesContainer.addChild(separator);

			const playerEntryContainer = this._createEntryRow(playerRank, playerRank.rank, true);
			playerEntryContainer.y = entryY + 22;
			this.entriesContainer.addChild(playerEntryContainer);
		}

		this.authContainer.visible = !isAuthorized;
	}

	_createEntryRow(entry, rank, isCurrentPlayer) {
		const container = new PIXI.Container();

		if (isCurrentPlayer) {
			const bg = new PIXI.Graphics();
			bg.beginFill(0x4caf50, 0.3);
			bg.drawRect(-10, -5, 420, 40);
			bg.endFill();
			container.addChild(bg);
		}

		const rankText = new PIXI.Text(`${rank}`, {
			fontFamily: ['HarreeghPoppedCyrillic', 'Arial'],
			fontSize: 18,
			fill: isCurrentPlayer ? 0xffd700 : 0xffffff,
		});
		rankText.x = 20;
		rankText.y = 10;
		container.addChild(rankText);

		let playerName = entry.player.publicName || 'Гость';
		if (playerName.length > 20) {
			playerName = playerName.substring(0, 17) + '...';
		}

		const nameText = new PIXI.Text(playerName, {
			fontFamily: ['HarreeghPoppedCyrillic', 'Arial'],
			fontSize: 18,
			fill: isCurrentPlayer ? 0xffffff : 0xcccccc,
		});
		nameText.x = 100;
		nameText.y = 10;
		container.addChild(nameText);

		const scoreText = new PIXI.Text(`${entry.score}`, {
			fontFamily: ['HarreeghPoppedCyrillic', 'Arial'],
			fontSize: 18,
			fill: isCurrentPlayer ? 0xffd700 : 0xffffff,
		});
		scoreText.x = 350;
		scoreText.y = 10;
		container.addChild(scoreText);

		return container;
	}

	open() {
		this.container.visible = true;
		this.loadingText.visible = true;

		while (this.entriesContainer.children.length > 0) {
			this.entriesContainer.removeChildAt(0);
		}

		const isAuthorized = this.game.ysdk && this.game.ysdk.isAuthorized();
		this.authContainer.visible = !isAuthorized;
	}
}
