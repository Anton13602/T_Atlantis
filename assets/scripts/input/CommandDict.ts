import { Vec2 } from 'cc';

import { ScreenButton } from 'db://assets/scripts/input/ScreenButton';
import { gameEventTarget } from 'db://assets/scripts/plugins/GameEventTarget';
import { GameEvent } from 'db://assets/scripts/enums/GameEvent';

export const CommandDict = {
    moveStartCommand(button: ScreenButton) {
        gameEventTarget.emit(GameEvent.INPUT_DOWN, button.touchStartPos);
    },

    moveCommand(button: ScreenButton) {
        if (button.touchCurrPos && button.touchStartPos) {
            let delta = new Vec2();
            Vec2.subtract(delta, button.touchCurrPos, button.touchStartPos);

            gameEventTarget.emit(GameEvent.INPUT_MOVE, button.touchCurrPos, delta);
        }
    },

    moveEndCommand(button: ScreenButton) {
        gameEventTarget.emit(GameEvent.INPUT_UP);
    },

    cancelCommand(button: ScreenButton) {
        gameEventTarget.emit(GameEvent.INPUT_UP);
    },
};
