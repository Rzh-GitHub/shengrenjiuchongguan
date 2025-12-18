import { _decorator, Component, Node, Vec3, Collider2D, Contact2DType, IPhysics2DContact } from 'cc';
import { Enemy } from './Enemy';
const { ccclass, property } = _decorator;

@ccclass('KnifeProjectile')
export class KnifeProjectile extends Component {

    private _speed: number = 0;
    private _damage: number = 0;
    private _direction: Vec3 = new Vec3();
    private _lifetime: number = 5; 

    public setup(dir: Vec3, speed: number, damage: number) {
        this._direction = dir.normalize();
        this._speed = speed;
        
        // 关键：根据 8 方向向量实时计算旋转角度
        const rad = Math.atan2(this._direction.y, this._direction.x);
        const angle = rad * 180 / Math.PI;
        this.node.angle = angle; 
        
        // 调试打印，看看斜方向的角度是否为 45, 135, -45, -135 等
        console.log("子弹发射角度:", angle);
    }

    start() {
        const collider = this.getComponent(Collider2D);
        if (collider) {
            collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }
    }

    update(deltaTime: number) {
        if (this._speed > 0) {
            const moveStep = this._direction.clone().multiplyScalar(this._speed * deltaTime);
            this.node.translate(moveStep);
        }

        this._lifetime -= deltaTime;
        if (this._lifetime <= 0 && this.node.isValid) this.node.destroy();
    }

    onBeginContact(self: Collider2D, other: Collider2D, contact: IPhysics2DContact | null) {
        // 防止已经销毁的子弹再次触发碰撞
        if (!this.node.isValid) return;

        const enemy = other.getComponent(Enemy);
        if (enemy) {
            enemy.takeDamage(this._damage);
            
            // ✅ 修复报错：延迟销毁
            this.scheduleOnce(() => {
                if (this.node.isValid) this.node.destroy();
            }, 0);
        }
    }
}