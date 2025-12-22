import { _decorator, Component, Node as CCNode, Prefab, director, instantiate } from "cc";
import { GameManager } from "./GameManager";
import { UpgradeCard } from "./UpgradeCard";
import { ILevelUpData, ItemType } from "./ItemType.enum";

const { ccclass, property } = _decorator;

@ccclass('LevelUpUI')
export class LevelUpUI extends Component {
    @property(CCNode) cardContainer: CCNode = null!;
    @property(Prefab) cardPrefab: Prefab = null!;

    /**
     * 弹出升级界面
     */
    public show() {
        this.node.active = true;
        this.cardContainer.removeAllChildren();
        
        // 1. 暂停游戏
        director.pause();

        // 2. 获取随机奖励
        const upgrades = GameManager.instance.getRandomUpgrades(3);

        // 3. 生成卡片
        upgrades.forEach(data => {
            let cardNode = instantiate(this.cardPrefab);
            cardNode.setParent(this.cardContainer);
            
            // 假设卡片上有个 UpgradeCard 脚本处理显示
            cardNode.getComponent(UpgradeCard).init(data, () => {
                this.onSelectUpgrade(data);
            });
        });
    }

    // 在 LevelUpUI.ts 的选择回调中
    private onSelectUpgrade(data: ILevelUpData) {
        if (data.type === ItemType.Weapon) {
            // 获取实例并升级
            const weapon = GameManager.instance.getWeapon<any>(data.id);
            if (weapon) weapon.upgrade();
        } else {
            // 获取实例并升级
            const passive = GameManager.instance.getPassive<any>(data.id);
            if (passive) passive.upgrade();
        }

        // 每次升级后跑一次进化检测
        GameManager.instance.checkEvolve();

        // 恢复游戏
        this.node.active = false;
        director.resume();
    }

    
}