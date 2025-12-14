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
        if (!this._rigidbody) return;

        // 1. 处理移动
        // 如果有按键输入，_moveDir 会有值 (例如 1,0 或 1,1)
        if (this._moveDir.x !== 0 || this._moveDir.y !== 0) {
            
            // 归一化方向向量 (解决斜着走速度变快的问题)
            const normalizedDir = this._moveDir.clone().normalize();
            
            // 设置刚体速度
            const velocity = normalizedDir.multiplyScalar(this.moveSpeed);
            this._rigidbody.linearVelocity = new Vec2(velocity.x, velocity.y);

            // 2. 更新朝向 (核心修改)
            // 只要玩家在动，我们就更新 facingDir
            this.facingDir = normalizedDir.clone(); 
            // 注意：因为上面 multiplyScalar 修改了 normalizedDir，这里最好重新 clone 或者使用未修改前的

            // 修正：更稳健的写法
            // 我们重新归一化一次 _moveDir 给 facingDir 用，确保它是标准单位向量
            this.facingDir = this._moveDir.clone().normalize();

            // 3. 处理视觉翻转 (依然只做左右翻转，保持 2D 风格)
            // 如果你以后有 8 方向的动画，可以在这里切换动画状态机
            if (this._moveDir.x < 0) {
                this.node.setScale(-1, 1, 1);
            } else if (this._moveDir.x > 0) {
                this.node.setScale(1, 1, 1);
            }
        } else {
            // 没有按键输入，停止移动
            this._rigidbody.linearVelocity = new Vec2(0, 0);
            
            // ⚠️ 关键点：不要重置 facingDir！
            // 让它保持“最后一次移动的方向”。
            // 比如你向左上角走，然后松手，facingDir 依然是 (-0.7, 0.7, 0)
            // 飞刀就会继续向左上角飞。
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