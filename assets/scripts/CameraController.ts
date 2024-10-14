import { _decorator, Component, Node, tween, v3, Vec2, Vec3, view } from 'cc';

import { gameEventTarget } from 'db://assets/scripts/plugins/GameEventTarget';
import { GameEvent } from 'db://assets/scripts/enums/GameEvent';
const { ccclass, property } = _decorator;


@ccclass('CameraSetup')
class CameraSetup {
	@property(Node)
	target: Node;

	@property
	followDistanceP: number = 10;
	@property
	followDistanceL: number = 10;
	@property
	thetaDeg: number = 0;
	@property
	phiDeg: number = 0;
}

@ccclass('CameraController')
export class CameraController extends Component {
	@property(Node)
	targetProxy: Node;

	@property([CameraSetup])
	cameraSetups: CameraSetup[] = [];

	@property
	shakeMagnitude: number = 3;

	private _cTarget: Node;
	private _cSetupIndex: number = 0;
	private _cDist: number = 0;
	private _cTheta: number = 0;
	private _cPhi: number = 0;
	private _cShakeAngle: number = 0;

	onEnable() {
		this._subscribeEvents(true);
	}

	onDisable() {
		this._subscribeEvents(false);
	}

	start() {
		this._updateCurrentParameters();
		this._positionCamera();
	}

	update(deltaTime: number) {
		if (this._cTarget) {
			const delta = Vec3.subtract(v3(), this._cTarget.worldPosition,
				this.targetProxy.worldPosition);
			delta.multiplyScalar(.1);
			this.targetProxy.worldPosition.add(delta);

			this._positionCamera();
		}
	}

	private _subscribeEvents(isOn: boolean): void {
		const func: string = isOn? 'on': 'off';

		view[func]('canvas-resize', this.onCanvasResize, this);
		gameEventTarget[func](GameEvent.CAMERA_TRANSITION, this.onCameraTransition, this);
	}

	private _positionCamera() {
		const targetPos = this.targetProxy.worldPosition;

		const x = targetPos.x + this._cDist * Math.sin(this._cTheta) * Math.sin(this._cPhi);
		const y = targetPos.y + this._cDist * Math.cos(this._cTheta);
		const z = targetPos.z + this._cDist * Math.sin(this._cTheta) * Math.cos(this._cPhi);

		const xAngle = this._cTheta * 180 / Math.PI - 90 + this._cShakeAngle;
		const yAngle = this._cPhi * 180 / Math.PI;

		this.node.setWorldPosition(v3(x, y, z));
		this.node.eulerAngles = new Vec3(xAngle, yAngle, 0);
	}

	private _updateCurrentParameters() {
		const isLand = view.getVisibleSize().width > view.getVisibleSize().height;
        const cSetup = this.cameraSetups[this._cSetupIndex];
        
        this._cTarget = cSetup.target;
        this._cDist = isLand? cSetup.followDistanceL: cSetup.followDistanceP;
        this._cTheta = cSetup.thetaDeg / 180 * Math.PI;
        this._cPhi = cSetup.phiDeg / 180 * Math.PI;

        const targetPos = this._cTarget.worldPosition;
        this.targetProxy.setWorldPosition(targetPos);
	}

	onCanvasResize() {
		this._updateCurrentParameters();
	}

	onCameraTransition(setupIndex: number, time: number = .5) {
		const newSetup = this.cameraSetups[setupIndex];
		const currSetup = this.cameraSetups[this._cSetupIndex];
		this._cTarget = newSetup.target;
		const isLand = view.getVisibleSize().width > view.getVisibleSize().height;

		this._cSetupIndex = setupIndex;

		const t = {value: 0};
		tween(t)
			.to(time, {value: 1}, {
				onUpdate: () => {
					this._cDist = isLand? newSetup.followDistanceL * t.value + currSetup.followDistanceL * (1 - t.value):
						newSetup.followDistanceP * t.value + currSetup.followDistanceP * (1 - t.value);
					this._cTheta = (newSetup.thetaDeg * t.value + currSetup.thetaDeg * (1 - t.value)) / 180 * Math.PI;
					this._cPhi = (newSetup.phiDeg * t.value + currSetup.phiDeg * (1 - t.value)) / 180 * Math.PI;
				}
			})
			.start();
	}
}


