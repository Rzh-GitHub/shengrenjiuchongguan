import { _decorator, Component, Input, input, EventKeyboard, KeyCode, RigidBody2D, Vec2, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

// 定义方向轴枚举，用于逻辑判断
enum Axis {
    Horizontal,
    Vertical
}

@ccclass('PlayerController')
export class PlayerController extends Component {

    @property
    moveSpeed: number = 5;

    // 内部状态：分别维护水平和垂直方向的按键栈
    // 栈顶（数组末尾）永远是当前生效的最新方向
    private _stackX: number[] = [];
    private _stackY: number[] = [];

    private _currentFacingDir: Vec3 = new Vec3(1, 0, 0);
    private _rigidbody: RigidBody2D | null = null;

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

    // 压入输入：如果已存在则先删除再压入，确保它在栈顶（最新）
    private pushInput(stack: number[], value: number) {
        const index = stack.indexOf(value);
        if (index !== -1) stack.splice(index, 1);
        stack.push(value);
    }

    // 移除输入
    private removeInput(stack: number[], value: number) {
        const index = stack.indexOf(value);
        if (index !== -1) stack.splice(index, 1);
    }

    update(deltaTime: number) {
        if (!this._rigidbody) return;

        // 获取栈顶元素作为当前方向，若栈为空则为 0
        const x = this._stackX.length > 0 ? this._stackX[this._stackX.length - 1] : 0;
        const y = this._stackY.length > 0 ? this._stackY[this._stackY.length - 1] : 0;

        if (x !== 0 || y !== 0) {
            const moveDir = new Vec3(x, y, 0).normalize();
            
            // 更新速度
            const velocity = moveDir.clone().multiplyScalar(this.moveSpeed);
            this._rigidbody.linearVelocity = new Vec2(velocity.x, velocity.y);

            // 更新朝向
            this._currentFacingDir.set(moveDir);

            // 视觉翻转（只根据水平输入 x 决定）
            if (x < 0) this.node.setScale(-1, 1, 1);
            else if (x > 0) this.node.setScale(1, 1, 1);
        } else {
            this._rigidbody.linearVelocity = Vec2.ZERO;
        }
    }

    public get currentFacingDir(): Vec3 {
        return this._currentFacingDir.clone();
    }
}