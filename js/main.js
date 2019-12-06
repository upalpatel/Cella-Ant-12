/**
    Reference:
    http://langtonant.com/

    CPSC335-Project-1               Team CPT
    
    File used to draw grid, place and run the 
    ant based on a behavior pattern Ant #12.
**/

//main function
function AntGridFrame() {

    var iterator = 0;
    var maxIterations = 1000;

    //declare default function
    var defaultOptions = (function () {

        //declare default options
        var gridOpts = {
                gridSize: 41,
                behavior: getBehavior()[0],
                intervalCount: 1,
                speed: 1,   //millisec
                Left: 0,    //West
                Up: 1,      //North
                Right: 2,   //East
                Down: 3,    //South
            }
            , setBehavior;

        //ant behavior function
        function getBehavior() {
            if (setBehavior != undefined) return setBehavior;

            setBehavior = [
                {turns: 'RRLL'.split(''), colors: ['#000', '#F00', '#FF0', '#00F']}
            ];

            return setBehavior;
        }

        return {
            setGridSize: function (gridSize) {
                gridOpts.gridSize = parseInt(gridSize);
            },
            setAntBehavior: function (behaviorIndex) {
                gridOpts.behavior = getBehavior()[parseInt(behaviorIndex)];
            },
            setRefreshInterval: function (intervalCount) {
                gridOpts.intervalCount = parseInt(intervalCount);
            },
            setRefreshDelayInterval: function (speed) {
                gridOpts.speed = parseInt(speed);
            },
            get: gridOpts
        }
    })();

    //function to help display the background, context, and ant behavior
    var displayScreen = (function () {
        var antBehaviorAlgorithm = document.getElementById('displayAntBehavior');
        var iterationCount = document.getElementById('iterationCount');
        var canvas = document.getElementById('theGrid');
        var context = canvas.getContext('2d');
        var cellSize = 10;
        var cellOffset = .5;
        
        var Orientation = [
            //0: Left  - West
            [{x: 0, y: -1}, {x: -1, y: 0}, {x: 0, y: 1}],
            //1: Up    - North
            [{x: -1, y: 0}, {x: 0, y: -1}, {x: 1, y: 0}],
            //2: Right - East
            [{x: 0, y: -1}, {x: 1, y: 0}, {x: 0, y: 1}],
            //3: Down  - South
            [{x: -1, y: 0}, {x: 0, y: 1}, {x: 1, y: 0}]
        ];

        return {
            setCanvasSize: function (gridSize) {
                canvas.width = gridSize - 9;
                canvas.height = gridSize - 9;
            },
            clearCanvas: function () {
                context.clearRect(0, 0, canvas.width, canvas.height);
            },
            printGrid: function () {
                var gridCanvasSize = ((defaultOptions.get.gridSize - 1) * cellSize) + (cellSize * 2);
                this.setCanvasSize(gridCanvasSize);
				
                for (var x = cellOffset; x < gridCanvasSize; x += cellSize) {
                    context.moveTo(x, 0);
                    context.lineTo(x, gridCanvasSize - cellSize);
                }
                
                for (var y = cellOffset; y < gridCanvasSize; y += cellSize) {
                    context.moveTo(0, y);
                    context.lineTo(gridCanvasSize - cellSize, y);
                }
				context.strokeStyle = '#C2C2C2';
                context.stroke();
            },
            printCellColor: function (cellState) {
                var x = (Ant.x * cellSize) + 1,
                    y = (Ant.y * cellSize) + 1,
                    wh = cellSize - 1;

                context.fillStyle = defaultOptions.get.behavior.colors[cellState];
                context.fillRect(x, y, wh, wh);
            },
            printIterationCount: function (count) {
                iterationCount.innerText = count.toLocaleString();
            },
            clearIterationCount: function () {
                iterationCount.innerText = '0';
            },
            printAntOrientation: function () {
                var paint = Orientation[Ant.antDirection];

                context.beginPath();
                context.moveTo(paint[0].x, paint[0].y);
                context.lineTo(paint[1].x, paint[1].y);
                context.lineTo(paint[2].x, paint[2].y);
            },
            printBehaviorAlgorithm: function () {
                var turns = '';

                antBehaviorAlgorithm.innerHTML = turns;
            },
            
            clearBehaviorAlgorithm: function () {
                antBehaviorAlgorithm.innerHTML = '';
            }
        }
    })();

    //grid variable to help populate grid cells
    var Grid = {
        start: function () {
            this.cells = new Int8Array(defaultOptions.get.gridSize + Math.pow(defaultOptions.get.gridSize, 2));

            displayScreen.clearCanvas();
            displayScreen.printGrid();
        },
        getCellState: function (cellIndex) {
            return this.cells[cellIndex];
        },
        setCellState: function (cellIndex, state) {
            this.cells[cellIndex] = state;
        }
    };

    //ant variable to place, turn, and move the ant on the grid
    var Ant = {
        start: function () {

            //place the ant in the center
            this.x = Math.floor(defaultOptions.get.gridSize / 2);
            this.y = Math.floor(defaultOptions.get.gridSize / 2);

            //ant direction:
            //0: West
            //1: North
            //2: East
            //3: South
            this.antDirection = defaultOptions.get.Left;

            //get the index of the cell the ant was placed on
            this.cellIndex = this.y + this.x * defaultOptions.get.gridSize;

        },
        turn: function(cellState) {
            if (defaultOptions.get.behavior.turns[cellState] === 'L') {
                this.antDirection = (this.antDirection + 3) % 4;    //left
            } else {
                this.antDirection = (this.antDirection + 5) % 4;    //right
            }
        },
        move: function () {
            if (!(this.antDirection % 2)) {
                this.y += this.antDirection - 1;
            } else {
                this.x -= this.antDirection - 2;
            }

            this.cellIndex = this.y + this.x * defaultOptions.get.gridSize;
        }
    };

    function run() {
        reset();

        iterator = setInterval(runSteps, defaultOptions.get.speed);

        displayScreen.printBehaviorAlgorithm(defaultOptions.get.behavior);

        var iterations = 0;

        //main loop
        function runSteps() {
            for (var i = 0, intervals = defaultOptions.get.intervalCount; i < intervals; i++) {
                if (runAnt()) { break; }
                iterations++;
                //stop after max iterations
                if(iterations == maxIterations) { clearInterval(iterator); }
            }
            displayScreen.printIterationCount(iterations);
        }

        function runAnt() {
            var currentCellState = Grid.getCellState(Ant.cellIndex);
            var newCellState = (currentCellState + 1) % defaultOptions.get.behavior.colors.length;

            Grid.setCellState(Ant.cellIndex, newCellState);

            displayScreen.printCellColor(currentCellState);
            displayScreen.printAntOrientation();

            Ant.turn(currentCellState);
            Ant.move();

            if (Ant.cellIndex < 0 || Ant.cellIndex > Grid.cells.length) {
                return true;
            }
        }
    }

    function reset() {
        clearInterval(iterator);
        displayScreen.clearBehaviorAlgorithm();
        displayScreen.clearIterationCount();
        Grid.start();
        Ant.start();
    }

    return {
        run: run,
        reset: reset,
        defaultOptions: defaultOptions
    }
}