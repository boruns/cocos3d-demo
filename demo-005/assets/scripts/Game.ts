import { _decorator, Collider2D, Component, Contact2DType, Director, Input, input, instantiate, Label, Node, Prefab, RigidBody2D, Vec2, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Game')
export class Game extends Component {

    @property({ type: Node })
    private ballNode: Node = null; // 绑定 ball 节点

    @property({ type: Node })
    private blocksNode: Node = null; // 绑定 blocks 节点

    @property({ type: Prefab })
    private blockPrefab: Prefab = null; // 绑定 block 预制体

    @property({ type: Label })
    private scoreLabel: Label = null; // 绑定 score label

    private blockGap: number = 250; // 两块跳板的间距
    private bounceSpeed: number = 0; // 速度
    private gameState: number = 0; // 0 等待开始 1 游戏开始  2 游戏结束
    private score: number = 0; // 得分

    start() {
        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        this.collisionHandler();
        this.ballNode.position = new Vec3(-250, 200, 0); // 设置小球的初始位置
        this.initBlock();
    }

    update(dt: number) {
        if (this.gameState == 1) {
            this.moveAllBlock(dt);
        }
    }

    // 初始化跳板
    initBlock() {
        let posX: number;
        for (let i = 0; i < 5; i++) {
            if (i == 0) {
                posX = this.ballNode.position.x; // 第一块跳板生成在小球下方
            } else {
                posX = posX + this.blockGap;
            }
            // 说明跳板和小球高度相差 200 
            this.createNewBlock(new Vec3(posX, 0, 0))
        }
    }

    // 创建新跳板
    createNewBlock(pos: Vec3) {
        let blockNode = instantiate(this.blockPrefab); // 创建预制节点
        blockNode.position = pos; // 设置节点生成位置
        this.blocksNode.addChild(blockNode); // 将节点添加到 blocks 节点下面
    }

    // 移动所有跳板
    moveAllBlock(dt: number) {
        let speed = -300 * dt; // 移动速度
        for (let blockNode of this.blocksNode.children) {
            let pos = blockNode.position.clone();
            pos.x += speed;
            blockNode.position = pos; // 实时修改跳板的位置
            this.checkBlockOut(blockNode); // 跳板出界处理
        }
    }

    // 获取最后一块跳板的位置
    getLastBlockPosX(): number {
        let lastBlockPosX: number = 0;
        // 拿出最后一个跳板的位置
        for (let blockNode of this.blocksNode.children) {
            if (blockNode.position.x > lastBlockPosX) {
                lastBlockPosX = blockNode.position.x;
            }
        }
        return lastBlockPosX
    }


    // 跳板出界处理
    checkBlockOut(blockNode: Node) {
        // 将出界跳板的坐标修改为下一块跳板出现的位置
        if (blockNode.position.x < - 400) {
            let nextPosX = this.getLastBlockPosX() + this.blockGap; // 最后一个跳板的位置加上距离
            let nextPosY = (Math.random() > .5 ? 1 : -1) * (10 + 40 * Math.random()) // 高度随机
            blockNode.position = new Vec3(nextPosX, nextPosY, 0);
        }

        // 小球掉出屏幕
        if (this.ballNode.position.y < -700) {
            this.gameState = 2;
            Director.instance.loadScene('Menu'); // 重新加载场景
        }
    }

    // 点击的时候会加速小球下落
    onTouchStart() {
        // 只有小球落地后才可以进行操作
        if (this.bounceSpeed == 0) return;

        let rigidbody = this.ballNode.getComponent(RigidBody2D);
        // 将小球的下落速度变成反弹速度的 1.5 倍，实现加速逻辑
        rigidbody.linearVelocity = new Vec2(0, -this.bounceSpeed * 1.5);
        this.gameState = 1; // 游戏开始
    }

    // 监听小球碰撞事件
    collisionHandler() {
        // 获取碰撞体
        let collider = this.ballNode.getComponent(Collider2D);
        // 获取刚体
        let rigidbody = this.ballNode.getComponent(RigidBody2D);
        // 监听碰撞体事件
        collider.on(Contact2DType.BEGIN_CONTACT, () => {
            // 首次落地前 bounceSpeed 值为0，此时会将小球的落地速度的绝对值进行赋值
            if (this.bounceSpeed == 0) {
                this.bounceSpeed = Math.abs(rigidbody.linearVelocity.y);
            } else {
                // 此后将落地反弹的速度锁定为第一次落地的速度 因为是正数，所以是向上的
                rigidbody.linearVelocity = new Vec2(0, this.bounceSpeed);
            }
            // 游戏开始才会加分
            if (this.gameState == 1) {
                this.incrScore();
            }
        }, this);
    }

    // 加分操作
    incrScore() {
        this.score = this.score + 1;
        this.scoreLabel.string = String(this.score);
    }
}

