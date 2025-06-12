class TitleScene extends Phaser.Scene {
  constructor() {
    super("TitleScene");
  }

  create() {
    const { width, height } = this.sys.game.canvas;

    // Solid background
    this.add.rectangle(0, 0, width, height, 0x000000).setOrigin(0);

    // Main title
    this.add.text(
      width / 2,
      height / 2 - 100,
      'When Cats Fly',
      {
        fontSize: '64px',
        color: '#ffffff',
        fontFamily: 'Arial'
      }
    ).setOrigin(0.5);

    // Subtitle 
    this.add.text(
      width / 2,
      height / 2,
      'A Phaser 3 Adventure',
      {
        fontSize: '32px',
        color: '#ffffff',
        fontFamily: 'Arial'
      }
    ).setOrigin(0.5);

    // Start instruction
    this.add.text(
      width / 2,
      height / 2 + 100,
      'Press SPACE to Start',
      {
        fontSize: '24px',
        color: '#ffffff',
        fontFamily: 'Arial'
      }
    ).setOrigin(0.5);

    // Start game on SPACE
    this.input.keyboard.once('keydown-SPACE', () => {
      this.scene.start('SlingshotGame');
    });
  }
}
