import { _decorator, Component, Prefab, instantiate, Node, math, director, ProgressBar, Label } from 'cc';
import { Enemy } from './Enemy';
import { ILevelUpData, ItemType } from './ItemType.enum';
import { AuroraBladeLevels, SunMoonLevels } from './AuroraBlade.interface';
import { LevelUpUI } from './LevelUpUI';
import { KnifeWeapon } from './KnifeWeapon';
import { PassiveSunMoon } from './PassiveSunMoon';
import { PlayerController } from './PlayerController';
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
        this.createNewPassive('PassiveSunMoon')
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
        if (LevelUpUI.instance) {
            LevelUpUI.instance.showLevelUp();
        }
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
        // 获取极光刃和日月梭的实例
        const knife = this.getWeapon<any>('KnifeWeapon');
        const sunMoon = this.getPassive<any>('PassiveSunMoon');

        // 进化条件：极光刃达到 5 级（根据你给出的配置最高级是 5），且拥有日月梭
        if (knife && knife.level >= 5 && sunMoon && sunMoon.level >= 1 && !knife.isEvolved) {
            this.executeEvolve(knife);
        }
    }

    private executeEvolve(weapon: any) {
        // 调用武器自身的进化方法
        if (weapon.evolve) {
            weapon.evolve();
        }
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

    public getAvailableUpgrades(): ILevelUpData[] {
        let pool: ILevelUpData[] = [];

        // --- 极光刃逻辑 ---
        const knife = this.getWeapon<KnifeWeapon>('KnifeWeapon');
        if (knife) {
            if (knife.level < knife.maxLevel) {
                const nextCfg = AuroraBladeLevels[knife.level];
                pool.push({
                    id: 'KnifeWeapon', type: ItemType.Weapon, name: '极光刃',
                    desc: nextCfg.desc, iconPath: 'textures/icons/knife', level: knife.level + 1
                });
            }
        }

        // --- 日月梭逻辑 (修复点) ---
        const sunMoon = this.getPassive<PassiveSunMoon>('PassiveSunMoon');
        if (sunMoon) {
            // 只有当前等级小于配置的最大等级（5级）时，才加入升级池
            if (sunMoon.level < sunMoon.maxLevel) {
                const nextCfg = SunMoonLevels[sunMoon.level];
                pool.push({
                    id: 'PassiveSunMoon',
                    type: ItemType.Passive,
                    name: '日月梭',
                    desc: nextCfg.desc,
                    iconPath: 'textures/icons/sunmoon',
                    level: sunMoon.level + 1
                });
            } else {
                console.log("日月梭已满级，不再加入升级池");
            }
        } else {
            // 未拥有时加入 1 级选项
            pool.push({
                id: 'PassiveSunMoon',
                type: ItemType.Passive,
                name: '日月梭',
                desc: SunMoonLevels[0].desc,
                iconPath: 'textures/icons/sunmoon',
                level: 1
            });
        }

        // --- 优先判断：是否触发进化 ---
        // 条件：极光刃满级(5) 且 日月梭至少1级 且 还没进化过
        if (knife && knife.level >= 5 && sunMoon && sunMoon.level >= 1 && !knife.isEvolved) {
            pool.push({
                id: 'KnifeWeaponEvolve', // 使用特殊 ID 标记进化
                type: ItemType.Weapon,
                name: '斩仙飞刀',
                desc: '极光刃终极进化！获得自动索敌与极致攻速',
                iconPath: 'textures/icons/evolve',
                level: 6
            });
            // 在吸血鬼幸存者逻辑中，如果出现进化，通常只给这一个选项，或者优先级最高
            return pool; 
        }
        return pool;
    }

    /**
     * 随机抽取三个奖励
     */
    public getRandomUpgrades(count: number = 3): ILevelUpData[] {
        // 先检查 Map 里到底有没有东西
        console.log("当前已注册武器库:", Array.from(this._ownedWeapons.keys()));
        console.log("当前已注册被动库:", Array.from(this._ownedPassives.keys()));
        const knife = this.getWeapon<KnifeWeapon>('KnifeWeapon');
        const sunMoon = this.getPassive<PassiveSunMoon>('PassiveSunMoon');
        
        if (knife && knife.level >= 5 && sunMoon && sunMoon.level >= 1 && !knife.isEvolved) {
            return [{
                id: 'KnifeWeaponEvolve', // 特殊 ID
                type: ItemType.Weapon,
                name: '斩仙飞刀',
                desc: '极光刃终极进化！获得自动索敌与无限穿透',
                iconPath: 'textures/icons/evolve',
                level: 6
            }];
        }
        let available = this.getAvailableUpgrades();
        console.log("经过等级过滤后可用的升级项:", available);

        let results: ILevelUpData[] = [];
        while (results.length < count && available.length > 0) {
            let randomIndex = Math.floor(Math.random() * available.length);
            results.push(available.splice(randomIndex, 1)[0]);
        }

        return results;
    }

    public getWeapon<T>(id: string): T | null {
        if (this._ownedWeapons.has(id)) {
            return this._ownedWeapons.get(id) as T;
        }
        return null;
    }

    /**
     * 根据 ID 获取已注册的被动宝物实例
     * @param id 注册时使用的字符串标识，如 "PassiveSunMoon"
     */
    public getPassive<T>(id: string): T | null {
        if (this._ownedPassives.has(id)) {
            return this._ownedPassives.get(id) as T;
        }
        return null;
    }

    // GameManager.ts

    public createNewPassive(id: string) {
        // 假设你已经把 PassiveSunMoon 挂在 Player 下了
        const playerNode = PlayerController.instance.node;
        let passiveComp = playerNode.getComponentInChildren(PassiveSunMoon);

        if (passiveComp) {
            // 1. 激活组件
            passiveComp.enabled = true;
            // 2. 调用初始化注册（解决你 start 不跑的问题）
            passiveComp.init(); 
            // 3. 执行第一次升级（Lv.1）
            passiveComp.upgrade(); 
        } else {
            console.error("在 Player 下没找到 PassiveSunMoon 组件，请检查预制体层级！");
        }
    }
}