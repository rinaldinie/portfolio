const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const gameOverElement = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');

// Impostazioni del gioco
const gridSize = 20;
const tileCountX = Math.floor(canvas.width / gridSize);
const tileCountY = Math.floor(canvas.height / gridSize);

let snake = [
    { x: 10, y: 10 }
];
let food = {};
let obstacles = [];
let dx = 0;
let dy = 0;
let score = 0;
let gameRunning = true;

// Colore uniforme per il serpente
const snakeColor = '#4ECDC4';

// Tipi di frutta con emoji e colori
const fruits = [
    { emoji: '🍎', color: '#FF6B6B', name: 'mela' },
    { emoji: '🍊', color: '#FF9F43', name: 'arancia' },
    { emoji: '🍌', color: '#FECA57', name: 'banana' },
    { emoji: '🍇', color: '#9B59B6', name: 'uva' },
    { emoji: '🍓', color: '#E74C3C', name: 'fragola' },
    { emoji: '🥝', color: '#27AE60', name: 'kiwi' }
];

function getRandomColor(colors) {
    return colors[Math.floor(Math.random() * colors.length)];
}

function randomTilePosition() {
    return {
        x: Math.floor(Math.random() * tileCountX),
        y: Math.floor(Math.random() * tileCountY)
    };
}

function createFood() {
    const fruit = fruits[Math.floor(Math.random() * fruits.length)];
    const pos = randomTilePosition();
    food = {
        x: pos.x,
        y: pos.y,
        emoji: fruit.emoji,
        color: fruit.color,
        name: fruit.name
    };

    // Assicurati che il cibo non spawni sul serpente o sugli ostacoli
    for (let segment of snake) {
        if (segment.x === food.x && segment.y === food.y) {
            createFood();
            return;
        }
    }

    for (let obstacle of obstacles) {
        if (obstacle.x === food.x && obstacle.y === food.y) {
            createFood();
            return;
        }
    }
}

function createObstacles() {
    obstacles = [];
    const numObstacles = Math.floor(Math.random() * 3) + 2; // 2-4 ostacoli

    for (let i = 0; i < numObstacles; i++) {
        let obstacle;
        let attempts = 0;

        do {
            const pos = randomTilePosition();
            obstacle = {
                x: pos.x,
                y: pos.y
            };
            attempts++;
        } while (attempts < 50 && (
            // Non vicino al serpente iniziale
            (Math.abs(obstacle.x - 10) < 3 && Math.abs(obstacle.y - 10) < 3) ||
            // Non sovrapposto ad altri ostacoli
            obstacles.some(obs => obs.x === obstacle.x && obs.y === obstacle.y)
        ));

        if (attempts < 50) {
            obstacles.push(obstacle);
        }
    }
}

function addDynamicObstacle() {
    let obstacle;
    let attempts = 0;

    do {
        const pos = randomTilePosition();
        obstacle = {
            x: pos.x,
            y: pos.y
        };
        attempts++;
    } while (attempts < 100 && (
        // Non sul serpente
        snake.some(segment => segment.x === obstacle.x && segment.y === obstacle.y) ||
        // Non sul cibo
        (obstacle.x === food.x && obstacle.y === food.y) ||
        // Non su altri ostacoli
        obstacles.some(obs => obs.x === obstacle.x && obs.y === obstacle.y) ||
        // Non troppo vicino alla testa del serpente
        (Math.abs(obstacle.x - snake[0].x) < 2 && Math.abs(obstacle.y - snake[0].y) < 2)
    ));

    if (attempts < 100) {
        obstacles.push(obstacle);
    }
}

function drawGame() {
    // Pulisci il canvas
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Disegna gli ostacoli
    obstacles.forEach(obstacle => {
        // Ostacolo principale (roccia)
        ctx.fillStyle = '#34495e';
        ctx.fillRect(obstacle.x * gridSize + 1, obstacle.y * gridSize + 1, gridSize - 2, gridSize - 2);

        // Effetto 3D per l'ostacolo
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(obstacle.x * gridSize + 1, obstacle.y * gridSize + 1, gridSize - 2, 3);
        ctx.fillRect(obstacle.x * gridSize + 1, obstacle.y * gridSize + 1, 3, gridSize - 2);

        // Texture dell'ostacolo
        ctx.fillStyle = '#7f8c8d';
        ctx.fillRect(obstacle.x * gridSize + 4, obstacle.y * gridSize + 4, 3, 3);
        ctx.fillRect(obstacle.x * gridSize + 10, obstacle.y * gridSize + 8, 2, 2);
        ctx.fillRect(obstacle.x * gridSize + 7, obstacle.y * gridSize + 12, 4, 2);
    });

    // Disegna il serpente con colore uniforme
    snake.forEach((segment, index) => {
        // Corpo del serpente
        ctx.fillStyle = snakeColor;
        ctx.fillRect(segment.x * gridSize + 2, segment.y * gridSize + 2, gridSize - 4, gridSize - 4);

        // Effetto lucido
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(segment.x * gridSize + 4, segment.y * gridSize + 4, gridSize - 8, 4);

        // Testa del serpente
        if (index === 0) {
            ctx.fillStyle = '#2c3e50';
            ctx.beginPath();
            ctx.arc(segment.x * gridSize + gridSize / 2 - 3, segment.y * gridSize + 6, 2, 0, 2 * Math.PI);
            ctx.arc(segment.x * gridSize + gridSize / 2 + 3, segment.y * gridSize + 6, 2, 0, 2 * Math.PI);
            ctx.fill();
        }
    });

    // Disegna la frutta
    const pulseSize = Math.sin(Date.now() * 0.005) * 1;

    // Sfondo colorato per la frutta
    ctx.fillStyle = food.color;
    ctx.beginPath();
    ctx.arc(
        food.x * gridSize + gridSize / 2,
        food.y * gridSize + gridSize / 2,
        (gridSize / 2 - 3) + pulseSize,
        0,
        2 * Math.PI
    );
    ctx.fill();

    // Disegna l'emoji della frutta
    ctx.font = `${gridSize - 4}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
        food.emoji,
        food.x * gridSize + gridSize / 2,
        food.y * gridSize + gridSize / 2
    );
}

function moveSnake() {
    if (!gameRunning || (dx === 0 && dy === 0)) return;

    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    // Controlla le collisioni con i bordi
if (head.x < 0 || head.x >= tileCountX || head.y < 0 || head.y >= tileCountY) {
        gameOver();
        return;
    }

    // Controlla le collisioni con se stesso
    for (let segment of snake) {
        if (head.x === segment.x && head.y === segment.y) {
            gameOver();
            return;
        }
    }

    // Controlla le collisioni con gli ostacoli
    for (let obstacle of obstacles) {
        if (head.x === obstacle.x && head.y === obstacle.y) {
            gameOver();
            return;
        }
    }

    snake.unshift(head);

    // Controlla se ha mangiato il cibo
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = score;

        // Aggiungi ostacoli dinamici ogni 50 punti
        if (score % 50 === 0 && score > 0) {
            addDynamicObstacle();
        }

        createFood();
    } else {
        snake.pop();
    }
}

function gameOver() {
    gameRunning = false;
    finalScoreElement.textContent = score;
    gameOverElement.style.display = 'block';
}

function restartGame() {
    snake = [{ x: 10, y: 10 }];
    dx = 0;
    dy = 0;
    score = 0;
    gameRunning = true;
    scoreElement.textContent = score;
    gameOverElement.style.display = 'none';
    createObstacles();
    createFood();
}

function changeDirection(event) {
    if (!gameRunning) return;

    const W_KEY = 87;  // W
    const A_KEY = 65;  // A
    const S_KEY = 83;  // S
    const D_KEY = 68;  // D

    const keyPressed = event.keyCode;
    const goingUp = dy === -1;
    const goingDown = dy === 1;
    const goingRight = dx === 1;
    const goingLeft = dx === -1;

    if (keyPressed === A_KEY && !goingRight) {  // A - sinistra
        dx = -1;
        dy = 0;
    }
    if (keyPressed === W_KEY && !goingDown) {   // W - su
        dx = 0;
        dy = -1;
    }
    if (keyPressed === D_KEY && !goingLeft) {   // D - destra
        dx = 1;
        dy = 0;
    }
    if (keyPressed === S_KEY && !goingUp) {     // S - giù
        dx = 0;
        dy = 1;
    }
}

// Event listeners
document.addEventListener('keydown', changeDirection);

// Inizializza il gioco
createObstacles();
createFood();

// Game loop
function gameLoop() {
    moveSnake();
    drawGame();
}

// Avvia il gioco
setInterval(gameLoop, 150);