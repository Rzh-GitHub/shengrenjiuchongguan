import { _decorator, Component, Collider2D, Contact2DType, IPhysics2DContact, Vec3 } from 'cc';
import { Enemy } from './Enemy'; // 引入 Enemy 类型，以便调用 takeDamage
const { ccclass, property } = _decorator;

@ccclass('Bullet')
export class Bullet extends Component {

    @property
    speed: number = 10; 

    @property
    damage: number = 30; // 子弹伤害值

    public direction: Vec3 = new Vec3(1, 0, 0);

    start() {
        const collider = this.getComponent(Collider2D);
        if (collider) {
            collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }
        
        this.scheduleOnce(() => {
            if (this.node.isValid) this.node.destroy();
        }, 3.0);
    }

    update(deltaTime: number) {
        const moveStep = this.direction.clone().multiplyScalar(this.speed * deltaTime);
        this.node.translate(moveStep);
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        // 尝试获取碰到物体的 Enemy 组件
        const enemyScript = otherCollider.getComponent(Enemy);

        // 如果对方真的是敌人 (有 Enemy 脚本)
        if (enemyScript) {
            // 扣血
            enemyScript.takeDamage(this.damage);
            
            // 子弹自己销毁 (打中一个就消失)
            this.node.destroy(); 
        }
        // 如果碰到的不是敌人(比如墙壁)，可以在这里处理
    }
}