import { _decorator, Component, Vec3, Node, Collider2D, Contact2DType, IPhysics2DContact, view } from 'cc';
const { ccclass, property } = _decorator;
import { PoolManager } from './PoolManager'; // 确保路径正确
import { PlayerController } from './PlayerController';

@ccclass('KnifeProjectile')
export class KnifeProjectile extends Component {
    private _direction: Vec3 = new Vec3();
    private _speed: number = 0;
    private _damage: number = 0;
    private _lifetime: number = 5; // 子弹生存时间（秒）
    private _isDead: boolean = false; // 防止同一帧内多次触发回收
    // 回收阈值：屏幕宽/高的一半 + 缓冲距离
    private _limitX: number = 0;
    private _limitY: number = 0;
    /**
     * 由武器或对象池调用，初始化子弹状态
     */
    public setup(dir: Vec3, speed: number, damage: number) {
        // 1. 重置基本状态
        this._isDead = false;
        this._direction.set(dir);
        this._speed = speed;
        this._damage = damage;
        this._lifetime = 5; // 重置寿命，否则回收出来的子弹可能立刻消失

        // 2. 处理旋转朝向
        // 计算弧度：Math.atan2(y, x)
        const rad = Math.atan2(dir.y, dir.x);
        const angle = rad * 180 / Math.PI;
        this.node.angle = angle; // 如果图片素材朝向不是水平向右，这里需要加减 90 度

        // 3. 激活节点（从对象池取出时 active 可能是 false）
        this.node.active = true;

        // 4. 注册碰撞回调（如果 onLoad 里没注册过）
        // 注意：如果节点被 putNode 放入池子，它的所有 schedule 会被自动取消，但事件监听建议保持
        const collider = this.getComponent(Collider2D);
        if (collider) {
            // 如果你的飞刀有 RigidBody2D，调用 body.syncPosition()
            // 如果只有 Collider2D，调用以下方法：
            collider.apply(); 
        }
    }

    onLoad() {
        // 注册碰撞开始事件
        const collider = this.getComponent(Collider2D);
        if (collider) {
            collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }

        // 初始化屏幕边界阈值
        const visibleSize = view.getVisibleSize();
        // 设置为屏幕半径的 1.2 倍，确保在视野外一点点才消失
        this._limitX = (visibleSize.width / 2) * 1.2;
        this._limitY = (visibleSize.height / 2) * 1.2;
    }

    update(deltaTime: number) {
        if (this._isDead) return;

        // 1. 移动
        const moveStep = this._direction.clone().multiplyScalar(this._speed * deltaTime);
        this.node.translate(moveStep, Node.NodeSpace.WORLD);

        // 2. 核心：判断是否超出屏幕
        // 获取当前子弹相对于相机的距离（假设相机跟着玩家）
        const playerPos = PlayerController.instance.node.worldPosition;
        const myPos = this.node.worldPosition;

        const offsetX = Math.abs(myPos.x - playerPos.x);
        const offsetY = Math.abs(myPos.y - playerPos.y);

        // 3. 回收逻辑：超出屏幕 OR 寿命到期
        this._lifetime -= deltaTime;

        if (offsetX > this._limitX || offsetY > this._limitY || this._lifetime <= 0) {
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