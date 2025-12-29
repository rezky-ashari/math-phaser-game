import './style.css';
import Phaser from 'phaser';
import Preloader from './src/scenes/Preloader';
import MainMenu from './src/scenes/MainMenu';
import Game from './src/scenes/Game';
import Pause from './src/scenes/Pause';
import GameOver from './src/scenes/GameOver';

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'app',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [
        Preloader,
        MainMenu,
        Game,
        Pause,
        GameOver
    ]
};

const game = new Phaser.Game(config);
