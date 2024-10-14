import { _decorator, Component, Node, Prefab, RigidBody, SphereCollider, Vec3, tween } from 'cc';
import { Pool } from 'db://assets/scripts/Poll';
import { gameEventTarget } from 'db://assets/scripts/plugins/GameEventTarget';
import { GameEvent } from 'db://assets/scripts/enums/GameEvent';

const { ccclass, property } = _decorator;

@ccclass('FruitsGenerator')
export class FruitsGenerator extends Component {
	private _timer = 0;

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

	onLoad() {
		this._pool = new Pool(this.fruitPrefab, this.perRow ** 2 * this.rows);

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

	destroyFruit(node: Node) {
		this._pool.release(node);
	}

	update(dt: number) {
		if (!this.playerNode) {
			return;
		}

		this._timer += dt;
		if (this._timer > 0.2) {
			this._timer = 0;
		}

		this.node.children.forEach((child) => {
			const playerPosXZ = new Vec3(this.playerNode.worldPosition.x, 0, this.playerNode.worldPosition.z);
			const childPosXZ = new Vec3(child.children[0].worldPosition.x, 0, child.children[0].worldPosition.z);
			const distance = Vec3.distance(playerPosXZ, childPosXZ);

			const rigidBody = child.getComponentInChildren(RigidBody);
			const collider = child.getComponentInChildren(SphereCollider);

			if (distance <= 1.) {
				if (rigidBody) {
					const f = this.playerNode.forward.multiplyScalar(-25);
					child['liveTime'] = 1;
					rigidBody.enabled = true; // Включаем физику
					collider.enabled = true;

					rigidBody.applyForce(f);
				}
			} else {
				if (rigidBody && rigidBody.enabled) {
					child['liveTime'] -= dt;
				}
				if (rigidBody && rigidBody.enabled && child['liveTime'] < 0) {
					rigidBody.enabled = false; // Отключаем физику
					collider.enabled = false;
					child['liveTime'] = 1;
				}
			}
		});
	}
}
