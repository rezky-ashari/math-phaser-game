import Phaser from 'phaser';

export default class Hole extends Phaser.GameObjects.Container {
    constructor(scene, x, y, value) {
        super(scene, x, y);

        this.value = value;
        this.scene = scene;

        // Visual
        const graphics = scene.add.sprite(0, 0, 'hole');
        this.add(graphics);

        // Text
        const text = scene.add.text(0, 0, value.toString(), {
            fontSize: '24px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.add(text);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Physics body for the container
        this.body.setCircle(30); // Matches graphics radius 30 (diam 60)
        this.body.setOffset(-30, -30); // Center the body
        this.body.immovable = true;
    }

    updateValue(newValue) {
        this.value = newValue;
        // Update text
        const textObj = this.list[1]; // Index 1 is text
        if (textObj) {
            textObj.setText(newValue.toString());
        }
    }
}
