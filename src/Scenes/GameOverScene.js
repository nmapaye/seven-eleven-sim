class GameOverScene extends Phaser.Scene {
  constructor() {
    super("GameOverScene");
  }

  init(data) {
    // data.score and data.outOfAmmo or data.completed
    this.finalScore = data.score || 0;
    this.outOfAmmo = data.outOfAmmo || false;
    this.completed = data.completed || false;
  }

  preload(){
    this.load.audio('sndRestart', 'assets/menuSelect.wav');
  }

  create() {
    const { width, height } = this.sys.game.canvas;
    const title = this.completed ? "You Win!" : "Game Over";
    const subtitle = this.outOfAmmo
      ? "You’ve run out of ammo."
      : this.completed
        ? "You cleared all levels!"
        : "";

    // dark translucent background
    this.add.rectangle(0, 0, width, height, 0x000000, 0.6).setOrigin(0);

    this.add
      .text(width/2, height/2 - 50, title, {
        fontSize: "48px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    if (subtitle) {
      this.add
        .text(width/2, height/2, subtitle, {
          fontSize: "24px",
          color: "#ffffff",
        })
        .setOrigin(0.5);
    }

    this.add
      .text(
        width/2,
        height/2 + 60,
        `Final Score: ${this.finalScore}`,
        { fontSize: "32px", color: "#ffff00" }
      )
      .setOrigin(0.5);

    // “Press R to restart”
    this.add
      .text(width/2, height/2 + 130, "Press R to Play Again", {
        fontSize: "18px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    // listen for R
    this.input.keyboard.once("keydown-R", () => {
        this.sound.play('sndRestart');
        // give the SFX a moment to start before switching scenes
        this.time.delayedCall(200, () => {
        window.score = 0;
        this.scene.start("SlingshotGame");
        });
    });
  }
}
