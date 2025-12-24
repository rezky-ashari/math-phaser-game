import Phaser from 'phaser';

export default class Ball extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'ball');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setCollideWorldBounds(true);
        this.setBounce(1);
        this.setCircle(10); // Matches the graphics radius 10 (diam 20)

        // Initial random velocity
        this.setVelocity(0, 0);
    }

    launch() {
        if (this.body.velocity.x === 0 && this.body.velocity.y === 0) {
            const speed = 300;
            const angle = Phaser.Math.Between(-45, 45); // Launch upwardsish? Or downwards?
            // Holes are at top, paddle at bottom. Launch UP from paddle? 
            // Or launch down from top? Brick breaker usually starts from paddle going up.
            // Let's assume start on paddle or middle.
            // Vector logic handled in Game.js
            this.setVelocityY(-speed);
            this.setVelocityX(Phaser.Math.Between(-100, 100));
        }
    }
}
