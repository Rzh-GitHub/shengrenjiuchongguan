import { _decorator, Component, Input, input, EventKeyboard, KeyCode, RigidBody2D, Vec2, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PlayerController')
export class PlayerController extends Component {

    @property
    moveSpeed: number = 10; 

    @property
    pickupRange: number = 100;

    private _rigidbody: RigidBody2D | null = null;
    
    // 移除旧的 _moveDir，改用实时计算
    // private _moveDir: Vec3 = new Vec3(0, 0, 0); 
    
    // ✅ 新增：使用 4 个开关记录按键状态
    private _up: boolean = false;
    private _down: boolean = false;
    private _left: boolean = false;
    private _right: boolean = false;

    public facingDir: Vec3 = new Vec3(1, 0, 0); // 默认朝右

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

        // 1. 实时计算移动方向
        // x = 右(1) - 左(1)
        // y = 上(1) - 下(1)
        const dirX = (this._right ? 1 : 0) - (this._left ? 1 : 0);
        const dirY = (this._up ? 1 : 0) - (this._down ? 1 : 0);

        // 如果有移动输入
        if (dirX !== 0 || dirY !== 0) {
            
            // 创建方向向量并归一化
            const moveDir = new Vec3(dirX, dirY, 0).normalize();
            
            // 设置速度
            const velocity = moveDir.clone().multiplyScalar(this.moveSpeed);
            this._rigidbody.linearVelocity = new Vec2(velocity.x, velocity.y);

            // 2. 更新朝向
            // 记录当前的标准化方向
            this.facingDir = moveDir.clone();

            // 3. 视觉翻转 (Left/Right)
            if (dirX < 0) {
                this.node.setScale(-1, 1, 1);
            } else if (dirX > 0) {
                this.node.setScale(1, 1, 1);
            }
        } else {
            // 停止移动
            this._rigidbody.linearVelocity = new Vec2(0, 0);
            
            // ⚠️ 保持 facingDir 不变，记住最后一次的方向
        }
    }

    onKeyDown(event: EventKeyboard) {
        switch(event.keyCode) {
            case KeyCode.KEY_W: this._up = true; break;
            case KeyCode.KEY_S: this._down = true; break;
            case KeyCode.KEY_A: this._left = true; break;
            case KeyCode.KEY_D: this._right = true; break;
        }
    }

    onKeyUp(event: EventKeyboard) {
        switch(event.keyCode) {
            case KeyCode.KEY_W: this._up = false; break;
            case KeyCode.KEY_S: this._down = false; break;
            case KeyCode.KEY_A: this._left = false; break;
            case KeyCode.KEY_D: this._right = false; break;
        }
    }
}