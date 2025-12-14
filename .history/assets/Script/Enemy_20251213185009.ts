import { _decorator, Component, Node, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Enemy')
export class Enemy extends Component {

    @property
    moveSpeed: number = 8; // 敌人移动速度，比玩家慢一点(玩家是5)

    private _player: Node | null = null; // 目标玩家

    // 这个方法由 GameManager 调用，告诉敌人“谁是目标”
    public setup(playerNode: Node) {
        this._player = playerNode;
    }

    update(deltaTime: number) {
        // 如果没有目标，或者目标已经没了，就发呆
        if (!this._player || !this._player.isValid) return;

        // 1. 获取位置
        const myPos = this.node.worldPosition;
        const targetPos = this._player.worldPosition;

        // 2. 计算方向向量 (目标 - 自己)
        const direction = new Vec3();
        Vec3.subtract(direction, targetPos, myPos); // 向量减法
        direction.normalize(); // 归一化 (变成长度为1的方向箭头)

        // 3. 移动 (方向 * 速度 * 时间)
        const moveStep = direction.multiplyScalar(this.moveSpeed * deltaTime);
        this.node.translate(moveStep);

        // 4. 简单的面朝向 (如果在左边，就翻转)
        if (direction.x < 0) {
            this.node.setScale(-1, 1, 1); // 左右翻转
        } else {
            this.node.setScale(1, 1, 1);
        }
    }
}