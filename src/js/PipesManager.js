import * as PIXI from 'pixi.js';
// Импортируем два отдельных файла
import pipeUp from '../assets/pipe-green-up.png'; // верхняя труба
import pipeDown from '../assets/pipe-green-down.png'; // нижняя труба

export default class PipesManager {
	constructor(screenWidth, screenHeight, speed) {
		this.screenWidth = screenWidth;
		this.screenHeight = screenHeight;
		this.speed = speed;

		// Все трубы кладём в отдельный контейнер
		this.container = new PIXI.Container();
		this.pipes = [];

		// Предположим, что pipe-green-up/down
		// имеют одинаковую ширину, например 52 пикселей,
		// и высоту, например 320 пикселей (или что у вас в исходных файлах).
		this.pipeWidth = 52;
		this.pipeHeight = 320;

		// Параметры «щели» между трубами:
		this.gapHeight = 150;
		// Диапазон, в котором появляется центр щели:
		this.minGapY = screenHeight * 0.3;
		this.maxGapY = screenHeight * 0.7;
	}

	spawnPipe() {
		// Случайная позиция «центра» зазора
		const gapY = Math.random() * (this.maxGapY - this.minGapY) + this.minGapY;

		// Координата X (с права)
		const pipeX = this.screenWidth;

		// ====== ВЕРХНЯЯ ТРУБА ======
		// Мы используем готовое изображение "pipe-green-up.png",
		// в котором кольцо/носик внизу.
		// Поэтому anchor ставим (0.5, 1), чтобы (x, y) считался
		// нижней кромкой этой трубы.
		const topPipe = new PIXI.Sprite(PIXI.Texture.from(pipeUp));
		topPipe.anchor.set(0.5, 1);

		// «низ» верхней трубы находится на верхней границе зазора
		topPipe.x = pipeX;
		topPipe.y = gapY - this.gapHeight / 2;

		// Если НЕ хотим растягивать трубу, scale по умолчанию = 1

		// ====== НИЖНЯЯ ТРУБА ======
		// "pipe-green-down.png" — кольцо/носик в верхней части картинки
		// anchor (0.5, 0), значит (x, y) — верхняя кромка трубы
		const bottomPipe = new PIXI.Sprite(PIXI.Texture.from(pipeDown));
		bottomPipe.anchor.set(0.5, 0);

		// «верх» нижней трубы находится на нижней границе зазора
		bottomPipe.x = pipeX;
		bottomPipe.y = gapY + this.gapHeight / 2;

		// Добавляем в контейнер
		this.container.addChild(topPipe, bottomPipe);

		// Запоминаем в массив
		this.pipes.push({
			topPipe,
			bottomPipe,
			passed: false, // для счёта
		});
	}

	update(delta) {
		// Двигаем трубы влево
		for (let i = 0; i < this.pipes.length; i++) {
			const pipe = this.pipes[i];
			pipe.topPipe.x -= this.speed * delta;
			pipe.bottomPipe.x -= this.speed * delta;

			// Если труба ушла за левый край, удаляем
			if (pipe.topPipe.x + this.pipeWidth < 0) {
				this.container.removeChild(pipe.topPipe);
				this.container.removeChild(pipe.bottomPipe);
				this.pipes.splice(i, 1);
				i--;
			}
		}
	}

	reset() {
		// Удаляем все трубы с контейнера
		for (const pipe of this.pipes) {
			this.container.removeChild(pipe.topPipe);
			this.container.removeChild(pipe.bottomPipe);
		}
		this.pipes = [];
	}
}
