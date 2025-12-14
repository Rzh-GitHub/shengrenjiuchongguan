import { _decorator, Component, Node, Vec3, director } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Enemy')
export class Enemy extends Component {

    @property
    moveSpeed: number = 2;

    private _playerNode: Node | null = null;

    start() {
        // 简单方式：通过名字查找玩家节点（实际项目中推荐通过管理器传入）
        this._playerNode = director.getScene().getChildByName('Canvas').getChildByName('Player');
    }

    update(deltaTime: number) {
        if (!this._playerNode) return;

        // 获取玩家位置
        const playerPos = this._playerNode.worldPosition;
        const myPos = this.node.worldPosition;

        // 计算方向向量 (玩家位置 - 自己位置)
        const direction = new Vec3();
        Vec3.subtract(direction, playerPos, myPos);
        direction.normalize(); // 归一化

        // 移动
        const moveStep = direction.multiplyScalar(this.moveSpeed * deltaTime);
        this.node.translate(moveStep);
        
        // 简单的朝向处理（翻转X轴）
        if (direction.x < 0) this.node.scale = new Vec3(-1, 1, 1);
        else this.node.scale = new Vec3(1, 1, 1);
    }
}