import * as PIXI from 'pixi.js';
// Подключаем спрайты труб
import pipeUp from '../assets/pipe-green-up.png'; // верхняя труба (носик внизу)
import pipeDown from '../assets/pipe-green-down.png'; // нижняя труба (носик вверху)

export default class PipesManager {
	constructor(screenWidth, screenHeight, speed) {
		this.screenWidth = screenWidth;
		this.screenHeight = screenHeight;
		this.speed = speed;

		// Контейнер, где лежат все трубы
		this.container = new PIXI.Container();
		this.pipes = [];

		// Размеры спрайтов труб (по умолчанию)
		this.pipeWidth = 52;
		this.pipeHeight = 320;

		// Высота зазора между трубами
		this.gapHeight = 150;

		// -------------------------------
		// 1) Расчитываем диапазон для центра зазора (gapY),
		//    чтобы верхняя труба гарантированно «уходила» за верх экрана,
		//    а нижняя – за нижний.
		// -------------------------------
		//
		// Верхняя труба (anchor.y = 1) ставится так, что её "нижняя кромка" = (gapY - gapHeight/2).
		// Значит "верх" трубы будет (topPipe.y - pipeHeight).
		// Чтобы труба выходила за верх экрана, нужно:
		//   (gapY - gapHeight/2) - pipeHeight < 0
		//   => gapY < pipeHeight + gapHeight/2
		//
		// Аналогично для нижней:
		// нижняя труба (anchor.y = 0) ставится так, что её "верхняя кромка" = (gapY + gapHeight/2).
		// "низ" трубы = (bottomPipe.y + pipeHeight).
		// Чтобы труба выходила за нижний край (screenHeight), нужно:
		//   (gapY + gapHeight/2) + pipeHeight > screenHeight
		//   => gapY > screenHeight - (pipeHeight + gapHeight/2)

		// Итого получаем, что допустимый центр зазора должен лежать в диапазоне:
		//   pipeHeight + gapHeight/2 > gapY > screenHeight - (pipeHeight + gapHeight/2)
		//
		// Условимся:
		this.topLimit = this.pipeHeight + this.gapHeight / 2; // верхняя граница gapY
		this.bottomLimit = this.screenHeight - (this.pipeHeight + this.gapHeight / 2); // нижняя граница gapY

		// Если экран слишком маленький и диапазон получается "перевернутым",
		// придётся либо уменьшать gapHeight, либо pipeHeight.
		if (this.topLimit > this.bottomLimit) {
			console.warn(
				'Параметры pipeHeight и gapHeight слишком велики для данного экрана.\n' +
					'Диапазон зазора получается некорректным. Попробуйте уменьшить gapHeight.',
			);
			// На крайний случай "зажмём" gapY в середину экрана:
			this.topLimit = this.screenHeight / 2;
			this.bottomLimit = this.screenHeight / 2;
		}

		// minGapY и maxGapY — реальные границы случайного центра зазора
		this.minGapY = this.topLimit;
		this.maxGapY = this.bottomLimit;
	}

	// -------------------------------
	// Создание новой пары труб
	// -------------------------------
	spawnPipe() {
		// Случайный центр зазора
		const gapY = Math.random() * (this.maxGapY - this.minGapY) + this.minGapY;

		// X-координата (справа за экраном)
		const pipeX = this.screenWidth;

		// ===== ВЕРХНЯЯ ТРУБА =====
		// Спрайт с «носиком» внизу, anchor = (0.5, 1),
		// значит координата (x, y) - это нижняя кромка трубы.
		const topPipe = new PIXI.Sprite(PIXI.Texture.from(pipeUp));
		topPipe.anchor.set(0.5, 1);
		topPipe.x = pipeX;
		topPipe.y = gapY - this.gapHeight / 2;
		// Размер трубы не меняем (не масштабируем):
		// topPipe.width = this.pipeWidth;  // Можно явно, если нужно
		// topPipe.height = this.pipeHeight;

		// ===== НИЖНЯЯ ТРУБА =====
		// Спрайт с «носиком» вверху, anchor = (0.5, 0),
		// значит координата (x, y) - это верхняя кромка трубы.
		const bottomPipe = new PIXI.Sprite(PIXI.Texture.from(pipeDown));
		bottomPipe.anchor.set(0.5, 0);
		bottomPipe.x = pipeX;
		bottomPipe.y = gapY + this.gapHeight / 2;
		// bottomPipe.width = this.pipeWidth;
		// bottomPipe.height = this.pipeHeight;

		// Добавляем в контейнер
		this.container.addChild(topPipe, bottomPipe);

		// Запоминаем в массив
		this.pipes.push({
			topPipe,
			bottomPipe,
			passed: false, // понадобится для логики счёта
		});
	}

	// -------------------------------
	// Движение труб (вызывается в gameLoop)
	// -------------------------------
	update(delta) {
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

	// -------------------------------
	// Сброс (удалить все трубы)
	// -------------------------------
	reset() {
		for (const pipe of this.pipes) {
			this.container.removeChild(pipe.topPipe);
			this.container.removeChild(pipe.bottomPipe);
		}
		this.pipes = [];
	}
}
