import { _decorator, Component, Node, Vec2 } from 'cc';

export class Quadtree {
	private maxObjects: number;
	private maxLevels: number;
	private level: number;
	private bounds: { x: number; y: number; width: number; height: number };
	private objects: Node[];
	private nodes: Quadtree[];

	constructor(x: number, y: number, width: number, height: number, level: number = 0, maxLevels: number = 4, maxObjects: number = 200) {
		this.bounds = { x, y, width, height };
		this.level = level;
		this.maxObjects = maxObjects;
		this.maxLevels = maxLevels;
		this.objects = [];
		this.nodes = [];
	}

	clear() {
		this.objects = [];
		this.nodes.forEach(node => node.clear());
		this.nodes = [];
	}

	split() {
		const subWidth = this.bounds.width / 2;
		const subHeight = this.bounds.height / 2;
		const x = this.bounds.x;
		const y = this.bounds.y;

		this.nodes[0] = new Quadtree(x + subWidth, y, subWidth, subHeight, this.level + 1);
		this.nodes[1] = new Quadtree(x, y, subWidth, subHeight, this.level + 1);
		this.nodes[2] = new Quadtree(x, y + subHeight, subWidth, subHeight, this.level + 1);
		this.nodes[3] = new Quadtree(x + subWidth, y + subHeight, subWidth, subHeight, this.level + 1);
	}

	// Получить индекс квадранта для объекта
	getIndex(node: Node): number {
		const posX = node.worldPosition.x;
		const posZ = node.worldPosition.z;

		const verticalMidpoint = this.bounds.x + (this.bounds.width / 2);
		const horizontalMidpoint = this.bounds.y + (this.bounds.height / 2);

		const topQuadrant = (posZ < horizontalMidpoint && posZ >= this.bounds.y);
		const bottomQuadrant = (posZ >= horizontalMidpoint);

		if (posX < verticalMidpoint && posX >= this.bounds.x) {
			if (topQuadrant) {
				return 1;
			} else if (bottomQuadrant) {
				return 2;
			}
		} else if (posX >= verticalMidpoint) {
			if (topQuadrant) {
				return 0;
			} else if (bottomQuadrant) {
				return 3;
			}
		}

		return -1;
	}

	// Вставка объекта в дерево
	insert(node: Node) {
		if (this.nodes.length > 0) {
			const index = this.getIndex(node);

			if (index !== -1) {
				this.nodes[index].insert(node);
				return;
			}
		}

		this.objects.push(node);

		if (this.objects.length > this.maxObjects && this.level < this.maxLevels) {
			if (this.nodes.length === 0) {
				this.split();
			}

			let i = 0;
			while (i < this.objects.length) {
				const index = this.getIndex(this.objects[i]);
				if (index !== -1) {
					this.nodes[index].insert(this.objects.splice(i, 1)[0]);
				} else {
					i++;
				}
			}
		}
	}

	// Обновление дерева
	update() {
		const movingObjects: Node[] = [];

		for (const obj of this.objects) {
			if (!this.isWithinBounds(obj)) {
				movingObjects.push(obj);
			}
		}


		for (const obj of movingObjects) {
			const index = this.objects.indexOf(obj);
			if (index !== -1) {
				this.objects.splice(index, 1);
				this.insert(obj);
			}
		}

		for (const node of this.nodes) {
			node.update();
		}
	}

	isWithinBounds(node: Node): boolean {
		const posX = node.worldPosition.x;
		const posZ = node.worldPosition.z;

		return posX >= this.bounds.x && posX <= this.bounds.x + this.bounds.width &&
			posZ >= this.bounds.y && posZ <= this.bounds.y + this.bounds.height;
	}

	// Поиск всех объектов в круге с радиусом
	queryCircle(center: Vec2, radius: number, found: Node[] = []): Node[] {
		const radiusSquared = radius * radius;

		if (!this.circleIntersectsRect(center, radius, this.bounds)) {
			return found;
		}

		for (const obj of this.objects) {
			const objPos = new Vec2(obj.worldPosition.x, obj.worldPosition.z);
			if (Vec2.squaredDistance(center, objPos) <= radiusSquared) {
				found.push(obj);
			}
		}

		if (this.nodes.length > 0) {
			for (const node of this.nodes) {
				node.queryCircle(center, radius, found);
			}
		}

		return found;
	}

	// Проверка пересечения круга с прямоугольником
	circleIntersectsRect(center: Vec2, radius: number, rect: { x: number; y: number; width: number; height: number }): boolean {
		const distX = Math.abs(center.x - (rect.x + rect.width / 2));
		const distY = Math.abs(center.y - (rect.y + rect.height / 2));

		if (distX > (rect.width / 2 + radius)) { return false; }
		if (distY > (rect.height / 2 + radius)) { return false; }

		if (distX <= (rect.width / 2)) { return true; }
		if (distY <= (rect.height / 2)) { return true; }

		const dx = distX - rect.width / 2;
		const dy = distY - rect.height / 2;

		return (dx * dx + dy * dy <= (radius * radius));
	}
}