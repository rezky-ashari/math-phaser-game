export class MathGenerator {
    static generate(operator) {
        let question = '';
        let answer = 0;
        let num1, num2;

        switch (operator) {
            case '+':
                num1 = Phaser.Math.Between(1, 50);
                num2 = Phaser.Math.Between(1, 50);
                question = `${num1} + ${num2}`;
                answer = num1 + num2;
                break;
            case '-':
                num1 = Phaser.Math.Between(20, 100);
                num2 = Phaser.Math.Between(1, num1); // Ensure positive result
                question = `${num1} - ${num2}`;
                answer = num1 - num2;
                break;
            case '*':
                num1 = Phaser.Math.Between(2, 12);
                num2 = Phaser.Math.Between(2, 12);
                question = `${num1} x ${num2}`;
                answer = num1 * num2;
                break;
            case ':': // Division
                num2 = Phaser.Math.Between(2, 10);
                answer = Phaser.Math.Between(2, 12);
                num1 = num2 * answer; // Ensure clean division
                question = `${num1} : ${num2}`;
                break;
            default:
                // Default to addition if something goes wrong
                num1 = 1;
                num2 = 1;
                question = '1 + 1';
                answer = 2;
                break;
        }

        // Generate wrong options
        const options = [answer];
        while (options.length < 3) {
            let offset = Phaser.Math.Between(-10, 10);
            let wrong = answer + offset;
            if (wrong !== answer && wrong >= 0 && !options.includes(wrong)) {
                options.push(wrong);
            } else if (wrong < 0) {
                // Try to keep positive for simplicity if desired, or allow negative.
                // Let's retry generating a valid wrong answer
                continue;
            }
        }

        // Shuffle options
        // Simple shuffle
        for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [options[i], options[j]] = [options[j], options[i]];
        }

        return {
            question,
            answer,
            options
        };
    }
}
