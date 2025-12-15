// BackgroundZFix.ts
import { _decorator, Component, Vec3 } from 'cc';
const { ccclass } = _decorator;

@ccclass('BackgroundZFix')
export class BackgroundZFix extends Component {
    start () {
        const p = this.node.position;
        this.node.setPosition(new Vec3(p.x, p.y, 900));
    }
}
