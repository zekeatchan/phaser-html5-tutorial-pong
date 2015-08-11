var gameProperties = {
    screenWidth: 640,
    screenHeight: 480,
    
    dashSize: 5,
    
    paddleLeft_x: 50,
    paddleRight_x: 590,
    paddleVelocity: 600,
    paddleSegmentsMax: 4,
    paddleSegmentHeight: 4,
    paddleSegmentAngle: 15,
    
    ballVelocity: 500,
    ballRandomStartingAngleLeft: [-120, 120],
    ballRandomStartingAngleRight: [-60, 60],
    ballStartDelay: 2,
    
    scoreToWin: 11,
};

var graphicAssets = {
    ballURL: 'assets/ball.png',
    ballName: 'ball',
    
    paddleURL: 'assets/paddle.png',
    paddleName: 'paddle'
};

var soundAssets = {
    ballBounceURL: 'assets/ballBounce',
    ballBounceName: 'ballBounce',
    
    ballHitURL: 'assets/ballHit',
    ballHitName: 'ballHit',
    
    ballMissedURL: 'assets/ballMissed',
    ballMissedName: 'ballMissed',
    
    mp4URL: '.m4a',
    oggURL: '.ogg'
};

var mainState = function(game) {
    this.backgroundGraphics;
    this.ballSprite;
    this.paddleLeftSprite;
    this.paddleRightSprite;
    this.paddleGroup;
    
    this.paddleLeft_up;
    this.paddleLeft_down;
    this.paddleRight_up;
    this.paddleRight_down;
    
    this.missedSide;
}

mainState.prototype = {
    preload: function () {
        game.load.image(graphicAssets.ballName, graphicAssets.ballURL);
        game.load.image(graphicAssets.paddleName, graphicAssets.paddleURL);
        
        game.load.audio(soundAssets.ballBounceName, [soundAssets.ballBounceURL+soundAssets.mp4URL, soundAssets.ballBounceURL+soundAssets.oggURL]);
        game.load.audio(soundAssets.ballHitName, [soundAssets.ballHitURL+soundAssets.mp4URL, soundAssets.ballHitURL+soundAssets.oggURL]);
        game.load.audio(soundAssets.ballMissedName, [soundAssets.ballMissedURL+soundAssets.mp4URL, soundAssets.ballMissedURL+soundAssets.oggURL]);
    },
    
    create: function () {
        this.initGraphics();
        this.initPhysics();
        this.initKeyboard();
        this.startDemo();
    },
    
    update: function () {
        this.moveLeftPaddle();
        this.moveRightPaddle();
        game.physics.arcade.overlap(this.ballSprite, this.paddleGroup, this.collideWithPaddle, null, this);
    },
    
    initGraphics: function () {
        this.backgroundGraphics = game.add.graphics(0, 0);
        this.backgroundGraphics.lineStyle(2, 0xFFFFFF, 1);
        
        for (var y = 0; y < gameProperties.screenHeight; y += gameProperties.dashSize * 2) {
            this.backgroundGraphics.moveTo(game.world.centerX, y);
            this.backgroundGraphics.lineTo(game.world.centerX, y + gameProperties.dashSize);
        }
        
        this.ballSprite = game.add.sprite(game.world.centerX, game.world.centerY, graphicAssets.ballName);
        this.ballSprite.anchor.set(0.5, 0.5);
        
        this.paddleLeftSprite = game.add.sprite(gameProperties.paddleLeft_x, game.world.centerY, graphicAssets.paddleName);
        this.paddleLeftSprite.anchor.set(0.5, 0.5);
        
        this.paddleRightSprite = game.add.sprite(gameProperties.paddleRight_x, game.world.centerY, graphicAssets.paddleName);
        this.paddleRightSprite.anchor.set(0.5, 0.5);
    },
    
    initPhysics: function () {
        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.physics.enable(this.ballSprite, Phaser.Physics.ARCADE);
        
        this.ballSprite.checkWorldBounds = true;
        this.ballSprite.body.collideWorldBounds = true;
        this.ballSprite.body.immovable = true;
        this.ballSprite.body.bounce.set(1);
        this.ballSprite.events.onOutOfBounds.add(this.ballOutOfBounds, this);
        
        this.paddleGroup = game.add.group();
        this.paddleGroup.enableBody = true;
        this.paddleGroup.physicsBodyType = Phaser.Physics.ARCADE;
        
        this.paddleGroup.add(this.paddleLeftSprite);
        this.paddleGroup.add(this.paddleRightSprite);
        
        this.paddleGroup.setAll('checkWorldBounds', true);
        this.paddleGroup.setAll('body.collideWorldBounds', true);
        this.paddleGroup.setAll('body.immovable', true);
    },
    
    initKeyboard: function () {
        this.paddleLeft_up = game.input.keyboard.addKey(Phaser.Keyboard.A);
        this.paddleLeft_down = game.input.keyboard.addKey(Phaser.Keyboard.Z);
        
        this.paddleRight_up = game.input.keyboard.addKey(Phaser.Keyboard.UP);
        this.paddleRight_down = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
    },
    
    startDemo: function () {
        this.ballSprite.visible = false;
        this.resetBall();
        this.enablePaddles(false);
        this.enableBoundaries(true);
        game.input.onDown.add(this.startGame, this);
    },
    
    startGame: function () {
        game.input.onDown.remove(this.startGame, this);
        
        this.enablePaddles(true);
        this.enableBoundaries(false);
        this.resetBall();
    },
    
    startBall: function () {
        this.ballSprite.visible = true;
        
        var randomAngle = game.rnd.pick(gameProperties.ballRandomStartingAngleRight.concat(gameProperties.ballRandomStartingAngleLeft));
        
        if (this.missedSide == 'right') {
            randomAngle = game.rnd.pick(gameProperties.ballRandomStartingAngleRight);
        } else if (this.missedSide == 'left') {
            randomAngle = game.rnd.pick(gameProperties.ballRandomStartingAngleLeft);
        }
        
        game.physics.arcade.velocityFromAngle(randomAngle, gameProperties.ballVelocity, this.ballSprite.body.velocity);
    },
    
    resetBall: function () {
        this.ballSprite.reset(game.world.centerX, game.rnd.between(0, gameProperties.screenHeight));
        this.ballSprite.visible = false;
        game.time.events.add(Phaser.Timer.SECOND * gameProperties.ballStartDelay, this.startBall, this);
    },
    
    enablePaddles: function (enabled) {
        this.paddleGroup.setAll('visible', enabled);
        this.paddleGroup.setAll('body.enable', enabled);
		
        this.paddleLeft_up.enabled = enabled;
        this.paddleLeft_down.enabled = enabled;
        this.paddleRight_up.enabled = enabled;
        this.paddleRight_down.enabled = enabled;
    },
    
    enableBoundaries: function (enabled) {
        game.physics.arcade.checkCollision.left = enabled;
        game.physics.arcade.checkCollision.right = enabled;
    },
    
    moveLeftPaddle: function () {
        if (this.paddleLeft_up.isDown)
        {
            this.paddleLeftSprite.body.velocity.y = -gameProperties.paddleVelocity;
        }
        else if (this.paddleLeft_down.isDown)
        {
            this.paddleLeftSprite.body.velocity.y = gameProperties.paddleVelocity;
        } else {
            this.paddleLeftSprite.body.velocity.y = 0;
        }
    },
    
    moveRightPaddle: function () {
        if (this.paddleRight_up.isDown)
        {
            this.paddleRightSprite.body.velocity.y = -gameProperties.paddleVelocity;
        }
        else if (this.paddleRight_down.isDown)
        {
            this.paddleRightSprite.body.velocity.y = gameProperties.paddleVelocity;
        } else {
            this.paddleRightSprite.body.velocity.y = 0;
        }
    },
    
    collideWithPaddle: function (ball, paddle) {
        var returnAngle;
        var segmentHit = Math.floor((ball.y - paddle.y)/gameProperties.paddleSegmentHeight);
        
        if (segmentHit >= gameProperties.paddleSegmentsMax) {
            segmentHit = gameProperties.paddleSegmentsMax - 1;
        } else if (segmentHit <= -gameProperties.paddleSegmentsMax) {
            segmentHit = -(gameProperties.paddleSegmentsMax - 1);
        }
        
        if (paddle.x < gameProperties.screenWidth * 0.5) {
            returnAngle = segmentHit * gameProperties.paddleSegmentAngle;
            game.physics.arcade.velocityFromAngle(returnAngle, gameProperties.ballVelocity, this.ballSprite.body.velocity);
        } else {
            returnAngle = 180 - (segmentHit * gameProperties.paddleSegmentAngle);
            if (returnAngle > 180) {
                returnAngle -= 360;
            }
            
            game.physics.arcade.velocityFromAngle(returnAngle, gameProperties.ballVelocity, this.ballSprite.body.velocity);
        }
    },
    
        ballOutOfBounds: function () {
            if (this.ballSprite.x < 0) {
                this.missedSide = 'left';
            } else if (this.ballSprite.x > gameProperties.screenWidth) {
                this.missedSide = 'right';
            }

            this.resetBall();
        },
};

var game = new Phaser.Game(gameProperties.screenWidth, gameProperties.screenHeight, Phaser.AUTO, 'gameDiv');
game.state.add('main', mainState);
game.state.start('main');