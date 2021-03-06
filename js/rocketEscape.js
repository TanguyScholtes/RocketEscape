( function () {
    let canvas,
        context,
        background;
    let obstacles = [];
    let radioTower = document.getElementById('radioTower');
    let rocketHideout = document.getElementById('rocketHideout');
    const gameWidth = 256;
    const gameHeight = 256;
    const speed = 3;
    const difficulty = 2;
    let ticker = 0;
    let gameState = "paused";
    let score = 0;
    let floor = {
        image: null,
        x: 0,
        y: 222
    };
    let player = {
        image: null,
        x: 25,
        y: 222,
        state: "running"
    };

    function setup () {
        canvas = document.getElementById('canvas');

        if ( !isCanvasSupported( canvas ) ) {
            return console.error( "Canvas not supported." );
        }

        context = canvas.getContext("2d");
        context.font = '12px Pixel';
        try{
            drawBackground();
        } finally {
            try{
                drawFloor();
            } finally {
                drawPlayer();
            }
        }

        // Wait for player to start game by pressing spacebar
        document.body.onkeyup = ( e ) => {
            if( e.keyCode == 32 && gameState === "paused" ) {
                // launch game
                gameState = "started";
                radioTower.play();
                jumpDetection();
                updateGame();
            }
        };
    }

    function isCanvasSupported ( $canvasElt ) {
        /*
         * Get given canvas element
         * Returns a boolean - "true" if canvas is supported and "false" if it isn't
         */
        return !!$canvasElt.getContext;
    };

    function rng ( min, max ) {
        /*
         * Returns a random integer between given min & max included
         */

        min = Math.ceil( min );
        max = Math.floor( max );
        return Math.floor( Math.random() * ( max - min + 1 ) ) + min;
    }

    function drawBackground () {
        /*
         * Draws the background image
         */
        background = new Image();
        background.src = "./img/background.png";
        background.addEventListener( 'load', () => {
            context.drawImage( background, 0, 0);
        } );
    }

    function drawFloor () {
        /*
         * Draws the grassy floor image (three times as it is smaller than the canvas)
         */
        floor.image = new Image();
        floor.image.src = "./img/grass.png";
        floor.image.addEventListener( 'load', () => {
            context.drawImage( floor.image, floor.x, floor.y );
            context.drawImage( floor.image, floor.x + 136, floor.y );
            context.drawImage( floor.image, floor.x + 272, floor.y );
        } );
    }

    function drawPlayer () {
        /*
         * Draws the player image at player's position
         */
        if( gameState === "paused" || ( ticker%speed && player.state === "running" ) ) {
            console.log("iddle")
            player.image = new Image();
            player.image.src = "./img/pikachu-iddle.png";
        } else {
            console.log("running")
            player.image = new Image();
            player.image.src = "./img/pikachu-running.png";
        }
        player.image.addEventListener( 'load', () => {
            context.drawImage( player.image, player.x, player.y );
        } );
    }

    function drawObstacle ( obstacle ) {
        /*
         * Draws an obstacle at given position
         */
        obstacle.image = new Image();
        if( obstacle.src === 0 ) {
            obstacle.image.src = "./img/obstacle.png";
        } else {
            obstacle.image.src = "./img/obstacleFemale.png";
        }
        obstacle.image.addEventListener( 'load', () => {
            context.drawImage( obstacle.image, obstacle.x, obstacle.y);
        } );
    }

    function jumpDetection () {
        /*
         * Detects if player is pressing Spacebar
         * and make it jump if able (not already jumping)
         */
        document.body.onkeyup = ( e ) => {
            if( e.keyCode == 32 && player.state === "running" && gameState === "started" ) {
                // make player jump
                player.state = "jumping-asc";
            }
        };
    }

    function drawScore () {
        context.fillText(`Score: ${score}`, 5, 20);
    }

    function drawStartScreen () {
        context.fillText(`Press spacebar to start`, 50, 110);
    }

    function endGame () {
        radioTower.pause();
        rocketHideout.play();
        context.fillText(`Game over!`, 65, 100);
        context.fillText(`Score: ${score}`, 65, 125);
    }

    function updateGame () {
        ticker += 1;

        if ( gameState == "game over" ) {
            endGame();
            return;
        }

        if ( ticker%2 ) {
            try {
                drawBackground();
            } finally {
                try {
                    // Make floor move
                    floor.x -= speed;
                    if ( floor.x <= -136 ) {
                        floor.x = 0;
                    }
                    drawFloor();
                } finally {
                    try {
                        // Make player move if able
                        // Ensure max jump height was no reached
                        if ( player.y < ( 222 - 51 ) ) {
                            player.y = 222 - 51;
                            player.state = "jumping-desc";
                        }
                        if ( player.y > 222 ) {
                            player.y = 222;
                            player.state = "running";
                        }
                        // Animate player
                        if ( player.state === "jumping-asc" ) {
                            // Player is gainning height
                            player.y -= speed*1.2;
                        }
                        if ( player.state === "jumping-desc" ) {
                            // Player is losing height
                            player.y += speed*0.8;
                        }
                        drawPlayer();
                    } finally {
                        // Handle Obstacles & Collisions
                        if ( obstacles.length > 0 ) {
                            obstacles.forEach( ( obstacle, index ) => {
                                if ( gameState === "started" ) {
                                    if ( obstacle.x <= player.x + 17 && obstacle.x + 18 >= player.x && obstacle.y - 25 <= player.y - 17 ) {
                                        // collision between the obstacle & the player
                                        gameState = "game over";
                                        drawObstacle( obstacle );
                                        return;
                                    } else {
                                        if ( obstacle.x + 18 <= player.x ) {
                                            // update score
                                            score += 10;
                                            // Delete obsolete obstacles
                                            obstacles.splice( index, 1 );
                                        } else {
                                            // Animate current obstacles
                                            obstacle.x -= speed;
                                            drawObstacle( obstacle );
                                        }
                                    }
                                }
                            } );
                        }
                        // Generate new obstacles
                        if ( obstacles.length < difficulty && rng( 1, 20 )%5 ) {
                            obstacles.push( {
                                x: rng( 257, 512 ),
                                y: 215,
                                image: null,
                                src: rng( 0, 1 )
                            } );
                        }
                    }
                }
            }
        }

        drawScore();
        requestAnimationFrame( updateGame );
    }

    setup();
} ) ();
