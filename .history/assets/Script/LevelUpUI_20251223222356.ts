import { _decorator, Component, Node as CCNode, Prefab, instantiate, director, Label, find } from 'cc';
import { GameManager } from './GameManager';
import { UpgradeCard } from './UpgradeCard'; // 下面会定义
import { ILevelUpData, ItemType } from './ItemType.enum';
const { ccclass, property } = _decorator;

@ccclass('LevelUpUI')
export class LevelUpUI extends Component {
    @property(CCNode) cardContainer: CCNode = null!;
    @property(Prefab) cardPrefab: Prefab = null!;

    public static instance: LevelUpUI = null!;

    onLoad() {
        LevelUpUI.instance = this;
        this.node.active = false;
    }

    /**
     * 外部调用触发升级界面（例如由 ExpManager 调用）
     */
public showLevelUp() {
        console.log("=== [升级系统] 开始触发 ===");
        this.node.active = true;
        this.cardContainer.removeAllChildren();
        
        director.pause();

        // 检查 GameManager 里的原始数据
        const upgrades = GameManager.instance.getRandomUpgrades(3);
        console.log("获取到的升级选项数据:", upgrades);

        if (upgrades.length === 0) {
            console.error("错误：获取到的升级选项为 0！请检查武器是否在 start 中 register，或配置是否正确。");
        }

        upgrades.forEach((data, index) => {
            if (!this.cardPrefab) {
                console.error("错误：cardPrefab 未在 Inspector 中拖入！");
                return;
            }
            
            let cardNode = instantiate(this.cardPrefab);
            console.log(`正在实例化第 ${index + 1} 张卡片: ${data.name}`);

            // 强制设置父节点
            cardNode.setParent(this.cardContainer);
            
            // 重要：强制重置坐标和缩放，防止预制体本身带了奇怪的偏置
            cardNode.setPosition(0, 0, 0);
            cardNode.setScale(1, 1, 1);
            
            // 重要：确保 Layer 是 UI_2D (通常 ID 是 1 << 25)
            // 如果你在编辑器里卡片能看到，动态生成的看不到，可能是这里的问题
            cardNode.layer = this.cardContainer.layer;

            const cardScript = cardNode.getComponent(UpgradeCard);
            if (cardScript) {
                cardScript.init(data, () => {
                    this.handleUpgradeSelection(data);
                });
            } else {
                console.error(`错误：预制体 ${cardNode.name} 上找不到 UpgradeCard 脚本！`);
            }
        });
    }

    private handleUpgradeSelection(data: ILevelUpData) {
        console.log(`玩家选择了升级: ${data.name}`);

        // 1. 根据类型执行升级
        if (data.type === ItemType.Weapon) {
            const weapon = GameManager.instance.getWeapon<any>(data.id);
            if (weapon) weapon.upgrade();
        } else {
            const passive = GameManager.instance.getPassive<any>(data.id);
            if (passive) passive.upgrade();
        }

        // 2. 检查并执行进化判定
        GameManager.instance.checkEvolve();

        // 3. 关闭界面并恢复游戏
        this.node.active = false;
        director.resume(); 
    }
}