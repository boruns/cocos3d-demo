import { _decorator, Component, director, instantiate, Node, Prefab, resources, Sprite, SpriteFrame, Texture2D, Vec2, Vec3 } from 'cc';
import { Block } from './Block';
import { AudioManager } from './AudioManager';
const { ccclass, property } = _decorator;

@ccclass('Game')
export class Game extends Component {

    @property({ type: Prefab })
    private blockPrefab: Prefab = null; // 绑定 block 预制体

    @property({ type: Node })
    private bgNode: Node = null; // 绑定 bg 节点

    @property({ type: Node })
    private originPic: Node = null;

    @property({ type: AudioManager })
    private audioManager: AudioManager = null;

    private blockNum: number = 3; // 拼图规模 blockNum ✖️ blockNum 块
    private picNodeArr = [];
    private hideBlockNode: Node;
    private gameOver: boolean = false;

    start() {
        this.loadPicture();
        // 注册全局事件
        director.on('click_pic', this.onClickPic, this);
    }

    update(deltaTime: number) {

    }

    /**
     * 随机加载一个拼图
     */
    private loadPicture(): void {
        // 随机读取一个拼图素材 1 或者 2
        let pic_num = Math.floor(Math.random() * 2) + 1;
        // 这边获取的是纹理 
        resources.load(`pic_${pic_num}/texture`, Texture2D, (err: any, texture: Texture2D) => {
            if (err) {
                console.log(err);
                return;
            }
            // 初始化图片，全部显示
            this.initGame(texture);
            // 隐藏最后一个图片
            this.removeOnePic();
            // 然后打乱图片顺序
            this.randPicV2();
        });
        // 原始图片
        resources.load(`pic_${pic_num}/spriteFrame`, SpriteFrame, (err: any, spriteFrame: SpriteFrame) => {
            this.originPic.getComponent(Sprite).spriteFrame = spriteFrame;
        });
    }

    /**
     * 隐藏一个图片，这个是隐藏最后一个图片
     */
    private removeOnePic(): void {
        let pos = new Vec2(this.blockNum - 1, this.blockNum - 1);
        // 最后一个图片为 2 - 2，直接隐藏掉
        let picNode: Node = this.picNodeArr[pos.y][pos.x];
        picNode.active = false;
        this.hideBlockNode = picNode;
    }

    /**
     * 初始化游戏
     * @param texture 纹理素材
     */
    private initGame(texture: Texture2D): void {
        this.picNodeArr = [];
        // 计算拼图块的边宽
        let blockSide = texture.image.width / this.blockNum;

        // 生成 N✖️N的拼图块，其中 N 为 blockNum
        for (let i = 0; i < this.blockNum; i++) {
            this.picNodeArr[i] = [];
            for (let j = 0; j < this.blockNum; j++) {
                const blockNode = instantiate(this.blockPrefab);
                // 获取预制体挂载的脚本
                const blockScript = blockNode.getComponent('Block') as Block;
                // x 一直为正数， y 一直为负数 这个坐标是相对于 bg 节点的
                let blockNodePosition = new Vec3(j * blockSide, -i * blockSide, 0);
                /**
                 * 因为锚点为(0, 1) 所以 bg的 (0, 0) 在左上角
                 * 拼图的锚点也是 (0, 1)，也是左上角，所以坐标相对于bg依次为 大概为从左到右，从上到下渲染
                 * (0, 0 , 0)
                 * (240, 0, 0)
                 * (480, 0, 0)
                 * 
                 * (0, -240, 0)
                 * (240, -240, 0)
                 * (480, -240, 0)
                 * 
                 * (0, -480, 0)
                 * (240, -480, 0)
                 * (480, -480, 0)
                 */
                blockNode.setPosition(blockNodePosition);
                /**
                 * 传过去的坐标依次为： 从左到右 从上到下
                 * (0, 0)
                 * (1, 0)
                 * (2, 0)
                 * 
                 * (0, 1)
                 * (1, 1)
                 * (2, 1)
                 * 
                 * (0, 2)
                 * (1, 2)
                 * (2, 2)
                 */
                blockScript.init(texture, blockSide, new Vec2(j, i)); // 显示哪一块
                /**
                 * 从左到右，从上到下依次的索引为
                 * 0 - 0
                 * 0 - 1
                 * 0 - 2
                 * 1 - 0
                 * 1 - 1
                 * 1 - 2
                 * 2 - 0
                 * 2 - 1
                 * 2 - 2
                 */
                this.picNodeArr[i][j] = blockNode;
                this.bgNode.addChild(blockNode); // 挂载到对应的背景节点上
            }
        }
    }

    private randPicV2() {
        for (let i = 0; i < 16; i++) {
            let randomX = Math.floor(Math.random() * this.blockNum); // 0-2
            let randomY = Math.floor(Math.random() * this.blockNum); // 0-2
            let randomIndex = new Vec2(randomX, randomY);

            // 交换hideNode和randomIndex的node
            let hideNodeScript = this.hideBlockNode.getComponent('Block') as Block;
            let hideNodeNowIndex = hideNodeScript.nowIndex;

            this.swapPicByIndex(hideNodeNowIndex, randomIndex);
        }
    }

    private swapPicByIndex(nowIndex: Vec2, randomIndex: Vec2) {
        if (nowIndex.x == randomIndex.x && nowIndex.y == randomIndex.y) return;

        let nowPicNode = this.picNodeArr[nowIndex.y][nowIndex.x];
        let randomPicNode = this.picNodeArr[randomIndex.y][randomIndex.x];

        // 交换位置
        let tmpPos: Vec3 = nowPicNode.position.clone(); // 需要深拷贝
        nowPicNode.position = randomPicNode.position;
        randomPicNode.position = tmpPos;

        // 交换标记
        let nowNodeScript = nowPicNode.getComponent('Block') as Block;
        let randomNodeScript = randomPicNode.getComponent('Block') as Block;
        let tmpIndex: Vec2 = nowNodeScript.nowIndex.clone(); // 需要深拷贝
        nowNodeScript.nowIndex = randomNodeScript.nowIndex;
        randomNodeScript.nowIndex = tmpIndex;

        // 交换数组值
        this.picNodeArr[nowIndex.y][nowIndex.x] = randomPicNode;
        this.picNodeArr[randomIndex.y][randomIndex.x] = nowPicNode;
    }


    /**
     * 检查是否拼图成功
     * 主要是检查原始坐标和当前坐标是否一致
     */
    private checkComplete(): void {
        let rightCount = 0;
        for (let i = 0; i < this.blockNum; i++) {
            for (let j = 0; j < this.blockNum; j++) {
                const blockNode: Node = this.picNodeArr[i][j];
                const blockNodeScript: Block = blockNode.getComponent('Block') as Block;
                if (blockNodeScript.originIndex.equals(blockNodeScript.nowIndex)) {
                    rightCount++
                }
            }
        }
        if (rightCount == this.blockNum * this.blockNum) {
            this.hideBlockNode.active = true;
            this.gameOver = true;
        }
    }

    public onClickPic(nowIndex: Vec2): void {
        if (this.gameOver) return;
        // 上下左右四个方向
        let dirs = [
            new Vec2(0, -1), // 上移  // 0 1 2
            new Vec2(0, 1), // 下移
            new Vec2(-1, 0), // 左移
            new Vec2(1, 0), // 右移
        ];

        let nearBlockNode: Node;
        let nearBlockIndex: Vec2;

        for (let dir of dirs) {
            let nearIndex = nowIndex.clone().add(dir);

            // x y 坐标必须在 [0, 2] 范围内
            if (nearIndex.x < 0 ||
                nearIndex.x >= this.blockNum ||
                nearIndex.y < 0 ||
                nearIndex.y >= this.blockNum
            ) {
                continue;
            }

            let blockNode = this.picNodeArr[nearIndex.y][nearIndex.x];
            // 判断相邻的图片是否是隐藏图片
            if (!blockNode || blockNode.active) {
                continue;
            }

            // 然后拿到相邻图片的相关坐标
            nearBlockNode = blockNode;
            nearBlockIndex = nearIndex.clone();
        }

        if (nearBlockNode) {
            // 播放音效
            this.audioManager.playSound();
            // 直接交换
            this.swapPicByIndex(nowIndex, nearBlockIndex);
            // 检查是否完成
            this.checkComplete();
        }

    }

    private randPic(): void {
        let swapTimes = 100; // 随机次数
        for (let i = 0; i < swapTimes; i++) {
            let dirs = [
                new Vec2(0, 1),
                new Vec2(0, -1),
                new Vec2(1, 0),
                new Vec2(-1, 0),
            ];

            let randDir = dirs[Math.floor(Math.random() * dirs.length)];
            let hideBlockNodeScript = this.hideBlockNode.getComponent('Block') as Block;
            let nearIndex = hideBlockNodeScript.nowIndex.clone().add(randDir);

            // 越界检查
            if (nearIndex.x < 0 || nearIndex.x >= this.blockNum || nearIndex.y < 0 || nearIndex.y >= this.blockNum) {
                continue;
            }
            this.swapPicByIndex(hideBlockNodeScript.nowIndex, nearIndex);
        }
    }

}

