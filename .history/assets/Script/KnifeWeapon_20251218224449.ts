import { _decorator, Component, Node, Prefab, instantiate, Vec3 } from 'cc';
import { KnifeProjectile } from './KnifeProjectile';
import { PlayerController } from './PlayerController'; // 引入 PlayerController
import { Enemy } from './Enemy';
import { GameManager } from './GameManager';
import { PoolManager } from './PoolManager';
const { ccclass, property } = _decorator;

@ccclass('KnifeWeapon')
export class KnifeWeapon extends Component {

    @property({ type: Prefab })
    knifePrefab: Prefab = null!;

    @property
    damage: number = 10; // 确保这里是你想要的伤害

    @property
    baseSpeed: number = 2000;

    @property
    waveInterval: number = 1.0;

    @property
    isEvolved: boolean = false;

    private _timer: number = 0;


    public level: number = 1; 
    private _baseDamage: number = 10;
    private _baseInterval: number = 1.0;
    private get knifeCount(): number {
        return this.level; 
    }
    update(deltaTime: number) {
        this._timer += deltaTime;
        const finalInterval = this._baseInterval;
        if (this._timer >= this.waveInterval) {
            this._timer = 0;
            this.fire();
        }
    }

    fire() {
        // 1. 获取射击方向 (初始化默认值)
        let dir = new Vec3(1, 0, 0); 

        // 获取玩家实例 (使用你之前定义的单例)
        const playerCtrl = PlayerController.instance;

        if (this.isEvolved) {
            // 进化版：索敌逻辑
            const target = this.findStrongestEnemy();
            if (target) {
                Vec3.subtract(dir, target.worldPosition, this.node.worldPosition);
                dir.normalize();
            } else if (playerCtrl) {
                // 如果没找到敌人，保底使用玩家朝向
                dir.set(playerCtrl.currentFacingDir);
            }
        } else {
            // 普通版：直接读取玩家最后一次移动的朝向
            if (playerCtrl) {
                dir.set(playerCtrl.currentFacingDir);
            }
        }

        // 2. 生成子弹
        if (!this.knifePrefab) return;
        const knife = PoolManager.instance.getNode(this.knifePrefab, GameManager.instance.worldRoot);
        
        // 3. 设置层级 (推荐直接使用 GameManager 维护的 worldRoot)
        const worldRoot = GameManager.instance.worldRoot;
        if (worldRoot) {
            knife.parent = worldRoot;
        } else {
            // 保底方案：如果 GameManager 还没初始化好，放在当前节点父级
            knife.parent = this.node.parent;
        }
        
        // 4. 设置初始位置与发射参数
        knife.worldPosition = this.node.worldPosition;

        const script = knife.getComponent(KnifeProjectile);
        if (script) {
            // 传入 dir (已经是克隆的值或新创建的 Vec3)
            script.setup(dir, this.baseSpeed, this.damage);
        }
    }

    findStrongestEnemy(): Node | null {
        // ... 保持你原本的索敌逻辑 ...
        return null; // 占位
    }
}