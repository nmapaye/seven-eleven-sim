class SlingshotGame extends Phaser.Scene {
    constructor() {
        super("slingshotGame");
    }

    preload() {
        this.load.image('bird', 'assets/hippo.png'); // Use your own image
        //this.load.image('background', 'assets/bg.png'); // Optional
    }

    create() {

        // Starting point for slingshot
        this.slingshotX = 200;
        this.slingshotY = 450;

        // Create bird
        this.bird = this.matter.add.image(this.slingshotX, this.slingshotY, 'bird');
        this.bird.setCircle();
        this.bird.setStatic(true); // Don’t move until released
        this.bird.setOrigin(0.5);

        // Input tracking
        this.input.on('pointerdown', this.startDrag, this);
        this.input.on('pointermove', this.doDrag, this);
        this.input.on('pointerup', this.release, this);

        this.isDragging = false;
    }

    startDrag(pointer) {
        if (Phaser.Math.Distance.Between(pointer.x, pointer.y, this.bird.x, this.bird.y) < 50) {
            this.isDragging = true;
        }
    }

    doDrag(pointer) {
        if (this.isDragging) {
            // Limit drag distance (like a real slingshot)
            const maxDistance = 100;
            const dx = pointer.x - this.slingshotX;
            const dy = pointer.y - this.slingshotY;
            const distance = Phaser.Math.Clamp(Math.sqrt(dx * dx + dy * dy), 0, maxDistance);

            const angle = Math.atan2(dy, dx);
            const limitedX = this.slingshotX + Math.cos(angle) * distance;
            const limitedY = this.slingshotY + Math.sin(angle) * distance;

            this.bird.setPosition(limitedX, limitedY);
        }
    }

    release() {
        if (this.isDragging) {
            this.isDragging = false;

            // Launch the bird based on drag direction and strength
            const forceFactor = .5;
            const dx = this.slingshotX - this.bird.x;
            const dy = this.slingshotY - this.bird.y;

            this.bird.setStatic(false); // Allow it to move
            this.bird.setVelocity(dx * forceFactor, dy * forceFactor);
        }
    }
}
