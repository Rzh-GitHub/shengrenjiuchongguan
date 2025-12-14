import { _decorator, Component, Prefab, instantiate, Node, math, director } from 'cc';
import { Enemy } from './Enemy'; // 引入 Enemy 脚本以便调用 setup
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {

    @property(Prefab)
    playerPrefab: Prefab = null!; // 拖入玩家预制体

    @property(Prefab)
    enemyPrefab: Prefab = null!;  // 拖入敌人预制体

    @property
    spawnInterval: number = 1.0; // 几秒生一只怪

    private _playerInstance: Node | null = null; // 记录生出来的玩家
    private _timer: number = 0;

    start() {
        // 游戏开始，先生成玩家
        this.spawnPlayer();
    }

    update(deltaTime: number) {
        // 只有玩家活着的时候才刷怪
        if (this._playerInstance && this._playerInstance.isValid) {
            this._timer += deltaTime;
            if (this._timer >= this.spawnInterval) {
                this.spawnEnemy();
                this._timer = 0;
            }
        }
    }

    spawnPlayer() {
        if (!this.playerPrefab) return;
        
        // 1. 生成玩家
        this._playerInstance = instantiate(this.playerPrefab);
        // 2. 放到 Canvas 节点下 (UI和2D游戏通常放在 Canvas 下)
        const canvas = director.getScene().getChildByName('Canvas');
        this._playerInstance.parent = canvas;
        this._playerInstance.setPosition(0, 0, 0);
    }

    spawnEnemy() {
        if (!this.enemyPrefab || !this._playerInstance) return;

        // 1. 生成敌人
        const enemy = instantiate(this.enemyPrefab);
        enemy.parent = this._playerInstance.parent; // 和玩家同一个父节点

        // 2. 计算随机坐标 (在玩家周围 400~600 像素的圆环范围内)
        // 这样敌人会从屏幕外生成，不会突然糊在玩家脸上
        const angle = Math.random() * Math.PI * 2;
        const radius = math.randomRange(400, 600);
        
        const offsetX = Math.cos(angle) * radius;
        const offsetY = Math.sin(angle) * radius;

        // 敌人位置 = 玩家位置 + 偏移量
        const spawnPos = this._playerInstance.position.clone().add3f(offsetX, offsetY, 0);
        enemy.setPosition(spawnPos);

        // 3. 告诉敌人：去追这个玩家
        const enemyScript = enemy.getComponent(Enemy);
        if (enemyScript) {
            enemyScript.setup(this._playerInstance);
        }
    }
}