"use strict"

const config = {
    type: Phaser.AUTO,
    width: 1600,
    height: 900,
    physics: {
        default: 'matter',
        matter: {
            gravity: { y: 1 },
            debug: true
        }
    },
    scene: SlingshotGame
};


const game = new Phaser.Game(config);