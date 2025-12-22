import { _decorator, Component } from 'cc';
import { GameManager } from './GameManager';
const { ccclass } = _decorator;

@ccclass('PassiveSunMoon')
export class PassiveSunMoon extends Component {
    public level: number = 0;
    private speedBoostPerLevel: number = 0.2; // 每级提升20%

    public upgrade() {
        this.level++;
        // 修改全局因子
        GameManager.instance.stats.projectileSpeedMul += this.speedBoostPerLevel;
        console.log("日月梭升级，当前速度加成:", GameManager.instance.stats.projectileSpeedMul);
    }
}