import { _decorator, Component, Node, Vec3, RigidBody2D, Vec2 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Enemy')
export class Enemy extends Component {

    @property
    moveSpeed: number = 8; // 现在这个 8 代表物理单位，速度会和玩家的 10 很接近了

    private _player: Node | null = null;
    private _rigidbody: RigidBody2D | null = null; // 新增刚体引用

    start() {
        // 获取刚体
        this._rigidbody = this.getComponent(RigidBody2D);
    }

    public setup(playerNode: Node) {
        this._player = playerNode;
    }

    update(deltaTime: number) {
        if (!this._player || !this._player.isValid) {
            // 如果没有目标，让敌人停下来
            if (this._rigidbody) this._rigidbody.linearVelocity = new Vec2(0, 0);
            return;
        }

        const myPos = this.node.worldPosition;
        const targetPos = this._player.worldPosition;

        // 计算方向
        const direction = new Vec3();
        Vec3.subtract(direction, targetPos, myPos);
        direction.normalize();

        // --- 核心修改开始 ---
        // 使用刚体速度移动，代替 translate
        if (this._rigidbody) {
            // 计算速度向量
            const velocity = direction.multiplyScalar(this.moveSpeed);
            // 应用速度
            this._rigidbody.linearVelocity = new Vec2(velocity.x, velocity.y);
        }
        // --- 核心修改结束 ---

        // 朝向控制
        if (direction.x < 0) {
            this.node.setScale(-1, 1, 1);
        } else {
            this.node.setScale(1, 1, 1);
        }
    }
}