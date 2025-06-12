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

        this.load.image('sling', 'assets/slingshot.png');

        this.load.spritesheet('leaves',' assets/Tiles.png', {frameWidth: 124, frameHeight: 32});
        this.load.spritesheet('trees',' assets/Tiles.png', {frameWidth: 32, frameHeight: 32});
    }

    create() {
        // Level designs
        this.levelDefs = [
            {
                // Level 1: simple ground platforms + one spinning wall + 3 enemies
                platforms: [
                { x: 600, y: 700, width: 300, height: 20 },
                { x: 1100, y: 600, width: 200, height: 20 }
                ],
                spinningWalls: [
                { x: 800, y: 500, angle: 0, spinSpeed: 0.002 }
                ],
                redWalls: [
                { x: 1200, y: 400, angle: 0, spinSpeed: -0.002 }
                ],
                enemies: [
                { x: 600, y: 650 },
                { x: 1100, y: 550 },
                { x: 1400, y: 450 }
                ]
            },
            {
                // Level 2: more red obstacles, narrow platforms
                platforms: [
                { x: 500, y: 750, width: 150, height: 20 },
                { x: 900, y: 650, width: 150, height: 20 },
                { x: 1300, y: 550, width: 150, height: 20 }
                ],
                spinningWalls: [
                { x: 700, y: 500, angle: Math.PI/4, spinSpeed: 0.003 },
                { x: 1200, y: 300, angle: 0, spinSpeed: -0.001 }
                ],
                redWalls: [
                { x: 1000, y: 400, angle: Math.PI/2, spinSpeed: 0.002 }
                ],
                enemies: [
                { x: 600, y: 720 },
                { x: 950, y: 620 },
                { x: 1350, y: 520 }
                ]
            },
            {
                // Level 3: clustered enemies behind a red spin-wall gauntlet
                platforms: [
                { x: 800, y: 800, width: 600, height: 20 }
                ],
                spinningWalls: [
                { x: 700, y: 600, angle: 0, spinSpeed: 0.003 },
                { x: 900, y: 600, angle: Math.PI/2, spinSpeed: -0.003 }
                ],
                redWalls: [
                { x: 800, y: 550, angle: 0, spinSpeed: 0.004 }
                ],
                enemies: [
                { x: 800, y: 520 },
                { x: 850, y: 520 },
                { x: 750, y: 520 },
                { x: 800, y: 470 }
                ]
            }
            ];

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
        
        // Enemy anims
        this.anims.create({
            key: 'enemy-flap',
            frames: this.anims.generateFrameNumbers('enemy', { start: 8, end: 15 }),
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

        // Scuffed Tree LOL
        const topLog = this.add.sprite(this.slingshotX, this.slingshotY+190, 'trees', 17).setScale(4);
        const middleLog1 = this.add.sprite(this.slingshotX-5, this.slingshotY+250, 'trees', 29).setScale(4);
        const middleLog2 = this.add.sprite(this.slingshotX-10, this.slingshotY+350, 'trees', 41).setScale(4);
        const middleLog3 = this.add.sprite(this.slingshotX-5, this.slingshotY+400, 'trees', 41).setScale(4);
        const bottomlog = this.add.sprite(this.slingshotX-5, this.slingshotY+500, 'trees', 41).setScale(4);
        const leaf1 = this.add.sprite(this.slingshotX-150, this.slingshotY+30, 'leaves', 20).setScale(5);
        const leaf2 = this.add.sprite(this.slingshotX-150, this.slingshotY+190, 'leaves', 20).setFlipY(true).setScale(5);

        // Create Sling
        this.sling = this.add.sprite(this.slingshotX-40, this.slingshotY, 'sling');
        this.sling.setScale(0.25)
        
        // Create bird at the top layer
        this.bird = this.matter.add.sprite(this.slingshotX, this.slingshotY, 'bird');
        this.bird.setScale(4);
        this.bird.setCircle(16*2);
        this.bird.setStatic(true); // Don’t move until released
        this.bird.setOrigin(0.6);
        this.bird.setDepth(1);

        //configure camera to follow the bird (yes it falls downwards)
        const cam = this.cameras.main;
        //set camera bounds to match world size (assumes world size 2000×1000)
        cam.setBounds(0, 0, 2000, 1000);
        // start following the bird with smoothness (lerp effect)
        cam.startFollow(this.bird, true, 0.1, 0.1);

        // Input tracking
        this.input.on('pointerdown', this.startDrag, this);
        this.input.on('pointermove', this.doDrag, this);
        this.input.on('pointerup', this.release, this);
        //respawn bird on R key press
        this.input.keyboard.on('keydown-R', () => {
            this.resetBird();
        });

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
                // reset bird on touching red obstacles
                if ((objA === this.bird && this.redWalls.contains(objB)) ||
                    (objB === this.bird && this.redWalls.contains(objA))) {
                    this.resetBird();
                }
            });
        });
        this.isDragging = false;
  
        // initialize groups
        this.platforms = [];
        this.walls      = this.add.group();
        this.redWalls   = this.add.group();
        this.enemies    = this.add.group();

        this.currentLevel = 0;
        this.loadLevel(this.currentLevel);

        // advance on “N” (or cycle)
        this.input.keyboard.on('keydown-N', () => {
            this.currentLevel = (this.currentLevel + 1) % this.levelDefs.length;
            this.loadLevel(this.currentLevel);
        });
        }

        // clear & spawn everything from levelDefs
        loadLevel(idx) {
        // clear existing
        this.platforms.forEach(p => p.destroy());
        this.platforms = [];
        this.walls.clear(true, true);
        this.redWalls.clear(true, true);
        this.enemies.clear(true, true);

        const def = this.levelDefs[idx];

        // platforms
        def.platforms.forEach(p => {
            const plat = this.matter.add.sprite(p.x, p.y, 'wall', null, { isStatic: true });
            plat.setDisplaySize(p.width, p.height).setOrigin(0.5);
            this.platforms.push(plat);
        });

        // spinning walls
        def.spinningWalls.forEach(w => {
            const wall = this.matter.add.sprite(w.x, w.y, 'wall', null, { isStatic: true });
            wall.setOrigin(0.5);
            wall.setIgnoreGravity(true);
            wall.rotation = w.angle;
            wall.spinSpeed = w.spinSpeed;
            this.walls.add(wall);
        });

        // red walls
        def.redWalls.forEach(r => {
            const red = this.matter.add.sprite(r.x, r.y, 'redWall', null, { isStatic: true });
            red.setOrigin(0.5);
            red.setIgnoreGravity(true);
            red.rotation = r.angle;
            red.spinSpeed = r.spinSpeed;
            this.redWalls.add(red);
        });

        // enemies
        def.enemies.forEach(e => {
            const enemy = this.matter.add.sprite(e.x, e.y, 'enemy', 0, { isStatic: true });
            enemy.setScale(3)
                .setCircle(8 * enemy.scaleX)
                .setIgnoreGravity(true)
                .play('enemy-flap');
            this.enemies.add(enemy);
        });



        this.my.text.score = this.add.bitmapText(750, 0, "rocketSquare", "Score:\n" + window.score).setScale(2);
        this.my.text.level = this.add.bitmapText(50, 0, "rocketSquare", "Level: " + (this.currentLevel + 1)).setScale(2);

        //prepare for birdie reset
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
            //draw trajectory guide
            const vx = (this.slingshotX - limitedX) * 0.35;
            const vy = (this.slingshotY - limitedY) * 0.35;
            this.trajectoryGfx.clear();
            this.drawTrajectory(vx, vy);
        }
    }

    release() {
        //clear trajectory on launch
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
        //reset bird to slingshot position
        this.bird.setStatic(true);
        this.bird.setPosition(this.slingshotX, this.slingshotY);
        this.bird.setVelocity(0, 0);
        this.bird.setRotation(0);
        this.bird.setAngularVelocity(0);
        this.bird.stop(); 
        //clear trajectory on reset
        this.trajectoryGfx.clear();
        this.resetScheduled = false;
    }

    drawTrajectory(vx, vy) {
        const startX = this.slingshotX;
        const startY = this.slingshotY;
        //approximate gravity from Matter world
        const worldGravity = this.matter.world.engine.world.gravity.y;
        const points = [];
        //interval of points la dee da
        const dt = 0.5;
        for (let t = 0; t < 10; t += dt) {
            const x = startX + vx * t;
            //y = start + prev point y + (Gravity*t^2)
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

        //check if bird left screen and schedule reset
        if (!this.resetScheduled && !this.bird.body.isStatic) {
            const width = this.scale.width;
            const height = this.scale.height;
            if (this.bird.x < 0 || this.bird.x > width || this.bird.y < 0 || this.bird.y > height) {
                this.resetScheduled = true;
                this.time.delayedCall(3000, this.resetBird, [], this);
            }
        }

        //rotate walls
        this.walls.getChildren().forEach(wall => {
            wall.rotation += wall.spinSpeed * delta;
            wall.setRotation(wall.rotation);
        });

        // rotate red obstacles
        this.redWalls.getChildren().forEach(red => {
            red.rotation += red.spinSpeed * delta;
            red.setRotation(red.rotation);
        });
    }
    
    regenerateLevel() {
        // destroy existing dynamic objects
        this.platforms.forEach(p => p.destroy());
        this.platforms = [];
        this.walls.clear(true, true);
        this.redWalls.clear(true, true);
        this.enemies.clear(true, true);

        // regenerate platforms
        const platformCount = 5;
        for (let i = 0; i < platformCount; i++) {
            const px = Phaser.Math.Between(300, 1700);
            const py = Phaser.Math.Between(200, 800);
            const platform = this.matter.add.sprite(px, py, 'wall', null, { isStatic: true });
            platform.setOrigin(0.5);
            platform.setScale(1, 0.5);
            this.platforms.push(platform);
        }

        // spawn rotating walls
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

        // spawn red spinning obstacles
        const redCount = 3;
        for (let i = 0; i < redCount; i++) {
            const x = Phaser.Math.Between(400, 1500);
            const y = Phaser.Math.Between(100, 800);
            const red = this.matter.add.sprite(x, y, 'redWall', null, { isStatic: true });
            red.setOrigin(0.5);
            red.setIgnoreGravity(true);
            red.rotation = Phaser.Math.FloatBetween(0, Math.PI * 2);
            red.spinSpeed = Phaser.Math.FloatBetween(-0.002, 0.002);
            this.redWalls.add(red);
        }

        // spawn enemies
        const enemyNumber = 10;
        for (let i = 0; i < enemyNumber; i++) {
            const x = Phaser.Math.Between(400, 1500);
            const y = Phaser.Math.Between(100, 800);
            const e = this.matter.add.sprite(x, y, 'enemy', 0, { isStatic: true });
            e.setScale(3);
            e.setCircle(8 * e.scaleX);
            e.setIgnoreGravity(true);
            e.play('enemy-flap');
            this.enemies.add(e);
        }
    }
    
    shuffleEnemies() {
        // pick new random positions for each enemy still in the group
        this.enemies.getChildren().forEach(enemy => {
            const x = Phaser.Math.Between(400, 1500);
            const y = Phaser.Math.Between(100, 800);

            // Matter sprites: reposition both the GameObject and its physics body
            enemy.setPosition(x, y);
            enemy.setVelocity(0, 0);
            enemy.setAngularVelocity(0);
        });
    }
    
}
