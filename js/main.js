function gameScope() {

var BLOCKS_WIDTH = 22;
var BLOCKS_HEIGHT = 30;
var SCREEN_EDGE_WIDTH = 3;
var CHUNK_WIDTH = 8;
var CHUNK_HEIGHT = 6;
var NUM_CHUNKS_X = 2;
var NUM_CHUNKS_Y = 4;
var PLAYER_SPAWN_X = 7;
var PLAYER_SPAWN_Y = 2;
var MAX_SCALE = 2.5;
var MIN_Y = 2;
var MAX_SCALE_Y = 2.225;
var ORIGINAL_BLOCK_SIZE = 128;
var START_ZOOM = 0.9;
var PLAYER_SPIN_TIME = 1000;
var CAMERA_SPEED = 25.0;
var PLAYER_MOVE_SPEED = 10;
var PLAYER_DIG_SPEED = 3.0;
var DIG_FRAME_SPEED = 50;
var PLAYER_ROTATE_SPEED = 5;
var DIG_FRAMES = 3;
var Y_OFFSET = 3;
var CAMERA_CLOSE_ENOUGH = 50;
var PLAYER_MOVE_CLOSE_ENOUGH = 10;
var OFFSCREEN = -1000;
var TIMER_FRAMES = 13;
var TOTAL_TIMER_FRAMES = 15;
var QUICKSAND_SPEED = 2;
var QUICKSAND_DISTANCE = 8;
var TREASURE_SPEED = 50.0;
var TIMER_BLINK_START_SECONDS = 10;
var PLAYER_FLIP_TIME = 300;
var TREASURE_CHEST_POINTS = 10000;
var GOBLET_POINTS = 5000;
var COINS_POINTS = 1000;
var SKULL_POINTS = 2500;
var STARTING_COINS = 8;
var STARTING_GOBLETS = 5;
var STARTING_SKULLS = 3;
var GENERIC_TREASURE_BLOCK = 4;
var TREASURE_SHINE_MIN = 1000;
var TREASURE_SHINE_MAX = 5000;
var TOP_SCORES_Y = 6;
var END_GAME_DELAY = 1;
var NAME_MAX = 8;
var COIN_FRAME = 0;
var GOBLET_FRAME = 6;
var SKULL_FRAME = 12;
var TUTORIAL_TEXT_1 = "Use arrow keys or tap the arrows to move and dig. You can only dig through sand, not rocks.";
var GAME_SECONDS = 90;

var gameWidth, gameHeight, scale, blockSize, relScale, worldScale, zoomFactor, worldSize, wordWrapMod;
var buttonGroup, uiGroup, blockGroup, worldGroup;
var player;
var treasureChest, treasureBlock;
var blocks;
var numbers, score, scoreText, gameOverText, closeButton, scoreImage, scoreContainer, overlay;
var keyDown, upKey, rightKey, downKey, leftKey, upButton, downButton, leftButton, rightButton;
var leftTap, rightTap, upTap, downTap;
var gameTimer, endGameDelayTimer, playerSpinTimer, flipTimer;
var meter, meterWidth, scoreBG, textCreated;
var frameCount, stalker, cameraStartY;
var chunks, mapJSON;
var digTimer, digFrame;
var treasureBlocks, shiningBlocks;
var treasures, gottenTreasure, treasureType, treasureMoving, treasureMovingPos;
var coinsCollectAudio, skullCollectAudio, gobletCollectAudio, chestCollectAudio, quicksandAudio, digAudio, music;
var timeText, timeGraphic, timeBG, timePerFrame, timeBlinkText, timeBlinkAlpha, timeBlinkDir, timeBlinkTimer, timeBlink, timerTick;
var splash, playButton, tutorialButton, audioButton, smallCloseButton, clickButtonAudio;
var tutorialBG, tutorialImage, tutorialText, tutorialIndex;
var textCreated = false;
var tutorial = false;
var audio = true;
var inputDown = false;

GameState = {
    SPLASH: 0,
    TUTORIAL: 1,
    INIT: 2,
    PAN: 3,
    PLAY: 4,
    GAME_OVER: 5,
    TELEPORTING: 6,
    TELEPORT_PAN: 7,
    MOVING: 8,
    DIGGING: 9
}

BlockType = {
    EMPTY: 0,
    DIGGABLE: 1,
    UNDIGGABLE: 2,
    QUICKSAND: 3,
    COINS: 4,
    GOBLET: 5,
    SKULL: 6,
    TREASURE_CHEST: 7
}

// set up resolution
gameWidth = 800;
gameHeight = 600;

if (window.innerHeight >= 937 && window.innerWidth >= 1250) {
    gameWidth = 1250;
    gameHeight = 937;
    wordWrapMod = 850;
} else if (window.innerHeight >= 768 && window.innerWidth >= 1024) {
    gameWidth = 1024;
    gameHeight = 768;
    wordWrapMod = 1050;
}
else {
    wordWrapMod = 1250;
}

scale = new Phaser.Point(gameWidth / 1250, gameHeight / 937);

var gameBridge = parent.window.gameBridge;
parent.window.gameBridge = undefined;

var mainState = {
    preload: function() {
        initRetryLoaders(game, this, mainState.postCreate);

        game.load.json("map", "assets/maps/level2.json");
        game.load.atlas("treasureAtlas", 'assets/images/treasureAtlas.png', "assets/treasureAtlas.json");
        game.load.spritesheet("playerSheet", "assets/images/player_spritesheet.png", 128, 128, 6);
        game.load.spritesheet("lightDig", "assets/images/lights_sheet.png", 128, 128, 6);
        game.load.spritesheet("timerSheet", "assets/images/UI_hourglass_spritesheet.png", 51, 59, TOTAL_TIMER_FRAMES);
        game.load.spritesheet("treasureChestSheet", "assets/images/item_treasureChest_spritesheet.png", 128, 128, 3);
        game.load.spritesheet("quicksandSheet", "assets/images/sandtrap_spritesheet.png", 128, 128, 3);
        game.load.spritesheet("playButtonSheet", "assets/images/DS_play_spritesheet.png", 400, 150, 3);
        game.load.spritesheet("closeButton", "assets/images/DS_close_spritesheet.png", 400, 150, 3);
        game.load.spritesheet("audioButtonSheet", "assets/images/TITLE_audio_spritesheet.png", 100, 100, 2);
        game.load.image("splash", "assets/images/DS_TITLE.png");
        game.load.image("scoreImage", "assets/images/DS_END_yourScore.png");
        game.load.image("scoreContainer", "assets/images/DS_END_container.png")
        game.load.image("topScoresContainer", "assets/images/DS_END_topscoresContainer.png");
        game.load.image("scale9White", "assets/images/Scale9_WhiteRounded_01.png");
        game.load.image("tutorial1", "assets/images/Tutorial_Digsite_01.jpg");
        game.load.image("tutorial2", "assets/images/Tutorial_Digsite_02.jpg");
        game.load.image("tutorial3", "assets/images/Tutorial_Digsite_03.jpg");
        game.load.image("diggable", "assets/images/tile_sand_00.png");
        game.load.image("diggable1", "assets/images/tile_sand_01.png");
        game.load.image("diggable2", "assets/images/tile_sand_02.png");
        game.load.image("diggable3", "assets/images/tile_sand_03.png");
        game.load.image("diggableEdge", "assets/images/tile_sand_edge_00.png");
        game.load.image("diggableEdge1", "assets/images/tile_sand_edge_01.png");
        game.load.image("diggableEdge2", "assets/images/tile_sand_edge_02.png");
        game.load.image("diggableEdge3", "assets/images/tile_sand_edge_03.png");
        game.load.image("unbreakable", "assets/images/tile_bg_wall_00.png");
        game.load.image("unbreakableEdge", "assets/images/tile_bg_wall_edge_00.png");
        game.load.image("overlay", "assets/images/TITLE_OVERLAY.png");
        game.load.image("upArrow", "assets/images/UI_arrow_up_00.png");
        game.load.image("rightArrow", "assets/images/UI_arrow_right.png");
        game.load.image("downArrow", "assets/images/UI_arrow_down_00.png");
        game.load.image("leftArrow", "assets/images/UI_arrow_left_00.png");
        game.load.image("empty", "assets/images/tile_bg_grid_00.png");
        game.load.image("timeBG", "assets/images/UI_time_00.png");
        game.load.image("scoreBG", "assets/images/UI_score_00.png");
        game.load.image("vignette", "assets/images/vignette.png");
        game.load.image("yourScoreBorder", "assets/images/DS_END_topscoresContainer_highlight.png");
        game.load.image("tutorialButton", "assets/images/TITLE_help.png");
        game.load.image("smallCloseButton", "assets/images/TITLE_close.png");
        game.load.audio("coinsCollect", "assets/audio/coinsCollect.mp3");
        game.load.audio("skullCollect", "assets/audio/skullCollect.mp3");
        game.load.audio("gobletCollect", "assets/audio/gobletCollect.mp3");
        game.load.audio("chestCollect", "assets/audio/chestCollect.mp3");
        game.load.audio("quicksand", "assets/audio/quicksand.mp3");
        game.load.audio("dig", "assets/audio/dig.mp3");
        game.load.audio("warning", "assets/audio/warning.mp3");
        game.load.audio("timerTick", "assets/audio/timerTick.mp3");
        game.load.audio("music", "assets/audio/diggerThemeLoop.mp3");
        game.load.audio("click", "assets/audio/click.mp3");
    },

    create: function() {
        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.scale.parentIsWindow = true;
        this.scale.pageAlignHorizontally = true;
        this.scale.pageAlignVertically = false;
    },
    postCreate: function() {
        timePerFrame = GAME_SECONDS / TIMER_FRAMES;
        cameraStartY = game.camera.y;

        game.stage.backgroundColor = "#791731";

        blockSize = ORIGINAL_BLOCK_SIZE * scale.x;
        worldSize = new Phaser.Point(blockSize * BLOCKS_WIDTH, blockSize * BLOCKS_HEIGHT);

        blockGroup = game.add.group();
        buttonGroup = game.add.group();
        worldGroup = game.add.group();
        worldGroup.add(blockGroup);

        // create world
        mapJSON = game.cache.getJSON("map");
        createChunks();
        createMapFromChunks();
        createTreasure();
        createStalker();
        createBlocks();
        createNumbers();
        createPlayer();

        // set camera to proper position
        setWorldBounds();
        game.camera.follow(treasureChest);

        // controls
        upKey = game.input.keyboard.addKey(Phaser.Keyboard.UP);
        upKey.onDown.add(pressUpKey, this);
        rightKey = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
        rightKey.onDown.add(pressRightKey, this);
        downKey = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
        downKey.onDown.add(pressDownKey, this);
        leftKey = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
        leftKey.onDown.add(pressLeftKey, this);
        game.input.keyboard.addKeyCapture([ Phaser.Keyboard.UP, Phaser.Keyboard.RIGHT, Phaser.Keyboard.DOWN, Phaser.Keyboard.LEFT /*, Phaser.Keyboard.SPACEBAR */ ]);

        // UI
        uiGroup = game.add.group();
        var vignette = uiGroup.create(0, 0, "vignette");
        vignette.scale.setTo(scale.x * 4, scale.y * 4);
        uiGroup.fixedToCamera = true;
        closeButton = game.add.button(OFFSCREEN, OFFSCREEN, "closeButton", null, this, 1, 3, 2, 0);
        closeButton.events.onInputUp.add(close, this);
        closeButton.scale.setTo(.75 * scale.x, .75 * scale.y);

        scoreContainer = game.add.sprite(gameWidth / 2, gameHeight * 0.25, "scoreContainer");
        scoreContainer.scale.setTo(scale.x, scale.y);
        scoreContainer.anchor.setTo(0.5, 0.5);
        scoreContainer.alpha = 0.0;

        scoreImage = game.add.sprite(game.width / 2, game.height * 0.1, "scoreImage");
        scoreImage.scale.setTo(scale.x, scale.y);
        scoreImage.anchor.setTo(0.5, 0.5);
        scoreImage.alpha = 0.0;

        topScoresContainer = game.add.sprite(gameWidth / 2, gameHeight * 0.575, "topScoresContainer");
        topScoresContainer.scale.setTo(scale.x, scale.y);
        topScoresContainer.anchor.setTo(0.5, 0.5);
        topScoresContainer.alpha = 0.0;

        overlay = game.add.sprite(0,0, "overlay");
        overlay.alpha = 0.0;

        tutorialButton = game.add.button(gameWidth * 0.01, gameHeight * 0.88, "tutorialButton", null, this);
        tutorialButton.events.onInputUp.add(clickTutorial, this);
        tutorialButton.scale.setTo(scale.x, scale.y);

        audioButton = game.add.button(gameWidth * 0.91, gameHeight * 0.88, "audioButtonSheet", null, this);
        audioButton.events.onInputUp.add(clickAudio, this);
        audioButton.frame = 1;
        audioButton.scale.setTo(scale.x, scale.y);

        smallCloseButton = game.add.button(gameWidth * 0.94, gameHeight * 0.01, "smallCloseButton", null, this);
        smallCloseButton.events.onInputUp.add(close, this);
        smallCloseButton.scale.setTo(scale.x, scale.y);

        uiGroup.add(overlay);
        buttonGroup.add(closeButton);
        uiGroup.add(closeButton);
        buttonGroup.add(audioButton);
        uiGroup.add(audioButton);
        buttonGroup.add(tutorialButton);
        uiGroup.add(tutorialButton);
        buttonGroup.add(smallCloseButton);
        uiGroup.add(smallCloseButton);
        uiGroup.add(scoreContainer);
        uiGroup.add(scoreImage);
        uiGroup.add(topScoresContainer);

        gottenTreasure = worldGroup.create(0, 0, "treasureAtlas");
        gottenTreasure.anchor.setTo(0.5, 0.5);
        gottenTreasure.scale.setTo(scale.x, scale.y);
        gottenTreasure.alpha = 0.0;
        createTimer();

        // audio
        coinsCollectAudio = game.add.audio("coinsCollect");
        skullCollectAudio = game.add.audio("skullCollect");
        gobletCollectAudio = game.add.audio("gobletCollect");
        chestCollectAudio = game.add.audio("chestCollect");
        quicksandAudio = game.add.audio("quicksand");
        digAudio = game.add.audio("dig");
        timerTick = game.add.audio("timerTick", 1, true);

        // music
        music = new Phaser.Sound(game, "music", 1, false);

        clickButtonAudio = game.add.audio("click");

        // -- insure game gets focus back if it was lost
        game.input.touch.touchStartCallback = function (e) {
            game.focusGain();
        };

        createTutorial();
        gameState = GameState.SPLASH;
        createSplash();

        if (gameBridge) {
          gameBridge.initialized();
        }
    },

    update: function() {
        if (gameState == GameState.TUTORIAL) {
            if (game.input.activePointer.isDown) {
                inputDown = true;
            }
            else if (game.input.activePointer.isUp && inputDown) {
                advanceTutorial();
                inputDown = false;
            }
        }
        else if (gameState > GameState.TUTORIAL) {
            if (!textCreated) {
                createText();
                showTimer();
            }
            else {
                //console.log(player.sprite.scale.x + " --- " + player.headlight.scale.x);
                // move treasure to UI
                if (treasureMoving) {
                    var diff = new Phaser.Point(treasureMovingPos.x - gottenTreasure.x, treasureMovingPos.y - gottenTreasure.y);
                    var normalizedDiff = normalize(diff);
                    var xDiff = normalizedDiff.x * TREASURE_SPEED;
                    var yDiff = normalizedDiff.y * TREASURE_SPEED;
                    gottenTreasure.x += xDiff;
                    gottenTreasure.y += yDiff;
                    if (closeEnough(gottenTreasure.x, treasureMovingPos.x, 50) && closeEnough(gottenTreasure.y, treasureMovingPos.y, 50)) {
                        treasureMoving = false;
                        gottenTreasure.alpha = 0.0;
                        switch (treasureType) {
                            case BlockType.COINS:
                                modScore(COINS_POINTS);
                                break;
                            case BlockType.SKULL:
                                modScore(SKULL_POINTS);
                                break;
                            case BlockType.GOBLET:
                                modScore(GOBLET_POINTS);
                                break;
                        }
                    }
                }

                switch (gameState) {
                    case GameState.INIT:
                        frameCount++;
                        if (frameCount >= 30) {
                            gameState = GameState.PAN;
                        }
                        break;
                    case GameState.PAN:
                        moveStalkerTowardsPlayer();
                        if (checkIfStalkerCloseEnoughToPlayer()) {
                            stalker.x = player.sprite.x;
                            stalker.y = player.sprite.y;
                            game.camera.follow(player.sprite);
                            gameState = GameState.PLAY;
                            gameTimer = game.time.events.add(Phaser.Timer.SECOND * GAME_SECONDS, gameOver, this);
                        }
                        break;
                    case GameState.PLAY:
                        //console.log(getTimerDuration());
                        updatePlayer();
                        /*
                        var zoom = false;
                        if (zoomInKey.isDown) {
                            worldScale += 0.05;
                            if (worldScale >= MAX_SCALE)
                                worldScale = MAX_SCALE;
                            zoom = true;
                        }
                        else if (zoomOutKey.isDown) {
                            worldScale -= 0.05;
                            if (worldScale < 1.0)
                                worldScale = 1.0;
                            zoom = true;
                        }
                        if (zoom) {
                            setWorldBounds();
                            worldGroup.scale.setTo(worldScale);
                        }
                        */
                        setTimer();
                        break;
                    case GameState.TELEPORTING:
                        playerSpinTimer += gameTimer.timer.elapsed;
                        player.rotate();
                        //console.log(playerSpinTimer);
                        if (playerSpinTimer >= PLAYER_SPIN_TIME) {
                            stalker.x = player.sprite.x;
                            stalker.y = player.sprite.y;
                            game.camera.follow(stalker);
                            // find random location
                            setPlayerRandomLocation();
                            player.setNormalSprite();
                            player.setPosition();
                            player.turnOffHeadlight();
                            player.checkHeadlight();

                            gameState = GameState.TELEPORT_PAN;
                        }
                        setTimer();
                        break;
                    case GameState.TELEPORT_PAN:
                        moveStalkerTowardsPlayer();
                        if (checkIfStalkerCloseEnoughToPlayer())
                        {
                            game.camera.follow(player.sprite);
                            gameState = GameState.PLAY;
                        }
                        setTimer();
                        break;
                    case GameState.MOVING:
                    case GameState.DIGGING:
                        player.move();
                        break;
                }
            }
        }
    }
};

var game = new Phaser.Game(gameWidth, gameHeight, Phaser.CANVAS, "");
game.state.add("main", mainState);
game.state.start("main");

function hideSplash(button) {
    if (pointIntersectsRect(new Phaser.Point(game.input.x, game.input.y), new Phaser.Rectangle(button.position.x, button.position.y, button.width, button.height))) {
        if (gameBridge) {
            gameBridge.start();
        }

        if (audio)
            clickButtonAudio.play();
        splash.alpha = 0.0;
        playButton.x = OFFSCREEN;
        playButton.y = OFFSCREEN;
        tutorialButton.x = OFFSCREEN;
        tutorialButton.y = OFFSCREEN;
        audioButton.x = OFFSCREEN;
        audioButton.y = OFFSCREEN;
        gameState = GameState.TUTORIAL;

        showTutorial();
    }
}

function showTutorial() {
    tutorialBG.alpha = 1.0;
    tutorial1.alpha = 1.0;
    tutorial2.alpha = 1.0;
    tutorial3.alpha = 1.0;
    tutorialText1.alpha = 1.0;
    tutorialText2.alpha = 1.0;
    tutorialText3.alpha = 1.0;
}

function hideTutorial() {
    tutorialBG.alpha = 0.0;
    tutorial1.alpha = 0.0;
    tutorial2.alpha = 0.0;
    tutorial3.alpha = 0.0;
    tutorialText1.alpha = 0.0;
    tutorialText2.alpha = 0.0;
    tutorialText3.alpha = 0.0;
    overlay.alpha = 0.0;
    initialize();
}

function clickTutorial(button) {
    if (pointIntersectsRect(new Phaser.Point(game.input.x, game.input.y), new Phaser.Rectangle(button.position.x, button.position.y, button.width, button.height))) {
        if (!tutorial) {
            if (audio)
                clickButtonAudio.play();
            tutorialButton.inputEnabled = false;
            tutorial = true;
            splash.alpha = 0.0;
            playButton.x = OFFSCREEN;
            playButton.y = OFFSCREEN;
            gameState = GameState.TUTORIAL;
            showTutorial();
        }
    }
}

function showTutorial() {
    tutorialIndex = 0;
    tutorialText.text = TUTORIAL_TEXT_1;
    tutorialImage.loadTexture("tutorial1");
    tutorialBG.alpha = 1.0;
    tutorialImage.alpha = 1.0;
    tutorialText.alpha = 1.0;
    gameState = GameState.TUTORIAL;
}

function advanceTutorial() {
    if (audio)
        clickButtonAudio.play();
    switch (tutorialIndex) {
        case 0:
            tutorialImage.loadTexture("tutorial2");
            tutorialText.text = "Collect as much treasure as you can. The chest is worth the most, but the game ends when you collect it.";
            tutorialIndex++;
            break;
        case 1:
            tutorialImage.loadTexture("tutorial3");
            tutorialText.text = "Get rich before the timer stops! Look out for quicksand with your helmet. Quicksand will move you back up the map.";
            tutorialIndex++;
            break;
        case 2:
            if (tutorial)
                backToSplash();
            else
                hideTutorial();
            break;
    }
}

function hideTutorial() {
    tutorialIndex = 0;
    tutorialBG.alpha = 0.0;
    tutorialImage.alpha = 0.0;
    tutorialText.alpha = 0.0;
    initialize();
}

function backToSplash() {
    tutorialBG.alpha = 0.0;
    tutorialImage.alpha = 0.0;
    tutorialText.alpha = 0.0;
    splash.alpha = 1.0;
    playButton.x = gameWidth / 2 - (playButton.width / 2);
    playButton.y = gameHeight * 0.7;
    gameState = GameState.SPLASH;
    tutorial = false;
    tutorialButton.inputEnabled = true;
    tutorialButton.input.useHandCursor = true;
}

function clickAudio(button) {
    if (pointIntersectsRect(new Phaser.Point(game.input.x, game.input.y), new Phaser.Rectangle(button.position.x, button.position.y, button.width, button.height))) {
        if (audio) {
            audioButton.frame = 0;
            audio = false;
        }
        else {
            audioButton.frame = 1;
            audio = true;
            clickButtonAudio.play();
        }
    }
}

function initialize() {
    frameCount = 0;
    score = 0;
    keyDown = false;
    treasureMoving = false;
    timeBlink = false;
    timeBlinkDir = -1;
    timeBlinkAlpha = 1.0;
    gameState = GameState.INIT;
    worldScale = START_ZOOM;
    setWorldBounds();
    worldGroup.scale.setTo(worldScale);
    player.init();
    game.camera.follow(treasureChest);
    if (audio)
        music.volume = 1.0;
    else
        music.volume = 0.0;
    setTimeout(function(){ music.play(); }, 1000);  // start music after one second
    initStalker();
}

function setWorldBounds() {
    var x = 0;
    var y = 0;
    var width = worldSize.x * worldScale;
    var height = worldSize.y * worldScale;
    game.world.setBounds(x, y, width, height);
}

function shineTreasures() {
    // shine treasures
    for (var i=0; i<shiningBlocks.length; i++) {
        shiningBlocks[i].shineTimer -= gameTimer.timer.elapsed;
        if (shiningBlocks[i].shineTimer <= 0) {
            shiningBlocks[i].shineTimer = getRandomInt(TREASURE_SHINE_MIN, TREASURE_SHINE_MAX);
            shiningBlocks[i].animations.play("shine");
        }
    }
}

function updatePlayer() {
    if (!keyDown) {
        var xMod = 0;
        var yMod = 0;

        /*
        if (leftKey.isDown) {
            keyDown = true;
            xMod = -1;
        }
        else if (rightKey.isDown) {
            keyDown = true;
            xMod = 1;
        }
        else if (upKey.isDown) {
            keyDown = true;
            yMod = -1;
        }
        else if (downKey.isDown) {
            keyDown = true;
            yMod = 1;
        }
        else if (spaceKey.isDown) {
            keyDown = true;
        }
        */

        if(leftTap)
        {
            keyDown = true;
            xMod = -1;
        }
        if(rightTap)
        {
            keyDown = true;
            xMod = 1;
        }
        if(downTap)
        {
            keyDown = true;
            yMod = 1;
        }
        if(upTap)
        {
            keyDown = true;
            yMod = -1;
        }

        if (xMod != 0 || yMod != 0)
            movePlayer(xMod, yMod);
    }
    else if (leftKey.isUp && rightKey.isUp && upKey.isUp && downKey.isUp /* && spaceKey.isUp */ ) {
        keyDown = false;
    }

    player.update();
}

function pressUpKey() {
    pressKey(0, -1);
}

function pressDownKey() {
    pressKey(0, 1);
}

function pressLeftKey() {
    pressKey(-1, 0);
}

function pressRightKey() {
    pressKey(1, 0);
}

function pressKey(xMod, yMod) {
    if (!keyDown) {
        keyDown = true;
        if (xMod != 0 || yMod != 0)
            movePlayer(xMod, yMod);
    }
    player.update();
}

function movePlayer(xMod, yMod) {
    if (gameState == GameState.PLAY) {
        player.setNormalSprite();
        var blockType = -1;
        if (keyDown) {
            var canMove = false;
            var willBreak = false;
            var treasure = false;
            var dig = false;
            var done = false;
            blockType = checkBlock(player.blockX + xMod, player.blockY + yMod);
            switch (blockType) {
                case BlockType.EMPTY:
                    canMove = true;
                    break;
                case BlockType.DIGGABLE:
                    canMove = true;
                    willBreak = true;
                    break;
                case BlockType.UNDIGGABLE:
                    break;
                case BlockType.QUICKSAND:
                    canMove = true;
                    break;
                case BlockType.COINS:
                case BlockType.SKULL:
                case BlockType.GOBLET:
                    canMove = true;
                    willBreak = true;
                    treasure = true;
                    break;
                case BlockType.TREASURE_CHEST:
                    done = true;
                    break;
            }

            if (done) {
                gameState = GameState.GAME_OVER;
                player.hideArrows();
                player.setItemGotSprite();
                //player.animations.play("winAnim");

                player.sprite.animations.play("winAnim", 4, false);
                player.headlight.animations.play("winLightAnim", 4, false);

                treasureChest.animations.play("open", 5, false);
                treasureChest.animations.currentAnim.onComplete.add(function () { finishGame(); }, this);
            }
            else if (canMove) {
                player.setBlockPos(xMod, yMod);
                if (blocks[player.blockX][player.blockY].key == "diggable" || blocks[player.blockX][player.blockY].key == "diggableEdge") {
                    //gameState = GameState.DIGGING
                    if (blocks[player.blockX][player.blockY].key == "diggable")
                        blocks[player.blockX][player.blockY].loadTexture("diggable1");
                    else
                        blocks[player.blockX][player.blockY].loadTexture("diggableEdge1");
                    gameState = GameState.DIGGING;
                    if (audio)
                        digAudio.play();
                    digTimer = 0;
                    digFrame = 0;
                }
                else
                    gameState = GameState.MOVING;

                // check block above
                if (blocks[player.blockX][player.blockY - 1].key == "diggable") {
                    blocks[player.blockX][player.blockY - 1].loadTexture("diggableEdge");
                }
                else if (blocks[player.blockX][player.blockY - 1].key == "unbreakable") {
                    blocks[player.blockX][player.blockY - 1].loadTexture("unbreakableEdge");
                }
            }
        }
    }
}

// create functions
function createSplash() {
    splash = uiGroup.create(gameWidth * 0.1, gameHeight * 0.1, "splash");
    splash.scale.setTo(scale.x * 1.6, scale.y * 1.6);
    playButton = game.add.button(0, 0, "playButtonSheet", null, this, 1, 3, 2, 0);
    playButton.events.onInputUp.add(hideSplash, this);
    playButton.scale.setTo(scale.x, scale.y);
    playButton.x = gameWidth / 2 - (playButton.width / 2);
    playButton.y = gameHeight * 0.7;
    buttonGroup.add(playButton);
    uiGroup.add(playButton);
}

function createTutorial() {
    tutorialIndex = 0;

    tutorialBG = game.add.sprite(gameWidth * 0.075, gameWidth * 0.11, "scale9White");
    tutorialBG.scale.setTo(scale.x, scale.y);
    tutorialBG.width = gameWidth * 0.85;
    tutorialBG.height = gameHeight * 0.6;
    tutorialBG.tint = 0x5b071f;
    tutorialBG.alpha = 0.0;
    uiGroup.add(tutorialBG);

    tutorialImage = game.add.sprite(gameWidth / 2, gameHeight * 0.35, "tutorial1");
    tutorialImage.anchor.setTo(0.5, 0.5);
    tutorialImage.scale.setTo(scale.x, scale.y);
    tutorialImage.alpha = 0.0;
    uiGroup.add(tutorialImage);

    var style = { font: "32px Arial", fill: "#ffffff", align: "center", wordWrap: true, wordWrapWidth: wordWrapMod * scale.x };
    tutorialText = game.add.text(gameWidth / 2, gameHeight * 0.65, TUTORIAL_TEXT_1, style);
    tutorialText.anchor.setTo(0.5, 0.5);
    tutorialText.scale.setTo(scale.x, scale.y);
    tutorialText.alpha = 0.0;
    uiGroup.add(tutorialText);
}

function createChunks() {
    var i;
    var normalChunks = [];
    var treasureChunks = [];
    for (i=0; i<mapJSON.chunks.length; i++) {
        if (mapJSON.chunks[i].treasure)
            treasureChunks.push(mapJSON.chunks[i].id);
        else
            normalChunks.push(mapJSON.chunks[i].id);
    }

    chunks = new Array(NUM_CHUNKS_X);
    for (var i=0; i<NUM_CHUNKS_X; i++) {
        chunks[i] = new Array(NUM_CHUNKS_Y);
    }

    var randomIndex = -1;
    for (i=0; i<NUM_CHUNKS_X; i++) {
        for (var j=0; j<NUM_CHUNKS_Y; j++) {
            if (i == 1 && j == 3) {
                randomIndex = getRandomInt(0, treasureChunks.length - 1);
                chunks[i][j] = treasureChunks[randomIndex];
            }
            else {
                randomIndex = getRandomInt(0, normalChunks.length - 1);
                chunks[i][j] = normalChunks[randomIndex];
            }
        }
    }
}

function createStalker() {
    stalker = worldGroup.create(0, 0, "playerSheet");
    stalker.alpha = 0.0;
    stalker.scale.setTo(scale.x, scale.y);
    stalker.anchor.setTo(0.5, 0.5);
}

function createMapFromChunks() {
    //console.log("createMapFromChunks");
    var i;
    map = new Array(BLOCKS_WIDTH);
    for (i=0; i<BLOCKS_WIDTH; i++)
        map[i] = new Array(BLOCKS_HEIGHT);

    for (i=0; i<BLOCKS_WIDTH; i++) {
        for (var j=0; j<BLOCKS_HEIGHT; j++) {
            if (i < SCREEN_EDGE_WIDTH || i >= BLOCKS_WIDTH - SCREEN_EDGE_WIDTH)
                map[i][j] = BlockType.UNDIGGABLE;
            else if (j <= PLAYER_SPAWN_Y)
                map[i][j] = BlockType.EMPTY;
            else if (j >= BLOCKS_HEIGHT - SCREEN_EDGE_WIDTH)
                map[i][j] = BlockType.UNDIGGABLE;
            else
                map[i][j] = getCorrespondingMapData(i - SCREEN_EDGE_WIDTH, j);
        }
    }
}

function createTreasure() {
    var i;
    treasures = [];
    for (i=0; i<STARTING_COINS; i++)
        treasures.push(BlockType.COINS);
    for (i=0; i<STARTING_GOBLETS; i++)
        treasures.push(BlockType.GOBLET)
    for (i=0; i<STARTING_SKULLS; i++)
        treasures.push(BlockType.SKULL);
    var totalChunks = NUM_CHUNKS_X * NUM_CHUNKS_Y;
    var row = -1;
    var randomIndex;
    for (i=0; i<totalChunks; i++) {
        var startI = (i%2) * CHUNK_WIDTH;
        if (i%2 == 0)
            row++;
        var startJ = row * CHUNK_HEIGHT;
        getTreasureBlocksInChunk(startI, startJ);
        while (treasureBlocks.length > 2) {
            randomIndex = getRandomInt(0, treasureBlocks.length - 1);
            map[treasureBlocks[randomIndex].x][treasureBlocks[randomIndex].y] = 1;
            treasureBlocks.splice(randomIndex, 1);
        }
        for (var j=0; j<treasureBlocks.length; j++) {
            randomIndex = getRandomInt(0, treasures.length - 1);
            map[treasureBlocks[j].x][treasureBlocks[j].y] = treasures[randomIndex];
            treasures.splice(randomIndex, 1);
        }
    }
}

function getTreasureBlocksInChunk(startI, startJ) {
    treasureBlocks = [];
    for (var i=startI; i<(startI + CHUNK_WIDTH); i++) {
        for (var j=startJ + Y_OFFSET; j<(startJ + CHUNK_HEIGHT + Y_OFFSET); j++) {
            if (map[i][j] == GENERIC_TREASURE_BLOCK)
                treasureBlocks.push(new Phaser.Point(i, j));
        }
    }
}

function createBackgroundTiles() {
    bgTiles = new Array(BLOCKS_WIDTH);
    for (var i=0; i<BLOCKS_WIDTH; i++) {
        bgTiles[i] = new Array(BLOCKS_HEIGHT);
        for (var j=0; j<BLOCKS_HEIGHT; j++) {
        }
    }
}

function createBlocks() {
    shiningBlocks = [];
    blocks = new Array(BLOCKS_WIDTH);
    for (var i=0; i<BLOCKS_WIDTH; i++) {
        blocks[i] = new Array(BLOCKS_HEIGHT);
        for (var j=0; j<BLOCKS_HEIGHT; j++) {
            var block;
            var frame = -1;
            switch (map[i][j]) {
                case 0:
                    blockType = "empty";
                    break;
                case 1:
                    if (isEdge(i, j))
                        blockType = "diggableEdge";
                    else
                        blockType = "diggable";
                    break;
                case 2:
                    if (isEdge(i, j))
                        blockType = "unbreakableEdge";
                    else
                        blockType = "unbreakable";
                    break;
                case 3:
                    if (isEdge(i, j))
                        blockType = "diggableEdge";
                    else
                        blockType = "diggable";
                    break;
                case 4:
                    frame = COIN_FRAME;
                    blockType = "treasureAtlas";
                    break;
                case 5:
                    frame = GOBLET_FRAME;
                    blockType = "treasureAtlas";
                    break;
                case 6:
                    frame = SKULL_FRAME;
                    blockType = "treasureAtlas";
                    break;
                case 7:
                    blockType = "treasureChestSheet";
                    break;
            }
            block = blockGroup.create(i * blockSize + (blockSize / 2), j * blockSize + (blockSize / 2), blockType);
            if (frame != -1)
                block.frame = frame;
            block.anchor.setTo(0.5, 0.5);
            block.scale.setTo(scale.x, scale.y);
            blocks[i][j] = block;
            switch (blockType) {
                case "treasureChestSheet":
                    treasureChest = block;
                    treasureBlock = new Phaser.Point(i, j);
                    treasureChest.animations.add("open", [0,1,2]);
                    break;
                case "treasureAtlas":
                    switch (map[i][j]) {
                        case 4:
                            blocks[i][j].animations.add("shine", [0,1,2,3,4,5,0], 6, false);
                            blocks[i][j].shineTimer = getRandomInt(TREASURE_SHINE_MIN, TREASURE_SHINE_MAX);
                            shiningBlocks.push(blocks[i][j]);
                            break;
                        case 5:
                            blocks[i][j].animations.add("shine", [6,7,8,9,10,11,6], 6, false);
                            blocks[i][j].shineTimer = getRandomInt(TREASURE_SHINE_MIN, TREASURE_SHINE_MAX);
                            shiningBlocks.push(blocks[i][j]);
                            break;
                        case 6:
                            blocks[i][j].animations.add("shine", [12,13,14,15,16,17,12], 6, false);
                            blocks[i][j].shineTimer = getRandomInt(TREASURE_SHINE_MIN, TREASURE_SHINE_MAX);
                            shiningBlocks.push(blocks[i][j]);
                            break;
                    }
                    break;
            }
        }
    }
}

function createNumbers() {
    numbers = new Array(BLOCKS_WIDTH);
    for (var i=0; i<BLOCKS_WIDTH; i++) {
        numbers[i] = new Array(BLOCKS_HEIGHT);
        for (var j=0; j<BLOCKS_HEIGHT; j++) {
            var count = 0;
            if (i > 0 && checkBlock(i-1, j) == BlockType.QUICKSAND)
                count++;
            if (j > 0 && checkBlock(i, j-1) == BlockType.QUICKSAND)
                count++;
            if (i > 0 && j > 0 && checkBlock(i-1, j-1) == BlockType.QUICKSAND)
                count++;
            if (i < (BLOCKS_WIDTH - 1) && checkBlock(i+1, j) == BlockType.QUICKSAND)
                count++;
            if (j < (BLOCKS_HEIGHT - 1) && checkBlock(i, j+1) == BlockType.QUICKSAND)
                count++;
            if (i < (BLOCKS_WIDTH - 1) && j < (BLOCKS_HEIGHT - 1) && checkBlock(i+1, j+1) == BlockType.QUICKSAND)
                count++;
            if (i > 0 && j < (BLOCKS_HEIGHT - 1) && checkBlock(i-1, j+1) == BlockType.QUICKSAND)
                count++;
            if (i < (BLOCKS_WIDTH - 1) && j > 0 && checkBlock(i+1, j-1) == BlockType.QUICKSAND)
                count++;

            numbers[i][j] = count;
        }
    }
}

function createPlayer() {
    player = new Player();
    player.setPosition();
}

function createTimer() {
    timeBG = game.add.sprite(0, 0, "timeBG");
    timeBG.scale.setTo(scale.x, scale.y);
    timeBG.x = gameWidth - (timeBG.width * 1.35);
    timeBG.alpha = 0.0;
    uiGroup.add(timeBG);

    timeGraphic = game.add.sprite(0, 0, "timerSheet");
    timeGraphic.scale.setTo(scale.x, scale.y);
    timeGraphic.x = gameWidth * 0.7775;
    timeGraphic.y = gameHeight * 0.01;
    timeGraphic.alpha = 0.0;
    uiGroup.add(timeGraphic);

    var style = { font: "64px Luckiest Guy", fill: "#ffffff", align: "center" };
    timeText = game.add.text(gameWidth * 0.845, gameHeight * 0.00125, GAME_SECONDS + " ", style);
    timeText.scale.setTo(scale.x, scale.y);
    timeText.alpha = 0.0;
    uiGroup.add(timeText);

    style.fill = "#ffa956";
    timeBlinkText = game.add.text(gameWidth * 0.845, gameHeight * 0.00125, GAME_SECONDS + " ", style);
    timeBlinkText.scale.setTo(scale.x, scale.y);
    timeBlinkText.alpha = 0.0;
    uiGroup.add(timeBlinkText);
}

function initStalker() {
    stalker.x = treasureChest.x;
    stalker.y = treasureChest.y; // - (400 * scale.y);
    game.camera.follow(stalker);
}

function createText() {
    var style = { font: "64px Luckiest Guy", fill: "#ffffff", align: "right" };
    var startX = gameWidth * 0.005;
    scoreBG = uiGroup.create(startX, 0, "scoreBG");
    scoreBG.scale.setTo(scale.x, scale.y);
    scoreText = [];
    var text = game.add.text(startX + scoreBG.width * 0.83, scoreBG.height * -0.0125, "0 ", style);
    text.scale.setTo(scale.x, scale.y);
    scoreText.push(text);
    uiGroup.add(text);
    text = game.add.text(startX + scoreBG.width * 0.70, scoreBG.height * -0.0125, "", style);
    text.scale.setTo(scale.x, scale.y);
    scoreText.push(text);
    uiGroup.add(text);
    text = game.add.text(startX + scoreBG.width * 0.57, scoreBG.height * -0.0125, "", style);
    text.scale.setTo(scale.x, scale.y);
    scoreText.push(text);
    uiGroup.add(text);
    text = game.add.text(startX + scoreBG.width * 0.44, scoreBG.height * -0.0125, "", style);
    text.scale.setTo(scale.x, scale.y);
    scoreText.push(text);
    uiGroup.add(text);
    text = game.add.text(startX + scoreBG.width * 0.31, scoreBG.height * -0.0125, "", style);
    text.scale.setTo(scale.x, scale.y);
    scoreText.push(text);
    uiGroup.add(text);
    text = game.add.text(startX + scoreBG.width * 0.18, scoreBG.height * -0.0125, "", style);
    text.scale.setTo(scale.x, scale.y);
    scoreText.push(text);
    uiGroup.add(text);

    //style.font = "65px Arial";
    style.font = "84px Luckiest Guy";
    style.align = "center";
    gameOverText = game.add.text(gameWidth / 2, gameHeight * 0.24, "", style);
    gameOverText.anchor.set(0.5, 0.5);
    gameOverText.alpha = 0.0;
    uiGroup.add(gameOverText);

    textCreated = true;
}

// map functions
function checkBlock(x, y) {
    if (x < 0 || x >= BLOCKS_WIDTH || y < MIN_Y || y >= BLOCKS_HEIGHT)
        return -1;
    return map[x][y];
}

function isEdge(i, j) {
    if (j < (BLOCKS_HEIGHT - 1) && (map[i][j+1] == BlockType.EMPTY || map[i][j+1] == BlockType.COINS || map[i][j+1] == BlockType.SKULL || map[i][j+1] == BlockType.GOBLET))
        return true;
    return false;
}

function gotTreasure(blockType, blockX, blockY) {
    //console.log(blockX + ", " + blockY);
    treasureType = blockType;
    switch (blockType) {
        case BlockType.COINS:
            gottenTreasure.frame = COIN_FRAME;
            if (audio)
                coinsCollectAudio.play();
            break;
        case BlockType.SKULL:
            gottenTreasure.frame = SKULL_FRAME;
            if (audio)
                skullCollectAudio.play();
            break;
        case BlockType.GOBLET:
            gottenTreasure.frame = GOBLET_FRAME;
            if (audio)
                gobletCollectAudio.play();
            break;
    }
    treasureMovingPos = new Phaser.Point(player.sprite.x - (blockSize * 5), player.sprite.y - (blockSize * 4));
    gottenTreasure.x = blocks[blockX][blockY].x;
    gottenTreasure.y = blocks[blockX][blockY].y;
    gottenTreasure.alpha = 1.0;
    treasureMoving = true;
}

function modScore(mod) {
    score += mod;
    for (var i=score.toString().length - 1; i>=0; i--) {
        scoreText[score.toString().length - 1 - i].setText(score.toString()[i] + " ");
        //console.log("score digit " + i);
    }
}

function setPlayerRandomLocation() {
    var maxY = player.blockY - 1;
    var cappedY = maxY -QUICKSAND_DISTANCE;
    if(cappedY <2)
        cappedY =2;

    var randomY = getRandomInt(cappedY, maxY);

    //console.log("Maximum penalty " + cappedY  + "  Current spot " +maxY  + " new spot "  +randomY);
    var emptyBlocks = [];
    for (var i=0; i<BLOCKS_WIDTH; i++) {
        if (blocks[i][randomY].key == "empty") {
            emptyBlocks.push(i);
        }
    }
    if (emptyBlocks.length > 0) {
        var randomIndex = getRandomInt(0, emptyBlocks.length - 1);
        var randomX = emptyBlocks[randomIndex];

        player.blockX = randomX;
        player.blockY = randomY;
    }
}

function checkSurroundings(x, y)
{
    //console.log("X : " + x + " Y : " +y);

    if(checkBlock(x-1,y+1) == 3|| checkBlock(x,y+1) == 3 || checkBlock(x+1,y+1) == 3)
    {
        player.downButton.tint = 0Xff0000;
    }
    else
    {
        player.downButton.tint = 0Xffffff;
    }
    if(checkBlock(x-1,y-1) == 3|| checkBlock(x,y-1) == 3 || checkBlock(x+1,y-1) == 3)
    {
        player.upButton.tint = 0Xff0000;
    }
    else
    {
        player.upButton.tint = 0Xffffff;
    }
    if(checkBlock(x-1,y-1) == 3|| checkBlock(x-1,y+1) == 3 || checkBlock(x-1,y) == 3)
    {
        player.leftButton.tint = 0Xff0000;
    }
    else
    {
        player.leftButton.tint = 0Xffffff;
    }
    if(checkBlock(x+1,y-1) == 3|| checkBlock(x+1,y+1) == 3 || checkBlock(x+1,y) == 3)
    {
        player.rightButton.tint = 0Xff0000;
    }
    else
    {
        player.rightButton.tint = 0Xffffff;
    }


}

// game control functions
function gameOver() {
    timeText.setText("0 ");
    timeGraphic.frame = TOTAL_TIMER_FRAMES - 1;
    timeBlinkText.alpha = 0.0;
    gameState = GameState.GAME_OVER;

    music.stop();
    timerTick.stop();
    player.warningAudio.stop();
    player.hideArrows();

    endGameDelayTimer = game.time.events.add(Phaser.Timer.SECOND * END_GAME_DELAY, displayEndUI, this);
}

function displayEndUI() {
    var sendScore, skipScoreCard;
    
    if (gameBridge) {
      sendScore = gameBridge.sendScore;
      skipScoreCard = Boolean(gameBridge.skipScoreCard);
    }
    
    if (sendScore) {
        var p = sendScore(score);
        p.then(function(v) {
            !skipScoreCard && finishGameOver(v); // 1
        }).catch(e => {});
    } else {
        finishGameOver({
            allTimeScores: [],
        });
    }
    
    if (!skipScoreCard) {
        smallCloseButton.x = OFFSCREEN;
        smallCloseButton.y = OFFSCREEN;
  
        overlay.alpha = 1.0;
  
        gameOverText.alpha = 1.0;
        gameOverText.scale.setTo(scale.x ,scale.y );
        gameOverText.text = score;
  
        scoreContainer.alpha = 1.0;
        scoreImage.alpha = 1.0;
        topScoresContainer.alpha = 1.0;
  
        var style = {font: "64px Luckiest Guy", fill: "#ffffff", boundsAlignH: "center"};
        var topScoresHeaderText = game.add.text(gameWidth * 0.5, gameHeight * 0.405, "TOP SCORES", style);
        topScoresHeaderText.anchor.setTo(0.5, 0.5);
        topScoresHeaderText.scale.setTo(scale.x, scale.y);
        uiGroup.add(topScoresHeaderText);
        style.font = "40px Luckiest Guy";
        var allTimeHeader = game.add.text(gameWidth * 0.28, gameHeight * 0.465, "ALL TIME", style);
        allTimeHeader.anchor.setTo(0.5, 0.5);
        allTimeHeader.scale.setTo(scale.x, scale.y);
        uiGroup.add(allTimeHeader);
        var weeklyHeader = game.add.text(gameWidth * 0.72, gameHeight * 0.465, "WEEKLY", style);
        weeklyHeader.anchor.setTo(0.5, 0.5);
        weeklyHeader.scale.setTo(scale.x, scale.y);
        uiGroup.add(weeklyHeader);
  
        // hide all game UI
        var j;
        for( j = 0; j < scoreText.length; j++)
        {
            scoreText[j].text = "";
        }
        scoreBG.alpha = 0.0;
        timeText.alpha = 0.0;
        timeBG.alpha = 0.0;
        timeGraphic.alpha = 0.0;
    }
}

function finishGameOver(leaderboardText) {
    // score = 125910;

    var allTimeHighScoreIndex = findScoreIndex(score, leaderboardText, 'allTimeScores', gameBridge ? gameBridge.info.studentId : null);
    if (allTimeHighScoreIndex != -1) {
        var yourScoreBorder = game.add.sprite(0, 0, "yourScoreBorder");
        yourScoreBorder.scale.setTo(scale.x, scale.y);
        yourScoreBorder.x = gameWidth * 0.095;
        yourScoreBorder.y = gameHeight * 0.5 + (gameHeight * 0.056 * allTimeHighScoreIndex);
        uiGroup.add(yourScoreBorder);
    }

    var weeklyHighScoreIndex = findScoreIndex(score, leaderboardText, 'currentWeekScores', gameBridge ? gameBridge.info.studentId : null);
    if (weeklyHighScoreIndex != -1) {
        var weeklyScoreBorder = game.add.sprite(0, 0, "yourScoreBorder");
        weeklyScoreBorder.scale.setTo(scale.x, scale.y);
        weeklyScoreBorder.x = gameWidth * 0.52;
        weeklyScoreBorder.y = gameHeight * 0.5 + (gameHeight * 0.056 * weeklyHighScoreIndex);
        uiGroup.add(weeklyScoreBorder);
    }

    //console.log(leaderboardText.allTimeScores);
    var style = { font: "36px Luckiest Guy", fill: "#ffffff", align: "left" };
    var indexTextLeft = "";
    var indexTextRight = "";
    var nameTextLeft = "";
    var nameTextRight = "";
    var scoreTextLeft = "";
    var scoreTextRight = "";
    for (i=0; i<5; i++) {
        // all time scores
        var allTimeEntry = null;
        if (leaderboardText != null && leaderboardText.allTimeScores != null) {
            if (leaderboardText.allTimeScores.length > i)
                allTimeEntry = leaderboardText.allTimeScores[i];
        }
        var scoreIndex = i + 1;
        var nameEntry = "";
        if (allTimeEntry != null) {
            nameEntry = getTrimmedName(allTimeEntry.firstName, NAME_MAX);
            nameTextLeft += nameEntry + "\n";
            scoreTextLeft += allTimeEntry.score + " \n"; //"999999\n"; //
        }
        else {
            scoreTextLeft += "\n";
        }

        indexTextLeft += scoreIndex + ".\n";
        indexTextRight += scoreIndex + ".\n";

        // weekly scores
        var weeklyEntry = null;
        if (leaderboardText != null && leaderboardText.currentWeekScores != null) {
            if (leaderboardText.currentWeekScores.length > i)
                weeklyEntry = leaderboardText.currentWeekScores[i];
        }

        if (weeklyEntry != null) {
            nameEntry = getTrimmedName(weeklyEntry.firstName, NAME_MAX);
            nameTextRight += nameEntry + "\n";
            scoreTextRight += weeklyEntry.score + " \n"; //"999999\n"; //
        }
        else
            scoreTextRight += "\n";
    }

    style.align = "center";
    var indexTextBlock = game.add.text(gameWidth * 0.096, gameHeight * 0.4975, indexTextLeft, style);
    indexTextBlock.lineSpacing = TOP_SCORES_Y;
    indexTextBlock.scale.setTo(scale.x, scale.y);
    uiGroup.add(indexTextBlock);

    indexTextBlock = game.add.text(gameWidth * 0.526, gameHeight * 0.4975, indexTextRight, style);
    indexTextBlock.lineSpacing = TOP_SCORES_Y;
    indexTextBlock.scale.setTo(scale.x, scale.y);
    uiGroup.add(indexTextBlock);

    style.align = "left";
    var nameTextBlock = game.add.text(gameWidth * 0.13, gameHeight * 0.4975, nameTextLeft, style);
    nameTextBlock.lineSpacing = TOP_SCORES_Y;
    nameTextBlock.scale.setTo(scale.x, scale.y);
    uiGroup.add(nameTextBlock);

    nameTextBlock = game.add.text(gameWidth * 0.56, gameHeight * 0.4975, nameTextRight, style);
    nameTextBlock.lineSpacing = TOP_SCORES_Y;
    nameTextBlock.scale.setTo(scale.x, scale.y);
    uiGroup.add(nameTextBlock);

    style.align = "right";
    var scoreTextBlock = game.add.text(gameWidth * 0.38, gameHeight * 0.4975, scoreTextLeft, style);
    scoreTextBlock.lineSpacing = TOP_SCORES_Y;
    scoreTextBlock.scale.setTo(scale.x, scale.y);
    uiGroup.add(scoreTextBlock);

    scoreTextBlock = game.add.text(gameWidth * 0.795, gameHeight * 0.4975, scoreTextRight, style);
    scoreTextBlock.lineSpacing = TOP_SCORES_Y;
    scoreTextBlock.scale.setTo(scale.x, scale.y);
    uiGroup.add(scoreTextBlock);

    closeButton.x = (game.width / 2) - (closeButton.width / 2);
    closeButton.y = game.height * 0.85;
}

function finishGame() {
    modScore(TREASURE_CHEST_POINTS);
    music.stop();
    timeBlinkText.alpha = 0.0;
    if (audio)
        chestCollectAudio.play();

    endGameDelayTimer = game.time.events.add(Phaser.Timer.SECOND * END_GAME_DELAY, displayEndUI, this);
    game.time.events.remove(gameTimer);
}

function close(button) {
    if (pointIntersectsRect(new Phaser.Point(game.input.x, game.input.y), new Phaser.Rectangle(button.position.x, button.position.y, button.width, button.height))) {
        if (audio)
            clickButtonAudio.play();
        if (gameBridge){
            gameBridge.close();
        }
    }
}

// ui functions
function setTimer() {
    shineTreasures();

    var secondsLeft = Math.ceil(getTimerDuration() / 1000)
    timeText.setText(secondsLeft + " ");
    timeBlinkText.setText(secondsLeft + " ");
    var baseNum = Math.ceil(secondsLeft / timePerFrame);
    var frame = TIMER_FRAMES - baseNum;
    timeGraphic.frame = frame;

    // timer blink
    if (secondsLeft <= TIMER_BLINK_START_SECONDS) {
        if (!timeBlink) {
            timeBlink = true;
            timeBlinkText.alpha = 1.0;
            timeBlinkTimer = secondsLeft * 1000 / 30;
            if (audio)
                timerTick.play();
        }
        else {
            timeBlinkTimer -= gameTimer.timer.elapsed;
            if (timeBlinkTimer <= 0.0) {
                timeBlinkTimer = secondsLeft * 1000 / 30;
                if (timeBlinkText.alpha == 0.0)
                    timeBlinkText.alpha = 1.0;
                else
                    timeBlinkText.alpha = 0.0;
            }
        }
    }
}

function showTimer() {
    timeBG.alpha = 1.0;
    timeGraphic.alpha = 1.0;
    timeText.alpha = 1.0;
    //timeBlinkText.alpha = 1.0;
}

function getTimerDuration() {
    return gameTimer.tick - gameTimer.timer._now;
}

// touch controls
function tapUpDown(button) {
    //keyDown = true;
    //movePlayer(0, -1);
    upTap = true;
}
function tapUpUp(button) {
    upTap = false;
}
function tapRightDown(button) {
    //keyDown = true;
    //movePlayer(1, 0);

    rightTap = true;
}
function tapRightUp(button) {
    rightTap = false;
}

function tapDownDown(button) {
    //keyDown = true;
    //movePlayer(0, 1);
    downTap = true;
}
function tapDownUp(button) {
    downTap = false;
}

function tapLeftDown(button) {
    //keyDown = true;
    //movePlayer(-1, 0);
    leftTap = true;
}
function tapLeftUp(button) {
    leftTap = false;
}

// map chunk functions
function getChunkById(id) {
    //console.log("finding chunk id " + id);
    for (var i=0; i<mapJSON.chunks.length; i++) {
        if (mapJSON.chunks[i].id == id)
            return mapJSON.chunks[i].map;
    }
    return null;
}

function getCorrespondingMapData(i, j) {
    // console.log("getCorrespondingMapData for i = " + i + " j = " + j);
    var chunkX;
    var chunkY;
    if (i < CHUNK_WIDTH)
        chunkX = 0;
    else
        chunkX = 1;
    if (j < CHUNK_HEIGHT + Y_OFFSET)
        chunkY = 0;
    else if (j < (CHUNK_HEIGHT * 2) + Y_OFFSET)
        chunkY = 1;
    else if (j < (CHUNK_HEIGHT * 3) + Y_OFFSET)
        chunkY = 2;
    else
        chunkY = 3;
    //console.log(chunkX + ", " + chunkY + " = " + chunks[chunkX][chunkY]);
    var mapX;
    var mapY;
    mapX = remainderMod(i, CHUNK_WIDTH);
    //mapX = i % CHUNK_WIDTH;
    mapY = ((j + Y_OFFSET) % CHUNK_HEIGHT);
    // console.log(mapX + ", " + mapY);
    return mapJSON.chunks[chunks[chunkX][chunkY]].map[mapX][mapY];
}

// stalker functions
function moveStalkerTowardsPlayer() {
    var diff = new Phaser.Point(player.sprite.x - stalker.x, player.sprite.y - stalker.y);
    var normalizedDiff = normalize(diff);
    var xDiff = normalizedDiff.x * CAMERA_SPEED;
    var yDiff = normalizedDiff.y * CAMERA_SPEED;
    stalker.x += xDiff;
    stalker.y += yDiff;
}

function checkIfStalkerCloseEnoughToPlayer() {
    if (player.blockY <= 3) {
        if (closeEnough(player.sprite.x, stalker.x, CAMERA_CLOSE_ENOUGH) && closeEnough(game.camera.y, cameraStartY, CAMERA_CLOSE_ENOUGH)) {
            return true;
        }
    }
    else if (closeEnough(player.sprite.x, stalker.x, CAMERA_CLOSE_ENOUGH) && closeEnough(player.sprite.y, stalker.y, CAMERA_CLOSE_ENOUGH)) {
        return true;
    }
    return false;
}

// classes
function Player() {
    this.sprite = game.add.sprite(0, 0, "playerSheet");
    this.sprite.scale.setTo(scale.x, scale.y);
    this.sprite.anchor.setTo(0.5, 0.5);
    worldGroup.add(this.sprite);

    this.headlight = game.add.sprite(0, 0, "lightDig");
    this.headlight.scale.setTo(scale.x * 1.1, scale.y * 1.1);
    this.headlight.anchor.setTo(0.5, 0.5);
    this.headlight.alpha = 0.0;
    worldGroup.add(this.headlight);

    // animations
    this.animation = this.sprite.animations.add("dig", [2,3]);
    this.animation = this.headlight.animations.add("lightDig", [2,3]);

    this.animation = this.sprite.animations.add("getAnim", [4,0]);
    this.animation = this.sprite.animations.add("winAnim", [4]);
    this.animation = this.headlight.animations.add("getLightAnim", [4,0]);
    this.animation = this.headlight.animations.add("winLightAnim", [4]);
    // player touch controls
    this.upButton = game.add.button(0, 0, "upArrow");
    this.upButton.scale.setTo(scale.x* 1.25, scale.y * 1.25);
    this.upButton.anchor.setTo(0.5, 0.5);
    this.upButton.events.onInputDown.add(tapUpDown, this);
    this.upButton.events.onInputUp.add(tapUpUp, this);
    buttonGroup.add(this.upButton);
    worldGroup.add(this.upButton);

    this.rightButton = game.add.button(0, 0, "rightArrow");
    this.rightButton.scale.setTo(scale.x* 1.25, scale.y * 1.25);
    this.rightButton.anchor.setTo(0.5, 0.5);
    this.rightButton.events.onInputDown.add(tapRightDown, this);
    this.rightButton.events.onInputUp.add(tapRightUp, this);
    buttonGroup.add(this.rightButton);
    worldGroup.add(this.rightButton);

    this.downButton = game.add.button(0, 0, "downArrow");
    this.downButton.scale.setTo(scale.x* 1.25, scale.y * 1.25);
    this.downButton.anchor.setTo(0.5, 0.5);
    this.downButton.events.onInputDown.add(tapDownDown, this);
    this.downButton.events.onInputUp.add(tapDownUp, this);
    buttonGroup.add(this.downButton);
    worldGroup.add(this.downButton);

    this.leftButton = game.add.button(0, 0, "leftArrow");
    this.leftButton.scale.setTo(scale.x* 1.25, scale.y * 1.25);
    this.leftButton.anchor.setTo(0.5, 0.5);
    this.leftButton.events.onInputDown.add(tapLeftDown, this);
    this.leftButton.events.onInputUp.add(tapLeftUp, this);
    buttonGroup.add(this.leftButton);
    worldGroup.add(this.leftButton);

    this.warningAudio = game.add.audio("warning", 1, true);
    this.flipTimer = PLAYER_FLIP_TIME;

    this.init = function() {
        this.blockX = PLAYER_SPAWN_X;
        this.blockY = PLAYER_SPAWN_Y;
        this.setPosition();
        this.blinkLevel = 0;
        this.sprite.angle = 0.0;
        this.headlight.angle = 0.0;
        this.startedAnimation = false;
    }

    this.update = function() {
        if (this.blinkLevel > 0  && this.sprite.key != "playerItemGet") {
            if (this.blinkDir == 1) {
                this.headlight.alpha = 1.0;
            }
            else {
                this.headlight.alpha = 0.0;
            }
        }
    }

    this.positionButtons = function() {
        this.upButton.x = this.sprite.x;
        this.upButton.y = this.sprite.y - blockSize;
        if (this.blockY <= PLAYER_SPAWN_Y)
            this.upButton.alpha = 0.0;
        else
            this.upButton.alpha = 1.0;
        this.rightButton.x = this.sprite.x + blockSize;
        this.rightButton.y = this.sprite.y;
        this.downButton.x = this.sprite.x;
        this.downButton.y = this.sprite.y + blockSize;
        this.leftButton.x = this.sprite.x - blockSize;
        this.leftButton.y = this.sprite.y;
    }

    this.setPosition = function() {
        this.sprite.x = (player.blockX * blockSize) + (blockSize / 2);
        this.sprite.y = (player.blockY * blockSize) + (blockSize / 2);
        this.setOtherSpritePositions();
    }

    this.setOtherSpritePositions = function() {
        this.headlight.x = this.sprite.x;
        this.headlight.y = this.sprite.y;
        this.positionButtons();
    }

    this.setBlockPos = function(xMod, yMod) {
        if ((xMod == -1 && this.sprite.scale.x > 0) || (xMod == 1 && this.sprite.scale.x < 0)) {
            this.sprite.scale.x *= -1;
            this.headlight.scale.x *= -1;
        }

        this.blockX += xMod;
        this.blockY += yMod;

        if (this.blockX < 0)
            this.blockX = 0;
        else if (this.blockX >= BLOCKS_WIDTH)
            this.blockX = BLOCKS_WIDTH - 1;
        else if (this.blockY < MIN_Y)
            this.blockY = MIN_Y;
        else if (this.blockY >= BLOCKS_HEIGHT)
            this.blockY = BLOCKS_HEIGHT - 1;
    }

    this.turnOffHeadlight = function() {
        this.headlight.alpha = 0.0;
        this.blinkDir = 1;
        this.blinkLevel = 0;
    }

    this.rotate = function() {
        this.flipTimer -= gameTimer.timer.elapsed;
        if (this.flipTimer <= 0.0) {
            this.flipTimer = PLAYER_FLIP_TIME;
            this.sprite.scale.x *= -1;
            this.headlight.scale.x *= -1;
        }
    }

    this.clearRotation = function() {
        this.sprite.angle = 0;
        this.headlight.angle = 0;
    }

    this.move = function() {
        var diff = new Phaser.Point(blocks[this.blockX][this.blockY].x - this.sprite.x, blocks[this.blockX][this.blockY].y - this.sprite.y);
        var normalizedDiff = normalize(diff);
        var speed;
        if (gameState == GameState.MOVING) {
            speed = PLAYER_MOVE_SPEED;
        }
        else {
            // play animations
            if (!this.startedAnimation) {

                this.sprite.animations.play("dig", 6, false);
                this.headlight.animations.play("lightDig", 6, false);
                this.sprite.animations.currentAnim.onComplete.add(function () { this.sprite.animations.stop(null,true); this.sprite.animations.frame = 0; this.headlight.animations.stop(null,true); this.headlight.animations.frame = 0; }, this);
                this.startedAnimation = true;
            }
            speed = PLAYER_DIG_SPEED;
            if (digFrame < DIG_FRAMES) {
                digTimer += gameTimer.timer.elapsed;
                if (digTimer > DIG_FRAME_SPEED) {
                    digFrame++;
                    switch(digFrame) {
                        case 1:
                            if (blocks[this.blockX][this.blockY].key == "diggable1")
                                blocks[this.blockX][this.blockY].loadTexture("diggable2");
                            else
                                blocks[this.blockX][this.blockY].loadTexture("diggableEdge2");
                            break;
                        case 2:
                            if (blocks[this.blockX][this.blockY].key == "diggable2")
                                blocks[this.blockX][this.blockY].loadTexture("diggable3");
                            else
                                blocks[this.blockX][this.blockY].loadTexture("diggableEdge3");
                            break;
                        case 3:
                            blocks[this.blockX][this.blockY].loadTexture("empty");
                            break;
                    }
                    digTimer = 0;
                }
            }
        }
        var xDiff = normalizedDiff.x * speed;
        var yDiff = normalizedDiff.y * speed;
        this.sprite.x += xDiff;
        this.sprite.y += yDiff;
        if (closeEnough(this.sprite.x, blocks[this.blockX][this.blockY].x, PLAYER_MOVE_CLOSE_ENOUGH) && closeEnough(this.sprite.y, blocks[this.blockX][this.blockY].y, PLAYER_MOVE_CLOSE_ENOUGH)) {
            this.sprite.x = blocks[this.blockX][this.blockY].x;
            this.sprite.y = blocks[this.blockX][this.blockY].y;
            this.setOtherSpritePositions();

            // check for results
            var blockType = checkBlock(this.blockX, this.blockY);
            switch (blockType) {
                case BlockType.COINS:
                case BlockType.SKULL:
                case BlockType.GOBLET:
                case BlockType.TREASURE_CHEST:
                    map[this.blockX][this.blockY] = BlockType.EMPTY;
                    // remove block from shining block array
                    var blockIndex = shiningBlocks.indexOf(blocks[this.blockX][this.blockY]);
                    shiningBlocks.splice(blockIndex, 1);
                    blocks[this.blockX][this.blockY].loadTexture("empty");
                    gotTreasure(blockType, this.blockX, this.blockY);
                    gameState = GameState.PLAY;
                    this.startedAnimation = false;
                    this.setItemGotSprite();
                    keyDown = false;
                    break;
                case BlockType.QUICKSAND:
                    if (blocks[this.blockX][this.blockY].key != "quicksandSheet") {
                        blocks[this.blockX][this.blockY].loadTexture("quicksandSheet");
                        blocks[this.blockX][this.blockY].animations.add("spin", [0, 1, 2], 3, true);
                        blocks[this.blockX][this.blockY].animations.play("spin");
                    }
                    if (audio)
                        quicksandAudio.play();
                    gameState = GameState.TELEPORTING;
                    playerSpinTimer = 0.0;
                    this.startedAnimation = false;
                    this.setSinkSprite();
                    keyDown = false;
                    break;
                default:
                    if (gameState == GameState.DIGGING) {
                        map[this.blockX][this.blockY] = BlockType.EMPTY;
                    }
                    this.checkHeadlight();
                    this.startedAnimation = false;
                    keyDown = false;
                    break;


            }
        }
        this.setOtherSpritePositions();
    }

    this.checkHeadlight = function() {
        var oldBlinkLevel = this.blinkLevel;
        if (numbers[this.blockX][this.blockY] > 0) {
            this.blinkLevel = Math.min(numbers[this.blockX][this.blockY], 3);
        }
        else {
            this.turnOffHeadlight();
            this.warningAudio.stop();
        }
        if (this.blinkLevel > 0) {
            this.warningAudio.volume = 0.25 + (0.25 * this.blinkLevel);
            if (oldBlinkLevel == 0 && audio)
                this.warningAudio.play();
        }
        gameState = GameState.PLAY;
    }

    this.hideArrows = function() {
        this.upButton.alpha = 0.0;
        this.rightButton.alpha = 0.0;
        this.downButton.alpha = 0.0;
        this.leftButton.alpha = 0.0;
    }

    this.showArrows = function() {
        this.upButton.alpha = 1.0;
        this.rightButton.alpha = 1.0;
        this.downButton.alpha = 1.0;
        this.leftButton.alpha = 1.0;
    }

    this.setItemGotSprite = function() {
        this.sprite.animations.stop();
        this.headlight.animations.stop();

        this.sprite.animations.play("getAnim", 4, false);
        this.headlight.animations.play("getLightAnim", 4, false);
    }

    this.setSinkSprite = function() {
        this.sprite.animations.stop();
        this.sprite.frame = 5;
        this.headlight.animations.stop();
        this.headlight.frame = 5;
    }

    this.setNormalSprite = function() {
        this.sprite.frame = 0;
        this.headlight.frame = 0;
    }
}

// utilities
function getRandomInt(min, max) {
    //console.log(min + ", " + max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function normalize(point) {
  var norm = Math.sqrt(point.x * point.x + point.y * point.y);
  if (norm != 0) { // as3 return 0,0 for a point of zero length
    point.x = point.x / norm;
    point.y = point.y / norm;
  }
  return point;
}

function closeEnough(x1, x2, closeEnoughFactor) {
    var xDiff = Math.abs(x1 - x2);
    //console.log(xDiff);
    if (xDiff < (closeEnoughFactor * scale.x))
        return true;
    return false;
}

function remainderMod(n, d) {
  return n - (d * (n/d | 0));
}

function pointIntersectsRect(point, rect) {
    if (point.x >= rect.x && point.x <= (rect.x + rect.width) && point.y >= rect.y && point.y <= (rect.y + rect.height))
        return true;
    return false;
}

}

gameScope();
