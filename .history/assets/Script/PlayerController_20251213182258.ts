import { _decorator, Component, Input, input, EventKeyboard, KeyCode, RigidBody2D, Vec2, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PlayerController')
export class PlayerController extends Component {

    @property
    moveSpeed: number = 5; // 可以在编辑器里调整速度

    private _rigidbody: RigidBody2D | null = null;
    private _moveDir: Vec3 = new Vec3(0, 0, 0);

    start() {
        // 获取刚体组件，稍后用来移动
        this._rigidbody = this.getComponent(RigidBody2D);

        // 监听键盘按下和抬起
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    onDestroy() {
        // 记得销毁时取消监听，这是好习惯
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    update(deltaTime: number) {
        if (this._rigidbody) {
            // 归一化方向（防止斜着走变快）并乘以速度
            const velocity = this._moveDir.clone().normalize().multiplyScalar(this.moveSpeed);
            // 设置刚体的线性速度
            this._rigidbody.linearVelocity = new Vec2(velocity.x, velocity.y);
        }
    }

    onKeyDown(event: EventKeyboard) {
        switch(event.keyCode) {
            case KeyCode.KEY_W: this._moveDir.y = 1; break;
            case KeyCode.KEY_S: this._moveDir.y = -1; break;
            case KeyCode.KEY_A: this._moveDir.x = -1; break;
            case KeyCode.KEY_D: this._moveDir.x = 1; break;
        }
    }

    onKeyUp(event: EventKeyboard) {
        switch(event.keyCode) {
            case KeyCode.KEY_W: if(this._moveDir.y === 1) this._moveDir.y = 0; break;
            case KeyCode.KEY_S: if(this._moveDir.y === -1) this._moveDir.y = 0; break;
            case KeyCode.KEY_A: if(this._moveDir.x === -1) this._moveDir.x = 0; break;
            case KeyCode.KEY_D: if(this._moveDir.x === 1) this._moveDir.x = 0; break;
        }
    }
}