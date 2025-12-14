import { _decorator, Component, Node, Input, input, EventKeyboard, KeyCode, Vec2, RigidBody2D, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PlayerController')
export class PlayerController extends Component {

    @property
    moveSpeed: number = 5; // 玩家移动速度

    private _inputDirection: Vec3 = new Vec3(0, 0, 0);
    private _rigidbody: RigidBody2D | null = null;

    start() {
        this._rigidbody = this.getComponent(RigidBody2D);
        
        // 注册键盘事件
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    onDestroy() {
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    update(deltaTime: number) {
        if (this._inputDirection.length() > 0) {
            // 归一化向量，防止斜向移动过快
            const dir = this._inputDirection.clone().normalize();
            // 计算位移
            const velocity = dir.multiplyScalar(this.moveSpeed);
            
            // 使用线性速度移动刚体
            if(this._rigidbody) {
                this._rigidbody.linearVelocity = new Vec2(velocity.x, velocity.y);
            }
        } else {
            if(this._rigidbody) this._rigidbody.linearVelocity = new Vec2(0, 0);
        }
    }

    onKeyDown(event: EventKeyboard) {
        switch(event.keyCode) {
            case KeyCode.KEY_W: this._inputDirection.y = 1; break;
            case KeyCode.KEY_S: this._inputDirection.y = -1; break;
            case KeyCode.KEY_A: this._inputDirection.x = -1; break;
            case KeyCode.KEY_D: this._inputDirection.x = 1; break;
        }
    }

    onKeyUp(event: EventKeyboard) {
        switch(event.keyCode) {
            case KeyCode.KEY_W: if(this._inputDirection.y === 1) this._inputDirection.y = 0; break;
            case KeyCode.KEY_S: if(this._inputDirection.y === -1) this._inputDirection.y = 0; break;
            case KeyCode.KEY_A: if(this._inputDirection.x === -1) this._inputDirection.x = 0; break;
            case KeyCode.KEY_D: if(this._inputDirection.x === 1) this._inputDirection.x = 0; break;
        }
    }
}