( function () {
    let canvas;
    let context;
    const gameWidth = 509;
    const gameHeight = 381;
    let background;

    function setup () {
        canvas = document.getElementById('canvas');

        if ( !_isCanvasSupported( canvas ) ) {
            return console.error( "Canvas not supported." );
        }

        context = canvas.getContext("2d");
        drawBackground();
    }

    function _isCanvasSupported ( $canvasElt ) {
        //Get given canvas element, return a boolean - "true" if canvas is supported and "false" if it isn't
        return !!$canvasElt.getContext;
    };

    function drawBackground () {
        background = new Image();
        background.addEventListener( 'load', backgroundLoaded );
        background.src = "./img/background.png";
    }

    function backgroundLoaded () {
        context.drawImage( background, 0, 0, gameWidth, gameHeight, 0, 0, gameWidth, gameHeight);
    }

    setup();
} ) ();
