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

        const x = (this._right ? 1 : 0) - (this._left ? 1 : 0);
        const y = (this._up ? 1 : 0) - (this._down ? 1 : 0);

        if (x !== 0 || y !== 0) {
            const moveDir = new Vec3(x, y, 0).normalize();

            const velocity = moveDir.clone().multiplyScalar(this.moveSpeed);
            this._rigidbody.linearVelocity = new Vec2(velocity.x, velocity.y);

            // 更新朝向
            this._currentFacingDir.set(moveDir);

            // --- 调试 LOG ---
            // console.log(`Input:(${x},${y}) | Facing:(${this._currentFacingDir.x.toFixed(2)}, ${this._currentFacingDir.y.toFixed(2)})`);

            if (x < 0) this.node.setScale(-1, 1, 1);
            else if (x > 0) this.node.setScale(1, 1, 1);

        } else {
            this._rigidbody.linearVelocity = new Vec2(0, 0);
        }

        // --- 视觉调试：在编辑器 Scene 窗口画一根红线显示朝向 ---
        // 需要在顶部 import { geometry } from 'cc'; 并确保开启了物理调试或 gizmos
        // 这里提供一个简单的坐标转换逻辑检查
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