import { _decorator, Component, Input, input, EventKeyboard, KeyCode, RigidBody2D, Vec2, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PlayerController')
export class PlayerController extends Component {

    @property
    moveSpeed: number = 10; 

    @property
    pickupRange: number = 100;

    private _rigidbody: RigidBody2D | null = null;
    private _moveDir: Vec3 = new Vec3(0, 0, 0);
    public facingDir: Vec3 = new Vec3(1, 0, 0);

    start() {
        this._rigidbody = this.getComponent(RigidBody2D);
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    onDestroy() {
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    update(deltaTime: number) {
        if (this._rigidbody) {
            // 1. 移动逻辑
            const velocity = this._moveDir.clone().normalize().multiplyScalar(this.moveSpeed);
            this._rigidbody.linearVelocity = new Vec2(velocity.x, velocity.y);

            // 2. 朝向更新逻辑 (核心修改)
            // 只有当有移动输入时 (x 或 y 不为 0)，才更新朝向
            if (this._moveDir.x !== 0 || this._moveDir.y !== 0) {
                // 更新逻辑朝向 (归一化，保证长度为1)
                this.facingDir = this._moveDir.clone().normalize();

                // 更新视觉朝向 (翻转图片)
                if (this._moveDir.x < 0) {
                    this.node.setScale(-1, 1, 1);
                } else if (this._moveDir.x > 0) {
                    this.node.setScale(1, 1, 1);
                }
            }
            // 如果 x == 0 (垂直移动)，保持原有朝向，不处理
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