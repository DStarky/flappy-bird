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
			{
				id: 'shield',
				name: 'ЩИТ',
				description: 'Начинать игру с дополнительным щитом',
				price: 10000,
				unlocked: false,
			},
			{
				id: 'pepper',
				name: 'УСКОРЕНИЕ',
				description: 'Начинать игру с ускорением',
				price: 20000,
				unlocked: false,
			},
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
		// Создаем фон для магазина
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
		this.coinInfoContainer.y = 80;
		this.container.addChild(this.coinInfoContainer);

		const coinBaseTexture = PIXI.BaseTexture.from(coinImg);
		const coinTexture = new PIXI.Texture(coinBaseTexture, new PIXI.Rectangle(0, 0, 16, 16));

		this.coinIcon = new PIXI.Sprite(coinTexture);
		this.coinIcon.scale.set(2);
		this.coinIcon.anchor.set(1, 0.5);
		this.coinIcon.x = -10;
		this.coinInfoContainer.addChild(this.coinIcon);

		this.coinText = new PIXI.Text('0', {
			fontFamily: ['HarreeghPoppedCyrillic', 'Arial'],
			fontSize: 30,
			fill: 0xffd700,
			stroke: 0x000000,
			strokeThickness: 3,
		});
		this.coinText.anchor.set(0, 0.5);
		this.coinText.x = 10;
		this.coinInfoContainer.addChild(this.coinText);

		this.itemsContainer = new PIXI.Container();
		this.itemsContainer.x = this.width / 2 - 150;
		this.itemsContainer.y = 130;
		this.container.addChild(this.itemsContainer);

		this.itemButtons = [];
		this.itemTexts = [];
		this.itemPrices = [];
		this.itemLabels = [];

		for (let i = 0; i < this.items.length; i++) {
			const item = this.items[i];
			const y = i * 120;

			const itemButton = new PIXI.Graphics();
			itemButton.beginFill(0x2980b9);
			itemButton.drawRoundedRect(0, 0, 300, 100, 10);
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
			itemName.y = 15;
			itemButton.addChild(itemName);
			this.itemTexts.push(itemName);

			const itemDescription = new PIXI.Text(item.description, {
				fontFamily: ['HarreeghPoppedCyrillic', 'Arial'],
				fontSize: 16,
				fill: 0xe0e0e0,
				wordWrap: true,
				wordWrapWidth: 220,
			});
			itemDescription.x = 15;
			itemDescription.y = 50;
			itemButton.addChild(itemDescription);

			let itemIcon;

			if (item.id === 'shield') {
				itemIcon = new PIXI.Sprite(PIXI.Texture.from(shieldImg));
				itemIcon.scale.set(0.7); 
			} else if (item.id === 'pepper') {
				itemIcon = new PIXI.Sprite(PIXI.Texture.from(pepperImg));
				itemIcon.scale.set(0.8); 
			} else {
				const difficultyIcon = new PIXI.Graphics();
				if (item.id === 'medium_difficulty') {
					difficultyIcon.beginFill(0xf39c12);
				} else {
					difficultyIcon.beginFill(0xe74c3c);
				}
				difficultyIcon.drawRoundedRect(0, 0, 20, 20, 4);
				difficultyIcon.endFill();
				itemIcon = difficultyIcon;
			}

			itemIcon.x = 260;
			itemIcon.y = 25;
			itemButton.addChild(itemIcon);

			const priceContainer = new PIXI.Container();
			priceContainer.x = 250;
			priceContainer.y = 70;
			itemButton.addChild(priceContainer);

			const priceIcon = new PIXI.Sprite(coinTexture);
			priceIcon.scale.set(1.2);
			priceIcon.anchor.set(1, 0.5);
			priceIcon.x = 0;
			priceContainer.addChild(priceIcon);

			const priceText = new PIXI.Text(item.price.toString(), {
				fontFamily: ['HarreeghPoppedCyrillic', 'Arial'],
				fontSize: 18,
				fill: 0xffd700,
				stroke: 0x000000,
				strokeThickness: 2,
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
			unlockedLabel.x = 150;
			unlockedLabel.y = 70;
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
		this.coinText.text = this.game.coins.toString();

		for (let i = 0; i < this.items.length; i++) {
			const item = this.items[i];
			const button = this.itemButtons[i];
			const priceContainer = this.itemPrices[i];
			const unlockedLabel = this.itemLabels[i];

			if (item.unlocked) {
				button.tint = 0x34495e;
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
		this.coinText.text = coins.toString();
		this._updateShopItems();
	}

	open() {
		this.coinText.text = this.game.coins.toString();
		this._updateShopItems();
		this.container.visible = true;
	}
}
