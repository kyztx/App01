import { Game } from './Game.js';
import { Input } from './Input.js';

window.addEventListener('load', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    
    // Set internal canvas resolution to match our 800x600 CSS size
    // For crisp pixel art, keeping a fixed internal resolution is best.
    canvas.width = 800;
    canvas.height = 600;

    // UI Elements
    const startScreen = document.getElementById('startScreen');
    const gameOverScreen = document.getElementById('gameOverScreen');
    const startButton = document.getElementById('startButton');
    const restartButton = document.getElementById('restartButton');

    // Initialize systems
    const input = new Input();
    let game = null;

    // Game loop timing
    let lastTime = 0;

    function animate(timeStamp) {
        if (!game) return;
        
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;

        // Clear canvas with a solid background each frame
        ctx.fillStyle = '#050510';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        game.update(deltaTime);
        game.draw(ctx);

        if (!game.isGameOver) {
            requestAnimationFrame(animate);
        } else {
            showGameOver();
        }
    }

    function startGame() {
        startScreen.classList.add('hidden');
        gameOverScreen.classList.add('hidden');
        
        game = new Game(canvas.width, canvas.height, input);
        lastTime = performance.now();
        requestAnimationFrame(animate);
    }

    function showGameOver() {
        gameOverScreen.classList.remove('hidden');
        document.getElementById('finalScore').innerText = game.score;
    }

    // Event Listeners
    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', startGame);
});
