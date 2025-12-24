import Phaser from 'phaser';
import Paddle from '../objects/Paddle';
import Ball from '../objects/Ball';
import Hole from '../objects/Hole';
import { MathGenerator } from '../utils/MathGenerator';

export default class Game extends Phaser.Scene {
    constructor() {
        super('Game');
    }

    init(data) {
        this.operator = data.operator || '+';
        this.score = 0;
        this.questionsAnswered = 0;
        this.totalQuestions = 10;
        this.currentQuestionData = null;

        // Streak Logic
        this.streak = 0;
        this.maxStreak = this.registry.get(`maxStreak_${this.operator}`) || 0;
        this.highScore = this.registry.get(`highScore_${this.operator}`) || 0;
    }

    create() {
        const { width, height } = this.scale;

        // Background
        // Background
        this.add.rectangle(0, 0, width, height, 0x222222).setOrigin(0).setDepth(-1);

        // UI
        this.scoreText = this.add.text(20, 20, `Score: 0`, { fontSize: '24px', color: '#fff' });
        this.streakText = this.add.text(20, 50, `Streak: 0`, {
            fontSize: '24px',
            color: '#ffaa00',
            fontStyle: 'bold'
        });

        this.levelText = this.add.text(width - 20, 20, `Level: ${this.operator}`, { fontSize: '24px', color: '#fff' }).setOrigin(1, 0);
        this.progressText = this.add.text(width - 20, 50, `1/${this.totalQuestions}`, { fontSize: '20px', color: '#aaaaaa' }).setOrigin(1, 0);

        // Control Info
        this.controlText = this.add.text(width / 2, height - 20, 'Controls: Arrows/AD (Aim) | Space (Launch)', {
            fontSize: '16px',
            color: '#888888'
        }).setOrigin(0.5);

        this.questionText = this.add.text(width / 2, height / 2 + 50, 'Ready?', {
            fontSize: '48px',
            color: '#ffff00'
        }).setOrigin(0.5);
        this.questionText.setDepth(1);
        // Debug Toggle: S to increment streak
        this.input.keyboard.on('keydown-S', () => {
            this.streak++;
            this.updateStreak();
            this.updateHighScore();
        });

        // Trajectory Graphics
        this.trajectoryGraphics = this.add.graphics();
        this.trajectoryGraphics.setDepth(100);

        // Walls
        this.physics.world.setBounds(0, 0, width, height);
        this.physics.world.checkCollision.down = false;

        // Custom Visual Walls
        this.add.sprite(10, height / 2, 'wallV').setDisplaySize(20, height);
        this.add.sprite(width - 10, height / 2, 'wallV').setDisplaySize(20, height);
        this.add.sprite(width / 2, 10, 'wallH').setDisplaySize(width, 20);

        this.physics.world.setBounds(20, 20, width - 40, height + 100);

        // Holes
        this.holes = [];
        const holeY = 80;
        const holeSpacing = 200;
        const startX = (width - (holeSpacing * 2)) / 2;

        for (let i = 0; i < 3; i++) {
            const hole = new Hole(this, startX + (i * holeSpacing), holeY, i);
            this.holes.push(hole);
        }

        // Bricks Group
        this.bricks = this.physics.add.staticGroup();

        // Paddle
        this.paddle = new Paddle(this, width / 2, height - 80);

        // Ball
        this.ball = new Ball(this, width / 2, height - 110);

        // Colliders
        this.physics.add.collider(this.ball, this.paddle, this.hitPaddle, null, this);
        this.physics.add.collider(this.ball, this.bricks, this.hitBrick, null, this);

        this.holes.forEach(hole => {
            this.physics.add.overlap(this.ball, hole, this.hitHole, null, this);
        });

        // Input
        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.pause();
            this.scene.launch('Pause');
        });

        this.input.keyboard.on('keydown-R', () => {
            this.scene.restart({ operator: this.operator });
        });

        // Start Game Loop
        this.nextQuestion();
        // Force reset to start aiming
        this.resetBall();
    }

    update(time, delta) {
        this.paddle.update();

        // Aiming Logic
        if (this.paddle.isAiming) {
            // Draw Trajectory
            this.trajectoryGraphics.clear();
            this.trajectoryGraphics.lineStyle(2, 0xffffff, 0.5); // Restored thickness and opacity

            const aimRad = Phaser.Math.DegToRad(this.paddle.aimAngle);
            const gap = 30; // Gap from ball center
            const length = 200; // Total length of line

            const startX = this.ball.x + Math.cos(aimRad) * gap;
            const startY = this.ball.y + Math.sin(aimRad) * gap;

            const endX = this.ball.x + Math.cos(aimRad) * length;
            const endY = this.ball.y + Math.sin(aimRad) * length;

            // Draw Line
            this.trajectoryGraphics.beginPath();
            this.trajectoryGraphics.moveTo(startX, startY);
            this.trajectoryGraphics.lineTo(endX, endY);
            this.trajectoryGraphics.strokePath();

            // Draw Arrow Head
            const arrowLength = 15;
            const arrowAngle1 = aimRad + Phaser.Math.DegToRad(150);
            const arrowAngle2 = aimRad - Phaser.Math.DegToRad(150);

            this.trajectoryGraphics.beginPath();
            this.trajectoryGraphics.moveTo(endX, endY);
            this.trajectoryGraphics.lineTo(
                endX + Math.cos(arrowAngle1) * arrowLength,
                endY + Math.sin(arrowAngle1) * arrowLength
            );
            this.trajectoryGraphics.moveTo(endX, endY);
            this.trajectoryGraphics.lineTo(
                endX + Math.cos(arrowAngle2) * arrowLength,
                endY + Math.sin(arrowAngle2) * arrowLength
            );
            this.trajectoryGraphics.strokePath();

            // Ball stuck to paddle
            this.ball.x = this.paddle.x;
            this.ball.y = this.paddle.y - 40;
            this.ball.setVelocity(0, 0);

            // Launch
            if (this.input.keyboard.checkDown(this.paddle.cursors.space, 500) || this.input.keyboard.checkDown(this.paddle.cursors.up, 500)) {
                this.launchBall();
            }
        }

        // Death Check
        if (this.ball.y > this.scale.height + 50) {
            this.handleDeath();
        }
    }

    launchBall() {
        this.paddle.isAiming = false;
        this.trajectoryGraphics.clear();

        // Update Controls text
        this.controlText.setText('Controls: Arrows/AD (Move) | Shift (Sprint)');

        // Calculate vector
        const speed = 400; // Launch speed
        const angleRad = Phaser.Math.DegToRad(this.paddle.aimAngle);

        this.ball.setVelocity(
            Math.cos(angleRad) * speed,
            Math.sin(angleRad) * speed
        );
    }

    hitPaddle(ball, paddle) {
        let diff = 0;

        if (ball.x < paddle.x) {
            diff = paddle.x - ball.x;
            ball.setVelocityX(-10 * diff);
        } else if (ball.x > paddle.x) {
            diff = ball.x - paddle.x;
            ball.setVelocityX(10 * diff);
        } else {
            ball.setVelocityX(2 + Math.random() * 8);
        }
    }

    hitBrick(ball, brick) {
        brick.disableBody(true, true);
        this.score += 10;
        this.scoreText.setText(`Score: ${this.score}`);
    }

    hitHole(ball, hole) {
        const isCorrect = (hole.value === this.currentQuestionData.answer);

        if (isCorrect) {
            this.score += 100;
            this.scoreText.setText(`Score: ${this.score}`);
            this.questionsAnswered++;

            // Streak
            this.streak++;
            this.updateStreak();
            this.updateHighScore();

            this.resetBall();

            // Correct Popup
            this.showFeedback('CORRECT!', 0x00ff00);

            if (this.questionsAnswered >= this.totalQuestions) {
                this.finishLevel();
            } else {
                this.nextQuestion();
            }
        } else {
            this.score = Math.max(0, this.score - 50);
            this.scoreText.setText(`Score: ${this.score}`);
            this.updateHighScore();

            // Reset Streak
            this.streak = 0;
            this.updateStreak();

            // Wrong Shake & Popup
            this.cameras.main.shake(200, 0.01);
            this.showFeedback('WRONG!', 0xff0000);

            this.resetBall();
        }
    }

    updateStreak() {
        this.streakText.setText(`Streak: ${this.streak}`);

        if (this.streak > this.maxStreak) {
            this.maxStreak = this.streak;
            this.registry.set(`maxStreak_${this.operator}`, this.maxStreak);
        }

        // Color Evolution
        if (this.streak >= 10) {
            this.streakText.setColor('#00ffff'); // Cyan (Max Hot)
        } else if (this.streak >= 5) {
            this.streakText.setColor('#ff0000'); // Red
        } else if (this.streak >= 2) {
            this.streakText.setColor('#ffcc00'); // Yellow/Hot Orange
        } else {
            this.streakText.setColor('#ffaa00'); // Default Orange
        }

        if (this.streak > 1) {
            // Bounce Main Text
            this.tweens.add({
                targets: this.streakText,
                scale: 1.3,
                duration: 100,
                yoyo: true
            });
        }
    }

    updateHighScore() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.registry.set(`highScore_${this.operator}`, this.highScore);
        }
    }

    showFeedback(text, color) {
        const feedback = this.add.text(this.scale.width / 2, this.scale.height / 2 - 50, text, {
            fontSize: '64px',
            color: '#ffffff',
            backgroundColor: color === 0x00ff00 ? '#00aa00' : '#aa0000',
            padding: { x: 20, y: 10 },
            fontStyle: 'bold'
        }).setOrigin(0.5).setAlpha(0).setDepth(20);

        this.tweens.add({
            targets: feedback,
            alpha: 1,
            y: this.scale.height / 2 - 100,
            duration: 500,
            yoyo: true,
            hold: 500,
            onComplete: () => feedback.destroy()
        });
    }

    handleDeath() {
        this.cameras.main.shake(200, 0.02);
        this.score = Math.max(0, this.score - 20);
        this.scoreText.setText(`Score: ${this.score}`);
        this.updateHighScore();
        this.streak = 0;
        this.updateStreak();

        this.resetBall();
    }

    finishLevel() {
        this.scene.start('GameOver', { result: 'VICTORY!', score: this.score, operator: this.operator });
    }

    resetBall() {
        this.ball.setVelocity(0, 0);
        this.paddle.x = this.scale.width / 2; // Center paddle
        this.paddle.setVelocity(0, 0);
        this.ball.x = this.paddle.x;
        this.ball.y = this.paddle.y - 40;

        // Enter Aiming Mode
        this.paddle.isAiming = true;
        this.paddle.aimAngle = -90; // Reset angle to up

        this.controlText.setText('Controls: Arrows/AD (Aim) | Space (Launch)');
    }

    nextQuestion() {
        this.spawnBricks();

        if (this.questionText.text !== 'Ready?') {
            this.tweens.add({
                targets: this.questionText,
                scaleX: 0,
                duration: 200,
                onComplete: () => {
                    this.updateQuestionData();
                    this.tweens.add({
                        targets: this.questionText,
                        scaleX: 1,
                        duration: 200
                    });
                }
            });
        } else {
            this.updateQuestionData();
        }
    }

    spawnBricks() {
        this.bricks.clear(true, true);

        const rows = 2;
        const cols = 7;
        const brickWidth = 60;
        const brickHeight = 20;
        const padding = 10;

        const totalWidth = (cols * brickWidth) + ((cols - 1) * padding);
        const startX = (this.scale.width - totalWidth) / 2 + (brickWidth / 2);
        const startY = 180;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const brick = this.bricks.create(
                    startX + (c * (brickWidth + padding)),
                    startY + (r * (brickHeight + padding)),
                    'brick'
                );
                brick.refreshBody();
            }
        }
    }

    updateQuestionData() {
        this.currentQuestionData = MathGenerator.generate(this.operator);
        this.questionText.setText(this.currentQuestionData.question);
        this.levelText.setText(`Level: ${this.operator}`);
        this.progressText.setText(`${this.questionsAnswered + 1}/${this.totalQuestions}`);

        const options = this.currentQuestionData.options;
        this.holes.forEach((hole, index) => {
            if (options[index] !== undefined) {
                hole.updateValue(options[index]);
            }
        });
    }
}
