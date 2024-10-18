import {
	_decorator,
	Component,
	Node,
	Prefab,
	RigidBody,
	SphereCollider,
	Vec2,
	Vec3,
	tween,
} from 'cc';
import { Pool } from 'db://assets/scripts/Poll';
import { gameEventTarget } from 'db://assets/scripts/plugins/GameEventTarget';
import { GameEvent } from 'db://assets/scripts/enums/GameEvent';
import { Quadtree } from 'db://assets/scripts/Qadtree';
import { getBoundSize } from 'db://assets/scripts/utils/getBoundSize';

const { ccclass, property } = _decorator;


@ccclass('FruitsGenerator')
export class FruitsGenerator extends Component {
	private _timer = 0;
	private _timerUpdateTree = 0;

	@property
	perRow: number = 20;

	@property
	squareSize: number = 13;

	@property
	rows: number = 2;

	@property
	rowHeight: number = 0.4;

	@property
	active: boolean = true;

	@property(Prefab)
	fruitPrefab: Prefab = null;

	@property(Node)
	playerNode: Node = null;

	private _pool: Pool = null;
	private _arr: Node[] = [];
	public _quadtree: Quadtree;

	onLoad() {
		const points: Vec3[] = [
			new Vec3(0, 0, -11),
			new Vec3(14, 0, -11),
			new Vec3(14, 0, 2.5),
			new Vec3(0, 0, 2.5),
		];

		const bounds = getBoundSize(points);

		this._pool = new Pool(this.fruitPrefab, this.perRow ** 2 * this.rows);
		this._quadtree = new Quadtree(bounds.x, bounds.y, bounds.width, bounds.height);

		this.startGeneratingOranges();
	}

	onEnable() {
		if (this.node.name === 'watermelons') {
			gameEventTarget['on'](GameEvent.SHOW_WATERMELON, this.showFruit, this);
		}
	}

	startGeneratingOranges() {

		const { perRow, squareSize, rows, rowHeight } = this;

		const spacing = squareSize / (perRow - 1); // Расстояние между апельсинами
		const randomOffset = 0.25;

		for (let row = 0; row < rows; row++) {
			const y = row * rowHeight;
			for (let i = 0; i < perRow; i++) {
				for (let j = 0; j < perRow; j++) {
					const randomX = (Math.random() - 0.5) * randomOffset;
					const randomZ = (Math.random() - 0.5) * randomOffset;
					this.generateFruit(i * spacing + randomX, y, j * spacing + randomZ);
				}
			}
		}
	}

	generateFruit(x: number, y: number, z: number) {
		const fruit = this._pool.get();
		fruit.active = this.active;
		if (fruit) {
			this.node.addChild(fruit);
			fruit.setPosition(new Vec3(x, y, z));
			fruit.eulerAngles = new Vec3(Math.random() * 180, Math.random() * 90, Math.random() * 180);
			this._quadtree.insert(fruit);
			this._arr.push(fruit);
		}
	}

	showFruit() {
		this.node.children.forEach((child, i) => {
			child.scale.set(0, 0, 0);
			const { x, y, z } = child.position;
			child.position.add(new Vec3(0, -0.4, 0));
			tween(child)
				.delay(0.005 * i)
				.to(0.7, {
					scale: new Vec3(1, 1, 1),
					eulerAngles: new Vec3(Math.random() * 180, Math.random() * 90, Math.random() * 180),
					position: new Vec3(x, y + 0.4, z),
				}, {
					onStart: (target?: object) => {
						child.active = true;
					},
					easing: 'backOut',
				})
				.start();
		});
	}

	update(dt: number) {
		if (!this.playerNode) {
			return;
		}

		this._timer += dt;
		this._timerUpdateTree += dt;
		if (this._timer < 0.1) {
			return;
		}
		this._timer = 0;
		
		if (this._timerUpdateTree > 1) {
			this._quadtree.update();
			this._timerUpdateTree = 0;
		}

		const playerPos2D = new Vec2(this.playerNode.worldPosition.x, this.playerNode.worldPosition.z);
		const radiusSquared = 2;

		const nearbyNodes = this._quadtree.queryCircle(playerPos2D, Math.sqrt(radiusSquared));

		nearbyNodes.forEach((childNode: Node) => {
			const parentPos2D = new Vec2(childNode.worldPosition.x, childNode.worldPosition.z);
			const distanceSquared = Vec2.squaredDistance(playerPos2D, parentPos2D);

			const rigidBody = childNode.getComponent(RigidBody);
			const collider = childNode.getComponent(SphereCollider);

			if (distanceSquared < 1) {
				if (rigidBody && !rigidBody.enabled) {
					const force = this.playerNode.forward.multiplyScalar(-25);
					rigidBody.enabled = true;
					collider.enabled = true;
					rigidBody.applyForce(force);
					this.scheduleOnce(() => {
						rigidBody.enabled = false;
						collider.enabled = false;
					}, 1);
				}
			}
		});
	}
}
