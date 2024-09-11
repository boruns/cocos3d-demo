import { _decorator, Color, color, Component, math, Node, ParticleSystem2D, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Test')
export class Test extends Component {
    @property({ type: Node })
    private boom: Node = null;

    start() {
        setInterval(() => {
            this.boom.setPosition(new Vec3(0, 20, 0));
            let boomNode = this.boom.getComponent(ParticleSystem2D);
            boomNode.startColor = Color.CYAN;
            boomNode.endColor = Color.YELLOW;
            boomNode.resetSystem();
        }, 1000)
    }

    update(deltaTime: number) {

    }
}

