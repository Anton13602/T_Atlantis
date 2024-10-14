import { _decorator, Component, Node, Label, tween } from 'cc';

import { gameEventTarget } from 'db://assets/scripts/plugins/GameEventTarget';
import { GameEvent } from 'db://assets/scripts/enums/GameEvent';

const { ccclass, property } = _decorator;


@ccclass('Balance')
export class Balance extends Component {
	@property(Label)
	counter: Label = null;

	private _cBalance: number = 0;
	private _targetBalance: number = 0;
	_currentAction;

	onEnable() {
		this._subscribeEvents(true);
	}

	onDisable() {
		this._subscribeEvents(false);
	}

	update(deltaTime: number) {

	}

	private _subscribeEvents(isOn: boolean): void {
		const func: string = isOn ? 'on' : 'off';

		gameEventTarget[func](GameEvent.ADD_BALANCE, this.onAddBalance, this);
	}

	onAddBalance(count = 5, time = 0.5, cb: () => void) {
		const startBalance = this._targetBalance;
		let targetBalance = startBalance + count;


		if (this._currentAction) {
			this._currentAction.destroySelf();
			this._currentAction = null;

			this._cBalance = this._targetBalance;
		}

		if (targetBalance < 0) {
			targetBalance = 0;
		}

		const t = { value: 0 };
		this._currentAction = tween(t)
			.to(time, { value: 1 }, {
				onUpdate: () => {
					const currentBalance = startBalance + t.value * (targetBalance - startBalance);
					this.counter.string = `${Math.ceil(currentBalance)}`;
				},
				onStart: () => this._targetBalance = targetBalance,
			})
			.call(() => {
				this._cBalance = targetBalance;
				cb?.();
			})
			.start();
	}
}