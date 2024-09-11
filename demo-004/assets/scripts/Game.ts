import { _decorator, Collider2D, Component, Contact2DType, Director, Input, input, IPhysics2DContact, Label, math, Node, ParticleSystem2D, Sprite, Tween, tween, Vec3, PhysicsSystem2D, EPhysics2DDrawFlags } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Game')
export class Game extends Component {

    @property({ type: Node })
    private bulletNode: Node = null; // 绑定 bullet 节点

    private gameState: number = 0; // 0 子弹未发射 1：子弹已发射 2：游戏结束

    @property({ type: Node })
    private enemyNode: Node = null; // 绑定 enemy 节点

    @property({ type: Label })
    private scoreLabel: Label = null; // 绑定 score label

    @property({ type: Node })
    private boomNode: Node = null;

    private bulletTween: Tween<Node> = null;
    private enemyTween: Tween<Node> = null;
    private score: number = 0; // 游戏得分


    start() {
        input.on(Input.EventType.TOUCH_START, this.fire, this);
        this.newLevel();
    }

    protected onDestroy(): void {
        input.off(Input.EventType.TOUCH_START, this.fire, this);
    }

    update(deltaTime: number) {
        this.checkHit();
    }

    // 敌人初始化
    enemyInit() {
        let st_pos = new Vec3(300, 260, 0); // 敌人初始化的位置
        let dua: number; // 从屏幕右边移动到左边所需时间

        dua = 1.5 - Math.random() * 0.5; // 移动时间随机 1 ~ 1.5

        st_pos.y = st_pos.y - Math.random() * 40; // 初始 y 坐标随机范围 220 ~ 260
        // 50% 概率 随机到对面
        if (Math.random() > 0.5) {
            st_pos.x = -st_pos.x;
        }

        this.enemyNode.setPosition(st_pos); // 设置敌人初始位置
        this.enemyNode.active = true;

        this.enemyTween = tween(this.enemyNode) // 指定缓动对象
            .to(dua, { position: new Vec3(-st_pos.x, st_pos.y, 0) })  // 移动到左侧
            .to(dua, { position: new Vec3(st_pos.x, st_pos.y, 0) }) // 移动到右侧
            .union() // 将上下文的缓动动作打包成一个
            .repeatForever() // 一直重复
            .start(); // 启动缓动
    }

    // 子弹初始化
    bulletInit() {
        let st_ops = new Vec3(0, -340, 0);

        this.bulletNode.setPosition(st_ops);
        this.bulletNode.active = true;
    }


    gameOver() {
        console.log('游戏结束');
        this.gameState = 2;

        let bulletColor = this.bulletNode.getComponent(Sprite).color;
        this.boom(this.bulletNode.position, bulletColor);

        setTimeout(() => {
            Director.instance.loadScene('Game'); // 重新加载游戏
        }, 1000);
    }

    // 游戏初始化
    newLevel() {
        this.enemyInit();
        this.bulletInit();
        this.gameState = 0; // 重置游戏状态
    }

    // 增加得分
    increScore() {
        this.score = this.score + 1;
        this.scoreLabel.string = String(this.score);
    }

    // 检测是否碰撞
    checkHit() {
        if (this.gameState != 1) return;  // 子弹处于发射状态才会检测

        // 获取两个坐标的距离
        let dis = Vec3.distance(this.bulletNode.position, this.enemyNode.position);
        if (dis < 100) {
            this.bulletTween.stop(); // 停止缓动动画
            this.enemyTween.stop(); // 停止敌人移动的缓动动画
            this.gameState = 2; // 游戏结束

            this.bulletNode.active = false; // 隐藏子弹对象
            this.enemyNode.active = false; // 隐藏敌人对象

            // 播放粒子效果
            let enemyColor = this.enemyNode.getComponent(Sprite).color; // 敌人的颜色
            this.boom(this.bulletNode.position, enemyColor);

            this.increScore(); // 增加得分
            this.newLevel(); // 新一轮游戏
        }
    }

    // 发射子弹
    fire() {
        if (this.gameState != 0) return; // 子弹已经发射

        this.gameState = 1;
        this.bulletTween = tween(this.bulletNode) // 指定缓动对象
            .to(0.6, { position: new Vec3(0, 500, 0) }) // 对象在 0.6s 内移动到指定坐标系
            .call(() => { // 到达目的地后，代表游戏结束
                this.gameOver();
            })
            .start(); // 启动缓动
    }

    // 播放爆破例子效果
    boom(pos: Vec3, color?: math.Color) {
        this.boomNode.setPosition(pos); // 设置粒子位置
        let particle = this.boomNode.getComponent(ParticleSystem2D);
        if (color != undefined) {
            particle.startColor = particle.endColor = color;
        }
        particle.resetSystem(); // 播放完直接重置
    }
}

