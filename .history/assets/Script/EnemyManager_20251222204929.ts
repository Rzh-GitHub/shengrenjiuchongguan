import { _decorator, Camera, Component, Vec3, Node } from "cc";
import { Enemy } from "./Enemy";

const {ccclass} = _decorator;

@ccclass('EnemyManager')
export class EnemyManager extends Component {
    public static instance: EnemyManager = null!;
    private _enemies: Enemy[] = [];

    onLoad() { EnemyManager.instance = this; }

    register(e: Enemy) { this._enemies.push(e); }
    unregister(e: Enemy) {
        const idx = this._enemies.indexOf(e);
        if (idx !== -1) this._enemies.splice(idx, 1);
    }

    public getStrongestInView(camera: Camera, playerPos: Vec3): Node | null {
        let strongest: Enemy | null = null;
        let maxScore = -1;

        for (const enemy of this._enemies) {
            // 1. 视野裁剪 (简易版：判断距离)
            const dist = Vec3.distance(enemy.node.worldPosition, playerPos);
            if (dist > 800) continue; // 假设 800 是屏幕半径

            // 2. 强度评分 = 类型权重 + (血量百分比 * 小权重)
            // 这样相同类型的敌人里，血厚的会被视为更强
            const score = (enemy.type as number) * 1000 + enemy.hp;

            if (score > maxScore) {
                maxScore = score;
                strongest = enemy;
            }
        }
        return strongest ? strongest.node : null;
    }
}