import { _decorator, Button, Component, director, EventHandler, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Game')
export class Game extends Component {

    /**
     * 游戏克制关系
     * 弓箭(0) 克制 流星锤(1)
     * 流星锤(1) 克制 盾牌(2)
     * 盾牌(2) 克制 弓箭(0)
     */

    @property({ type: Node })
    private enemySkillNode: Node = null; // 绑定 enemy_kill 节点

    private enemyAttackType = 0; // 敌人招式 0: 弓箭 1: 流星锤 2: 盾牌
    private timer = null; // 计时器

    @property({ type: Label })
    private hintLable: Label = null; // 绑定 hint 节点

    start() {
        // 启动定时器，每 0.1s 执行一次
        this.timer = setInterval(() => {
            this.randEnemyAttack();
        }, 100);
    }

    // 敌人随机招式
    randEnemyAttack() {
        this.enemyAttackType = Math.floor(Math.random() * 3); // 给敌人随机招式 0 ~ 2
        let children = this.enemySkillNode.children;
        // 如果节点名字与随机招式的编号一直则显示，否则隐藏
        children.forEach(childNode => {
            if (childNode.name == this.enemyAttackType.toString()) {
                childNode.active = true;
            } else {
                childNode.active = false;
            }
        })
    }

    attack(event: Button, _customEventData: string) {
        if (!this.timer) {
            return;
        }
        // 点击的时候就直接停止定时器
        clearInterval(this.timer);
        this.timer = null;

        let pkRes = 0; // 0: 平 1: 赢 -1: 输
        let attackType = event.target.name; // 获取目标节点的name
        if (attackType == "0") {
            if (this.enemyAttackType == 0) {
                pkRes = 0;
            } else if (this.enemyAttackType == 1) {
                pkRes = 1;
            } else if (this.enemyAttackType == 2) {
                pkRes = -1;
            }
        } else if (attackType == "1") {
            if (this.enemyAttackType == 0) {
                pkRes = -1;
            } else if (this.enemyAttackType == 1) {
                pkRes = 0;
            } else if (this.enemyAttackType == 2) {
                pkRes = 1;
            }
        } else if (attackType == "2") {
            if (this.enemyAttackType == 0) {
                pkRes = 1;
            } else if (this.enemyAttackType == 1) {
                pkRes = -1;
            } else if (this.enemyAttackType == 2) {
                pkRes = 0;
            }
        }

        switch (pkRes) {
            case -1:
                this.hintLable.string = '失败';
                break;
            case 0:
                this.hintLable.string = '平局';
                break;
            case 1:
                this.hintLable.string = '胜利';
                break;
        }

    }

    // 重新加载场景
    restart() {
        if (this.timer != null) {
            clearInterval(this.timer);
        }
        director.loadScene('Game');
    }

    update(deltaTime: number) {

    }
}

