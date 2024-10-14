import { _decorator, Component, Node, v2, Vec2, Vec3 } from 'cc';

import { gameEventTarget } from 'db://assets/scripts/plugins/GameEventTarget';
import { GameEvent } from 'db://assets/scripts/enums/GameEvent';
const { ccclass, property } = _decorator;

@ccclass('Borders')
export class Borders extends Component {
    private _borderLines: any[] = [];

    onEnable() {
        for (let i = 0; i < this.node.children.length - 1; i++) {
            const startPos3d = this.node.children[i].worldPosition;
            const endPos3d = this.node.children[i + 1].worldPosition;

            const borderLine = {
                startPos: v2(startPos3d.x, startPos3d.z),
                endPos: v2(endPos3d.x, endPos3d.z)
            };
            this._borderLines.push(borderLine);
        }
        const firstPos3d = this.node.children[0].worldPosition;
        const lastPos3d = this.node.children[this.node.children.length - 1].worldPosition;
        const closeBorder = {
            startPos: v2(firstPos3d.x, firstPos3d.z),
            endPos: v2(lastPos3d.x, lastPos3d.z)
        }
        this._borderLines.push(closeBorder);

        this._subscribeEvents(true);
    }

    onDisable() {
        this._subscribeEvents(false);
    }

    update(deltaTime: number) {

    }

    private _subscribeEvents(isOn: boolean): void {
        const func: string = isOn? 'on': 'off';

        gameEventTarget[func](GameEvent.CORRECT_VELOCITY, this.onCorrectVelocity, this);
    }

    onCorrectVelocity(pos3d: Vec3, radius: number, velocity: Vec3, callback: Function) {
        let corrVelocity3d = velocity;
        let corrVelocity = v2(velocity.x, velocity.z);
        const pos = v2(pos3d.x, pos3d.z);

        for (let i = 0; i < this._borderLines.length; i++) {

            const borderLine = this._borderLines[i];

            const centNewPos = v2();
            centNewPos.add(pos).add(corrVelocity).subtract(borderLine.startPos);
            const centOldPos = v2();
            centOldPos.add(pos).subtract(borderLine.startPos);
            const centEnd = v2();
            centEnd.add(borderLine.endPos).subtract(borderLine.startPos);

            const dir = Vec2.normalize(v2(), centEnd);
            const borderLength = centEnd.length();
            const projLenNew = centNewPos.dot(dir);
            const projLenOld = centOldPos.dot(dir);

            if (projLenNew > 0 && projLenNew < borderLength) {

                const projVecNew = Vec2.multiplyScalar(v2(), dir, projLenNew);
                const tangVecNew = Vec2.subtract(v2(), centNewPos, projVecNew);

                const projVecOld = Vec2.multiplyScalar(v2(), dir, projLenOld);
                const tangVecOld = Vec2.subtract(v2(), centOldPos, projVecOld);

                if (tangVecNew.length() < radius && tangVecNew.length() < tangVecOld.length()) {

                    const velProjLen = corrVelocity.dot(dir);
                    const velProjVec = Vec2.multiplyScalar(v2(), dir, velProjLen);

                    corrVelocity = velProjVec;
                }
            }
        }

        corrVelocity3d.x = corrVelocity.x;
        corrVelocity3d.z = corrVelocity.y;

        callback(corrVelocity3d);
    }
}