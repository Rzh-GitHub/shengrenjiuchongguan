import { _decorator, Component, Node, Prefab, instantiate, Vec3, director } from 'cc';
import { KnifeProjectile } from './KnifeProjectile';
import { Enemy } from './Enemy';
import { PlayerController } from './PlayerController';
const { ccclass, property } = _decorator;

@ccclass('KnifeWeapon')
export class KnifeWeapon extends Component {

    @property({ type: Prefab })
    knifePrefab: Prefab = null!;

    // --- 基础属性 ---
    @property
    damage: number = 10;

    @property({ tooltip: "穿透数量" })
    penetration: number = 1;

    @property({ tooltip: "每一波发射的飞刀数量 (n)" })
    projectileCount: number = 1; 

    @property({ tooltip: "基础弹道速度" })
    baseSpeed: number = 400;

    // --- 节奏控制 ---
    @property({ tooltip: "波次间隔 (x)，进化后设为 0" })
    waveInterval: number = 2.0;

    @property({ tooltip: "连射间隔 (y)，两把刀之间的微小延迟" })
    staggerInterval: number = 0.1;

    // --- 进化属性 ---
    @property({ tooltip: "是否进化 (决定是否索敌最强敌人)" })
    isEvolved: boolean = false;

    // --- 模拟被动道具 (日月梭) ---
    // 实际项目中，这个应该从 PlayerController 或 InventoryManager 获取
    @property({ tooltip: "日月梭等级 (0代表未拥有)" })
    passiveSpeedLevel: number = 0; 

    private _timer: number = 0;
    private _isFiring: boolean = false; // 是否正在射击中

    update(deltaTime: number) {
        // 如果正在连射中，就不走冷却计时
        if (this._isFiring) return;

        this._timer += deltaTime;
        if (this._timer >= this.waveInterval) {
            this._timer = 0;
            this.fireWave();
        }
    }

    // 发射一波
    async fireWave() {
        this._isFiring = true;

        // 计算当前是否需要索敌 (进化后且屏幕内有怪)
        let targetDir = this.getDirection();

        // 开始连射循环
        for (let i = 0; i < this.projectileCount; i++) {
            // 注意：斩仙飞刀每一发都要重新索敌吗？
            // 吸血鬼幸存者中，通常是一波锁定一个方向，或者是实时追踪。
            // 这里为了性能和表现，我们设定为：如果是进化版，每一发都实时修正方向指向最强怪
            if (this.isEvolved) {
                targetDir = this.getDirection();
            }

            this.spawnProjectile(targetDir);

            // 等待 y 秒 (stagger)
            // 使用 Promise + setTimeout 模拟协程等待
            await new Promise(resolve => this.scheduleOnce(resolve, this.staggerInterval));
            
            // 如果节点销毁了(比如切换场景)，停止发射
            if (!this.node.isValid) return; 
        }

        this._isFiring = false;
    }

getDirection(): Vec3 {
        // 1. 默认方向
        let dir = new Vec3(1, 0, 0);

        // 2. 获取父节点上的 PlayerController
        // 假设 Weapon 是 Player 的子节点，所以用 this.node.parent.getComponent
        if (this.node.parent) {
            const playerCtrl = this.node.parent.getComponent(PlayerController);
            if (playerCtrl) {
                // ✅ 直接读取逻辑朝向，不需要管 Scale 了
                // 使用 clone() 防止修改原始数据
                dir = playerCtrl.facingDir.clone();
            }
        }

        // 3. 进化版索敌逻辑 (覆盖前面的默认朝向)
        if (this.isEvolved) {
            const strongestEnemy = this.findStrongestEnemy();
            if (strongestEnemy) {
                Vec3.subtract(dir, strongestEnemy.worldPosition, this.node.worldPosition);
                dir.normalize();
            }
        }

        return dir;
    }

    spawnProjectile(dir: Vec3) {
        if (!this.knifePrefab) return;

        const knife = instantiate(this.knifePrefab);
        
        // 放在 GameWorld (Canvas) 下，不要作为 Player 子节点，否则会跟着人走
        // 假设 parent 的 parent 是 GameWorld
        knife.parent = this.node.parent?.parent || this.node.parent; 
        knife.worldPosition = this.node.worldPosition;

        const script = knife.getComponent(KnifeProjectile);
        if (script) {
            // 计算由于日月梭带来的速度加成
            // 假设每一级提升 10% 速度
            const speedMultiplier = 1 + (this.passiveSpeedLevel * 0.1);
            const finalSpeed = this.baseSpeed * speedMultiplier;

            script.setup(dir, finalSpeed, this.damage, this.penetration);
        }
    }

    findStrongestEnemy(): Node | null {
        // 获取 GameWorld 下的所有节点
        // 注意：这种遍历方式性能较差，生产环境应该用 EnemyManager 维护一个数组
        const gameWorld = this.node.parent?.parent; 
        if (!gameWorld) return null;

        let maxHp = -1;
        let target: Node | null = null;
        const myPos = this.node.worldPosition;

        // 简单的屏幕范围检查 (假设屏幕宽 1280 左右，太远的不算)
        const rangeSq = 800 * 800; 

        for (const child of gameWorld.children) {
            const enemyScript = child.getComponent(Enemy);
            if (enemyScript && child.isValid) {
                // 必须在射程内
                if (Vec3.squaredDistance(myPos, child.worldPosition) < rangeSq) {
                    // 找血量最高的
                    if (enemyScript.maxHp > maxHp) {
                        maxHp = enemyScript.maxHp;
                        target = child;
                    }
                }
            }
        }
        return target;
    }
}