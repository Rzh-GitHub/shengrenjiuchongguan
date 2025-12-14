import { _decorator, Component, Node, Prefab, instantiate, Vec3, director } from 'cc';
import { Bullet } from './Bullet'; // 引入子弹脚本以便设置方向
const { ccclass, property } = _decorator;

@ccclass('Weapon')
export class Weapon extends Component {

    @property(Prefab)
    bulletPrefab: Prefab = null!; // 需要把子弹预制体拖进来

    @property
    fireRate: number = 0.5; // 射击间隔（秒），越小越快

    private _timer: number = 0;

    update(deltaTime: number) {
        this._timer += deltaTime;
        if (this._timer >= this.fireRate) {
            this.tryShoot();
            this._timer = 0;
        }
    }

    tryShoot() {
        // 1. 寻找最近的敌人
        const target = this.findNearestEnemy();
        
        // 2. 如果找到了，就开火
        if (target) {
            this.shoot(target.worldPosition);
        }
    }

    findNearestEnemy(): Node | null {
        // 获取场景 Canvas 下的所有子节点（包含玩家和敌人）
        // 注意：这种写法适合敌人不多的情况。敌人多了需要用对象池优化。
        const canvas = director.getScene().getChildByName('Canvas');
        if (!canvas) return null;

        const children = canvas.children;
        let closestEnemy: Node | null = null;
        let minDistance = 10000; // 先设一个很大的距离

        const myPos = this.node.worldPosition;

        // 遍历所有节点找敌人
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            // 简单判断：如果名字是 Enemy 且节点有效
            if (child.name.includes("Enemy") && child.isValid) {
                const dist = Vec3.distance(myPos, child.worldPosition);
                if (dist < minDistance) {
                    minDistance = dist;
                    closestEnemy = child;
                }
            }
        }
        return closestEnemy;
    }

    shoot(targetPos: Vec3) {
        if (!this.bulletPrefab) return;

        // 1. 生成子弹
        const bullet = instantiate(this.bulletPrefab);
        
        // 2. 设置位置：子弹必须放在世界坐标系下（和玩家同级），不能作为玩家子节点，否则会跟着玩家走
        bullet.parent = this.node.parent; 
        bullet.worldPosition = this.node.worldPosition;

        // 3. 计算方向
        const direction = new Vec3();
        Vec3.subtract(direction, targetPos, this.node.worldPosition);
        direction.normalize();

        // 4. 设置子弹飞行方向
        const bulletScript = bullet.getComponent(Bullet);
        if (bulletScript) {
            bulletScript.direction = direction;
        }

        // 5. (可选) 让子弹图片旋转对准敌人
        // 计算角度：Math.atan2(y, x)
        const angle = Math.atan2(direction.y, direction.x) * (180 / Math.PI);
        bullet.angle = angle;
    }
}