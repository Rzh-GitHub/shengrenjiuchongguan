import { _decorator, Component, Node, Vec3, Collider2D, Contact2DType, IPhysics2DContact, UITransform } from 'cc';
import { Enemy } from './Enemy';
const { ccclass, property } = _decorator;

@ccclass('KnifeProjectile')
export class KnifeProjectile extends Component {

    private _speed: number = 0;
    private _damage: number = 30;
    private _penetration: number = 0;
    private _direction: Vec3 = new Vec3();
    private _lifetime: number = 5; // 5秒后自动销毁防止内存泄漏

    // 初始化子弹数据
    public setup(dir: Vec3, speed: number, damage: number, penetration: number) {
        this._direction = dir.normalize();
        this._speed = speed;
        this._damage = damage;
        this._penetration = penetration;

        // 设置子弹旋转角度，让刀尖朝向飞行方向
        const angle = Math.atan2(this._direction.y, this._direction.x) * (180 / Math.PI);
        this.node.angle = angle;
    }

    start() {
        const collider = this.getComponent(Collider2D);
        if (collider) {
            collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }
    }

    update(deltaTime: number) {
        // 飞行逻辑
        if (this._speed > 0) {
            const moveStep = this._direction.clone().multiplyScalar(this._speed * deltaTime);
            this.node.translate(moveStep);
        }

        // 生命周期倒计时
        this._lifetime -= deltaTime;
        if (this._lifetime <= 0) this.node.destroy();
    }

    onBeginContact(self: Collider2D, other: Collider2D, contact: IPhysics2DContact | null) {
        const enemy = other.getComponent(Enemy);
        if (enemy) {
            enemy.takeDamage(this._damage);
            
            this._penetration--;
            if (this._penetration <= 0) {
                this.node.destroy();
            }
        }
    }
}