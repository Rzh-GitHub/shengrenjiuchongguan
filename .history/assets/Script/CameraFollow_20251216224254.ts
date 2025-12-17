import { _decorator, Component, Node, Vec3, director } from 'cc';
import { PlayerController } from './PlayerController';
const { ccclass, property } = _decorator;

@ccclass('CameraFollow')
export class CameraFollow extends Component {

    private _target: Node | null = null; // 目标（玩家）
    private _tempPos: Vec3 = new Vec3(); // 临时变量，防止每帧创建新对象造成GC

    lateUpdate(deltaTime: number) {
        // 1. 如果没有目标，尝试去寻找
        if (!this._target || !this._target.isValid) {
            this.findPlayer();
            return;
        }

        // 2. 获取目标位置
        const targetPos = this._target.worldPosition;
        const currentPos = this.node.worldPosition;

        // 3. 直接赋值，不要插值
        // 保持摄像机原有的 Z 轴高度 (通常是 1000)，只同步 X 和 Y
        this._tempPos.set(targetPos.x, targetPos.y, 1000);
        this.node.worldPosition = this._tempPos;
    }

    findPlayer() {
        this._target = PlayerController.instance?.node;
    }
}