import Phaser from 'phaser';

export default class Pause extends Phaser.Scene {
    constructor() {
        super('Pause');
    }

    create() {
        const { width, height } = this.scale;

        // Semi-transparent bg
        this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);

        this.add.text(width / 2, height / 2 - 50, 'PAUSED', {
            fontSize: '64px',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.add.text(width / 2, height / 2 + 20, 'Press ESC to Resume', {
            fontSize: '24px',
            color: '#aaaaaa'
        }).setOrigin(0.5);

        this.add.text(width / 2, height / 2 + 60, 'Press Q to Quit to Menu', {
            fontSize: '24px',
            color: '#aaaaaa'
        }).setOrigin(0.5);

        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.resume('Game');
            this.scene.stop();
        });

        this.input.keyboard.on('keydown-Q', () => {
            this.scene.stop('Game');
            this.scene.stop();
            this.scene.start('MainMenu');
        });
    }
}
