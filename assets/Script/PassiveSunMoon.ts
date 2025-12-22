import { _decorator, Component } from 'cc';
import { GameManager } from './GameManager';
import { SunMoonLevels } from './AuroraBlade.interface';

const { ccclass } = _decorator;

@ccclass('PassiveSunMoon')
export class PassiveSunMoon extends Component {
    public level: number = 0; // 0 代表未获得，1-5 代表等级
    public maxLevel: number = 5;

    start() {
        GameManager.instance.registerPassive('PassiveSunMoon', this);
    }

    public upgrade() {
        if (this.level >= this.maxLevel) return;
        this.level++;
        
        // 获取配置：由于 level 从 1 开始，数组下标需 -1
        const config = SunMoonLevels[this.level - 1];
        
        // 直接覆盖全局速度倍率：1.0 (基础) + 配置的加成
        // 比如 1 级时是 1.0 + 0.2 = 1.2倍
        GameManager.instance.stats.projectileSpeedMul = 1.0 + config.speedMul;
        
        console.log(`日月梭升级至 Lv.${this.level}, 当前全局弹道速度倍率: ${GameManager.instance.stats.projectileSpeedMul}`);
    }
}