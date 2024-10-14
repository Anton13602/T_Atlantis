import { _decorator, Component, Node, UIOpacity } from 'cc';

import { gameEventTarget } from 'db://assets/scripts/plugins/GameEventTarget';
import { GameEvent } from 'db://assets/scripts/enums/GameEvent';

const { ccclass, property } = _decorator;

@ccclass('Tutor')
export class Tutor extends Component {
    @property
    inactiveTutor: number = 3;

    private _timeInactive: number = 0;
    private _isActive: boolean = true;

    onEnable() {
        this._subscribeEvents(true);
    }

    onDisable() {
        this._subscribeEvents(false);
    }

    update(deltaTime: number) {
        if (!this._isActive) {
            this._timeInactive += deltaTime;
            if (this._timeInactive >= this.inactiveTutor) {
                this._isActive = true;
                this.getComponent(UIOpacity).opacity = 255;
            }
        }
    }

    private _subscribeEvents(isOn: boolean): void {
        const func: string = isOn? 'on': 'off';

        gameEventTarget[func](GameEvent.INPUT_MOVE, this.onInputMove, this);
    }

    onInputMove() {
        if (this._isActive) {
            this.getComponent(UIOpacity).opacity = 0;
            this._isActive = false;
        }
        this._timeInactive = 0;
    }
}