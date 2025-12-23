import { _decorator, Component, Prefab, Vec3, Node as CCNode, Camera, find } from 'cc';
import { PlayerController } from './PlayerController';
import { PoolManager } from './PoolManager';
import { GameManager } from './GameManager';
import { EnemyManager } from './EnemyManager';
import { KnifeProjectile } from './KnifeProjectile';
import { AuroraBladeLevels } from './AuroraBlade.interface';

const { ccclass, property } = _decorator;

@ccclass('KnifeWeapon')
export class KnifeWeapon extends Component {
    @property(Prefab) knifePrefab: Prefab = null!;

    public level: number = 1;
    public isEvolved: boolean = false;

    @property baseDamage: number = 10;
    @property baseSpeed: number = 1500;
    @property waveInterval: number = 1.2; // 发射波次的间隔
    @property shootInterval: number = 0.05; // 每一把之间的微小延迟 z

    private _timer: number = 0;

    start() {
        debugger
        GameManager.instance.registerWeapon('KnifeWeapon', this);
    }

    update(dt: number) {
        this._timer += dt;
        if (this._timer >= this.waveInterval) {
            this._timer = 0;
            this.startFireWave();
        }
    }

    private async startFireWave() {
        const stats = this.calculateFinalStats();
        const dir = this.getShootDirection();

        // 计算排开方向：垂直于飞行方向 (-y, x)
        const offsetDir = new Vec3(-dir.y, dir.x, 0).normalize();
        const spacing = 25; // 飞刀之间的间距

        for (let i = 0; i < stats.amount; i++) {
            // 计算排开位置：让飞刀以角色中心对称排列
            const offsetMultiplier = i - (stats.amount - 1) / 2;
            const posOffset = offsetDir.clone().multiplyScalar(offsetMultiplier * spacing);
            
            this.spawnKnife(dir, posOffset, stats);

            if (stats.amount > 1 && this.shootInterval > 0) {
                // 等待间隔 z
                await new Promise(resolve => setTimeout(resolve, this.shootInterval * 1000));
            }
        }
    }

    private calculateFinalStats() {
        const config = AuroraBladeLevels[this.level - 1];
        const global = GameManager.instance.stats;

        return {
            amount: config.amount + global.amountAdd,
            // 只有进化后基础穿透才为 1
            pierce: (this.isEvolved ? 1 : 0) + global.pierceAdd,
            speed: this.baseSpeed * global.projectileSpeedMul,
            scale: global.projectileScaleMul
        };
    }

    private spawnKnife(dir: Vec3, posOffset: Vec3, stats: any) {
        const knife = PoolManager.instance.getNode(this.knifePrefab, GameManager.instance.worldRoot);
        
        // 初始位置 = 玩家世界坐标 + 排开偏移
        const startPos = this.node.worldPosition.clone().add(posOffset);
        knife.setWorldPosition(startPos);

        // 设置攻击范围（大小）
        knife.setScale(new Vec3(stats.scale, stats.scale, 1));

        const projectile = knife.getComponent(KnifeProjectile);
        if (projectile) {
            projectile.setup(dir, stats.speed, this.baseDamage, stats.pierce);
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

    private findStrongestEnemy(): CCNode | null {
        const canvasNode = find('Canvas');
        if (!canvasNode) return null;
        const mainCamera = canvasNode.getComponentInChildren(Camera);
        if (!mainCamera) return null;

        return EnemyManager.instance.getStrongestInView(mainCamera, PlayerController.instance.node.worldPosition);
    }

    // 进化入口，由 GameManager 调用
    public evolve() {
        this.isEvolved = true;
        this.waveInterval = 0.5; // 进化后大幅缩短发射间隔
        console.log("极光刃已进化为 -> 斩仙飞刀！");
    }
}