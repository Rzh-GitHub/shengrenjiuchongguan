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

    }

    onDestroy() {
 
    }

    update(deltaTime: number) {
        if (!this._rigidbody) return;

        const x = (this._right ? 1 : 0) - (this._left ? 1 : 0);
        const y = (this._up ? 1 : 0) - (this._down ? 1 : 0);

        if (x !== 0 || y !== 0) {
            // 1. 计算当前移动方向并归一化
            const moveDir = new Vec3(x, y, 0).normalize();

            // 2. 更新刚体速度
            const velocity = moveDir.clone().multiplyScalar(this.moveSpeed);
            this._rigidbody.linearVelocity = new Vec2(velocity.x, velocity.y);

            // 3. 更新内部记录的朝向
            this._currentFacingDir.set(moveDir);

            // 4. 处理美术表现（翻转节点）
            if (x < 0) this.node.setScale(-1, 1, 1);
            else if (x > 0) this.node.setScale(1, 1, 1);

        } else {
            // 停止时速度归零，但 _currentFacingDir 保持最后一次的值
            this._rigidbody.linearVelocity = new Vec2(0, 0);
        }
    }

    public get currentFacingDir(): Vec3 {
        // 返回克隆对象，防止外部修改返回值时影响到内部变量
        return this._currentFacingDir.clone();
    }
}