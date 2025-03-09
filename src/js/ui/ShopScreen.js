import * as PIXI from 'pixi.js';
import coinImg from '../../assets/MonedaD.png';
import shieldImg from '../../assets/shield.png';
import pepperImg from '../../assets/pepper.png';

export default class ShopScreen {
	constructor(width, height, game) {
		this.width = width;
		this.height = height;
		this.game = game;
		this.container = new PIXI.Container();
		this.items = [
			{
				id: 'medium_difficulty',
				name: 'СРЕДНИЙ УРОВЕНЬ',
				description: 'Разблокирует средний уровень сложности',
				price: 500,
				unlocked: false,
			},
			{
				id: 'hard_difficulty',
				name: 'ТЯЖЕЛЫЙ УРОВЕНЬ',
				description: 'Разблокирует тяжелый уровень сложности',
				price: 3000,
				unlocked: false,
			},
			{ id: 'shield', name: 'ЩИТ', description: 'Добавляет в игру щит', price: 10000, unlocked: false },
			{ id: 'pepper', name: 'УСКОРЕНИЕ', description: 'Добавляет в игру ускорение', price: 20000, unlocked: false },
		];
		this._setupShopElements();
		this._loadUnlockedItems();
	}

	_loadUnlockedItems() {
		for (const item of this.items) {
			const unlocked = localStorage.getItem(`shop_${item.id}`) === 'true';
			item.unlocked = unlocked;
		}
		this._updateShopItems();
	}

	_saveUnlockedItems() {
		for (const item of this.items) {
			localStorage.setItem(`shop_${item.id}`, item.unlocked.toString());
		}
	}

	_setupShopElements() {
		const overlay = new PIXI.Graphics();
		overlay.beginFill(0x000000, 0.85);
		overlay.drawRect(0, 0, this.width, this.height);
		overlay.endFill();
		this.container.addChild(overlay);
		this.shopTitle = new PIXI.Text('МАГАЗИН', {
			fontFamily: ['HarreeghPoppedCyrillic', 'Arial'],
			fontSize: 40,
			fill: 0xffffff,
			stroke: 0x000000,
			strokeThickness: 4,
		});
		this.shopTitle.anchor.set(0.5, 0);
		this.shopTitle.x = this.width / 2;
		this.shopTitle.y = 20;
		this.container.addChild(this.shopTitle);
		this.coinInfoContainer = new PIXI.Container();
		this.coinInfoContainer.x = this.width / 2;
		this.coinInfoContainer.y = 95;
		this.container.addChild(this.coinInfoContainer);
		const coinBaseTexture = PIXI.BaseTexture.from(coinImg);
		const coinTexture = new PIXI.Texture(coinBaseTexture, new PIXI.Rectangle(0, 0, 16, 16));
		this.coinIcon = new PIXI.Sprite(coinTexture);
		this.coinIcon.scale.set(2);
		this.coinIcon.anchor.set(1, 0.5);
		this.coinIcon.x = 0;
		this.coinInfoContainer.addChild(this.coinIcon);
		this.coinText = new PIXI.Text('0', {
			fontFamily: ['HarreeghPoppedCyrillic', 'Arial'],
			fontSize: 30,
			fill: 0xffd700,
			stroke: 0x000000,
			strokeThickness: 3,
			align: 'center',
		});
		this.coinText.anchor.set(0, 0.5);
		this.coinText.x = this.coinIcon.width + 5;
		this.coinInfoContainer.addChild(this.coinText);
		const totalWidthSetup = this.coinIcon.width + 5 + this.coinText.width;
		this.coinInfoContainer.pivot.x = totalWidthSetup / 2;
		this.itemsContainer = new PIXI.Container();
		this.itemsContainer.x = this.width / 2 - 225;
		this.itemsContainer.y = 130;
		this.container.addChild(this.itemsContainer);
		this.itemButtons = [];
		this.itemTexts = [];
		this.itemPrices = [];
		this.itemLabels = [];
		for (let i = 0; i < this.items.length; i++) {
			const item = this.items[i];
			const y = i * 90;
			const itemButton = new PIXI.Graphics();
			itemButton.beginFill(0x2980b9);
			itemButton.drawRoundedRect(0, 0, 450, 75, 10);
			itemButton.endFill();
			itemButton.y = y;
			itemButton.interactive = true;
			itemButton.cursor = 'pointer';
			itemButton.on('pointerdown', () => this._buyItem(item));
			this.itemsContainer.addChild(itemButton);
			this.itemButtons.push(itemButton);
			const itemName = new PIXI.Text(item.name, {
				fontFamily: ['HarreeghPoppedCyrillic', 'Arial'],
				fontSize: 20,
				fill: 0xffffff,
				stroke: 0x000000,
				strokeThickness: 2,
			});
			itemName.x = 15;
			itemName.y = 12;
			itemButton.addChild(itemName);
			this.itemTexts.push(itemName);
			const itemDescription = new PIXI.Text(item.description, {
				fontFamily: ['HarreeghPoppedCyrillic', 'Arial'],
				fontSize: 13,
				fill: 0xe0e0e0,
				wordWrap: true,
				wordWrapWidth: 370,
			});
			itemDescription.x = 15;
			itemDescription.y = 45;
			itemButton.addChild(itemDescription);
			if (item.id === 'shield' || item.id === 'pepper') {
				itemDescription.style.fontSize = 12;
				itemDescription.style.wordWrapWidth = 380;
			}
			const priceContainer = new PIXI.Container();
			priceContainer.x = 370;
			priceContainer.y = 37.5;
			itemButton.addChild(priceContainer);
			const priceIcon = new PIXI.Sprite(coinTexture);
			priceIcon.scale.set(1.2);
			priceIcon.anchor.set(1, 0.5);
			priceIcon.x = -5;
			priceContainer.addChild(priceIcon);
			const priceValue = item.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
			const priceText = new PIXI.Text(priceValue, {
				fontFamily: ['HarreeghPoppedCyrillic', 'Arial'],
				fontSize: 18,
				fill: 0xffd700,
				stroke: 0x000000,
				strokeThickness: 2,
				align: 'center',
			});
			priceText.anchor.set(0, 0.5);
			priceText.x = 5;
			priceContainer.addChild(priceText);
			this.itemPrices.push(priceContainer);
			const unlockedLabel = new PIXI.Text('РАЗБЛОКИРОВАНО', {
				fontFamily: ['HarreeghPoppedCyrillic', 'Arial'],
				fontSize: 18,
				fill: 0x2ecc71,
				stroke: 0x000000,
				strokeThickness: 2,
			});
			unlockedLabel.anchor.set(0.5);
			unlockedLabel.x = 225;
			unlockedLabel.y = 37.5;
			unlockedLabel.visible = false;
			itemButton.addChild(unlockedLabel);
			this.itemLabels.push(unlockedLabel);
		}
		const closeButton = new PIXI.Graphics();
		closeButton.beginFill(0xe74c3c);
		closeButton.drawRoundedRect(0, 0, 200, 60, 10);
		closeButton.endFill();
		closeButton.x = this.width / 2 - 100;
		closeButton.y = this.height - 100;
		closeButton.interactive = true;
		closeButton.cursor = 'pointer';
		closeButton.on('pointerdown', () => this._closeShop());
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

	_buyItem(item) {
		if (item.unlocked) return;
		if (this.game.coins >= item.price) {
			this.game.coins -= item.price;
			item.unlocked = true;
			this._saveUnlockedItems();
			this.game.uiManager.updateCoins(this.game.coins);
			localStorage.setItem('coins', this.game.coins);
			this._updateShopItems();
			this.game.soundManager.play('point');
			if (item.id === 'medium_difficulty' || item.id === 'hard_difficulty') {
				this.game.difficultyManager.updateUnlockedDifficulties();
				this.game.uiManager.updateDifficultyButtons(this.game.difficultyManager.currentDifficulty);
			}
		} else {
			this.game.soundManager.play('hit');
		}
	}

	_getButtonForItem(item) {
		const index = this.items.indexOf(item);
		if (index !== -1) {
			return this.itemButtons[index];
		}
		return null;
	}

	_updateShopItems() {
		const formattedCoins = this.game.coins.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
		this.coinText.text = formattedCoins;
		for (let i = 0; i < this.items.length; i++) {
			const item = this.items[i];
			const button = this.itemButtons[i];
			const priceContainer = this.itemPrices[i];
			const unlockedLabel = this.itemLabels[i];
			if (item.unlocked) {
				button.tint = 0x666666;
				button.alpha = 0.5;
				priceContainer.visible = false;
				unlockedLabel.visible = true;
				button.interactive = false;
				button.cursor = 'default';
			} else {
				const canAfford = this.game.coins >= item.price;
				button.tint = canAfford ? 0x2980b9 : 0x7f8c8d;
				button.alpha = canAfford ? 1 : 0.7;
				const priceText = priceContainer.getChildAt(1);
				priceText.style.fill = canAfford ? 0xffd700 : 0xff6b6b;
				priceContainer.visible = true;
				unlockedLabel.visible = false;
				button.interactive = true;
				button.cursor = canAfford ? 'pointer' : 'not-allowed';
			}
		}
	}

	_closeShop() {
		this.game.soundManager.play('swoosh');
		this.game.gameState.transitionTo('MENU');
		this.game.uiManager.updateVisibility(this.game.gameState.current);
	}

	updateCoins(coins) {
		const formattedCoins = coins.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
		this.coinText.text = formattedCoins;
		const gap = 5;
		const coinIconWidth = this.coinIcon.width;
		const totalWidth = coinIconWidth + gap + this.coinText.width;
		this.coinInfoContainer.pivot.x = totalWidth / 2;
		this.coinIcon.x = 0;
		this.coinText.x = coinIconWidth + gap;
		this._updateShopItems();
	}

	open() {
		const formattedCoins = this.game.coins.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
		this.coinText.text = formattedCoins;
		const gap = 5;
		const coinIconWidth = this.coinIcon.width;
		const totalWidth = coinIconWidth + gap + this.coinText.width;
		this.coinInfoContainer.pivot.x = totalWidth / 2;
		this.coinIcon.x = 0;
		this.coinText.x = coinIconWidth + gap;
		this._updateShopItems();
		this.container.visible = true;
	}
}
