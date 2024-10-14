import { _decorator, Component, Enum, EventTouch, Input, Node, Vec2 } from 'cc';

import { gameEventTarget } from 'db://assets/scripts/plugins/GameEventTarget';
import { GameEvent } from 'db://assets/scripts/enums/GameEvent';
import { InteractionType } from 'db://assets/scripts/enums/InteractionType';
import { CommandDict } from 'db://assets/scripts/input/CommandDict';

const { ccclass, property } = _decorator;


@ccclass('InteractionCommandPair')
class InteractionCommandPair {
	@property({
		type: Enum(InteractionType),
	})
	interactionType = InteractionType.None;

	@property
	commandName = '';
}

@ccclass('CustomField')
class CustomField {
	@property
	key: string = '';

	@property
	value: string = '';
}

@ccclass('ScreenButton')
export class ScreenButton extends Component {
	@property({
		type: [InteractionCommandPair],
	})
	interCommandPairs: InteractionCommandPair[] = [];

	@property({
		type: [CustomField],
	})
	customFields: CustomField[] = [];

	@property
	buttonName = '';

	@property({
		visible: false,
	})
	touchStartPos: Vec2 = null;

	@property({
		visible: false,
	})
	touchCurrPos: Vec2 = null;

	touchEndPos: Vec2 = null;

	commandMap: Map<InteractionType, Function> = new Map();
	statusMap: Map<InteractionType, boolean> = new Map();
	private _customFields;
	private _isRedirectOnAllscreen = false;

	onEnable() {
		this.interCommandPairs.forEach(interCommandPair => {
			const command = CommandDict[interCommandPair.commandName];
			this.commandMap.set(interCommandPair.interactionType, command);
		});

		this._customFields = {};
		this.customFields.forEach(field => this._customFields[field.key] = field.value);

		gameEventTarget.emit(GameEvent.REGISTER_BUTTON, this);

		this._subscribeEvents(true);
	}

	onDisable() {
		this._subscribeEvents(true);

		gameEventTarget.emit(GameEvent.UNREGISTER_BUTTON, this);
	}

	private _subscribeEvents(isOn: boolean) {
		const func = isOn ? 'on' : 'off';

		this.node[func](Input.EventType.TOUCH_START, this.onTouchStart, this);
		this.node[func](Input.EventType.TOUCH_END, this.onTouchEnd, this);
		this.node[func](Input.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
		this.node[func](Input.EventType.TOUCH_MOVE, this.onTouchMove, this);

		gameEventTarget[func](GameEvent.TOGGLE_ALLSCREEN, this.onToggleAllscreen, this);
	}

	getCustomFields() {
		return this._customFields;
	}

	onTouchStart(event: EventTouch) {
		if (this._isRedirectOnAllscreen) {
			gameEventTarget.emit(GameEvent.REDIRECT_PROCESSING);
			return;
		}

		this.statusMap.set(InteractionType.Down, true);

		this.touchStartPos = event.getLocation();
		this.touchCurrPos = event.getLocation();
		this.touchEndPos = null;
	}

	onTouchEnd(event: EventTouch) {
		this.statusMap.set(InteractionType.Up, true);

		this.touchEndPos = this.touchCurrPos;

		this.touchStartPos = null;
		this.touchCurrPos = null;
	}

	onTouchCancel(event: EventTouch) {
		this.statusMap.set(InteractionType.Cancel, true);

		this.touchStartPos = null;
		this.touchCurrPos = null;
	}

	onTouchMove(event: EventTouch) {
		if (this._isRedirectOnAllscreen) {
			return;
		}

		this.statusMap.set(InteractionType.Move, true);

		this.touchCurrPos = event.getLocation();
	}

	onToggleAllscreen() {
		this._isRedirectOnAllscreen = true;
	}
}