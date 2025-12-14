import { _decorator, Component, Node, Prefab, instantiate, Vec3, math } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {

    @property(Prefab)
    enemyPrefab: Prefab = null!;

    @property(Node)
    player: Node = null!;

    @property
    spawnInterval: number = 1.0; // 生成间隔

    private _timer: number = 0;

    update(deltaTime: number) {
        this._timer += deltaTime;
        if (this._timer >= this.spawnInterval) {
            this.spawnEnemy();
            this._timer = 0;
        }
    }

    spawnEnemy() {
        if (!this.enemyPrefab || !this.player) return;

        const enemy = instantiate(this.enemyPrefab);
        this.node.parent.addChild(enemy); // 添加到场景

        // 在玩家周围随机位置生成 (例如：距离玩家 400-600 像素的圆环内)
        const angle = Math.random() * Math.PI * 2;
        const radius = math.randomRange(400, 600);
        
        const offsetX = Math.cos(angle) * radius;
        const offsetY = Math.sin(angle) * radius;

        const spawnPos = this.player.position.clone().add3f(offsetX, offsetY, 0);
        enemy.position = spawnPos;
    }
}