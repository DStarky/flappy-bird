export default class DifficultyManager {
	constructor() {
		this.difficulties = {
			easy: {
				gravity: 0.5,
				jumpPower: -8,
				pipeSpeed: 3,
				pipeSpawnInterval: 100,
				groundSpeed: 2,
				gapHeight: 120,
				name: 'ЛЕГКИЙ',
				scoreMultiplier: 1,
				coinMultiplier: 1,
			},
			medium: {
				gravity: 0.65,
				jumpPower: -9,
				pipeSpeed: 4,
				pipeSpawnInterval: 75,
				groundSpeed: 2.5,
				gapHeight: 112,
				name: 'СРЕДНИЙ',
				scoreMultiplier: 2,
				coinMultiplier: 2,
			},
			hard: {
				gravity: 0.8,
				jumpPower: -10,
				pipeSpeed: 5,
				pipeSpawnInterval: 60,
				groundSpeed: 3,
				gapHeight: 104,
				name: 'ТЯЖЕЛЫЙ',
				scoreMultiplier: 3,
				coinMultiplier: 3,
			},
		};

		this.currentDifficulty = localStorage.getItem('difficulty') || 'easy';
		this.unlockedDifficulties = {
			easy: true,
			medium: localStorage.getItem('shop_medium_difficulty') === 'true',
			hard: localStorage.getItem('shop_hard_difficulty') === 'true',
		};

		if (!this.unlockedDifficulties[this.currentDifficulty]) {
			this.currentDifficulty = 'easy';
			localStorage.setItem('difficulty', 'easy');
		}
	}

	getDifficultySettings() {
		return this.difficulties[this.currentDifficulty];
	}

	setDifficulty(difficulty) {
		if (this.difficulties[difficulty] && this.unlockedDifficulties[difficulty]) {
			this.currentDifficulty = difficulty;
			localStorage.setItem('difficulty', difficulty);
			return true;
		}
		return false;
	}

	getCurrentDifficultyName() {
		return this.difficulties[this.currentDifficulty].name;
	}

	updateUnlockedDifficulties() {
		this.unlockedDifficulties = {
			easy: true,
			medium: localStorage.getItem('shop_medium_difficulty') === 'true',
			hard: localStorage.getItem('shop_hard_difficulty') === 'true',
		};
	}

	isDifficultyUnlocked(difficulty) {
		return this.unlockedDifficulties[difficulty];
	}
}
