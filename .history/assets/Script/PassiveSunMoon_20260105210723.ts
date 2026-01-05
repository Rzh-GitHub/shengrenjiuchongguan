import { _decorator, Component } from 'cc';
import { GameManager } from './GameManager';
import { SunMoonLevels } from './AuroraBlade.interface';

const { ccclass } = _decorator;

@ccclass('PassiveSunMoon')
export class PassiveSunMoon extends Component {
    public level: number = 0;
    private _maxLevel = SunMoonLevels.length;
    public init() {
        console.log("日月梭正式激活并注册！");
        GameManager.instance.registerPassive('PassiveSunMoon', this);
    }

    public upgrade() {
        if (this.level >= this._maxLevel) return;
        this.level++;
        const config = SunMoonLevels[this.level - 1];
        GameManager.instance.stats.projectileSpeedMul = 1.0 + config.speedMul;
    }
}