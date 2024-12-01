document.addEventListener("DOMContentLoaded", () => {
    const puzzleContainer = document.getElementById("puzzle-container");
    const shuffleButton = document.getElementById("shuffle-button");
    const newGameButton = document.getElementById("new-game-button");
    const backgroundSelector = document.getElementById("background-selector");
    const timerElement = document.getElementById("timer");
    const gridSize = 4;
    const tileSize = 100;
    let tiles = [];
    let blankPosition = { x: 3, y: 3 };
    let timerInterval = null;
    let elapsedTime = 0;
    let gameInitialized = false; // Flag to track game initialization

    // Update hover effects for tiles
    function updateHoverEffects() {
        tiles.flat().forEach((tile) => {
            if (tile) {
                const row = Math.round(tile.style.transform.match(/,\s*(-?\d+)px\)/)[1] / tileSize);
                const col = Math.round(tile.style.transform.match(/\((-?\d+)px/)[1] / tileSize);
                if (isMovable(row, col)) {
                    tile.classList.add("movablepiece");
                } else {
                    tile.classList.remove("movablepiece");
                }
            }
        });
    }

    // initialize puzzle grid
    function createTiles() {
        puzzleContainer.innerHTML = "";
        tiles = [];
        for (let row = 0; row < gridSize; row++) {
            tiles[row] = [];
            for (let col = 0; col < gridSize; col++) {
                if (row === 3 && col === 3) {
                    tiles[row][col] = null;
                } else {
                    const tile = document.createElement("div");
                    tile.classList.add("tile");
                    tile.textContent = row * gridSize + col + 1;
                    tile.style.backgroundPosition = `${-col * tileSize}px ${-row * tileSize}px`;
                    tiles[row][col] = tile;
                    puzzleContainer.appendChild(tile);
                    updateTilePosition(tile, col, row);
                }
            }
        }
        blankPosition = { x: 3, y: 3 };
        updateHoverEffects();
        updateTileBackground();
    }

    // Update the position of a tile using CSS transform
    function updateTilePosition(tile, x, y) {
        tile.style.transform = `translate(${x * tileSize}px, ${y * tileSize}px)`;
    }

    // Update the background image of all tiles
    function updateTileBackground() {
        const selectedBackground = backgroundSelector.value;
        tiles.flat().forEach((tile) => {
            if (tile) {
                tile.style.backgroundImage = `url(${selectedBackground})`;
            }
        });
    }

    // Check if a tile can move into the blank space
    function isMovable(row, col) {
        const dx = Math.abs(blankPosition.x - col);
        const dy = Math.abs(blankPosition.y - row);
        return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
    }

    // Move the tile into the blank position
    function moveTile(row, col) {
        if (isMovable(row, col)) {
            const tile = tiles[row][col];
            tiles[blankPosition.y][blankPosition.x] = tile;
            tiles[row][col] = null;
            updateTilePosition(tile, blankPosition.x, blankPosition.y);
            blankPosition = { x: col, y: row };
            updateHoverEffects();

            // Check if the puzzle is completed after every move
            if (gameInitialized && isPuzzleComplete()) {
                setTimeout(() => {
                    showPopup(elapsedTime); // Pass elapsed time to the popup
                }, 100); // Delay slightly to allow last move animation
                stopTimer(); // Stop the timer when the puzzle is solved
            }
        }
    }

    function showPopup(time) {
        const popup = document.getElementById("popup");
        const popupMessage = document.querySelector(".popup-content p");
        const timeDisplay = document.createElement("p");
        timeDisplay.textContent = `You solved the puzzle in ${time} seconds!`;

        popupMessage.textContent = "Congratulations! You have completed the puzzle!";
        popupMessage.appendChild(timeDisplay);

        popup.style.display = "flex";

        const closeButton = document.getElementById("close-popup");
        closeButton.addEventListener("click", () => {
            popup.style.display = "none";
            resetGame();
        });
    }

    // Check if the puzzle is solved
    function isPuzzleComplete() {
        let correct = true;
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                if (tiles[row][col] && tiles[row][col].textContent != row * gridSize + col + 1) {
                    correct = false;
                    break;
                }
            }
        }
        return correct;
    }

    function shuffleTiles() {
        let moves = 300;
        while (moves > 0) {
            const neighbors = [];
            tiles.flat().forEach((tile) => {
                if (tile) {
                    const transform = tile.style.transform.match(/translate\((.*?)px, (.*?)px\)/);
                    const x = parseInt(transform[1]) / tileSize;
                    const y = parseInt(transform[2]) / tileSize;
                    if (isMovable(y, x)) {
                        neighbors.push({ row: y, col: x });
                    }
                }
            });

            const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
            moveTile(randomNeighbor.row, randomNeighbor.col);
            moves--;
        }

        resetTimer();
        startTimer();
        gameInitialized = true; // Mark the game as initialized
    }

    // Timer Functions
    function startTimer() {
        if (timerInterval) clearInterval(timerInterval); // clears prev intervals
        elapsedTime = 0;
        timerElement.textContent = elapsedTime;
        timerInterval = setInterval(() => {
            elapsedTime++;
            timerElement.textContent = elapsedTime;
        }, 1000);
    }

    function stopTimer() {
        clearInterval(timerInterval); // Stops when puzzle is solved
    }

    function resetTimer() {
        clearInterval(timerInterval);
        elapsedTime = 0;
        timerElement.textContent = elapsedTime;
    }

    // Reset game after completion or a new game
    function resetGame() {
        gameInitialized = false; // Reset game state
        createTiles(); // Create new tiles
        resetTimer(); // Reset the timer
        updateHoverEffects(); // Reset hover effects
    }

    // Start a new game
    function newGame() {
        resetGame();
        startTimer();
    }

    // Initialize the game
    createTiles();
    updateHoverEffects();
    shuffleTiles(); // Shuffle tiles at the start of the game

    // Event listeners
    puzzleContainer.addEventListener("click", (event) => {
        if (event.target.classList.contains("tile")) {
            const transform = event.target.style.transform.match(/translate\((.*?)px, (.*?)px\)/);
            const col = parseInt(transform[1]) / tileSize;
            const row = parseInt(transform[2]) / tileSize;
            moveTile(row, col);

            // Start the timer on the first move
            if (elapsedTime === 0) startTimer();
        }
    });

    shuffleButton.addEventListener("click", shuffleTiles);
    newGameButton.addEventListener("click", newGame);
    backgroundSelector.addEventListener("change", updateTileBackground);
});
