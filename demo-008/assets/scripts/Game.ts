import { _decorator, Collider, Component, Director, Input, input, instantiate, Label, Node, PhysicsSystem, Prefab, RigidBody, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Game')
export class Game extends Component {

    @property({ type: Node })
    private ballNode: Node = null; // 绑定 ball 节点
    @property({ type: Prefab })
    private blockPrefab: Prefab = null; // 绑定 block 预制体
    @property({ type: Node })
    private blocksNode: Node = null; // 绑定 blocks 节点
    @property({ type: Label })
    private scoreLabel: Label = null; // 绑定 score label

    private bounceSpeed: number = 0; // 小球第一次落地时的速度
    private gameState: number = 0; // 0：等待开始 1：游戏开始 2：游戏结束
    private blockGap: number = 2.4; // 两块板的间距
    private score: number = 0; // 游戏得分

    start() {
        // 全局监听 input 事件
        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        this.collisionHandler();  // 监听碰撞事件
        this.initBlock();
    }

    update(dt: number) {
        if (this.gameState == 1) {
            let speed = -2 * dt;
            for (let blockNode of this.blocksNode.children) {
                let pos = blockNode.position.clone();
                pos.x += speed;
                blockNode.position = pos;

                // 检测板子是否出界
                this.checkBlockOut(blockNode);
            }
        }

        // 小球掉出屏幕 直接开始下一局
        if (this.ballNode.position.y < -4) {
            this.gameState = 2;
            Director.instance.loadScene('Game');
        }
    }

    /**
     * 检测板子是否出界
     * @param blockNode {Node} 板子节点
     */
    private checkBlockOut(blockNode: Node) {
        if (blockNode.position.x < -3) {
            // 将出界跳板的坐标修改为下一跳板出现的位置
            let nextBlockPosX = this.getLastBlockPosX() + this.blockGap;
            let nextBlockPosY = 0;
            blockNode.position = new Vec3(nextBlockPosX, nextBlockPosY, 0);
            this.initScore();
        }
    }

    /**
     * 获取最后一块跳板的位置
     * @returns {number} 最后一块跳板的位置
     */
    private getLastBlockPosX(): number {
        let lastBlockPosX = 0;
        for (let blockNode of this.blocksNode.children) {
            if (blockNode.position.x > lastBlockPosX) {
                lastBlockPosX = blockNode.position.x;
            }
        }
        return lastBlockPosX;
    }

    /**
     * 创建新跳板
     * @param pos {Vec3} 坐标
     */
    private createNewBlock(pos: Vec3) {
        let blockNode = instantiate(this.blockPrefab); // 创建预制节点
        blockNode.position = pos;
        this.blocksNode.addChild(blockNode);
    }

    /**
     * 初始化板子
     */
    private initBlock() {
        let posX: number;
        for (let i = 0; i < 8; i++) {
            if (i == 0) {
                posX = this.ballNode.position.x; // 第一块板生成在小球的下方
            } else {
                posX = posX + this.blockGap; // 根据间隔获取下一块跳板的位置
            }
            this.createNewBlock(new Vec3(posX, 0, 0));
        }
    }

    /**
     * 碰撞函数
     * @returns void
     */
    private collisionHandler(): void {
        let collider = this.ballNode.getComponent(Collider);
        let righdbody = this.ballNode.getComponent(RigidBody);

        // 每次碰撞都需要给向上的加速度改变
        collider.on('onCollisionEnter', () => {
            // 首次落地前 bounceSpeed 值为0，此时会将小球的落地速度的绝对值进行赋值
            let vc = new Vec3(0, 0, 0);
            righdbody.getLinearVelocity(vc);

            if (this.bounceSpeed == 0) {
                this.bounceSpeed = Math.abs(vc.y);
            } else {
                righdbody.setLinearVelocity(new Vec3(0, this.bounceSpeed, 0));
            }
        }, this);
    }

    /**
     * 点击开始
     * @returns void
     */
    private onTouchStart() {
        if (this.bounceSpeed == 0) return; // 只有小球落地后才可以进行操作

        let rigidbody = this.ballNode.getComponent(RigidBody);
        rigidbody.setLinearVelocity(new Vec3(0, -this.bounceSpeed * 1.5, 0)); // 将小球的下落速度变成反弹速度的 1.5 倍 实现加速逻辑

        this.gameState = 1; // 游戏开始
    }

    /**
     * 增加分数
     */
    private initScore() {
        this.score = this.score + 1;
        this.scoreLabel.string = `${this.score}`;
    }

}

