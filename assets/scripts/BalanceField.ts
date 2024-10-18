import {_decorator, Component, Node, SpriteFrame, SpriteRenderer, UIOpacity} from 'cc';

const {ccclass, property} = _decorator;

@ccclass('BalanceField')
export class BalanceField extends Component {
    @property([SpriteFrame])
    numberFrames: SpriteFrame[] = [];

    @property(SpriteRenderer)
    sprite1: SpriteRenderer;

    @property(SpriteRenderer)
    sprite10: SpriteRenderer;

    @property(SpriteRenderer)
    sprite100: SpriteRenderer;

    private _currentNumber: number = 0;

    updateNumber(newNumber: number) {
        this._currentNumber = newNumber;
        this.updateSpritesVisibility();
        this.updateDigits();
        this.updatePosition();
    }

    updateSpritesVisibility() {
        this.setActive(this.sprite10, this._currentNumber > 9);
        this.setActive(this.sprite100, this._currentNumber > 99);
    }

    updateDigits() {
        const firstDigit = this._currentNumber % 10;
        this.sprite1.spriteFrame = this.numberFrames[firstDigit];

        if (this._currentNumber > 9) {
            const secondDigit = Math.floor((this._currentNumber % 100) / 10);
            this.sprite10.spriteFrame = this.numberFrames[secondDigit];
        }

        if (this._currentNumber > 99) {
            const thirdDigit = Math.floor((this._currentNumber % 1000) / 100);
            this.sprite100.spriteFrame = this.numberFrames[thirdDigit];
        }
    }

    setActive(sprite: SpriteRenderer, isActive: boolean) {
        if (sprite) {
            sprite.node.active = isActive;
        }
    }

    updatePosition() {
        if (this._currentNumber <= 9) {
            const secondDigit = Math.floor((this._currentNumber % 100) / 10);
            this.sprite1.node.setPosition(0, 0 ,0);
        } else if (this._currentNumber > 9 && this._currentNumber <= 99) {
            this.sprite1.node.setPosition(0.8, 0 ,0);
            this.sprite10.node.setPosition(-0.45, 0 ,0);
        } else if (this._currentNumber > 99) {
            this.sprite1.node.setPosition(1.25, 0 ,0);
            this.sprite10.node.setPosition(0, 0 ,0);
            this.sprite100.node.setPosition(-1.25, 0 ,0);
        }
    }

    getCurrentNumber(): number {
        return this._currentNumber;
    }
}