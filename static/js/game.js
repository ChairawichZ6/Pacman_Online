const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
const socket = io.connect(`${protocol}://${document.domain}:${location.port}`);

const PACMAN_SIZE = 30;
const DOT_SIZE = 5;
const SPEED = 10;
const obstacles = [
    // Outer walls
    { x: 50, y: 50, width: 20, height: 400, color: 'red' },
    { x: 50, y: 50, width: 400, height: 20, color: 'red' },
    { x: 50, y: 450, width: 400, height: 20, color: 'red' },
    // Additional outer wall
    { x: 730, y: 100, width: 20, height: 300, color: 'red' },
    { x: 230, y: 150, width: 20, height: 500, color: 'red' },
    { x: 50, y: 100, width: 20, height: 320, color: 'red' },
    { x: 230, y: 350, width: 20, height: 500, color: 'red' },
    { x: 400, y: 200, width: 20, height: 250, color: 'red' },
    { x: 800, y: 600, width: 20, height: 600, color: 'red' },

// Add more obstacles here
];


let players = {};
let imageCache = {};
let dots = initializeDots();

function initializeDots() {
    const dotsArray = [];
    const dotRadius = DOT_SIZE / 2;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    const isValidDot = (x, y) => {
        // Check if the dot is inside the canvas boundaries
        if (x < dotRadius || x > canvasWidth - dotRadius || y < dotRadius || y > canvasHeight - dotRadius) {
            return false;
        }

        // Check if the dot is not too close to any obstacle
        for (const obstacle of obstacles) {
            if (
                x + dotRadius > obstacle.x &&
                x - dotRadius < obstacle.x + obstacle.width &&
                y + dotRadius > obstacle.y &&
                y - dotRadius < obstacle.y + obstacle.height
            ) {
                return false;
            }
        }

        return true;
    };

    while (dotsArray.length < 47) {
        const x = Math.random() * (canvasWidth - DOT_SIZE) + dotRadius;
        const y = Math.random() * (canvasHeight - DOT_SIZE) + dotRadius;

        if (isValidDot(x, y)) {
            dotsArray.push({ x, y });
        }
    }

    return dotsArray;
}

socket.on('game_created', handleGameCreated);
socket.on('update_game', (data) => (players = data.players));

document.addEventListener('keydown', handlePlayerMovement);
setInterval(updateGame, 500 / 60);

function handleGameCreated(data) {
    alert('Game created! Share this ID with your friend: ' + data.game_id);
    document.getElementById('lobby').style.display = 'none';
    document.getElementById('gameCanvas').style.display = 'block';
}

function createGame() {
    socket.emit('create_game');
}

function joinGame() {
    const gameId = document.getElementById('gameIdInput').value;
    socket.emit('join_game', { game_id: gameId });
}

function drawAllPacmans() {
    for (let id in players) {
        const p = players[id];
        drawPacmanImage(p);
        checkCollisionWithObstacles(p); // Check collision with obstacles
    }
    // Draw obstacles
    ctx.fillStyle = 'red'; // Default obstacle color
    obstacles.forEach((obstacle) => {
        ctx.fillStyle = obstacle.color || 'red'; // Use obstacle color if specified
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        ctx.fillStyle = 'red'; // Reset to default color
    });
}

function drawPacmanImage(p) {
    const imageUrl = p.imageUrl;

    if (!imageUrl) {
        // If imageUrl is not set, use a default image
        ctx.fillStyle = 'yellow'; // Default color
        ctx.beginPath();
        ctx.arc(p.x, p.y, PACMAN_SIZE, 0.2 * Math.PI, 1.8 * Math.PI);
        ctx.lineTo(p.x, p.y);
        ctx.closePath();
        ctx.fill();
    } else if (!imageCache[imageUrl]) {
        const playerImage = new Image();
        playerImage.src = imageUrl;
        playerImage.onload = function () {
            imageCache[imageUrl] = playerImage;
            ctx.drawImage(
                playerImage,
                p.x - PACMAN_SIZE,
                p.y - PACMAN_SIZE,
                PACMAN_SIZE * 2,
                PACMAN_SIZE * 2
            );
        };
    } else {
        ctx.drawImage(
            imageCache[imageUrl],
            p.x - PACMAN_SIZE,
            p.y - PACMAN_SIZE,
            PACMAN_SIZE * 2,
            PACMAN_SIZE * 2
        );
    }
}

function drawDots() {
    ctx.fillStyle = 'white';
    dots.forEach((dot) => {
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, DOT_SIZE, 0, Math.PI * 2);
        ctx.fill();
    });
}

function updateGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawDots();
    drawAllPacmans();
    
    // Check if all dots are collected
    if (dots.length === 0) {
        // Display the total dots collected and "Game Over" text
        ctx.font = '30px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 30);
        ctx.fillText(`Total Dots Collected: ${47}`, canvas.width / 2, canvas.height / 2 + 10);
    }
}

function handlePlayerMovement(e) {
    let player = players[socket.id] || {};
    player.prevX = player.x; // Store the previous X position
    player.prevY = player.y; // Store the previous Y position
    movePlayerBasedOnKey(e.key, player);

    for (let i = 0; i < dots.length; i++) {
        if (isPlayerCloseToDot(player, dots[i])) {
            dots.splice(i, 1);
            i--;
        }
    }

    const imageUrl = document.getElementById('pacmanImageUrl').value;
    socket.emit('player_move', { pacman: { ...player, imageUrl: imageUrl } });
}

function movePlayerBasedOnKey(key, player) {
    const movementMap = {
        ArrowRight: () => (player.x += SPEED),
        ArrowLeft: () => (player.x -= SPEED),
        ArrowUp: () => (player.y -= SPEED),
        ArrowDown: () => (player.y += SPEED),
    };
    const move = movementMap[key];
    if (move) move();
}

function isPlayerCloseToDot(player, dot) {
    const distance = Math.sqrt(
        (player.x - dot.x) ** 2 + (player.y - dot.y) ** 2
    );
    return distance < PACMAN_SIZE + DOT_SIZE;
}

function checkCollisionWithObstacles(player) {
    for (let i = 0; i < obstacles.length; i++) {
        const obstacle = obstacles[i];
        if (
            player.x - PACMAN_SIZE < obstacle.x + obstacle.width &&
            player.x + PACMAN_SIZE > obstacle.x &&
            player.y - PACMAN_SIZE < obstacle.y + obstacle.height &&
            player.y + PACMAN_SIZE > obstacle.y
        ) {
            // Collision detected, move the player back to their previous position
            player.x = player.prevX;
            player.y = player.prevY;
        }
    }
}
