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

    @property({ type: Prefab })
    playerPrefab: Prefab = null!;

    @property({ type: Prefab })
    enemyPrefab: Prefab = null!;

    // --- UI 绑定 ---
    @property({ type: ProgressBar })
    expBar: ProgressBar = null!;

    @property({ type: Label })
    levelLabel: Label = null!;

    @property
    spawnInterval: number = 0.5;

    // 武器升级
    private _ownedWeapons: Map<string, any> = new Map();
    private _ownedPassives: Map<string, any> = new Map();
    public registerWeapon(name: string, comp: any) { this._ownedWeapons.set(name, comp); }
    public registerPassive(name: string, comp: any) { this._ownedPassives.set(name, comp); }

    private _playerInstance: Node | null = null;
    private _timer: number = 0;

    // --- 经验值系统变量 ---
    public currentLevel: number = 1;
    public currentExp: number = 0;
    public maxExp: number = 100; // 升下一级需要的经验
    // --------------------

    // 全局加成因子
    public stats = {
        projectileSpeedMul: 1.0, // 初始 1.0，日月梭会往上加
        projectileScaleMul: 1.0, // 攻击范围倍率
        amountAdd: 0,            // 额外发射数量（如其他宝物加成）
        pierceAdd: 0             // 额外穿透次数
    };

    onLoad() {
        GameManager.instance = this;
    }

    start() {
        this.spawnMap(); // 先生成地图
        this.spawnPlayer();
        this.updateUI(); // 初始化 UI 显示
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
        if (!this.mapPrefab) return;
        const map = instantiate(this.mapPrefab);
        
        if (this.worldRoot) {
            map.parent = this.worldRoot;
            map.setSiblingIndex(0); // 确保地图在最底下 (背景)
        }
    }

    spawnPlayer() {
        if (!this.playerPrefab) return;
        this._playerInstance = instantiate(this.playerPrefab);
        // 放到 worldRoot 下，而不是 Canvas
        if (this.worldRoot) {
            this._playerInstance.parent = this.worldRoot;
        }
        this._playerInstance.setPosition(0, 0, 0);
    }

    spawnEnemy() {
        if (!this.enemyPrefab || !this._playerInstance) return;
            
        const enemy = instantiate(this.enemyPrefab);
        // 放到 worldRoot 下
        if (this.worldRoot) enemy.parent = this.worldRoot;
        
        // 为了不遮挡 UI，最好把 UI 放在一个单独的 Layer 节点里，这里先简单通过 SiblingIndex 控制
        // 实际上只要 UI 节点在 Hierarchy 里位于 Player/Enemy 下方即可

        const angle = Math.random() * Math.PI * 2;
        const radius = math.randomRange(400, 600);
        const offsetX = Math.cos(angle) * radius;
        const offsetY = Math.sin(angle) * radius;
        const spawnPos = this._playerInstance.position.clone().add3f(offsetX, offsetY, 0);
        enemy.setPosition(spawnPos);

        const enemyScript = enemy.getComponent(Enemy);
        if (enemyScript) enemyScript.setup(this._playerInstance);
    }

    public getWorldRoot(): Node | null {
        return this.worldRoot;
    }

    public checkEvolve() {
        EVOLVE_CONFIG.forEach(recipe => {
            const weapon = this._ownedWeapons.get(recipe.weaponName);
            const passive = this._ownedPassives.get(recipe.passiveName);

            // 满足条件：有武器且满级，有被动（至少1级），且尚未进化
            if (weapon && weapon.level >= recipe.minWeaponLevel && passive && !weapon.isEvolved) {
                this.executeEvolve(weapon);
            }
        });
    }

    private executeEvolve(weapon: any) {
        weapon.isEvolved = true;
        console.log(`[进化] ${weapon.node.name} 觉醒为超武！`);
        // TODO: 这里可以播放特效、更换武器图标等
    }

    public onPlayerUpgrade(itemName: string) {
        const weapon = this._ownedWeapons.get('KnifeWeapon');
        const passive = this._ownedPassives.get('PassiveSunMoon');

        if (itemName === 'KnifeWeapon') {
            weapon.level++;
        } else if (itemName === 'PassiveSunMoon') {
            passive.upgrade();
        }

        // 每次选择奖励后检查是否可以进化
        this.checkEvolve();
    }
}