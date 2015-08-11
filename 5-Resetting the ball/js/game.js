var gameProperties = {
    screenWidth: Number = 640,
    screenHeight: Number = 480,
    
    dashSize: Number = 5, // dash line spacing (in pixels) for the centre vertical-line drawing
    
    paddleLeft_x: Number = 50, // left player x-position
    paddleRight_x: Number = 590, // right player x-position
    
    paddleVelocity: Number = 600, // moves paddles at a constant velocity
    paddleSegmentHeight: Number = 5, // height of a segments used to determine return angle of ball when deflected
    paddleSegmentAngle: Number = 15, // return angle when the ball is deflected
    paddleTopGap: Number = 22, // prevents paddles from going above this value
    
    ballVelocity: Number = 500, // starting ball velocity when the ball is reset
    ballVelocityIncrement: Number = 25, // increase ball velocity by X amount after returned [ballReturnCount] times
    ballReturnCount: Number = 4, // number of times the ball is successfully returned before increasing the ball's velocity
    ballResetDelay: Number = 2, // delay in seconds before the ball is reset and appears at the centre of the screen
    ballRandomStartingAngleLeft: [-120, 120],
    ballRandomStartingAngleRight: [-60, 60],
    
    scoreToWin: Number = 11, // score to end the game
};

// relative URLs to assets and names for use in Phaser
var graphicAssets = {
    ballURL: String = 'assets/ball.png',
    ballName: String = 'ball',
    
    paddleURL: String = 'assets/paddle.png',
    paddleName: String = 'paddle'
};

var soundAssets = {
    ballBounceURL: String = 'assets/ballBounce',
    ballBounceName: String = 'ballBounce',
    
    ballHitURL: String = 'assets/ballHit',
    ballHitName: String = 'ballHit',
    
    ballMissedURL: String = 'assets/ballMissed',
    ballMissedName: String = 'ballMissed',
    
    mp4URL: String = '.m4a',
    oggURL: String = '.ogg'
};

var scores = {
    left: Number, // left-player score
    right: Number, // right-player score
    
    left_x: Number = gameProperties.screenWidth * 0.25, // x-position for the left player score text
    rightX: Number = gameProperties.screenWidth * 0.75, // x-position for the right player score text
    topY: Number = 10, // y-position of the score text
};

// font style formatting for scores
var scoreFontStyle = {
    font: String = '80px Arial',
    fill: String = '#FFFFFF',
    align: String = 'center' 
};

// font style and formatting for instructions
var instructionsFontStyle = {
    font: String = '24px Arial',
    fill: String = '#FFFFFF',
    align: String = 'center'
};

// text for all labels in the game
var labels = {
    clickToStart: String = 'Left paddle: A to move up, Z to move down.\n\nRight paddle: UP and DOWN arrow keys.\n\n- click to start -',
    winner: String = 'Winner!',
    
};

var mainState = {
    
    backgroundGraphics: Phaser.Graphics,
    ballSprite: Phaser.Sprite,
    paddleLeftSprite: Phaser.Sprite,
    paddleRightSprite: Phaser.Sprite,
    paddleGroup: Phaser.Group,
    
    paddleLeft_up: Phaser.Key,
    paddleLeft_down: Phaser.Key,
    paddleRight_up: Phaser.Key,
    paddleRight_down: Phaser.Key,
    
    scoreLeft: Phaser.Text,
    scoreRight: Phaser.Text,
    clickToStart: Phaser.Text,
    
    missedSide: String,
    ballVelocity: Number,
    ballReturnCount: Number,
    
    sndBallHit:Phaser.Sound,
    sndBallBounce:Phaser.Sound,
    sndBallMissed:Phaser.Sound,
    
    preload: function () {
        game.load.image(graphicAssets.ballName, graphicAssets.ballURL);
        game.load.image(graphicAssets.paddleName, graphicAssets.paddleURL);
        
        game.load.audio(soundAssets.ballBounceName, [soundAssets.ballBounceURL+soundAssets.mp4URL, soundAssets.ballBounceURL+soundAssets.oggURL]);
        game.load.audio(soundAssets.ballHitName, [soundAssets.ballHitURL+soundAssets.mp4URL, soundAssets.ballHitURL+soundAssets.oggURL]);
        game.load.audio(soundAssets.ballMissedName, [soundAssets.ballMissedURL+soundAssets.mp4URL, soundAssets.ballMissedURL+soundAssets.oggURL]);
    },
    
    create: function () {
        this.initGraphics();
        this.initSounds();
        this.initPhysics();
        this.initKeyboard();
        this.startDemo();
    },
    
    update: function () {
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
        
        if(this.paddleLeftSprite.body.y < gameProperties.paddleTopGap) {
            this.paddleLeftSprite.body.y = gameProperties.paddleTopGap;
        }
        
        if(this.paddleRightSprite.body.y < gameProperties.paddleTopGap) {
            this.paddleRightSprite.body.y = gameProperties.paddleTopGap;
        }
        
        game.physics.arcade.overlap(this.ballSprite, this.paddleLeftSprite, this.collideWithPaddle, null, this);
        game.physics.arcade.overlap(this.ballSprite, this.paddleRightSprite, this.collideWithPaddle, null, this);
        
        if(this.ballSprite.body.blocked.up || this.ballSprite.body.blocked.down) {
            this.sndBallBounce.play();
        }
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
        
        this.scoreLeft = game.add.text(scores.left_x, scores.topY, "0", scoreFontStyle);
        this.scoreLeft.anchor.set(0.5, 0);
        
        this.scoreRight = game.add.text(scores.rightX, scores.topY, "0", scoreFontStyle);
        this.scoreRight.anchor.set(0.5, 0);
        
        this.winnerLeft = game.add.text(gameProperties.screenWidth * 0.25, gameProperties.screenHeight * 0.25, labels.winner, instructionsFontStyle);
        this.winnerLeft.anchor.set(0.5, 0.5);
        
        this.winnerRight = game.add.text(gameProperties.screenWidth * 0.75, gameProperties.screenHeight * 0.25, labels.winner, instructionsFontStyle);
        this.winnerRight.anchor.set(0.5, 0.5);
        
        this.winnerLeft.visible = false;
        this.winnerRight.visible = false;
        
        this.clickToStart = game.add.text(game.world.centerX, game.world.centerY, labels.clickToStart, instructionsFontStyle);
        this.clickToStart.anchor.set(0.5, 0.5);
    },
    
    initSounds: function () {
        this.sndBallHit = game.add.audio(soundAssets.ballHitName);
        this.sndBallBounce = game.add.audio(soundAssets.ballBounceName);
        this.sndBallMissed = game.add.audio(soundAssets.ballMissedName);
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
        this.paddleGroup.setAll('body.bounce.x', 1);
        this.paddleGroup.setAll('body.bounce.y', 1);
    },
    
    initKeyboard: function () {
        this.paddleLeft_up = game.input.keyboard.addKey(Phaser.Keyboard.A);
        this.paddleLeft_down = game.input.keyboard.addKey(Phaser.Keyboard.Z);
        
        this.paddleRight_up = game.input.keyboard.addKey(Phaser.Keyboard.UP);
        this.paddleRight_down = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
    },
    
    startDemo: function () {
        game.physics.arcade.checkCollision.left = true;
        game.physics.arcade.checkCollision.right = true;
        
        this.clickToStart.visible = true;
        
        this.resetBall();
        
        game.input.onDown.add(this.startGame, this);
        this.enablePaddles(false);
    },
    
    startGame: function () {
        this.ballReturnCount = 0;
            
        scores.left = 0;
        scores.right = 0;
        this.scoreLeft.text = scores.left;
        this.scoreRight.text = scores.right;
        
        game.physics.arcade.checkCollision.left = false;
        game.physics.arcade.checkCollision.right = false;
        
        this.paddleLeftSprite.y = game.world.centerY;
        this.paddleRightSprite.y = game.world.centerY;
        
        this.clickToStart.visible = false;
        this.winnerLeft.visible = false;
        this.winnerRight.visible = false;
                
        game.input.onDown.remove(this.startGame, this);
        
        this.resetBall();
        this.enablePaddles(true);
    },
    
    resetBall: function () {
        this.ballSprite.reset(game.world.centerX, game.rnd.between(0, gameProperties.screenHeight));
        this.ballSprite.visible = false;
        
        game.time.events.add(Phaser.Timer.SECOND * gameProperties.ballResetDelay, this.startBall, this);
    },
    
    startBall: function () {
        this.ballSprite.visible = true;
        
        var randomAngle;
        
        if (this.missedSide == 'right') {
            randomAngle = game.rnd.pick(gameProperties.ballRandomStartingAngleRight);
        } else {
            randomAngle = game.rnd.pick(gameProperties.ballRandomStartingAngleLeft);
        }
        
        this.ballVelocity = gameProperties.ballVelocity;
        this.ballReturnCount = 0;
        
        game.physics.arcade.velocityFromAngle(randomAngle, this.ballVelocity, this.ballSprite.body.velocity);
    },
    
    enablePaddles: function (enabled) {
        this.paddleLeftSprite.visible = enabled;
        this.paddleRightSprite.visible = enabled;
        
        this.paddleLeft_up.enabled = enabled;
        this.paddleLeft_down.enabled = enabled;
        this.paddleRight_up.enabled = enabled;
        this.paddleRight_down.enabled = enabled;
        this.paddleGroup.setAll('body.enable', enabled);
    },
    
    ballOutOfBounds: function () {
        this.sndBallMissed.play();
        
        if (this.ballSprite.x < 0) {
            this.missedSide = 'left';
            scores.right++;
        } else if (this.ballSprite.x > gameProperties.screenWidth) {
            this.missedSide = 'right';
            scores.left++;
        }
        this.scoreLeft.text = scores.left;
        this.scoreRight.text = scores.right;
        
        if (scores.left >= gameProperties.scoreToWin) {
            this.winnerLeft.visible = true;
            this.startDemo();
        } else if (scores.right >= gameProperties.scoreToWin) {
            this.winnerRight.visible = true;
            this.startDemo();
        } else {
            this.resetBall();
        }
    },
    
    collideWithPaddle: function (ball, paddle) {
        this.sndBallHit.play();
        
        var dx = paddle.x;
        var dy = Math.floor((ball.y - paddle.y)/gameProperties.paddleSegmentHeight);
        
        if (dy > 3) {
            dy = 3;
        } else if (dy < -3) {
            dy = -3;
        }
        
        var angle;
        
        if (dx < gameProperties.screenWidth * 0.5) {
            angle = dy * gameProperties.paddleSegmentAngle;
            game.physics.arcade.velocityFromAngle(angle, this.ballVelocity, this.ballSprite.body.velocity);
        } else {
            angle = 180 - (dy * gameProperties.paddleSegmentAngle);
            if (angle > 180) {
                angle -= 360;
            }
            
            game.physics.arcade.velocityFromAngle(angle, this.ballVelocity, this.ballSprite.body.velocity);
        }
        
        // increase the count for each time the ball is returned
        this.ballReturnCount ++;
        
        // if this.ballReturnCount is more or equal to the gameProperties.ballReturn Count
        // reset this.ballReturnCount to 0 and increase this.ballVelocity by gameProperties.ballVelocityIncrement value
        if(this.ballReturnCount >= gameProperties.ballReturnCount) {
            this.ballReturnCount = 0;
            this.ballVelocity += gameProperties.ballVelocityIncrement;
        }
    },
};

var game = new Phaser.Game(gameProperties.screenWidth, gameProperties.screenHeight, Phaser.AUTO, 'gameDiv');
game.state.add('main', mainState);
game.state.start('main');