import Phaser from 'phaser';

export default class Preloader extends Phaser.Scene {
    constructor() {
        super('Preloader');
    }

    preload() {
        // Create simple graphics for assets
        const graphics = this.make.graphics();

        // Ball Texture
        graphics.fillStyle(0xffffff);
        graphics.fillCircle(10, 10, 10);
        graphics.generateTexture('ball', 20, 20);
        graphics.clear();

        // Paddle Texture
        graphics.fillStyle(0x00ff00);
        graphics.fillRect(0, 0, 100, 20);
        graphics.generateTexture('paddle', 100, 20);
        graphics.clear();

        // Hole Texture
        graphics.fillStyle(0x555555);
        graphics.fillCircle(30, 30, 30);
        graphics.generateTexture('hole', 60, 60);
        graphics.clear();

        // Wall Texture (Vertical)
        graphics.fillStyle(0x888888);
        graphics.fillRect(0, 0, 20, 600);
        graphics.generateTexture('wallV', 20, 600);
        graphics.clear();

        // Wall Texture (Horizontal)
        graphics.fillStyle(0x888888);
        graphics.fillRect(0, 0, 800, 20);
        graphics.generateTexture('wallH', 800, 20);
        graphics.clear();

        // Brick Texture
        graphics.fillStyle(0x00aaff);
        graphics.fillRect(0, 0, 60, 20);
        graphics.lineStyle(2, 0xffffff);
        graphics.strokeRect(0, 0, 60, 20);
        graphics.generateTexture('brick', 60, 20);
        graphics.clear();

        // Fire Texture (Simple Particle)
        graphics.fillStyle(0xffaa00);
        graphics.fillCircle(4, 4, 4);
        graphics.generateTexture('fire', 8, 8);
        graphics.clear();
    }

    create() {
        this.scene.start('MainMenu');
    }
}
