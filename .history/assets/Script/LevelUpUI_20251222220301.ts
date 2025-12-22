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
        this.node.active = true;
        this.cardContainer.removeAllChildren();
        
        // 1. 暂停游戏
        director.pause();

        // 2. 从 GameManager 获取随机的 3 个奖励数据
        const upgrades = GameManager.instance.getRandomUpgrades(3);

        // 3. 生成卡片实例
        upgrades.forEach(data => {
            if (!this.cardPrefab) return;
            
            let cardNode = instantiate(this.cardPrefab);
            cardNode.setParent(this.cardContainer);
            
            const cardScript = cardNode.getComponent(UpgradeCard);
            if (cardScript) {
                cardScript.init(data, () => {
                    this.handleSelection(data);
                });
            }
        });
    }

    private handleSelection(data: ILevelUpData) {
        // 执行实际升级
        if (data.type === ItemType.Weapon) {
            const weapon = GameManager.instance.getWeapon<any>(data.id);
            if (weapon) weapon.upgrade();
        } else {
            const passive = GameManager.instance.getPassive<any>(data.id);
            if (passive) passive.upgrade();
        }

        // 检查进化
        GameManager.instance.checkEvolve();

        // 恢复游戏
        this.node.active = false;
        director.resume();
    }
}