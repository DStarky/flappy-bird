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
			},
			medium: {
				gravity: 0.65,
				jumpPower: -9,
				pipeSpeed: 4,
				pipeSpawnInterval: 75,
				groundSpeed: 2.5,
				gapHeight: 112,
				name: 'СРЕДНИЙ',
			},
			hard: {
				gravity: 0.8,
				jumpPower: -10,
				pipeSpeed: 5,
				pipeSpawnInterval: 60,
				groundSpeed: 3,
				gapHeight: 104,
				name: 'ТЯЖЕЛЫЙ',
			},
		};

		this.currentDifficulty = localStorage.getItem('difficulty') || 'easy';
	}

	getDifficultySettings() {
		return this.difficulties[this.currentDifficulty];
	}

	setDifficulty(difficulty) {
		if (this.difficulties[difficulty]) {
			this.currentDifficulty = difficulty;
			localStorage.setItem('difficulty', difficulty);
		}
	}

	getCurrentDifficultyName() {
		return this.difficulties[this.currentDifficulty].name;
	}
}
