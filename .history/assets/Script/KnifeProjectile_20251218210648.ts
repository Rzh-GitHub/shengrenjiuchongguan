import { _decorator, Component, Vec3, Node, Collider2D, Contact2DType, IPhysics2DContact } from 'cc';
const { ccclass, property } = _decorator;
import { PoolManager } from './PoolManager'; // 确保路径正确

@ccclass('KnifeProjectile')
export class KnifeProjectile extends Component {
    private _direction: Vec3 = new Vec3();
    private _speed: number = 0;
    private _damage: number = 0;
    private _lifetime: number = 2; // 子弹生存时间（秒）
    private _isDead: boolean = false; // 防止同一帧内多次触发回收

    /**
     * 由武器或对象池调用，初始化子弹状态
     */
    public setup(dir: Vec3, speed: number, damage: number) {
        // 1. 重置基本状态
        this._isDead = false;
        this._direction.set(dir);
        this._speed = speed;
        this._damage = damage;
        this._lifetime = 2; // 重置寿命，否则回收出来的子弹可能立刻消失

        // 2. 处理旋转朝向
        // 计算弧度：Math.atan2(y, x)
        const rad = Math.atan2(dir.y, dir.x);
        const angle = rad * 180 / Math.PI;
        this.node.angle = angle; // 如果图片素材朝向不是水平向右，这里需要加减 90 度

        // 3. 激活节点（从对象池取出时 active 可能是 false）
        this.node.active = true;

        // 4. 注册碰撞回调（如果 onLoad 里没注册过）
        // 注意：如果节点被 putNode 放入池子，它的所有 schedule 会被自动取消，但事件监听建议保持
    }

    onLoad() {
        // 注册碰撞开始事件
        const collider = this.getComponent(Collider2D);
        if (collider) {
            collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }
    }

    update(deltaTime: number) {
        if (this._isDead) return;

        // 移动逻辑
        const moveStep = new Vec3();
        Vec3.multiplyScalar(moveStep, this._direction, this._speed * deltaTime);
        this.node.position = this.node.position.add(moveStep);

        // 寿命递减
        this._lifetime -= deltaTime;
        if (this._lifetime <= 0) {
            this.recycle();
        }
    }

    onBeginContact(self: Collider2D, other: Collider2D, contact: IPhysics2DContact | null) {
        if (this._isDead) return;

        // 假设敌人的脚本叫 Enemy
        // const enemy = other.getComponent(Enemy);
        // if (enemy) {
        //     enemy.takeDamage(this._damage);
        //     this.recycle(); // 击中敌人后回收
        // }
    }

    /**
     * 统一回收方法
     */
    private recycle() {
        if (this._isDead) return;
        this._isDead = true;

        // 使用 PoolManager 进行回收
        // 确保你的 PoolManager 里 putNode 的逻辑是基于 node.name 的
        PoolManager.instance.putNode(this.node);
    }
}