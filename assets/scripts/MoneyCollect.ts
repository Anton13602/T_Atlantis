import {
	_decorator,
	Component,
	Node,
	v3,
	tween,
	Vec3,
	Prefab,
	instantiate,
} from 'cc';

import { gameEventTarget } from 'db://assets/scripts/plugins/GameEventTarget';
import { GameEvent } from 'db://assets/scripts/enums/GameEvent';

const { ccclass, property } = _decorator;

@ccclass('MoneyCollect')
export class FruitsCollect extends Component {
	@property(Node)
	moneyStackStart: Node = null;

	@property(Prefab)
	moneyPrefab: Prefab = null;

	@property
	stackStep: number = .2;

	private _array: Node[] = [];

	onEnable() {
		this._subscribeEvents(true);
	}

	onDisable() {
		this._subscribeEvents(false);
	}

	private _subscribeEvents(isOn: boolean) {
		const func = isOn ? 'on' : 'off';

		gameEventTarget[func](GameEvent.COLLECT_MONEY, this.onCollectMoney, this);
		gameEventTarget[func](GameEvent.SPEND_MONEY, this.onSpendMoney, this);
	}

	onCollectMoney(wPos: Vec3, cb?: () => void) {
		const count = 5;

		const parent = this.moneyStackStart;
		gameEventTarget.emit(GameEvent.ADD_BALANCE, 25);
		for (let i = 0; i < count; i++) {
			const money = instantiate(this.moneyPrefab);
			const targetPos = Vec3.add(v3(), v3(),
				v3(0, this.stackStep * this._array.length, 0));

			tween(money)
				.delay(i * 0.1)
				.to(0.001, {}, {
					onStart() {
						money.setPosition(wPos);
						money.setParent(parent, true);
					},
				})
				.to(0.1, { position: targetPos, eulerAngles: new Vec3(0, 90, 0) }, {
					easing: 'sineOut',
				})
				.by(0.05, { scale: new Vec3(0.1, 0.1, 0.1) }, {
					easing: 'sineIn',
				})
				.by(0.05, { scale: new Vec3(-0.1, -0.1, -0.1) }, {
					easing: 'sineOut',
				})
				.call(() => {
					i === count - 1 && cb?.();
				})
				.start();

			this._array.push(money);
		}
	}

	onSpendMoney(field: Node, cost: number) {
		let cBalance = this._array.length * 5;

		if (cBalance > cost) {
			cBalance = cost;
		}

		const count = Math.ceil(cBalance * 40 / 200);

		gameEventTarget.emit(GameEvent.ADD_BALANCE, -cBalance, count * 0.05, () => {
			gameEventTarget.emit(GameEvent.UPDATE_CURRENT_COST, cost - cBalance);
		});

		this._array.sort((a, b) => a.position.y - b.position.y);
		for (let i = 0; i < count; i++) {
			const last = this._array.pop();

			const xRotateCoeff = Math.random();
			const zRotateCoeff = Math.random();


			tween(last)
				.delay(i * 0.05)
				.to(0.001, {}, {
					onStart() {
						last.setParent(field, true);
					},
				})
				.to(0.5, {
					position: new Vec3(),
				}, {
					easing: 'sineInOut',
					onUpdate: (target: Node, ratio: number) => {
						const y = Math.sin(ratio * Math.PI);

						target.children[0].eulerAngles = v3(360 * ratio * xRotateCoeff, 0, 180 * ratio * zRotateCoeff);
						target.children[0].position = v3(0, y * 2, 0);
					},
				})
				.call(() => {
					field.removeChild(last);
				})
				.start();
		}
	}
}
