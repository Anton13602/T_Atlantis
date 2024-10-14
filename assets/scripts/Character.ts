import { _decorator, Component, SkeletalAnimation, Node, v3, Vec2, Vec3 } from 'cc';

import { gameEventTarget } from 'db://assets/scripts/plugins/GameEventTarget';
import { GameEvent } from 'db://assets/scripts/enums/GameEvent';

const { ccclass, property } = _decorator;

@ccclass('Character')
export class Character extends Component {

	@property
	moveSpeed: number = 10;

	@property
	interRadius: number = 3;

	@property(Node)
	moneyNode: Node;

	@property(Node)
	fruitNode: Node;

	private _cVelocity: Vec3 = v3();
	_animation;

	onEnable() {
		this._subscribeEvents(true);

	}

	onDisable() {
		this._subscribeEvents(false);
	}

	start() {
		this._animation = this.node.getComponentInChildren(SkeletalAnimation);
	}

	update(dt: number) {
		if (this._cVelocity.length() > 0) {
			let velocity = Vec3.multiplyScalar(v3(), this._cVelocity, dt);

			gameEventTarget.emit(GameEvent.CORRECT_VELOCITY, this.node.worldPosition,
				this.interRadius, velocity, newVel => velocity = newVel);

			this.node.setWorldPosition(this.node.worldPosition.add(velocity));

			const angle = Math.atan2(this._cVelocity.x, this._cVelocity.z) / Math.PI * 180;
			this.node.eulerAngles = v3(0, angle, 0);
		}
	}

	private _subscribeEvents(isOn: boolean) {
		const func = isOn ? 'on' : 'off';

		gameEventTarget[func](GameEvent.INPUT_MOVE, this.onJoystickMove, this);
		gameEventTarget[func](GameEvent.INPUT_UP, this.onJoystickMoveEnd, this);
	}

	onJoystickMove(cPos: Vec2, delta: Vec2) {
		if (delta.length() > 0) {
			this._cVelocity.x = delta.x * this.moveSpeed / delta.length();
			this._cVelocity.z = -delta.y * this.moveSpeed / delta.length();
			const animationState = this._animation.getState('kate_run');

			if (!animationState.isPlaying) {
				this._animation.crossFade('kate_run', 0.2);
			}
		}
	}

	onJoystickMoveEnd() {
		this._cVelocity = v3();

		this._animation.crossFade('kate_idle', 0.2);
	}
}
