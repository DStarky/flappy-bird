import * as PIXI from 'pixi.js';
import pipeUp from '../assets/pipe-green-up.png'; // верхняя труба (носик внизу)
import pipeDown from '../assets/pipe-green-down.png'; // нижняя труба (носик вверху)

export default class PipesManager {
	constructor(screenWidth, screenHeight, speed) {
		this.screenWidth = screenWidth;
		this.screenHeight = screenHeight;
		this.speed = speed;

		// Контейнер для всех труб
		this.container = new PIXI.Container();
		this.pipes = [];

		// Размер спрайтов труб
		this.pipeWidth = 52;
		this.pipeHeight = 320;

		// Зазор между трубами
		this.gapHeight = 150;

		// -------------------------------------------------------
		// Логика, чтобы верхняя труба не заходила «внутрь» экрана верхним краем.
		// При этом трубы могут «уходить» за границу сверху/снизу.
		//
		// topPipe.anchor = (0.5, 1), значит:
		//   topPipe.y = (центр зазора) - (gapHeight/2) — это нижняя кромка верхней трубы.
		// Чтобы её верхняя кромка была за пределами экрана (или ровно по границе),
		//   topPipe.y - pipeHeight <= 0  =>  (gapY - gapHeight/2) - pipeHeight <= 0
		//   => gapY <= pipeHeight + (gapHeight/2).
		//
		// Для нижней трубы (anchor.y = 0):
		//   bottomPipe.y = gapY + gapHeight/2 — верхняя кромка.
		// Чтобы нижняя труба могла "уйти" за нижний край, требуется
		//   (bottomPipe.y + pipeHeight) >= screenHeight  =>  gapY + gapHeight/2 + pipeHeight >= screenHeight
		//   => gapY >= screenHeight - (pipeHeight + gapHeight/2).
		//
		// Значит, случайный "центр зазора" (gapY) берём из диапазона:
		//   [ minGapY, maxGapY ] = [ screenHeight - (pipeHeight + gapHeight/2),  pipeHeight + gapHeight/2 ]
		// -------------------------------------------------------

		this.minGapY = this.screenHeight - (this.pipeHeight + this.gapHeight / 2);
		this.maxGapY = this.pipeHeight + this.gapHeight / 2;
		// При экране 640, трубе 320 и зазоре 150:
		//   minGapY = 640 - (320 + 75) = 245
		//   maxGapY = 320 + 75 = 395
		// Диапазон [245..395] даёт 150px «разброса» для центра зазора.
	}

	// -------------------------------
	// Создаём пару труб (верхняя + нижняя)
	// -------------------------------
	spawnPipe() {
		// Случайный центр зазора
		const gapY = Math.random() * (this.maxGapY - this.minGapY) + this.minGapY;

		// Точка появления труб (по оси X — справа за экраном)
		const pipeX = this.screenWidth;

		// ===== ВЕРХНЯЯ ТРУБА =====
		// anchor.set(0.5, 1): (x, y) — это нижняя кромка трубы.
		// Нижняя кромка верхней трубы ставится на (gapY - gapHeight/2).
		const topPipe = new PIXI.Sprite(PIXI.Texture.from(pipeUp));
		topPipe.anchor.set(0.5, 1);
		topPipe.x = pipeX;
		topPipe.y = gapY - this.gapHeight / 2;
		// Можно явно задать размер, если нужно:
		// topPipe.width = this.pipeWidth;
		// topPipe.height = this.pipeHeight;

		// ===== НИЖНЯЯ ТРУБА =====
		// anchor.set(0.5, 0): (x, y) — верхняя кромка трубы.
		// Верхняя кромка нижней трубы ставится на (gapY + gapHeight/2).
		const bottomPipe = new PIXI.Sprite(PIXI.Texture.from(pipeDown));
		bottomPipe.anchor.set(0.5, 0);
		bottomPipe.x = pipeX;
		bottomPipe.y = gapY + this.gapHeight / 2;
		// bottomPipe.width = this.pipeWidth;
		// bottomPipe.height = this.pipeHeight;

		// Добавляем обе трубы в контейнер
		this.container.addChild(topPipe, bottomPipe);

		// Запоминаем в массив (нужно для удаления и подсчёта очков)
		this.pipes.push({
			topPipe,
			bottomPipe,
			passed: false, // для логики счёта
		});
	}

	// -------------------------------
	// Анимация труб (движение влево)
	// -------------------------------
	update(delta) {
		for (let i = 0; i < this.pipes.length; i++) {
			const pipe = this.pipes[i];
			// Двигаем трубы влево
			pipe.topPipe.x -= this.speed * delta;
			pipe.bottomPipe.x -= this.speed * delta;

			// Если труба ушла за левый край экрана, удаляем её
			if (pipe.topPipe.x + this.pipeWidth < 0) {
				this.container.removeChild(pipe.topPipe);
				this.container.removeChild(pipe.bottomPipe);
				this.pipes.splice(i, 1);
				i--;
			}
		}
	}

	// -------------------------------
	// Сброс (удаляем все трубы)
	// -------------------------------
	reset() {
		for (const pipe of this.pipes) {
			this.container.removeChild(pipe.topPipe);
			this.container.removeChild(pipe.bottomPipe);
		}
		this.pipes = [];
	}
}
