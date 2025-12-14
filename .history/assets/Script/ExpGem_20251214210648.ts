import { _decorator, Component, Node, Vec3, director } from 'cc';
import { PlayerController } from './PlayerController'; // 引入玩家脚本以获取范围
import { GameManager } from './GameManager';
const { ccclass, property } = _decorator;

@ccclass('ExpGem')
export class ExpGem extends Component {

    @property
    flySpeed: number = 800; // 被吸过去时的飞行速度

    @property
    expAmount: number = 20; // 每一颗宝石增加多少经验
    private _player: Node | null = null;
    private _isMagnetized: boolean = false; // 是否已经被吸住了

    setup(playerNode: Node) {
        this._player = playerNode;
    }

    update(deltaTime: number) {
        if (!this._player || !this._player.isValid) return;

        const myPos = this.node.worldPosition;
        const playerPos = this._player.worldPosition;
        
        // 计算距离
        const dist = Vec3.distance(myPos, playerPos);

        // 获取玩家当前的拾取范围
        const playerScript = this._player.getComponent(PlayerController);
        const currentRange = playerScript ? playerScript.pickupRange : 100;

        // 状态 1: 还没被吸住，检查范围
        if (!this._isMagnetized) {
            if (dist <= currentRange) {
                this._isMagnetized = true; // 进入被吸取状态
            }
        }

        // 状态 2: 被吸住了，飞向玩家
        if (this._isMagnetized) {
            // 计算飞行方向
            const direction = new Vec3();
            Vec3.subtract(direction, playerPos, myPos);
            direction.normalize();

            // 移动
            const moveStep = direction.multiplyScalar(this.flySpeed * deltaTime);
            this.node.translate(moveStep);

            // 状态 3: 距离足够近，视为吃到
            if (dist < 30) { // 30像素内算吃到
                this.onPickedUp();
            }
        }
    }

    onPickedUp() {
        // 这里以后会添加：增加玩家经验值 XP 的逻辑
        // console.log("吃到宝石了！");
        if (GameManager.instance) {
            GameManager.instance.addExp(this.expAmount);
        }
        // ----------------
        
        this.node.destroy(); // 销毁自己
    }
}