class SlingshotGame extends Phaser.Scene {
    constructor() {
        super("SlingshotGame");
        this.birdScore = 500;

        this.my = {text: {}};

    }

    preload() {
        // Cat Sprite Sheet
        this.load.spritesheet('bird', 'assets/2_Cat_Run-Sheet.png', {frameWidth: 32, frameHight: 32}); // Use your own image
        // Background Layer 0
        this.load.image('background', 'assets/Background.png');

        this.load.bitmapFont("rocketSquare", "assets/KennyRocketSquare_0.png", "assets/KennyRocketSquare.fnt");

        this.load.spritesheet('enemy', 'assets/BirdSprite.png', {frameWidth: 16, frameHeight: 16});
    }

    create() {
        // trajectory guide graphics
        this.trajectoryGfx = this.add.graphics();
        this.trajectoryGfx.lineStyle(2, 0xffffff, 1);
        this.trajectoryGfx.setDepth(2);

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
        //destroy enemies on contact with the bird
        this.matter.world.on('collisionstart', (event) => {
            event.pairs.forEach(pair => {
                const { bodyA, bodyB } = pair;
                const objA = bodyA.gameObject;
                const objB = bodyB.gameObject;
                if (objA === this.bird && this.enemies.contains(objB)) {
                    objB.destroy();
                    window.score += this.birdScore;
                    this.updateScore();
                } else if (objB === this.bird && this.enemies.contains(objA)) {
                    objA.destroy();
                    window.score += this.birdScore;
                    this.updateScore();
                }
            });
        });
        this.isDragging = false;
        
        // generate placeholder wall texture
        const wallGfx = this.add.graphics();
        wallGfx.fillStyle(0x888888);
        wallGfx.fillRect(0, 0, 150, 20);
        wallGfx.generateTexture('wall', 150, 20);
        wallGfx.destroy();

        // spawn rotating walls
        this.walls = this.add.group();
        const wallCount = 2;
        for (let i = 0; i < wallCount; i++) {
            const x = Phaser.Math.Between(400, 1500);
            const y = Phaser.Math.Between(100, 800);
            const wall = this.matter.add.sprite(x, y, 'wall', null, { isStatic: true });
            wall.setOrigin(0.5);
            wall.setIgnoreGravity(true);
            wall.rotation = Phaser.Math.FloatBetween(0, Math.PI * 2);
            wall.spinSpeed = Phaser.Math.FloatBetween(-0.001, 0.001);
            this.walls.add(wall);
        }

        // Spawn our “enemy” sprites
        this.enemies = this.add.group();
        // Gave them a simple flapping animation
        this.anims.create({
          key: 'enemy-flap',
         frames: this.anims.generateFrameNumbers('enemy', { start: 8, end: 15 }),
          frameRate: 6,
          repeat: -1
        });

        const enemyNumber = 10;

        for (let i = 0; i < enemyNumber; i++) {
            const x = Phaser.Math.Between(400, 1500);
            const y = Phaser.Math.Between(100, 800);
            const e = this.matter.add.sprite(x, y, 'enemy', 0, { isStatic: true });
            e.setScale(3);                 // scale up from 16×16 if you like
            e.setCircle(8 * e.scaleX);    // match collision to sprite size
            e.setIgnoreGravity(true);
            e.play('enemy-flap');
            this.enemies.add(e);
        }

        this.my.text.score = this.add.bitmapText(750, 0, "rocketSquare", "Score:\n" + window.score);

        // prepare for bird reset
        this.resetScheduled = false;
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
            // draw trajectory guide
            const vx = (this.slingshotX - limitedX) * 0.35;
            const vy = (this.slingshotY - limitedY) * 0.35;
            this.trajectoryGfx.clear();
            this.drawTrajectory(vx, vy);
        }
    }

    release() {
        // clear trajectory on launch
        this.trajectoryGfx.clear();
        if (this.isDragging) {
            this.isDragging = false;

            // Launch the bird based on drag direction and strength
            const forceFactor = .30;
            const dx = this.slingshotX - this.bird.x;
            const dy = this.slingshotY - this.bird.y;

            this.bird.setStatic(false); // Allow it to move
            this.bird.setVelocity(dx * forceFactor, dy * forceFactor);

            // When cat is launched, play the cat-run animation
            this.bird.play('cat-run', true);
        }
    }

    resetBird() {
        // reset bird to slingshot position
        this.bird.setStatic(true);
        this.bird.setPosition(this.slingshotX, this.slingshotY);
        this.bird.setVelocity(0, 0);
        this.bird.setRotation(0);
        this.bird.setAngularVelocity(0);
        this.bird.stop(); // stop animations
        // clear trajectory on reset
        this.trajectoryGfx.clear();
        this.resetScheduled = false;
    }

    drawTrajectory(vx, vy) {
        const startX = this.slingshotX;
        const startY = this.slingshotY;
        // approximate gravity from Matter world
        const worldGravity = this.matter.world.engine.world.gravity.y;
        const points = [];
        // interval of points
        const dt = 0.5;
        for (let t = 0; t < 10; t += dt) {
            const x = startX + vx * t;
            // y = start + prev point y + (Gravity*t^2)
            const y = startY + vy * t + .5 * worldGravity * t * t;
            points.push({ x, y });
        }
        this.trajectoryGfx.beginPath();
        points.forEach((p, i) => {
            if (i === 0) this.trajectoryGfx.moveTo(p.x, p.y);
            else this.trajectoryGfx.lineTo(p.x, p.y);
        });
        this.trajectoryGfx.strokePath();
    }

    // Update Score UI to reflect window.score
    updateScore(){
        let my = this.my;
        my.text.score.setText("Score\n" + window.score);
    }

    update(time, delta){
        // Slight Parallax/Scrolling Background
        this.bg.tilePositionX += 0.02 * delta;

        // check if bird left screen and schedule reset
        if (!this.resetScheduled && !this.bird.body.isStatic) {
            const width = this.scale.width;
            const height = this.scale.height;
            if (this.bird.x < 0 || this.bird.x > width || this.bird.y < 0 || this.bird.y > height) {
                this.resetScheduled = true;
                this.time.delayedCall(3000, this.resetBird, [], this);
            }
        }

        // rotate walls
        this.walls.getChildren().forEach(wall => {
            wall.rotation += wall.spinSpeed * delta;
            wall.setRotation(wall.rotation);
        });
    }
    
}
