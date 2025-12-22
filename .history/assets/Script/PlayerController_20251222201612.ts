import { _decorator, Component, Input, input, EventKeyboard, KeyCode, RigidBody2D, Vec2, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PlayerController')
export class PlayerController extends Component {

    @property
    moveSpeed: number = 5; 

    @property
    pickupRange: number = 100;

    // 内部私有变量，初始化为向右
    private _stackX: number[] = [];
    private _stackY: number[] = [];
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
        const x = this._stackX.length > 0 ? this._stackX[this._stackX.length - 1] : 0;
        const y = this._stackY.length > 0 ? this._stackY[this._stackY.length - 1] : 0;

        if (x !== 0 || y !== 0) {
            // 2. 核心：归一化 (Normalize)
            // 解决斜向移动速度变为 1.41 倍的问题，并统一 8 方向向量长度为 1
            const moveDir = new Vec3(x, y, 0).normalize();

            // 3. 更新速度
            const velocity = moveDir.clone().multiplyScalar(this.moveSpeed);
            this._rigidbody.linearVelocity = new Vec2(velocity.x, velocity.y);

            // 4. 更新朝向 (此时 currentFacingDir 必定是 8 个方向之一)
            this._currentFacingDir.set(moveDir);

            // 5. 视觉翻转
            if (x < 0) this.node.setScale(-1, 1, 1);
            else if (x > 0) this.node.setScale(1, 1, 1);

        } else {
            // 停止移动，但保留最后一次移动的朝向
            return this._currentFacingDir.clone();
        }
    }

    onKeyDown(event: EventKeyboard) {
        switch (event.keyCode) {
            case KeyCode.KEY_W: this.pushInput(this._stackY, 1); break;
            case KeyCode.KEY_S: this.pushInput(this._stackY, -1); break;
            case KeyCode.KEY_A: this.pushInput(this._stackX, -1); break;
            case KeyCode.KEY_D: this.pushInput(this._stackX, 1); break;
        }
    }

    onKeyUp(event: EventKeyboard) {
        switch (event.keyCode) {
            case KeyCode.KEY_W: this.removeInput(this._stackY, 1); break;
            case KeyCode.KEY_S: this.removeInput(this._stackY, -1); break;
            case KeyCode.KEY_A: this.removeInput(this._stackX, -1); break;
            case KeyCode.KEY_D: this.removeInput(this._stackX, 1); break;
        }
    }

    private pushInput(stack: number[], value: number) {
        const index = stack.indexOf(value);
        if (index !== -1) stack.splice(index, 1);
        stack.push(value);
    }

    private removeInput(stack: number[], value: number) {
        const index = stack.indexOf(value);
        if (index !== -1) stack.splice(index, 1);
    }

    public get currentFacingDir(): Vec3 {
        // 返回克隆对象，防止外部修改返回值时影响到内部变量
        return this._currentFacingDir.clone();
    }
}