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

    private onSelectUpgrade(data: ILevelUpData) {
        // 执行升级逻辑
        if (data.type === ItemType.Weapon) {
            GameManager.instance.getWeapon(data.id).upgrade();
        } else {
            GameManager.instance.getPassive(data.id).upgrade();
        }

        // 检查是否触发进化
        GameManager.instance.checkEvolve();

        // 关闭界面并恢复游戏
        this.node.active = false;
        director.resume();
    }
}