import { _decorator, Component, Label, Node, Animation } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Game')
export class Game extends Component {
    private playerMaxHp: number = 25; // 玩家最大血量
    private playerMaxAp: number = 3; // 玩家最大行动点
    private playerMaxMp: number = 10; // 玩家最大法力值上线
    private playerAtk: number = 5; // 玩家攻击力
    private healMpCost: number = 8; // 恢复术法力消耗
    private healHp: number = 5; // 恢复力血量
    private incrMp: number = 2; // 法力恢复速度

    private enemyMaxHp: number = 25; // 敌人最大血量
    private enemyAtk: number = 3; // 敌人攻击力

    private playerHp: number = 0; // 玩家当前血量
    private playerAp: number = 0; // 玩家当前行动点
    private playerMp: number = 0; // 玩家当前法力值
    private enemyHp: number = 0; // 敌人当前血量

    private turnNum: number = 0; // 0: 玩家回合 1: 敌人回合

    @property({ type: Node })
    private enemyAreaNode: Node = null; // 绑定 enemyArea 节点
    @property({ type: Label })
    private enemyHpLabel: Label = null; // 绑定 enemy 节点下的 hp 节点

    @property({ type: Label })
    private playerHpLabel: Label = null // 绑定player 节点下的 hp 节点
    @property({ type: Label })
    private playerApLabel: Label = null // 绑定player 节点下的 ap 节点
    @property({ type: Label })
    private playerMpLabel: Label = null // 绑定player 节点下的 mp 节点

    @property({ type: Node })
    private nextBtnNode: Node = null;

    @property({ type: Animation })
    private bgAni: Animation = null; // 绑定 bg 节点


    public start() {
        this.initEnemy();
        this.initPlayer();
        // 切换背景的动画播放完之后，就初始化相关敌人
        this.bgAni.on(Animation.EventType.FINISHED, this.bgAniFinish, this);

        // 敌人攻击之后的动画播放完之后 重置攻击标识
        let ani = this.enemyAreaNode.getComponent(Animation);
        ani.on(Animation.EventType.FINISHED, () => {
            this.turnNum = 0;
        }, this);
    }

    /**
     * 过度动画结束回调
     */
    private bgAniFinish(): void {
        this.initEnemy();
        this.turnNum = 0;
        this.updatePlayerAp(this.playerMaxAp);
    }

    /**
     * 初始化敌人
     */
    private initEnemy() {
        this.updateEnemyHp(this.enemyMaxHp);
        this.enemyAreaNode.active = true;
    }

    /**
     * 更新敌人血量
     * @param hp 血量
     */
    private updateEnemyHp(hp: number): void {
        this.enemyHp = hp;
        this.enemyHpLabel.string = `${this.enemyHp}hp`;
    }

    /**
     * 初始化玩家
     */
    private initPlayer(): void {
        this.updatePlayerAp(this.playerMaxAp);
        this.updatePlayerHp(this.playerMaxHp);
        this.updatePlayerMp(this.playerMaxMp);
    }

    /**
     * 更新玩家血量
     * @param {number} hp 血量
     */
    private updatePlayerHp(hp: number): void {
        this.playerHp = hp;
        this.playerHpLabel.string = `HP\n${this.playerHp}`;
    }

    /**
     * 更新玩家行动点
     * @param {number} ap 当前 ap 值
     */
    private updatePlayerAp(ap: number): void {
        this.playerAp = ap;
        this.playerApLabel.string = `AP\n${this.playerAp}`;
    }


    /**
     * 更新玩家法力值
     * @param {number} mp mp值
     */
    private updatePlayerMp(mp: number): void {
        this.playerMp = mp;
        this.playerMpLabel.string = `MP\n${this.playerMp}`;
    }

    /**
     * 玩家发起攻击
     * @returns 
     */
    private playerAttack(): void {
        if (this.turnNum != 0) return; // 不是自己的回合不能行动
        if (this.playerAp <= 0) return; // 没有行动点不能行动

        this.playerAp -= 1; // 消耗一个行动点

        this.playerMp += this.incrMp; // 自然法力恢复
        if (this.playerMp > this.playerMaxMp) {
            this.playerMp = this.playerMaxMp;
        }

        // 播放敌人受击动画
        let ani = this.enemyAreaNode.getComponent(Animation);
        ani.play('hurt');

        this.enemyHp -= this.playerAtk;
        if (this.enemyHp <= 0) {
            this.enemyDie();
            return;
        }
        this.updateEnemyHp(this.enemyHp);
        this.updatePlayerAp(this.playerAp);
        this.updatePlayerMp(this.playerMp);
        this.checkEnemyAction();
    }

    /**
     * 敌人死亡逻辑
     */
    private enemyDie(): void {
        this.enemyAreaNode.active = false;
        this.nextBtnNode.active = true;
        // this.nextRoom();
    }

    /**
     * 玩家使用治疗
     * @returns 
     */
    private playerHeal(): void {
        if (this.turnNum != 0) return;// 不是自己回合不能行动
        if (this.playerAp <= 0 || this.playerMp < this.healMpCost) return;

        this.playerAp -= 1; // 消耗一个行动点
        this.playerMp -= this.healMpCost; // 消耗法力值
        this.playerHp += this.healHp; // 恢复治疗值
        // 越界检查
        if (this.playerHp > this.playerMaxHp) {
            this.playerHp = this.playerMaxHp;
        }

        this.updatePlayerHp(this.playerHp);
        this.updatePlayerAp(this.playerAp);
        this.updatePlayerMp(this.playerMp);
        this.checkEnemyAction();
    }

    private checkEnemyAction(): void {
        if (this.turnNum == 0 && this.playerAp <= 0) {
            this.turnNum = 1;
            this.enemyAttack(this.enemyAtk);
        }
    }

    /**
     * 敌人攻击
     * @param atk 攻击伤害
     * @returns 
     */
    private enemyAttack(atk: number) {
        if (this.turnNum != 1) return;
        this.playerHp -= atk;
        this.updatePlayerHp(this.playerHp);

        // 播放玩家攻击动画
        let ani = this.enemyAreaNode.getComponent(Animation);
        ani.play('attack');

        if (this.playerHp <= 0) {
            console.log('游戏结束');
            return;
        }
        // this.turnNum = 0;
        this.updatePlayerAp(this.playerMaxAp);
    }

    /**
     * 进入下一个房间
     */
    private nextRoom(): void {
        console.log('进入下一个房间');
        let ani = this.enemyAreaNode.getComponent(Animation);
        ani.stop();
        this.bgAni.play('interlude');
        this.nextBtnNode.active = false;
    }

}

