import Phaser from 'phaser';

export default class GameOver extends Phaser.Scene {
    constructor() {
        super('GameOver');
    }

    create(data) {
        const { width, height } = this.scale;
        const result = data.result || 'Game Over';
        const score = data.score || 0;

        this.add.text(width / 2, 100, result, {
            fontSize: '64px',
            color: result === 'VICTORY!' ? '#00ff00' : '#ff0000'
        }).setOrigin(0.5);

        this.add.text(width / 2, 200, `Final Score: ${score}`, {
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5);

        const btn = this.add.text(width / 2, 400, 'Back to Menu', {
            fontSize: '32px',
            color: '#00ff00',
            backgroundColor: '#333333',
            padding: { left: 20, right: 20, top: 10, bottom: 10 }
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.scene.start('MainMenu'))
            .on('pointerover', () => btn.setStyle({ fill: '#ffff00' }))
            .on('pointerout', () => btn.setStyle({ fill: '#00ff00' }));
    }
}
