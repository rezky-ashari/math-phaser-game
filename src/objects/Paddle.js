import Phaser from 'phaser';

export default class Paddle extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'paddle');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setImmovable(true);
        this.body.allowGravity = false;
        this.setCollideWorldBounds(true);

        // Controls
        this.cursors = scene.input.keyboard.createCursorKeys();
        this.keyA = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyD = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.shiftKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

        this.moveSpeed = 400;
        this.angle = 0; // Reset angle

        // Aiming Logic
        this.isAiming = false;
        this.aimAngle = -90; // Degrees, pointing up
    }

    update(delta) {
        if (this.isAiming) {
            // Aiming Mode: Keys rotate aim
            const rotateSpeed = 2;
            if (this.cursors.left.isDown || this.keyA.isDown) {
                this.aimAngle = Math.max(-160, this.aimAngle - rotateSpeed);
            } else if (this.cursors.right.isDown || this.keyD.isDown) {
                this.aimAngle = Math.min(-20, this.aimAngle + rotateSpeed);
            }
            // Ensure paddle stays still/centered (handled by Game.js setting position)
            this.setVelocityX(0);
        } else {
            // Normal Mode: Keys move paddle
            const speed = this.shiftKey.isDown ? this.moveSpeed * 2 : this.moveSpeed;

            if (this.cursors.left.isDown || this.keyA.isDown) {
                this.setVelocityX(-speed);
            } else if (this.cursors.right.isDown || this.keyD.isDown) {
                this.setVelocityX(speed);
            } else {
                this.setVelocityX(0);
            }

            this.angle = 0;
        }
    }
}
