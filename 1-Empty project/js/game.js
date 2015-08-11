// The game properties object that currently only contains the screen dimensions
var gameProperties = {
    screenWidth: 640,
    screenHeight: 480,
};

// The main state that contains our game. Think of states like pages or screens such as the splash screen, main menu, game screen, high scores, inventory, etc.
var mainState = function(game){};
mainState.prototype = {
    // The preload function is use to load assets into the game
    preload: function () {

    },

    // The create function is called after all assets are loaded and ready for use. This is where we add all our sprites, sounds, levels, text, etc.
    create: function () {

    },

    // The update function is run every frame. The default frame rate is 60 frames per second, so the update function is run 60 times per second
    update: function () {

    },
};

// Initialise the Phaser framework by creating an instance of a Phaser.Game object and assigning it to a local variable called 'game'.
// The first two arguments are the width and the height of the canvas element. In this case 640 x 480 pixels. You can resize this in the gameProperties object above.
// The third argument is the renderer that will be used. Phaser.AUTO is used to automatically detect whether to use the WebGL or Canvas renderer.
// The fourth argument is 'gameDiv', which is the id of the DOM element we used above in the index.html file where the canvas element is inserted.
var game = new Phaser.Game(gameProperties.screenWidth, gameProperties.screenHeight, Phaser.AUTO, 'gameDiv');

// Here we declare and add a state to the game object.
// The first argument is the state name that will is used to switch between states
// The second argument is the object name that will used when a state name is called
game.state.add('main', mainState);

// We are using the 'main' state name as the argument to load our new state.
game.state.start('main');