document.addEventListener("DOMContentLoaded", () => {
    const puzzleContainer = document.getElementById("puzzle-container");
    const shuffleButton = document.getElementById("shuffle-button");
    const newGameButton = document.getElementById("new-game-button");
    const backgroundSelector = document.getElementById("background-selector");
    const gridSizeSelector = document.getElementById("grid-size-selector");
    const timerElement = document.getElementById("timer");
    const backgroundMusic = document.getElementById("game-music"); // Reference to the audio element
    const tileSize = 100;
    let gridSize = 4;
    let tiles = [];
    let blankPosition = { x: gridSize - 1, y: gridSize - 1 };
    let timerInterval = null;
    let elapsedTime = 0;
    let gameInitialized = false; // Flag to track game initialization
    let moveCounter = 0;

    // Play music button
    const playMusicButton = document.createElement("button");
    playMusicButton.textContent = "Play Music";
    document.body.appendChild(playMusicButton);

    // Initialize music settings
    backgroundMusic.loop = true; // Ensure music loops
    backgroundMusic.volume = 0.5; // Set default volume

    // Autoplay (may fail due to restrictions)
    backgroundMusic.play().catch(() => {
        console.log("Autoplay blocked. Waiting for user interaction.");
    });

    // Play/Pause toggle
    playMusicButton.addEventListener("click", () => {
        if (backgroundMusic.paused) {
            backgroundMusic.play().catch((error) => {
                console.error("Error playing music:", error);
            });
            playMusicButton.textContent = "Pause Music";
        } else {
            backgroundMusic.pause();
            playMusicButton.textContent = "Play Music";
        }
    });

    const moveCounterDisplay = document.createElement("div");
    moveCounterDisplay.id = "move-counter";
    moveCounterDisplay.style.marginTop = "10px";
    moveCounterDisplay.textContent = `Moves Made: ${moveCounter}`;
    document.body.insertBefore(moveCounterDisplay, puzzleContainer.nextSibling);

    function updateMoveCounter() {
        moveCounterDisplay.textContent = `Moves Made: ${moveCounter}`;
    }

    function resetMoveCounter() {
        moveCounter = 0;
        updateMoveCounter();
    }

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

    function createTiles() {
        puzzleContainer.innerHTML = "";
        tiles = [];
        for (let row = 0; row < gridSize; row++) {
            tiles[row] = [];
            for (let col = 0; col < gridSize; col++) {
                if (row === gridSize - 1 && col === gridSize - 1) {
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
        blankPosition = { x: gridSize - 1, y: gridSize - 1 };
        updateHoverEffects();
        updateTileBackground();
    }

    function updateTilePosition(tile, x, y) {
        tile.style.transform = `translate(${x * tileSize}px, ${y * tileSize}px)`;
    }

    function updateTileBackground() {
        const selectedBackground = backgroundSelector.value;
        tiles.flat().forEach((tile) => {
            if (tile) {
                tile.style.backgroundImage = `url(${selectedBackground})`;
            }
        });
        resetMoveCounter();
    }

    function isMovable(row, col) {
        return row === blankPosition.y || col === blankPosition.x;
    }

    function moveTile(row, col) {
        if (isMovable(row, col)) {
            if (row === blankPosition.y) {
                const direction = col > blankPosition.x ? 1 : -1;
                for (let c = blankPosition.x; c !== col; c += direction) {
                    const tile = tiles[row][c + direction];
                    tiles[row][c] = tile;
                    updateTilePosition(tile, c, row);
                }
                tiles[row][col] = null;
            } else if (col === blankPosition.x) {
                const direction = row > blankPosition.y ? 1 : -1;
                for (let r = blankPosition.y; r !== row; r += direction) {
                    const tile = tiles[r + direction][col];
                    tiles[r][col] = tile;
                    updateTilePosition(tile, col, r);
                }
                tiles[row][col] = null;
            }

            blankPosition = { x: col, y: row };
            updateHoverEffects();

            moveCounter++;
            updateMoveCounter();

            if (gameInitialized && isPuzzleComplete()) {
                setTimeout(() => {
                    showPopup(elapsedTime);
                }, 100);
                stopTimer();
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
        resetMoveCounter();
        startTimer();
        gameInitialized = true;
    }

    function startTimer() {
        if (timerInterval) clearInterval(timerInterval);
        elapsedTime = 0;
        timerElement.textContent = elapsedTime;
        timerInterval = setInterval(() => {
            elapsedTime++;
            timerElement.textContent = elapsedTime;
        }, 1000);
    }

    function stopTimer() {
        clearInterval(timerInterval);
    }

    function resetTimer() {
        clearInterval(timerInterval);
        elapsedTime = 0;
        timerElement.textContent = elapsedTime;
    }

    function resetGame() {
        gameInitialized = false;
        createTiles();
        resetTimer();
        resetMoveCounter();
        updateHoverEffects();
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
    }

    function newGame() {
        resetGame();
        startTimer();
    }

    function changeGridSize() {
        gridSize = parseInt(gridSizeSelector.value);
        resetGame();
    }

    createTiles();
    updateHoverEffects();
    shuffleTiles();

    puzzleContainer.addEventListener("click", (event) => {
        if (event.target.classList.contains("tile")) {
            const transform = event.target.style.transform.match(/translate\((.*?)px, (.*?)px\)/);
            const col = parseInt(transform[1]) / tileSize;
            const row = parseInt(transform[2]) / tileSize;
            moveTile(row, col);

            if (elapsedTime === 0) startTimer();
        }
    });

    shuffleButton.addEventListener("click", shuffleTiles);
    newGameButton.addEventListener("click", newGame);
    backgroundSelector.addEventListener("change", updateTileBackground);
    gridSizeSelector.addEventListener("change", changeGridSize);
});
