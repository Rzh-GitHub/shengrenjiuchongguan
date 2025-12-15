import { _decorator, Component, Input, input, EventKeyboard, KeyCode, RigidBody2D, Vec2, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PlayerController')
export class PlayerController extends Component {

    @property
    moveSpeed: number = 10; 

    @property
    pickupRange: number = 100;

    // ✅ 公开这个变量，给武器用
    // 初始化为 (1, 0, 0) 确保一开始有默认方向，而不是 (0,0,0)
    public currentFacingDir: Vec3 = new Vec3(1, 0, 0);

    private _rigidbody: RigidBody2D | null = null;
    
    // 输入状态开关
    private _up: boolean = false;
    private _down: boolean = false;
    private _left: boolean = false;
    private _right: boolean = false;

    static instance: PlayerController;

        onLoad() {
        PlayerController.instance = this;
    }

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

        // 1. 计算移动输入 (右减左，上减下)
        const x = (this._right ? 1 : 0) - (this._left ? 1 : 0);
        const y = (this._up ? 1 : 0) - (this._down ? 1 : 0);

        if (x !== 0 || y !== 0) {
            // --- 正在移动 ---

            // 归一化输入向量
            const moveDir = new Vec3(x, y, 0).normalize();

            // 1. 更新刚体速度
            const velocity = moveDir.clone().multiplyScalar(this.moveSpeed);
            this._rigidbody.linearVelocity = new Vec2(velocity.x, velocity.y);

            // 2. 更新朝向记录 (这是给飞刀用的)
            this.currentFacingDir = moveDir.clone();

            // 3. 简单的左右翻转 (这是给美术表现用的)
            if (x < 0) this.node.setScale(-1, 1, 1);
            else if (x > 0) this.node.setScale(1, 1, 1);

        } else {
            // --- 停止移动 ---
            this._rigidbody.linearVelocity = new Vec2(0, 0);

            // ⚠️ 关键：这里什么都不做！
            // 不要把 currentFacingDir 重置为 0，让它保留“最后一次移动的方向”
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