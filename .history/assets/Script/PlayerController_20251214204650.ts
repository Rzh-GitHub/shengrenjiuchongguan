import { _decorator, Component, Input, input, EventKeyboard, KeyCode, RigidBody2D, Vec2, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PlayerController')
export class PlayerController extends Component {

    @property
    moveSpeed: number = 10; 

    private _rigidbody: RigidBody2D | null = null;
    private _moveDir: Vec3 = new Vec3(0, 0, 0);
    
    @property
    pickupRange: number = 100;

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

            // 2. 朝向逻辑 (新增)
            // 如果向左走 (x < 0)
            if (this._moveDir.x < 0) {
                this.node.setScale(-1, 1, 1);
            } 
            // 如果向右走 (x > 0)
            else if (this._moveDir.x > 0) {
                this.node.setScale(1, 1, 1);
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