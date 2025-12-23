import { _decorator, Component, Node as CCNode, Prefab, director, instantiate, Label, Sprite } from "cc";
import { ILevelUpData } from "./ItemType.enum";

const { ccclass, property } = _decorator;

@ccclass('UpgradeCard')
export class UpgradeCard extends Component {
    @property(Label) titleLabel: Label = null!;
    @property(Label) descLabel: Label = null!;
    @property(Sprite) iconSprite: Sprite = null!;

    private _callback: Function = null!;

    public init(data: ILevelUpData, callback: Function) {
        this.titleLabel.string = `${data.name} (Lv.${data.level})`;
        this.descLabel.string = data.desc;
        this._callback = callback;
        // TODO: 加载图片资源 data.iconPath
    }

    /**
     * 该方法已绑定到 Button 的 Click Event
     */
    public onBtnClick() {
        console.log("卡片被点击，准备执行升级回调");
        if (this._callback) {
            this._callback();
        }
    }
}