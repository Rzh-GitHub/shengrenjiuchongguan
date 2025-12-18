import { _decorator, Component, Input, input, EventKeyboard, KeyCode, RigidBody2D, Vec2, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PlayerController')
export class PlayerController extends Component {

    @property
    moveSpeed: number = 10; 

    @property
    pickupRange: number = 100;

    // 内部私有变量，初始化为向右
    private _currentFacingDir: Vec3 = new Vec3(1, 0, 0);

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

        // 1. 提取 8 方向输入
        const x = (this._right ? 1 : 0) - (this._left ? 1 : 0);
        const y = (this._up ? 1 : 0) - (this._down ? 1 : 0);

        if (x !== 0 || y !== 0) {
            // 2. 核心：归一化 (Normalize)
            // 解决斜向移动速度变为 1.41 倍的问题，并统一 8 方向向量长度为 1
            const moveDir = new Vec3(x, y, 0).normalize();

            // 3. 更新速度
            const velocity = moveDir.clone().multiplyScalar(this.moveSpeed);
            this._rigidbody.linearVelocity = new Vec2(velocity.x, velocity.y);

            // 4. 更新朝向 (此时 currentFacingDir 必定是 8 个方向之一)
            this._currentFacingDir.set(moveDir);

            // 【调试 LOG】
            console.log(`移动方向: ${this.getDirectionName(x, y)} | 向量: ${moveDir.toString()}`);

            // 5. 视觉翻转
            if (x < 0) this.node.setScale(-1, 1, 1);
            else if (x > 0) this.node.setScale(1, 1, 1);

        } else {
            // 停止移动，但保留最后一次移动的朝向
            this._rigidbody.linearVelocity = new Vec2(0, 0);
        }
    }

    // 辅助调试方法：识别当前是哪个方向
    private getDirectionName(x: number, y: number): string {
        if (x > 0 && y === 0) return "右";
        if (x > 0 && y > 0)  return "右上";
        if (x === 0 && y > 0) return "上";
        if (x < 0 && y > 0)  return "左上";
        if (x < 0 && y === 0) return "左";
        if (x < 0 && y < 0)  return "左下";
        if (x === 0 && y < 0) return "下";
        if (x > 0 && y < 0)  return "右下";
        return "未知";
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

    public get currentFacingDir(): Vec3 {
        // 返回克隆对象，防止外部修改返回值时影响到内部变量
        return this._currentFacingDir.clone();
    }
}