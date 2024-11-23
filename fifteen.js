document.addEventListener("DOMContentLoaded", () => {
    const puzzleContainer = document.getElementById("puzzle-container");
    const shuffleButton = document.getElementById("shuffle-button");
    const gridSize = 4;
    const tileSize = 100;
    let tiles = [];
    let blankPosition = { x: 3, y: 3 }; 

    function createTiles() {
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
    }

    function updateTilePosition(tile, x, y) {
        tile.style.transform = `translate(${x * tileSize}px, ${y * tileSize}px)`;
    }

    function isMovable(row, col) {
        const dx = Math.abs(blankPosition.x - col);
        const dy = Math.abs(blankPosition.y - row);
        return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
    }

    function moveTile(row, col) {
        if (isMovable(row, col)) {
            const tile = tiles[row][col];

            tiles[blankPosition.y][blankPosition.x] = tile;
            tiles[row][col] = null;

            updateTilePosition(tile, blankPosition.x, blankPosition.y);

            blankPosition = { x: col, y: row };

            updateHoverEffects();
        }
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
    }

    createTiles();
    updateHoverEffects();

    puzzleContainer.addEventListener("click", (event) => {
        if (event.target.classList.contains("tile")) {
            const transform = event.target.style.transform.match(/translate\((.*?)px, (.*?)px\)/);
            const col = parseInt(transform[1]) / tileSize;
            const row = parseInt(transform[2]) / tileSize;
            moveTile(row, col);
        }
    });

    shuffleButton.addEventListener("click", shuffleTiles);
});
