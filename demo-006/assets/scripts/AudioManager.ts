import { _decorator, AudioClip, AudioSource, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('AudioManager')
export class AudioManager extends Component {

    @property({ type: AudioClip })
    public clickClip: AudioClip = null;

    private audioSource: AudioSource;

    protected onLoad(): void {
        this.audioSource = this.getComponent(AudioSource);
    }

    // 点击播放音乐
    public playSound() {
        this.audioSource.playOneShot(this.clickClip, 1);
    }

    start() {

    }

    update(deltaTime: number) {

    }
}

