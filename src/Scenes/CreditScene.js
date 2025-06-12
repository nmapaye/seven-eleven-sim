class CreditsScene extends Phaser.Scene {
  constructor() {
    super("CreditsScene");
  }

  create() {
    const { width, height } = this.sys.game.canvas;

    // Semi-transparent background
    this.add.rectangle(0, 0, width, height, 0x000000, 0.8).setOrigin(0);

    // Title
    this.add.text(width/2, 80, "Credits", {
      fontSize: "48px",
      color: "#ffffff",
      fontFamily: "Arial"
    }).setOrigin(0.5);

    // The actual credit lines
    const lines = [
      "Game Design & Code: Bryce Han, Nathan Mapaye, Cameron Coleman",
      "Art & Animation: Anokolisa, OboroPixel",
      "Sound Effects: Dask",
      "Special Thanks: Arc System Works for bringing back Marvel", 
      "",
      "Press M to return to Menu"
    ];

    lines.forEach((line, i) => {
      this.add.text(width/2, 160 + i*32, line, {
        fontSize: "24px",
        color: "#ffffff",
        fontFamily: "Arial"
      }).setOrigin(0.5);
    });

    // Go back to a “menu” or to the game on keypress
    this.input.keyboard.once("keydown-M", () => {
      this.scene.start("TitleScene");
    });
  }
}
