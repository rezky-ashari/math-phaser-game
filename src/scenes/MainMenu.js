import Phaser from 'phaser';

export default class MainMenu extends Phaser.Scene {
    constructor() {
        super('MainMenu');
    }

    create() {
        const { width, height } = this.scale;

        this.add.text(width / 2, 100, 'Math Pinball', {
            fontSize: '48px',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.add.text(width / 2, 180, 'Select Level', {
            fontSize: '32px',
            color: '#aaaaaa'
        }).setOrigin(0.5);

        const operators = ['+', '-', '*', ':'];
        const startY = 250;
        const gap = 80;

        operators.forEach((op, index) => {
            const btn = this.add.text(width / 2, startY + (index * gap), `Level [ ${op} ]`, {
                fontSize: '32px',
                color: '#00ff00',
                backgroundColor: '#333333',
                padding: { left: 20, right: 20, top: 10, bottom: 10 }
            })
                .setOrigin(0.5)
                .setInteractive({ useHandCursor: true })
                .on('pointerdown', () => this.startLevel(op))
                .on('pointerover', () => btn.setStyle({ fill: '#ffff00' }))
                .on('pointerout', () => btn.setStyle({ fill: '#00ff00' }));
        });
    }

    startLevel(operator) {
        this.scene.start('Game', { operator: operator });
    }
}
