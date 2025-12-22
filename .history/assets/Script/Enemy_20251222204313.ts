import { _decorator, Component, Node, Vec3, RigidBody2D, Vec2, Sprite, Color, Prefab, instantiate, Enum } from 'cc';
import { ExpGem } from './ExpGem';
import { EnemyManager } from './EnemyManager';
import { EnemyType } from './Enemy.Enum';
const { ccclass, property } = _decorator;

@ccclass('Enemy')
export class Enemy extends Component {
    @property({ type: Enum(EnemyType) })
    public type: EnemyType = EnemyType.Normal;

    @property
    moveSpeed: number = 4; 

    @property
    maxHp: number = 10; // 最大生命值 (比如子弹伤害10，需要打3下)

    private _currentHp: number = 0;
    private _player: Node | null = null;
    private _rigidbody: RigidBody2D | null = null;
    private _sprite: Sprite | null = null; // 用来控制颜色

    @property(Prefab)
    expGemPrefab: Prefab = null!; // --- 新增：拖入宝石预制体 ---

    // 原始颜色，用于闪白后恢复
    private _originColor: Color = new Color(); 

    start() {
        this._rigidbody = this.getComponent(RigidBody2D);
        this._sprite = this.getComponent(Sprite);

        // 初始化血量
        this._currentHp = this.maxHp;

        // 记录一下敌人原本的颜色 (红色)
        if (this._sprite) {
            this._originColor.set(this._sprite.color);
        }
    }

    public setup(playerNode: Node) {
        this._player = playerNode;
    }

    // --- 新增：受伤逻辑 ---
    public takeDamage(damage: number) {
        this._currentHp -= damage;
        
        // 播放受击特效
        this.playHitEffect();

        // 死亡判定
        if (this._currentHp <= 0) {
            this.scheduleOnce(() => {
                this.die();
            }, 0);
        }
    }

    private playHitEffect() {
        if (!this._sprite) return;

        // 1. 变成白色 (高亮)
        this._sprite.color = new Color(255, 255, 255, 255);

        // 2. 0.1秒后变回原来的颜色
        this.scheduleOnce(() => {
            if (this.node.isValid && this._sprite) {
                this._sprite.color = this._originColor;
            }
        }, 0.1);
    }

    private die() {
        // 这里以后可以加死亡动画、掉落经验球等
        this.spawnGem();
        this.node.destroy();
    }
    // -------------------

    private spawnGem() {
        if (!this.expGemPrefab) return;

        // 1. 生成宝石
        const gem = instantiate(this.expGemPrefab);
        
        // 2. 放在敌人当前的位置
        gem.parent = this.node.parent; // 放在同一个父节点(Canvas)下
        gem.worldPosition = this.node.worldPosition;

        // 3. 告诉宝石玩家在哪里 (为了计算距离)
        // 我们自己本来就存了 _player，直接传给宝石
        if (this._player) {
            const gemScript = gem.getComponent(ExpGem);
            if (gemScript) {
                gemScript.setup(this._player);
            }
        }
    }

    update(deltaTime: number) {
        if (!this._player || !this._player.isValid) {
            if (this._rigidbody) this._rigidbody.linearVelocity = new Vec2(0, 0);
            return;
        }

        const myPos = this.node.worldPosition;
        const targetPos = this._player.worldPosition;

        const direction = new Vec3();
        Vec3.subtract(direction, targetPos, myPos);
        direction.normalize();

        if (this._rigidbody) {
            const velocity = direction.multiplyScalar(this.moveSpeed);
            this._rigidbody.linearVelocity = new Vec2(velocity.x, velocity.y);
        }

        if (direction.x < 0) this.node.setScale(-1, 1, 1);
        else this.node.setScale(1, 1, 1);
    }
    
    onEnable() { EnemyManager.instance.register(this); }

    onDisable() { EnemyManager.instance.unregister(this); }

    get hp(): number {
        return this._currentHp;
    }
}