export default class YandexGamesSDK {
	constructor(game) {
		this.game = game;
		this.sdk = null;
		this.player = null;
		this.leaderboard = null;
		this.initialized = false;
		this.initializing = false;
		this.authorizationStatus = 'NOT_AUTHORIZED';
		this.hasShownInterstitialAd = false;
		this.rewardedAdInProgress = false;
		this.lastAdShownTime = 0;
		this.adsMinInterval = 180000;
		this.isLocalDevelopment = false;
		this.gameStateBeforeAd = null;
	}

	async init() {
		if (this.initialized || this.initializing) {
			return this.initialized;
		}

		if (!window.YaGames) {
			console.log('Яндекс.Игры SDK не найден. Использование локального режима.');
			this.isLocalDevelopment = true;
			this.initialized = true;
			return true;
		}

		try {
			this.initializing = true;
			this.sdk = await window.YaGames.init();

			this.getLoadingAPI();

			try {
				this.player = await this.sdk.getPlayer({ scopes: false });
				if (this.player.getMode() === 'lite') {
				} else {
					this.authorizationStatus = 'AUTHORIZED';

					await this.loadPlayerData();
				}
			} catch (err) {
				console.log('Не удалось получить данные игрока:', err);
				this.player = null;
			}

			this.initialized = true;
			this.initializing = false;
			return true;
		} catch (err) {
			console.log('Ошибка инициализации SDK:', err);
			this.isLocalDevelopment = true;
			this.initialized = true;
			this.initializing = false;
			return true;
		}
	}

	getLoadingAPI() {
		if (!this.sdk) return;

		try {
			this.sdk.features.LoadingAPI.ready();
		} catch (err) {}
	}

	async authorizePlayer() {
		if (this.isLocalDevelopment) {
			console.log('Локальный режим: авторизация недоступна');
			return false;
		}

		if (!this.sdk || this.authorizationStatus === 'AUTHORIZED' || this.authorizationStatus === 'AUTHORIZING') {
			return false;
		}

		this.authorizationStatus = 'AUTHORIZING';
		try {
			const player = await this.sdk.getPlayer({ scopes: true });
			if (player.getMode() !== 'lite') {
				this.player = player;
				this.authorizationStatus = 'AUTHORIZED';

				await this.loadPlayerData();

				return true;
			} else {
				this.authorizationStatus = 'NOT_AUTHORIZED';
				return false;
			}
		} catch (err) {
			this.authorizationStatus = 'NOT_AUTHORIZED';
			return false;
		}
	}

	async loadPlayerData() {
		if (this.isLocalDevelopment) return;
		if (!this.player || this.player.getMode() === 'lite') return;

		try {
			const data = await this.player.getData();

			if (data) {
				if (data.bestScore !== undefined && data.bestScore > this.game.bestScore) {
					this.game.bestScore = data.bestScore;
					localStorage.setItem('bestScore', data.bestScore);
				}

				if (data.coins !== undefined) {
					this.game.coins = data.coins;
					localStorage.setItem('coins', data.coins);
					this.game.uiManager.updateCoins(data.coins);
				}

				if (data.unlockedItems) {
					Object.keys(data.unlockedItems).forEach(key => {
						localStorage.setItem(`shop_${key}`, data.unlockedItems[key]);
					});

					this.game.difficultyManager.updateUnlockedDifficulties();
					this.game.uiManager.updateDifficultyButtons(this.game.difficultyManager.currentDifficulty);
				}
			}
		} catch (err) {}
	}

	async savePlayerData() {
		if (this.isLocalDevelopment) return;
		if (!this.player || this.player.getMode() === 'lite') {
			return;
		}

		try {
			const unlockedItems = {
				medium_difficulty: localStorage.getItem('shop_medium_difficulty') === 'true',
				hard_difficulty: localStorage.getItem('shop_hard_difficulty') === 'true',
				shield: localStorage.getItem('shop_shield') === 'true',
				pepper: localStorage.getItem('shop_pepper') === 'true',
			};

			const dataToSave = {
				bestScore: this.game.bestScore,
				coins: this.game.coins,
				unlockedItems: unlockedItems,
			};

			await this.player.setData(dataToSave);
		} catch (err) {}
	}

	async setLeaderboardScore(score) {
		if (this.isLocalDevelopment) return;
		if (!this.sdk || !this.initialized) return;

		try {
			const leaderboard = await this.sdk.getLeaderboards();
			await leaderboard.setLeaderboardScore('birdScore', score);
		} catch (err) {
			console.error('Ошибка при установке рекорда в таблицу лидеров:', err);
		}
	}

	async getLeaderboardEntries(quantityAround = 5, quantityTop = 10) {
		if (this.isLocalDevelopment) {
			return {
				entries: [
					{ player: { publicName: 'Игрок 1', uniqueID: '1' }, score: 100, rank: 1 },
					{ player: { publicName: 'Игрок 2', uniqueID: '2' }, score: 80, rank: 2 },
					{ player: { publicName: 'Игрок 3', uniqueID: '3' }, score: 60, rank: 3 },
				],
			};
		}

		if (!this.sdk || !this.initialized) return null;

		try {
			const leaderboard = await this.sdk.getLeaderboards();
			const result = await leaderboard.getLeaderboardEntries('birdScore', {
				quantityAround,
				quantityTop,
			});

			return result;
		} catch (err) {
			console.error('Ошибка при получении данных таблицы лидеров:', err);
			return {
				entries: [],
			};
		}
	}

	async showInterstitialAd() {
		if (this.isLocalDevelopment) return;
		if (!this.sdk || !this.initialized) return;

		const currentTime = Date.now();
		if (currentTime - this.lastAdShownTime < this.adsMinInterval) {
			return;
		}

		try {
			this.hasShownInterstitialAd = true;

			this.gameStateBeforeAd = this.game.gameState.current;

			if (this.gameStateBeforeAd === 'PLAY') {
				this.game.pauseGame();
			} else {
				this.game.soundManager.pauseMusic();
			}

			await this._showAdWarning();

			await this.sdk.adv.showFullscreenAdv({
				callbacks: {
					onClose: wasShown => {
						this.lastAdShownTime = Date.now();

						if (this.gameStateBeforeAd === 'PLAY') {
							this.game.resumeGame();
						} else if (!this.game.soundManager.isMusicMuted) {
							this.game.soundManager.playMusic();
						}

						this.gameStateBeforeAd = null;
					},
					onError: error => {
						if (this.gameStateBeforeAd === 'PLAY') {
							this.game.resumeGame();
						} else if (!this.game.soundManager.isMusicMuted) {
							this.game.soundManager.playMusic();
						}

						this.gameStateBeforeAd = null;
					},
				},
			});
		} catch (err) {
			if (this.gameStateBeforeAd === 'PLAY') {
				this.game.resumeGame();
			} else if (!this.game.soundManager.isMusicMuted) {
				this.game.soundManager.playMusic();
			}

			this.gameStateBeforeAd = null;
		}
	}

	async showRewardedAd(callbacks = {}) {
		if (this.isLocalDevelopment) {
			if (callbacks.onRewarded) callbacks.onRewarded();
			if (callbacks.onClose) callbacks.onClose();
			return true;
		}

		if (!this.sdk || !this.initialized || this.rewardedAdInProgress) return false;

		try {
			this.rewardedAdInProgress = true;

			this.gameStateBeforeAd = this.game.gameState.current;

			if (this.gameStateBeforeAd === 'PLAY') {
				this.game.pauseGame();
			} else {
				this.game.soundManager.pauseMusic();
			}

			await this._showAdWarning('Награда за просмотр рекламы');

			await this.sdk.adv.showRewardedVideo({
				callbacks: {
					onOpen: () => {
						if (callbacks.onOpen) callbacks.onOpen();
					},
					onRewarded: () => {
						if (callbacks.onRewarded) callbacks.onRewarded();
					},
					onClose: () => {
						this.rewardedAdInProgress = false;

						if (this.gameStateBeforeAd === 'PLAY') {
							this.game.resumeGame();
						} else if (!this.game.soundManager.isMusicMuted) {
							this.game.soundManager.playMusic();
						}

						this.gameStateBeforeAd = null;

						if (callbacks.onClose) callbacks.onClose();
					},
					onError: error => {
						this.rewardedAdInProgress = false;

						if (this.gameStateBeforeAd === 'PLAY') {
							this.game.resumeGame();
						} else if (!this.game.soundManager.isMusicMuted) {
							this.game.soundManager.playMusic();
						}

						this.gameStateBeforeAd = null;

						if (callbacks.onError) callbacks.onError(error);
					},
				},
			});

			return true;
		} catch (err) {
			this.rewardedAdInProgress = false;

			if (this.gameStateBeforeAd === 'PLAY') {
				this.game.resumeGame();
			} else if (!this.game.soundManager.isMusicMuted) {
				this.game.soundManager.playMusic();
			}

			this.gameStateBeforeAd = null;

			return false;
		}
	}

	_showAdWarning(title = 'Реклама') {
		return new Promise(resolve => {
			const overlay = document.createElement('div');
			overlay.style.cssText = `
				position: fixed;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				background-color: rgba(0, 0, 0, 0.7);
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: center;
				z-index: 10000;
				color: white;
				font-family: Arial, sans-serif;
			`;

			const titleElement = document.createElement('div');
			titleElement.textContent = title;
			titleElement.style.cssText = `
				font-size: 24px;
				font-weight: bold;
				margin-bottom: 20px;
			`;

			const message = document.createElement('div');
			message.textContent = 'Сейчас начнется показ рекламы';
			message.style.cssText = `
				font-size: 18px;
				margin-bottom: 30px;
			`;

			overlay.appendChild(titleElement);
			overlay.appendChild(message);
			document.body.appendChild(overlay);

			setTimeout(() => {
				document.body.removeChild(overlay);
				resolve();
			}, 2000);
		});
	}

	async showBanner(show = true) {
		if (this.isLocalDevelopment) return;
		if (!this.sdk || !this.initialized) return;

		try {
			if (show) {
				await this.sdk.adv.showBannerAdv();
			} else {
				await this.sdk.adv.hideBannerAdv();
			}
		} catch (err) {}
	}

	startGamePlay() {
		if (this.isLocalDevelopment) return;
		if (!this.sdk || !this.initialized) return;

		try {
			this.sdk.features.GameplayAPI.start();
		} catch (err) {}
	}

	stopGamePlay() {
		if (this.isLocalDevelopment) return;
		if (!this.sdk || !this.initialized) return;

		try {
			this.sdk.features.GameplayAPI.stop();
		} catch (err) {}
	}

	isAuthorized() {
		if (this.isLocalDevelopment) return true;
		return this.player && this.player.getMode() !== 'lite';
	}

	getPlayerName() {
		if (this.isLocalDevelopment) return 'Локальный игрок';
		if (this.player && this.player.getMode() !== 'lite') {
			return this.player.getName() || 'Игрок';
		}
		return 'Гость';
	}
}
