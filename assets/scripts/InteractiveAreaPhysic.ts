import {
	_decorator,
	Component,
	Node,
	Vec3,
	Enum,
	RigidBody,
	Collider,
	ICollisionEvent,
	ITriggerEvent,
} from 'cc';

import { InteractiveAreaType } from './enums/InteractiveAreaType';
import { gameEventTarget } from 'db://assets/scripts/plugins/GameEventTarget';
import { GameEvent } from 'db://assets/scripts/enums/GameEvent';
import { CostComponent } from 'db://assets/scripts/CostComponent';

const { ccclass, property } = _decorator;

@ccclass('InteractiveAreaPhysic')
export class InteractiveAreaPhysic extends Component {
	@property(Node)
	point: Node = null

	@property({
		type: Enum(InteractiveAreaType),
	})
	areaType: InteractiveAreaType = InteractiveAreaType.None;

	@property(Node)
	rigidBodyNode: Node;

	@property({ type: CostComponent })
	costComponent: CostComponent;

	private _body: RigidBody;
	private _collider: Collider;
	_isActive: boolean = true;

	onEnable() {
		this._body = this.node.getComponent(RigidBody);
		this._collider = this.node.getComponent(Collider);

		this._subscribeEvents(true);
	}

	onDisable() {
		this._subscribeEvents(false);
	}

	update(deltaTime: number) {

	}

	private _subscribeEvents(isOn: boolean): void {
		const func: string = isOn ? 'on' : 'off';

		this._collider[func]('onCollisionEnter', this.onCollisionEnter, this);
		this._collider[func]('onCollisionExit', this.onCollisionExit, this);
		this._collider[func]('onCollisionStay', this.onCollisionStay, this);

		this._collider[func]('onTriggerStay', this.onTriggerStay, this);
		this._collider[func]('onTriggerEnter', this.onTriggerStart, this);
	}

	private onTriggerStay (event: ITriggerEvent) {
		if (this.areaType === InteractiveAreaType.Order && this._isActive) {
			gameEventTarget.emit(GameEvent.EMIT_ORDER, this, this.point, Math.round(3 + (Math.random() * (6 - 3))));
		}
	}

	private onTriggerStart (event: ITriggerEvent) {

		if (this.areaType === InteractiveAreaType.PlantField) {
			gameEventTarget.emit(GameEvent.SPEND_MONEY, this.point, this.costComponent.cost);
		}
	}


	private onCollisionStay(event: ICollisionEvent) {

	}

	private onCollisionEnter(event: ICollisionEvent) {

		gameEventTarget.emit(GameEvent.COLLECT_FRUITS, this);
	}

	onCollisionExit(event: ICollisionEvent) {

	}
}