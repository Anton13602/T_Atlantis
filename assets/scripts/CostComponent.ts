import { _decorator, Component, Node } from 'cc';
import { gameEventTarget } from 'db://assets/scripts/plugins/GameEventTarget';
import { GameEvent } from 'db://assets/scripts/enums/GameEvent';
import { BalanceField } from 'db://assets/scripts/BalanceField';

const { ccclass, property } = _decorator;

@ccclass('CostComponent')
export class CostComponent extends Component {
	@property(BalanceField)
	balance: BalanceField = null;

	@property
	cost: number = 200;

	private _isActive: boolean = false;

	onEnable() {
		this._subscribeEvents(true);
		this.balance.updateNumber(this.cost);
	}

	onDisable() {
		this._subscribeEvents(false);
	}

	private _subscribeEvents(isOn: boolean) {
		const func = isOn ? 'on' : 'off';

		gameEventTarget[func](GameEvent.UPDATE_CURRENT_COST, this.onUpdateCurrentCost, this);
	}

	onUpdateCurrentCost(num: number) {
		this.cost = num;
		this.balance.updateNumber(this.cost);
	}

	update(deltaTime: number) {

		if (this.cost <= 0 && !this._isActive) {

			this.scheduleOnce(() => {
				this.node.active = false;
				gameEventTarget.emit(GameEvent.SHOW_WATERMELON);
				gameEventTarget.emit(GameEvent.TOGGLE_ALLSCREEN);
			}, 0.5);
			this._isActive = true;
		}
	}
}
