// Settings
let updateInterval = 50;
let gridWidth = 100;
let gridHeight = 100;
let deadColor = "#ffffff";
let aliveColor = "#000000";

// Other variables
let isPlaying = false;
let timeoutID: number | undefined;
let colorPicker = document.getElementById("cell-color") as HTMLInputElement;

let graphicsGrid: number[][] = new Array(gridWidth).fill(0).map(() => new Array(gridHeight).fill(0));
let lifeTime = 1;
let fadeSlider = document.getElementById("fade-slider") as HTMLInputElement;

let gridSizeSlider = document.getElementById("grid-size-slider") as HTMLInputElement;

let style = document.documentElement.style

// Main function
function main() {
    // Add event listener to the color picker
    colorPicker.addEventListener("input", (event) => {
        aliveColor = colorPicker.value;
        style.setProperty("--main-color", aliveColor);
        updateGraphics(currentGrid);

    });

    fadeSlider.addEventListener("input", (event) => {
        lifeTime = parseInt(fadeSlider.value);
        // resetGrid(graphicsGrid);
    });
    lifeTime = parseInt(fadeSlider.value);

    gridSizeSlider.addEventListener("input", (event) => {
        let gridContainer = document.getElementById("grid-container");
        if (!gridContainer) { console.error("Grid container not found"); return; } // Error handling
        gridContainer.style.width = parseInt(gridSizeSlider.value) + "px";
        gridContainer.style.height = parseInt(gridSizeSlider.value) + "px";
    });

    // Create and initialize the grid
    let currentGrid: number[][] = 
    new Array(gridWidth).fill(0).map(() =>
    new Array(gridHeight).fill(0));

    createGrid(currentGrid); // Create the grid
    setupControls(currentGrid); // Setup the controls
}

function createGrid(grid: number[][]) {
    // Get the grid container
    let gridContainer = document.getElementById("grid-container");
    if(!gridContainer) { console.error("Grid container not found"); return; } // Error handling

    // Create the table
    let table = document.createElement("table");

    // Create the rows and cells
    for (let x = 0; x < gridWidth; x++) {
        let tableRow = document.createElement("tr");
        for  (let y = 0; y < gridHeight; y++) {
            let cell = document.createElement("td");
            cell.setAttribute("id", x + "-" + y); // Set the cell id to the x-y coordinates
            cell.setAttribute("class", "dead"); // Set the class of the cell to indicate its state
            cell.onclick = () => cellClickHandler(cell, grid); // Set the click event handler to listen for cell clicks
            tableRow.appendChild(cell); // Append the cell to the row
        }
        table.appendChild(tableRow); // Append the row to the table
    }
    gridContainer.appendChild(table); // Append the table to the grid container

    // The cell click event handler function
    function cellClickHandler(cell: HTMLTableCellElement, grid: number[][]) {
        // Get the x and y coordinates of the cell
        let coordinates = cell.id.split("-");
        let x = parseInt(coordinates[0]);
        let y = parseInt(coordinates[1]);

        // Toggle the cell state
        let state = cell.getAttribute("class");
        if (state == "dead") {
            cell.setAttribute("class", "alive");
            grid[x][y] = 1;
        } else {
            cell.setAttribute("class", "dead");
            grid[x][y] = 0;
        }

        // Update and print the grid
        updateGraphics(grid);
    }
}

// The function to reset the whole grid to the dead state
function resetGrid(grid: number[][]) {
    for (let x = 0; x < gridWidth; x++) {
        for (let y = 0; y < gridHeight; y++) {
            grid[x][y] = 0;
        }
    }
}

// The function to interpolate between two colors and return the result based on the percentage
function interpolateColor(color1:string, color2:string, percent:number) {
    // Parse the hexadecimal color strings of the first color
    const red1 = parseInt(color1.substring(1, 3), 16);
    const green1 = parseInt(color1.substring(3, 5), 16);
    const blue1 = parseInt(color1.substring(5, 7), 16);

    // Parse the hexadecimal color strings of the second color
    const red2 = parseInt(color2.substring(1, 3), 16);
    const green2 = parseInt(color2.substring(3, 5), 16);
    const blue2 = parseInt(color2.substring(5, 7), 16);

    // Interpolate the colors
    const red = Math.round(red1 + (red2 - red1) * percent);
    const green = Math.round(green1 + (green2 - green1) * percent);
    const blue = Math.round(blue1 + (blue2 - blue1) * percent);

    // Convert the interpolated colors to hexadecimal
    return "#" + red.toString(16) + green.toString(16) + blue.toString(16);
}

function setupControls(grid: number[][]) {
    // Play button
    let playButton = document.getElementById("play");
    if (!playButton) { console.error("Play button not found"); return; } // Error handling
    playButton.onclick = () => startButtonHandler(playButton);

    // Clear button
    let clearButton = document.getElementById("clear");
    if (!clearButton) { console.error("Clear button not found"); return; } // Error handling
    clearButton.onclick = () => clearButtonHandler();

    // Random button
    let randomButton = document.getElementById("random");
    if (!randomButton) { console.error("Random button not found"); return; } // Error handling
    randomButton.onclick = () => randomButtonHandler();


    // The start button event handler function
    function startButtonHandler(button: HTMLElement) {
        if (isPlaying) {
            isPlaying = false;
            button.setAttribute("id", "play");
            button.innerText = "Play";
            clearTimeout(timeoutID);
        } else {
            isPlaying = true;
            button.setAttribute("id", "stop");
            button.innerText = "Stop";
            gameLoop(grid);
        }
    }
    
    // The clear button event handler function
    function clearButtonHandler() {
        console.log("Clear button clicked, Stopping the game, Resetting the grid");
        
        resetGrid(grid);
        resetGrid(graphicsGrid)
        updateGraphics(grid);
    }

    // The random button event handler function
    function randomButtonHandler() {
        resetGrid(grid);
        resetGrid(graphicsGrid);
        for (let x = 0; x < gridWidth; x++) {
            for (let y = 0; y < gridHeight; y++) {
                grid[x][y] = Math.round(Math.random());
            }
        }
        updateGraphics(grid);
    }
}

// the game loop function
function gameLoop(grid: number[][]) {
    // initialize the next generation grid
    let nextGeneration: number[][] = 
        new Array(gridWidth).fill(0).map(() =>
        new Array(gridHeight).fill(0));

    // Check if the game is still playing if not, stop the loop
    if (isPlaying) {
        // calculate the next generation
        for (let x = 0; x < gridWidth; x++) {
            for (let y = 0; y < gridHeight; y++) {
                applyRules(x, y);
            }
        }
        resetGrid(grid); // Reset the current generation
        for (let x = 0; x < gridWidth; x++) {
            for (let y = 0; y < gridHeight; y++) {
                grid[x][y] = nextGeneration[x][y];
            }
        }
        updateGraphics(grid); // Print the current generation

        // Call the game loop function again
        timeoutID = setTimeout(() => gameLoop(grid), updateInterval);
    }

    function applyRules(x: number, y: number) {
        let neightbors = countNeightbours(x, y);
        if (grid[x][y] == 1) {
            // if the cell has less than 2 or more than 3 neightbors, it dies
            if (neightbors < 2 || neightbors > 3) {
                nextGeneration[x][y] = 0;
            } 
            // if the cell has 2 or 3 neightbors, it lives
            else if (neightbors == 2 || neightbors == 3) {
                nextGeneration[x][y] = 1;
            }
            // if the cell has more than 3 neightbors, it dies
            else if (neightbors > 3) {
                nextGeneration[x][y] = 0;
            }
        } 
        else if (grid[x][y] == 0) {
            // if the cell has exactly 3 neightbors, it becomes alive
            if (neightbors == 3) {
                nextGeneration[x][y] = 1;
            }
        }
    }

    function countNeightbours(x: number, y: number): number {
        let count = 0;
        // Check the eight neighboring cells
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                // Skip the current cell
                if (i === 0 && j === 0) {
                    continue;
                }
                // Calculate the coordinates of the neighboring cell
                const neighborX = x + i;
                const neighborY = y + j;
                // Check if the neighboring cell is within the grid boundaries
                if (neighborX >= 0 && neighborX < gridWidth && neighborY >= 0 && neighborY < gridHeight) {
                    // Check if the neighboring cell is alive
                    if (grid[neighborX][neighborY] === 1) {
                        count++;
                    }
                }
            }
        }
        return count; // Return the count of alive neighboring cells
    }
}

function updateGraphics(grid: number[][]) {
    for (let x = 0; x < gridWidth; x++) {
        for (let y = 0; y < gridHeight; y++) {
            let cell = document.getElementById(x + "-" + y);
            if (!cell) { console.error("Cell not found"); return; } // Error handling

            if(grid[x][y] == 1) {
                graphicsGrid[x][y] = lifeTime;
                cell.setAttribute("class", "alive");
            } else if (graphicsGrid[x][y] > 0) {
                cell.setAttribute("class", "dead");
                if (graphicsGrid[x][y] > 0) graphicsGrid[x][y]--;
            }

            cell.style.background = aliveColor;
            cell.style.opacity = graphicsGrid[x][y] / lifeTime + "";
        }
    }
}

main();