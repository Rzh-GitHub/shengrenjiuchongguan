import { _decorator, Component, Prefab, instantiate, Node, math, director, ProgressBar, Label } from 'cc';
import { Enemy } from './Enemy';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {

    // --- 单例模式设置 ---
    public static instance: GameManager = null!;

    @property({ type: Prefab })
    mapPrefab: Prefab = null!; // 拖入你的地图预制体

    @property({ type: Node, tooltip: "所有游戏世界物体(玩家/敌人/地图)的父节点" })
    worldRoot: Node = null!;

    onLoad() {
        // 这一步让其他脚本可以通过 GameManager.instance 访问我
        GameManager.instance = this;
    }
    // ------------------

    @property({ type: Prefab })
    playerPrefab: Prefab = null!;

    @property({ type: Prefab })
    enemyPrefab: Prefab = null!;

    // --- UI 绑定 ---
    @property({ type: ProgressBar })
    expBar: ProgressBar = null!;

    @property({ type: Label })
    levelLabel: Label = null!;
    // --------------

    @property
    spawnInterval: number = 1.0;

    private _playerInstance: Node | null = null;
    private _timer: number = 0;

    // --- 经验值系统变量 ---
    public currentLevel: number = 1;
    public currentExp: number = 0;
    public maxExp: number = 100; // 升下一级需要的经验
    // --------------------

    start() {
        if (!this.worldRoot) {
            this.worldRoot = director.getScene().getChildByName('WorldRoot')!;
        }
        
        this.spawnMap();
        this.spawnPlayer();
        this.updateUI();
    }

    update(deltaTime: number) {
        if (this._playerInstance && this._playerInstance.isValid) {
            this._timer += deltaTime;
            if (this._timer >= this.spawnInterval) {
                this.spawnEnemy();
                this._timer = 0;
            }
        }
    }

    // --- 新增：增加经验值的接口 ---
    public addExp(amount: number) {
        this.currentExp += amount;

        // 检查是否升级
        if (this.currentExp >= this.maxExp) {
            this.levelUp();
        }

        this.updateUI();
    }

    private levelUp() {
        this.currentLevel++;
        this.currentExp -= this.maxExp; // 扣除当前升级所需经验，溢出的保留
        
        // 升级难度增加：每级所需经验增加 20%
        this.maxExp = Math.floor(this.maxExp * 1.2);

        // 播放升级音效或暂停游戏（以后实现）
        console.log("Level Up! Now Level: " + this.currentLevel);
    }

    private updateUI() {
        // 更新进度条 (0.0 到 1.0)
        if (this.expBar) {
            this.expBar.progress = this.currentExp / this.maxExp;
        }

        // 更新文字
        if (this.levelLabel) {
            this.levelLabel.string = "Lv. " + this.currentLevel;
        }
    }
    // -------------------------

    spawnMap() {
        if (!this.mapPrefab || !this.worldRoot) return;
        const map = instantiate(this.mapPrefab);
        
        // ✅ 正确：放在 WorldRoot 下
        map.parent = this.worldRoot; 
        map.setSiblingIndex(0); // 保证在最底层
    }

    spawnPlayer() {
        if (!this.playerPrefab || !this.worldRoot) return;
        this._playerInstance = instantiate(this.playerPrefab);
        
        // ✅ 修正：Player 应该在 WorldRoot 下，而不是 Canvas 下
        this._playerInstance.parent = this.worldRoot;
        
        // 设置位置 (确保 Player 的 Layer 属性在 Prefab 里已经设为 WORLD)
        this._playerInstance.setPosition(0, 0, 0);
    }

    spawnEnemy() {
        if (!this.enemyPrefab || !this._playerInstance || !this.worldRoot) return;
        
        const enemy = instantiate(this.enemyPrefab);
        
        // ✅ 修正：Enemy 也要在 WorldRoot 下
        enemy.parent = this.worldRoot;

        // 生成逻辑保持不变...
        const angle = Math.random() * Math.PI * 2;
        const radius = math.randomRange(400, 600);
        // 注意：因为 Player 和 Enemy 现在在同一个父节点下，可以直接用位置相加
        const spawnPos = this._playerInstance.position.clone().add3f(
            Math.cos(angle) * radius, 
            Math.sin(angle) * radius, 
            0
        );
        enemy.setPosition(spawnPos);

        const enemyScript = enemy.getComponent(Enemy);
        if (enemyScript) enemyScript.setup(this._playerInstance);
    }
}