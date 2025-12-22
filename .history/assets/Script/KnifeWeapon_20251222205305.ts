import { _decorator, Canvas, Component, Prefab, Vec3, Node as CCNode, find, Camera } from "cc";
import { GameManager } from "./GameManager";
import { KnifeProjectile } from "./KnifeProjectile";
import { PlayerController } from "./PlayerController";
import { PoolManager } from "./PoolManager";
import { EnemyManager } from "./EnemyManager";

const { ccclass, property } = _decorator;

@ccclass('KnifeWeapon')
export class KnifeWeapon extends Component {
    @property(Prefab) knifePrefab: Prefab = null!;
    
    // 基础属性
    @property baseDamage: number = 10;
    @property baseSpeed: number = 800;
    @property waveInterval: number = 1.2;
    @property shootInterval: number = 0.05; // 每把刀之间的间隔时间 z

    public level: number = 1;
    public isEvolved: boolean = false; // 是否进化为斩仙飞刀

    private _timer: number = 0;
    node: any;
    
    start() {
        GameManager.instance.registerWeapon('KnifeWeapon', this);
    }

    update(dt: number) {
        this._timer += dt;
        if (this._timer >= this.waveInterval) {
            this._timer = 0;
            this.startFireWave();
        }
    }

    async startFireWave() {
        // 计算最终发射数量 = 基础数量(等级) + 全局加成
        const totalCount = this.level + GameManager.instance.stats.amountAdd;
        const dir = this.getShootDirection();
        
        // 计算排开的偏移向量（垂直于飞行方向）
        // 如果 dir = (x, y)，则垂直向量为 (-y, x)
        const offsetDir = new Vec3(-dir.y, dir.x, 0).normalize();
        const spacing = 20; // 每把刀的间距

        for (let i = 0; i < totalCount; i++) {
            // 计算位置偏移：让子弹以角色中心对称排开
            const offsetMultiplier = i - (totalCount - 1) / 2;
            const posOffset = offsetDir.clone().multiplyScalar(offsetMultiplier * spacing);
            
            this.spawnKnife(dir, posOffset);

            // 如果有多把刀，等待一小段时间 z
            if (totalCount > 1 && this.shootInterval > 0) {
                await this.wait(this.shootInterval);
            }
        }
    }

    private spawnKnife(dir: Vec3, posOffset: Vec3) {
        const knife = PoolManager.instance.getNode(this.knifePrefab, GameManager.instance.worldRoot);
        
        // 初始位置 = 玩家位置 + 宽度排开偏移
        const startPos = this.node.worldPosition.clone().add(posOffset);
        knife.setWorldPosition(startPos);

        const script = knife.getComponent(KnifeProjectile);
        if (script) {
            const stats = GameManager.instance.stats;
            // 计算最终属性
            const finalSpeed = this.baseSpeed * stats.projectileSpeedMul;
            const finalPierce = this.isEvolved ? 1 + stats.pierceAdd : 0 + stats.pierceAdd;
            const finalScale = stats.projectileScaleMul;

            // 设置缩放（攻击范围影响大小）
            knife.setScale(new Vec3(finalScale, finalScale, 1));
            
            script.setup(dir, finalSpeed, this.baseDamage, finalPierce);
        }
    }

    private getShootDirection(): Vec3 {
        let dir = PlayerController.instance.currentFacingDir;

        if (this.isEvolved) {
            const target = this.findStrongestEnemy();
            if (target) {
                Vec3.subtract(dir, target.worldPosition, this.node.worldPosition);
                dir.normalize();
            }
        }
        return dir;
    }

    findStrongestEnemy(): CCNode | null {
        // 1. 找到场景中名为 "Canvas" 的节点实例
        const canvasNode = find("Canvas"); 
        if (!canvasNode) {
            console.warn("未找到 Canvas 节点");
            return null;
        }

        // 2. 在该节点实例上调用方法
        const mainCamera = canvasNode.getComponentInChildren(Camera); 
        const playerPos = PlayerController.instance.node.worldPosition;

        if (!mainCamera) return null;

        return EnemyManager.instance.getStrongestInView(mainCamera, playerPos);
    }

    // 简易等待工具
    private wait(seconds: number) {
        return new Promise(resolve => setTimeout(resolve, seconds * 1000));
    }
}
