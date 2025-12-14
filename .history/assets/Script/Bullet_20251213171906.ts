import { _decorator, Component, Node, Vec3, Collider2D, Contact2DType, IPhysics2DContact } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Bullet')
export class Bullet extends Component {

    @property
    speed: number = 10;
    
    // 子弹飞行方向
    public direction: Vec3 = new Vec3(1, 0, 0);

    start() {
        // 碰撞监听
        const collider = this.getComponent(Collider2D);
        if (collider) {
            collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }
        
        // 3秒后自动销毁，防止内存泄漏
        this.scheduleOnce(() => {
            if(this.node.isValid) this.node.destroy();
        }, 3.0);
    }

    update(deltaTime: number) {
        // 沿方向飞行
        const moveStep = this.direction.clone().multiplyScalar(this.speed * deltaTime);
        this.node.translate(moveStep);
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        // 假设敌人的 Group 设置或者名字包含 Enemy
        if (otherCollider.node.name.includes("Enemy")) {
            otherCollider.node.destroy(); // 销毁敌人
            this.node.destroy(); // 销毁子弹
            // 这里可以增加计分逻辑
        }
    }
}