import {_decorator, Component, Node, sys} from 'cc';

import { GameEvent } from 'db://assets/scripts/enums/GameEvent';
import { gameEventTarget } from 'db://assets/scripts/plugins/GameEventTarget';

const {ccclass, property} = _decorator;

@ccclass('Redirector')
export class Redirector extends Component {
    @property
    iOsUrl: string = '';

    @property
    androidUrl: string = '';

    private _currentStoreLink: string = ''

    onLoad() {
        //@ts-ignore
        window.gameReady && window.gameReady();
    }

    onEnable() {
        this._currentStoreLink = /android/i.test(navigator.userAgent) ?
          this.androidUrl : this.iOsUrl;

        this._subscribeEvents(true);
    }

    onDisable() {
        this._subscribeEvents(false);
    }

    private _subscribeEvents(isOn: boolean): void {
        const func = isOn ? 'on' : 'off';

        gameEventTarget[func](GameEvent.REDIRECT_PROCESSING, this.onRedirectProcessing, this);
    }

    onRedirectProcessing() {
        try {
            // @ts-ignore
            window.AdRedirectProcessing();
        } catch (e) {

            if (sys.platform === 'EDITOR_PAGE') {
                alert('REDIRECT')
            } else {
                window[decodeURIComponent('%6c') + 'ocation'].href = this._currentStoreLink;
            }

        }
    }
}