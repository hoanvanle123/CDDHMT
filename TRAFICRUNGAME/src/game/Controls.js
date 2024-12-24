export function setupControls(gameState, startGame, reset) {
    const accelerateButton = document.getElementById("accelerate");
    const decelerateButton = document.getElementById("decelerate");

    // Button controls
    accelerateButton.addEventListener("mousedown", () => {
        startGame();
        gameState.accelerate = true;
    });

    decelerateButton.addEventListener("mousedown", () => {
        startGame();
        gameState.decelerate = true;
    });

    accelerateButton.addEventListener("mouseup", () => {
        gameState.accelerate = false;
    });

    decelerateButton.addEventListener("mouseup", () => {
        gameState.decelerate = false;
    });

    // Keyboard controls
    window.addEventListener("keydown", (event) => {
        if (event.key === "ArrowUp") {
            startGame();
            gameState.accelerate = true;
            return;
        }
        if (event.key === "ArrowDown") {
            gameState.decelerate = true;
            return;
        }
        if (event.key === "R" || event.key === "r") {
            reset();
            return;
        }
    });

    window.addEventListener("keyup", (event) => {
        if (event.key === "ArrowUp") {
            gameState.accelerate = false;
            return;
        }
        if (event.key === "ArrowDown") {
            gameState.decelerate = false;
            return;
        }
    });
}