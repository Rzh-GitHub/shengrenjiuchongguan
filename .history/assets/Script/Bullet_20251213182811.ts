import { _decorator, Component, Collider2D, Contact2DType, IPhysics2DContact, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Bullet')
export class Bullet extends Component {

    @property
    speed: number = 10; // 子弹速度

    // 子弹的飞行方向 (默认向右)
    // 这个变量会被 Weapon 脚本修改
    public direction: Vec3 = new Vec3(1, 0, 0);

    start() {
        // 1. 注册碰撞监听 (必须做，否则撞到了也没反应)
        const collider = this.getComponent(Collider2D);
        if (collider) {
            collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }

        // 2. 为了防止子弹飞出屏幕后永远存在占内存，3秒后自动销毁
        this.scheduleOnce(() => {
            if (this.node.isValid) this.node.destroy();
        }, 3.0);
    }

    update(deltaTime: number) {
        // 3. 每一帧都往 direction 方向移动
        const moveStep = this.direction.clone().multiplyScalar(this.speed * deltaTime);
        this.node.translate(moveStep);
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        // 4. 撞到了什么？
        // 因为我们在物理矩阵里设置了 Bullet 只能撞 Enemy，所以这里撞到的肯定是敌人
        // 安全起见，还是判断一下对方是不是敌人
        if (otherCollider.group === 2 || otherCollider.group === 4) { // 注意：Group的数字可能不同，最好用名字判断
             // 或者简单点：只要撞到了，对方销毁，自己也销毁
             
             // 销毁敌人
             if (otherCollider.node) {
                 otherCollider.node.destroy();
             }
             
             // 销毁子弹自己
             this.node.destroy();
        }
    }
}