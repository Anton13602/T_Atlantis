import { _decorator, Component, Node } from 'cc';

import { ScreenButton } from 'db://assets/scripts/input/ScreenButton';
import { gameEventTarget } from 'db://assets/scripts/plugins/GameEventTarget';
import { InteractionType } from 'db://assets/scripts/enums/InteractionType';
import { GameEvent } from 'db://assets/scripts/enums/GameEvent';

const { ccclass, property } = _decorator;

@ccclass('InputSystem')
export class InputSystem extends Component {

    _idInterArray: Array<string> = [];
    _idInterButtonMap: Map<string, ScreenButton> = new Map();
    _idInterCommandMap: Map<string, Function> = new Map();

    onEnable() {
        this._subscribeEvents(true);
    }

    onDisable() {
        this._subscribeEvents(false);
    }

    update(deltaTime: number) {
        let hasInput = false;

        this._idInterArray.forEach(idInter => {

            const button = this._idInterButtonMap.get(idInter);
            const command = this._idInterCommandMap.get(idInter);

            const interaction = idInter.split('|')[1];
            const interType = InteractionType[interaction];

            if (button.statusMap.get(interType)) {
                button.statusMap.set(interType, false);
                command(button);
                hasInput = true;
            }
        });
    }

    private _subscribeEvents(isOn: boolean) {
        const func = isOn ? 'on' : 'off';

        gameEventTarget[func](GameEvent.REGISTER_BUTTON, this.onRegisterButton, this);
        gameEventTarget[func](GameEvent.UNREGISTER_BUTTON, this.onUnregisterButton, this);
    }

    onRegisterButton(button: ScreenButton) {
        const id = button.buttonName;

        for (const interaction in InteractionType) {
            const command = button.commandMap.get(Number(InteractionType[interaction]));
            if (command) {
                const idInter = id + '|' + interaction;
                this._idInterArray.push(idInter);
                this._idInterButtonMap.set(idInter, button);
                this._idInterCommandMap.set(idInter, command);
            }
        }
    }

    onUnregisterButton(button: ScreenButton) {
        const id = button.buttonName;

        for (const interaction in InteractionType) {
            const command = button.commandMap.get(Number(InteractionType[interaction]));
            if (command) {
                const idInter = id + '|' + interaction;
                this._idInterArray = this._idInterArray.filter(idI => idI !== idInter);
                this._idInterButtonMap.delete(idInter);
                this._idInterCommandMap.delete(idInter);
            }
        }
    }
}
