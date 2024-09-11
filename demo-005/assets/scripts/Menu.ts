import { _decorator, Button, Component, Director, find, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Menu')
export class Menu extends Component {
    start() {
        // 找到 button 按钮
        // let btnNode: Node = find('/Canvas/bg/startBtn');
        // btnNode.on(Button.EventType.CLICK, this.gameStart, this);
    }

    gameStart() {
        Director.instance.loadScene('Game');
    }

    update(deltaTime: number) {

    }
}

