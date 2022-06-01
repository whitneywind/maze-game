const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;

const width = window.innerWidth;
const height = window.innerHeight;
const cellsH = 4;
const cellsV = 3;

const unitLengthX = width / cellsH;
const unitLengthY = height / cellsV;


function startMaze() {
    const engine = Engine.create();
    engine.world.gravity.y = 0;
    const { world } = engine;
    const render = Render.create({
        element: document.body,
        engine: engine,
        options: {
            wireframes: false,
            width: width,
            height: height
        }
    });

    Render.run(render);
    Runner.run(Runner.create(), engine);

    // walls
    const walls = [
        Bodies.rectangle(width / 2, 0, width, 10, { isStatic: true}),
        Bodies.rectangle(width / 2, height, width, 10, { isStatic: true}),
        Bodies.rectangle(0, height / 2, 10, height, { isStatic: true}),
        Bodies.rectangle(width, height / 2, 10, height, { isStatic: true})
    ];
    World.add(world, walls);


    // maze generation 
    const shuffle = (arr) => {
        let counter = arr.length;
        while (counter > 0) {
            const index = Math.floor(Math.random() * counter);
            counter--;
            const temp = arr[counter];
            arr[counter] = arr[index];
            arr[index] = temp;
        }
    return arr;
    };

    const grid = Array(cellsV).fill(null).map(() => Array(cellsH).fill(false));

    const verticals = Array(cellsV).fill(null).map(() => Array(cellsH - 1).fill(false));

    const horizontals = Array(cellsV - 1).fill(null).map(() => Array(cellsH).fill(false));

    const startRow = Math.floor(Math.random() * cellsV);
    const startColumn = Math.floor(Math.random() * cellsH);

    const stepThroughCell = (row, column) => {
        // if already visited row, then return 
        if (grid[row][column]) {
            return;
        }
        // mark cell as being visited
        grid[row][column] = true;

        //assemble randomly-ordered list of neighbors
        const neighbors = shuffle([
            [row - 1, column, 'up'],
            [row, column + 1, 'right'],
            [row + 1, column, 'down'],
            [row, column - 1, 'left']
        ]);
    // For each neighbor....
    for (let neighbor of neighbors) {
        const [nextRow, nextColumn, direction] = neighbor;
            // see if each neightbor is out of bounds
            if (nextRow < 0 || nextRow >= cellsV || nextColumn < 0 || nextColumn >= cellsH) {
                continue;
            }
            // see if we've already visited that neightbor
            if (grid[nextRow][nextColumn]) {
                continue;
            }
            // remove a wall from either horizontals or verticals
            if (direction === 'left') {
                verticals[row][column - 1] = true;
            } else if (direction === 'right') {
                verticals[row][column] = true;
            } else if (direction === 'up') {
                horizontals[row - 1][column] = true;
            } else if (direction === 'down') {
                horizontals[row][column] = true;
            }
            stepThroughCell(nextRow, nextColumn);
        }
    };

    stepThroughCell(startRow, startColumn);

    horizontals.forEach((row, rowIndex) => {
        row.forEach((open, columnIndex) => {
        if (open) {
            return;
        }
    
        const wall = Bodies.rectangle(
            columnIndex * unitLengthX + unitLengthX / 2,
            rowIndex * unitLengthY + unitLengthY,
            unitLengthX,
            5,
            {
            isStatic: true,
            label: 'wall',
            render: {
                fillStyle: 'blue'
            }
            }
        );
        World.add(world, wall);
        });
    });

    verticals.forEach((row, rowIndex) => {
        row.forEach((open, columnIndex) => {
        if (open) {
            return;
        }
    
        const wall = Bodies.rectangle(
            columnIndex * unitLengthX + unitLengthX,
            rowIndex * unitLengthY + unitLengthY / 2,
            5,
            unitLengthY,
            {
            isStatic: true,
            label: 'wall',
            render: {
                fillStyle: 'blue'
            }
            }
        );
        World.add(world, wall);
        });
    });

    const goal = Bodies.rectangle(width - unitLengthX / 2, height - unitLengthY / 2, unitLengthX * .5, unitLengthY * .5, {
        isStatic: true,
        label: 'goal',
        render: {
            fillStyle: 'teal'
        }
    });
    World.add(world, goal);

    // ball
    const ballRadius = Math.min(unitLengthX, unitLengthY) / 4;
    const ball = Bodies.circle(
        unitLengthX / 2, unitLengthY / 2, ballRadius, { label: 'ball', render: { fillStyle: 'skyBlue'} }
    );

    World.add(world, ball);

    document.addEventListener('keydown', event => {
        const { x, y } = ball.velocity;

        if (event.keyCode === 38) {
            Body.setVelocity(ball, { x, y: y - 5 });
        } else if (event.keyCode === 39) {
            Body.setVelocity(ball, { x: x + 5, y });
        } else if (event.keyCode === 40) {
            Body.setVelocity(ball, { x, y: y + 5 });
        } else if (event.keyCode === 37) {
            Body.setVelocity(ball, { x: x - 5, y });
        }
    });


    // win condition

    Events.on(engine, 'collisionStart', event => {
        event.pairs.forEach(collision => {
            const labels = ['ball', 'goal'];
            if (labels.includes(collision.bodyA.label) && labels.includes(collision.bodyB.label)) {
                document.querySelector('.winner').classList.remove('hidden');
                world.gravity.y = 1;
                world.bodies.forEach(body => {
                    if (body.label === 'wall') {
                        Body.setStatic(body, false);
                    }
                })
            }
        });
    });

}
  

  // reset button
  const resetBtn = document.querySelector('#resetBtn');
  resetBtn.addEventListener('click', () => {
    location.reload();
});

window.addEventListener('load', startMaze());