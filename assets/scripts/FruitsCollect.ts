import {
	_decorator,
	Component,
	Node,
	v3,
	tween,
	Vec3,
	Prefab,
	RigidBody,
	SphereCollider,
	MeshRenderer
} from 'cc';

import { gameEventTarget } from 'db://assets/scripts/plugins/GameEventTarget';
import { GameEvent } from 'db://assets/scripts/enums/GameEvent';
import { Pool } from 'db://assets/scripts/Poll';
import { InteractiveAreaPhysic } from 'db://assets/scripts/InteractiveAreaPhysic';

const { ccclass, property } = _decorator;

@ccclass('FruitsCollect')
export class FruitsCollect extends Component {
	@property(Node)
	fruitStackStart: Node = null;

	@property(Prefab)
	fruitPrefab: Prefab = null;

	@property
	stackStep: number = .2;

	private _fruitsPool: Pool = null;
	private _isCollect: boolean = false;

	onLoad() {
		this._fruitsPool = new Pool(this.fruitPrefab, 20);
	}

	onEnable() {
		this._subscribeEvents(true);
	}

	onDisable() {
		this._subscribeEvents(false);
	}

	update(deltaTime: number) {

	}

	private _subscribeEvents(isOn: boolean) {
		const func = isOn ? 'on' : 'off';

		gameEventTarget[func](GameEvent.COLLECT_FRUITS, this.onCollectFruits, this);
		gameEventTarget[func](GameEvent.EMIT_ORDER, this.onEmitOrder, this);
	}


	onEmitOrder(area: InteractiveAreaPhysic, orderPoint: Node, countFruitsOrder: number) {
		const l = this.fruitStackStart.children.length;

		if (l - countFruitsOrder < 0) {
			countFruitsOrder = this.fruitStackStart.children.length
		}

		gameEventTarget.emit(GameEvent.IN_PROGRESS_ORDER, area, orderPoint, countFruitsOrder);
		for (let i = 0; i < countFruitsOrder; i++) {
			const fruit = this.fruitStackStart.children[l - 1 - i];

			tween(fruit)
				.delay(i * 0.1)
				.to(.15, { scale: new Vec3() }, {
					easing: 'backIn',
				})
				.call(() => {
					this._fruitsPool.release(fruit);
				})
				.start();
		}
	}

	onCollectFruits() {
		if (this.fruitStackStart.children.length > 20 || this._isCollect) {
			return;
		}
		this._isCollect = true;

		const targetPos = Vec3.add(v3(), v3(),
			v3(0, this.stackStep * this.fruitStackStart.children.length, 0));

		const fruit = this._fruitsPool.get();

		const rigidBody = fruit.getComponentInChildren(RigidBody);
		const collider = fruit.getComponentInChildren(SphereCollider);
		const renderer = fruit.getComponentInChildren(MeshRenderer);
		rigidBody.enabled = false;
		collider.enabled = false;
		renderer.shadowCastingMode = 1;
		fruit.parent = this.fruitStackStart;
		fruit.scale.set(0, 0, 0);

		fruit.setPosition(targetPos);

		tween(fruit)
			.to(.1, { scale: new Vec3(1.5, 1.5, 1.5) }, {
				easing: 'sineOut',
			})
			.call(() => {
				this._isCollect = false;
			})
			.to(0.05, { scale: new Vec3(1.2, 1.2, 1.2) })
			.start();
	}
}
