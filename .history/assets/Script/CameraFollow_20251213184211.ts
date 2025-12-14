import { _decorator, Component, Node, Vec3, director } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CameraFollow')
export class CameraFollow extends Component {

    @property
    smoothSpeed: number = 1; // 跟随的平滑度（0-1），越小越有延迟感

    private _target: Node | null = null; // 要跟随的目标（玩家）
    private _offset: Vec3 = new Vec3();  // 摄像机和玩家的距离偏差

    lateUpdate(deltaTime: number) {
        // 1. 如果还没有目标，尝试去寻找名为 "Player" 的节点
        if (!this._target || !this._target.isValid) {
            this.findPlayer();
            return;
        }

        // 2. 计算目标位置
        // 保持 Z 轴不变（摄像机需要保持高度才能看到东西），只改变 X 和 Y
        const targetPos = this._target.worldPosition;
        const currentPos = this.node.worldPosition;

        // 使用 lerp (线性插值) 让跟随动作更平滑，不生硬
        const smoothPos = new Vec3();
        Vec3.lerp(smoothPos, currentPos, targetPos);
        
        // 保持摄像机原有的 Z 轴高度 (通常是 1000)
        smoothPos.z = currentPos.z; 

        // 3. 应用位置
        this.node.worldPosition = smoothPos;
    }

    findPlayer() {
        // 在 Canvas 下面寻找叫 "Player" 的节点（因为 GameManager 把玩家生成在 Canvas 下了）
        const canvas = director.getScene().getChildByName('Canvas');
        if (canvas) {
            this._target = canvas.getChildByName('Player');
        }
    }
}