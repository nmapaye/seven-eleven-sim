class SlingshotGame extends Phaser.Scene {
    constructor() {
        super("SlingshotGame");
    }

    preload() {
        // Cat Sprite Sheet
        this.load.spritesheet('bird', 'assets/2_Cat_Run-Sheet.png', {frameWidth: 32, frameHight: 32}); // Use your own image
        // Background Layer 0
        this.load.image('background', 'assets/Background.png'); // Optional
    }

    create() {
        
        // Anims for cat
        this.anims.create({
            key: 'cat-run',
            frames: this.anims.generateFrameNumbers('bird', { start: 0, end: 9 }),
            frameRate: 12,
            repeat: -1
        });

        // Create background
        this.bg = this.add.tileSprite(0,0,1600, 900, "background");
        this.bg.setOrigin(0,0);
        this.bg.setScale(3.5);
        this.bg.setDepth(0);

        // Starting point for slingshot
        this.slingshotX = 200;
        this.slingshotY = 450;
        
        // Create bird at the top layer
        this.bird = this.matter.add.sprite(this.slingshotX, this.slingshotY, 'bird');
        this.bird.setScale(4);
        this.bird.setCircle(16*2);
        this.bird.setStatic(true); // Don’t move until released
        this.bird.setOrigin(0.6);
        this.bird.setDepth(1);

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

            // When cat is launched, play the cat-run animation
            this.bird.play('cat-run', true);
        }
    }
    update(time, delta){
        // Slight Parallax/Scrolling Background
        this.bg.tilePositionX += 0.02 * delta;
    }
}
