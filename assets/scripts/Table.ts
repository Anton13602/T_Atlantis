import { _decorator, Component, Node, Prefab, tween, Vec3, v3, instantiate, Animation } from 'cc';
import { gameEventTarget } from 'db://assets/scripts/plugins/GameEventTarget';
import { GameEvent } from 'db://assets/scripts/enums/GameEvent';
import { InteractiveAreaPhysic } from 'db://assets/scripts/InteractiveAreaPhysic';


const { ccclass, property } = _decorator;


@ccclass('Table')
export class Table extends Component {
	@property([Prefab])
	customerFruitPrefab: Prefab[] = [];

	@property(Prefab)
	customerMoneyPrefab: Prefab;

	@property(Prefab)
	money: Prefab;

	onEnable() {
		this._subscribeEvents(true);
	}

	onDisable() {
		this._subscribeEvents(false);
	}

	private _subscribeEvents(isOn: boolean) {
		const func = isOn ? 'on' : 'off';
		gameEventTarget[func](GameEvent.IN_PROGRESS_ORDER, this.onProgressOrder, this);
	}

	onProgressOrder(area: InteractiveAreaPhysic, currentOrder: Node, count: number) {
		if (count === 0) {
			return;
		}

		const processOrder = (area: InteractiveAreaPhysic, order: Node, counter: number) => {
			area._isActive = false;

			for (let i = 0; i < counter; i++) {
				const targetPos = Vec3.add(v3(), v3(), v3(0, 0.25 * i + 0.1, 0));
				const node = instantiate(this.customerFruitPrefab[0]);
				node.setPosition(targetPos);
				node.scale.set(0, 0, 0);

				tween(node)
					.delay(i * 0.1)
					.to(0.1, { scale: new Vec3(0.9, 0.9, 0.9) }, {
						easing: 'sineOut',
						onStart: () => order.addChild(node),
					})
					.to(0.05, { scale: new Vec3(0.8, 0.8, 0.8) })
					.call(() => {
						if (i === counter - 1) {
							this.doneOrder(area, order, counter);
						}
					})
					.start();
			}
		};

		processOrder(area, currentOrder, count);
	}

	doneOrder(area: InteractiveAreaPhysic, order: Node, counter: number) {
		const children = order.children.slice().reverse();
		for (let i = 0; i < counter; i++) {
			tween(children[i])
				.delay(i * 0.05 + 1)
				.to(0.08, { scale: new Vec3() }, { easing: 'sineOut' })
				.call(() => {
					if (i === counter - 1) {
						order.removeAllChildren();

						const moneyNode = instantiate(this.customerMoneyPrefab);
						const animationComponent = moneyNode.getComponent(Animation);
						order.addChild(moneyNode);

						animationComponent.play('show_money');
						animationComponent.crossFade('money', 0.2);

						gameEventTarget.emit(GameEvent.COLLECT_MONEY, order.getWorldPosition(), () => {
							animationComponent.play('hide_money');

							area._isActive = true;
						});
					}
				})
				.start();
		}
	}
}
