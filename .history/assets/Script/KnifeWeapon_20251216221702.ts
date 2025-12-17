import { _decorator, Component, Node, Prefab, instantiate, Vec3 } from 'cc';
import { KnifeProjectile } from './KnifeProjectile';
import { PlayerController } from './PlayerController'; // 引入 PlayerController
import { Enemy } from './Enemy';
const { ccclass, property } = _decorator;

@ccclass('KnifeWeapon')
export class KnifeWeapon extends Component {

    @property({ type: Prefab })
    knifePrefab: Prefab = null!;

    @property
    damage: number = 30; // 确保这里是你想要的伤害

    @property
    baseSpeed: number = 600;

    @property
    waveInterval: number = 1.0;

    @property
    isEvolved: boolean = false;

    private _timer: number = 0;

    update(deltaTime: number) {
        this._timer += deltaTime;
        if (this._timer >= this.waveInterval) {
            this._timer = 0;
            this.fire();
        }
    }

    fire() {
        // 1. 获取射击方向
        let dir = new Vec3(1, 0, 0); // 默认保底

        // 如果是进化版，走索敌逻辑
        if (this.isEvolved) {
             const target = this.findStrongestEnemy();
             if (target) {
                 Vec3.subtract(dir, target.worldPosition, this.node.worldPosition);
                 dir.normalize();
             }
        } 
        // 否则，直接读取玩家的朝向
        else {
            // 获取 PlayerController (假设 Weapon 挂在 Player 下面)
            // 注意：如果是挂在 Weapon_Node 子节点下，可能需要 parent.parent
            // 这里用 getComponentInParent 最稳，它会向上查找直到找到组件
            if (this.node.parent) {
                const playerCtrl = this.node.parent.getComponent(PlayerController);
                if (playerCtrl) {
                    dir = playerCtrl.currentFacingDir.clone();
                }
            }
        }

        // 2. 生成子弹
        if (!this.knifePrefab) return;
        const knife = instantiate(this.knifePrefab);
        
        // 放在 GameWorld
        // 假设层级是 GameWorld -> Player -> Weapon -> WeaponScript
        // 我们想让子弹在 GameWorld 这一层
        const worldRoot = this.node.scene.getChildByName('WorldRoot') || this.node.parent?.parent;
        if (worldRoot) {
             knife.parent = worldRoot;
        } else {
             knife.parent = this.node.parent; // 保底
        }
        
        knife.worldPosition = this.node.worldPosition;

        const script = knife.getComponent(KnifeProjectile);
        if (script) {
            script.setup(dir, this.baseSpeed, this.damage);
        }
    }

    findStrongestEnemy(): Node | null {
        // ... 保持你原本的索敌逻辑 ...
        return null; // 占位
    }
}