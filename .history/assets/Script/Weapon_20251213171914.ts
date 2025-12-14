import { _decorator, Component, Node, Prefab, instantiate, Vec3, director } from 'cc';
import { Bullet } from './Bullet'; // 引入子弹类
const { ccclass, property } = _decorator;

@ccclass('Weapon')
export class Weapon extends Component {

    @property(Prefab)
    bulletPrefab: Prefab = null!;

    @property
    fireRate: number = 0.5; // 攻击间隔

    private _timer: number = 0;

    update(deltaTime: number) {
        this._timer += deltaTime;
        if (this._timer >= this.fireRate) {
            this.findAndShoot();
            this._timer = 0;
        }
    }

    findAndShoot() {
        // 获取所有敌人 (简单粗暴的方法，性能优化后续再做)
        // 注意：这里假设敌人都在 Canvas 节点下
        const canvas = director.getScene().getChildByName('Canvas');
        const children = canvas.children;
        
        let closestEnemy: Node | null = null;
        let minDistance = 500; // 攻击范围

        const playerPos = this.node.worldPosition;

        children.forEach(child => {
            if (child.name.includes("Enemy")) {
                const dist = Vec3.distance(playerPos, child.worldPosition);
                if (dist < minDistance) {
                    minDistance = dist;
                    closestEnemy = child;
                }
            }
        });

        if (closestEnemy) {
            this.shoot(closestEnemy.worldPosition);
        }
    }

    shoot(targetPos: Vec3) {
        const bulletNode = instantiate(this.bulletPrefab);
        bulletNode.parent = this.node.parent; // 放在世界空间，不要作为玩家子节点
        bulletNode.worldPosition = this.node.worldPosition;

        // 计算方向
        const direction = new Vec3();
        Vec3.subtract(direction, targetPos, this.node.worldPosition);
        direction.normalize();

        // 传递方向给子弹脚本
        const bulletScript = bulletNode.getComponent(Bullet);
        if (bulletScript) {
            bulletScript.direction = direction;
            
            // 计算子弹旋转角度 (可选)
            const angle = Math.atan2(direction.y, direction.x) * (180 / Math.PI);
            bulletNode.angle = angle;
        }
    }
}