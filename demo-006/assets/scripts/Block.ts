import { _decorator, Component, director, Node, Rect, Sprite, SpriteFrame, Texture2D, UITransform, Vec2 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Block')
export class Block extends Component {

    public originIndex = new Vec2(0, 0); // 初始位置下标
    public nowIndex = new Vec2(0, 0); // 当前位置下标

    start() {
        this.node.on(Node.EventType.TOUCH_START, this.onBlockTouch, this);
    }

    onBlockTouch() {
        director.emit('click_pic', this.nowIndex);
    }

    /**
     * 拼图块的初始化函数
     * @param texture 目标纹理
     * @param blockSide 拼图块边长
     * @param index 拼图块初始下标
     */
    public init(texture: Texture2D, blockSide: number, index: Vec2) {
        const sprite = this.getComponent(Sprite);
        const spriteFrame = new SpriteFrame();

        // 设置宽高为 边长
        const uiTransform = this.getComponent(UITransform);
        uiTransform.setContentSize(blockSide, blockSide);

        spriteFrame.texture = texture;
        // 创建一个矩形
        spriteFrame.rect = new Rect(index.x * blockSide, index.y * blockSide, blockSide, blockSide);
        sprite.spriteFrame = spriteFrame;

        this.nowIndex = index; // 就是初始化的时候传过来的数组的索引值
        this.originIndex = index;
    }

    update(deltaTime: number) {

    }
}

