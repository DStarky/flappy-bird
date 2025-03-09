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
		this.adsMinInterval = 60000;
	}

	async init() {
		if (this.initialized || this.initializing) {
			return this.initialized;
		}

		if (!window.YaGames) {
			console.error('Яндекс.Игры SDK не найден. Убедитесь, что скрипт загружен.');
			return false;
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
				this.player = null;
			}

			this.initialized = true;
			this.initializing = false;
			return true;
		} catch (err) {
			this.initializing = false;
			return false;
		}
	}

	getLoadingAPI() {
		if (!this.sdk) return;

		try {
			this.sdk.features.LoadingAPI.ready();
		} catch (err) {}
	}

	async authorizePlayer() {
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
		if (!this.sdk || !this.initialized) return;

		try {
			const leaderboard = await this.sdk.getLeaderboards();
			await leaderboard.setLeaderboardScore('flappy_bird_score', score);
		} catch (err) {}
	}

	async getLeaderboardEntries(quantityAround = 5, quantityTop = 10) {
		if (!this.sdk || !this.initialized) return null;

		try {
			const leaderboard = await this.sdk.getLeaderboards();
			const result = await leaderboard.getLeaderboardEntries('flappy_bird_score', {
				quantityAround,
				quantityTop,
			});

			return result;
		} catch (err) {
			return null;
		}
	}

	async showInterstitialAd() {
		if (!this.sdk || !this.initialized) return;

		const currentTime = Date.now();
		if (currentTime - this.lastAdShownTime < this.adsMinInterval) {
			return;
		}

		try {
			this.hasShownInterstitialAd = true;

			const wasMusicPlaying = this.game.soundManager.isMusicPlaying;
			this.game.soundManager.pauseMusic();

			await this.sdk.adv.showFullscreenAdv({
				callbacks: {
					onClose: wasShown => {
						this.lastAdShownTime = Date.now();

						if (wasMusicPlaying && !this.game.soundManager.isMusicMuted) {
							this.game.soundManager.playMusic();
						}
					},
					onError: error => {
						if (wasMusicPlaying && !this.game.soundManager.isMusicMuted) {
							this.game.soundManager.playMusic();
						}
					},
				},
			});
		} catch (err) {
			if (wasMusicPlaying && !this.game.soundManager.isMusicMuted) {
				this.game.soundManager.playMusic();
			}
		}
	}

	async showRewardedAd(callbacks = {}) {
		if (!this.sdk || !this.initialized || this.rewardedAdInProgress) return false;

		try {
			this.rewardedAdInProgress = true;

			const wasMusicPlaying = this.game.soundManager.isMusicPlaying;
			this.game.soundManager.pauseMusic();

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

						if (wasMusicPlaying && !this.game.soundManager.isMusicMuted) {
							this.game.soundManager.playMusic();
						}

						if (callbacks.onClose) callbacks.onClose();
					},
					onError: error => {
						this.rewardedAdInProgress = false;

						if (wasMusicPlaying && !this.game.soundManager.isMusicMuted) {
							this.game.soundManager.playMusic();
						}

						if (callbacks.onError) callbacks.onError(error);
					},
				},
			});

			return true;
		} catch (err) {
			this.rewardedAdInProgress = false;

			if (wasMusicPlaying && !this.game.soundManager.isMusicMuted) {
				this.game.soundManager.playMusic();
			}

			return false;
		}
	}

	async showBanner(show = true) {
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
		if (!this.sdk || !this.initialized) return;

		try {
			this.sdk.features.GameplayAPI.start();
		} catch (err) {}
	}

	stopGamePlay() {
		if (!this.sdk || !this.initialized) return;

		try {
			this.sdk.features.GameplayAPI.stop();
		} catch (err) {}
	}

	isAuthorized() {
		return this.player && this.player.getMode() !== 'lite';
	}

	getPlayerName() {
		if (this.player && this.player.getMode() !== 'lite') {
			return this.player.getName() || 'Игрок';
		}
		return 'Гость';
	}
}
