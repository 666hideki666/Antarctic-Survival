const player = document.getElementById('player');
const gameContainer = document.getElementById('game-container');
const scoreDisplay = document.getElementById('score');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScore = document.getElementById('final-score');
const startScreen = document.getElementById('start-screen');
const startButton = document.getElementById('start-button');
const gameMusic = document.getElementById('game-music');
const sparkleSound = document.getElementById('sparkle-sound');
const scoreList = document.getElementById('score-list');

let score = 0;
let gameOver = true;
let currentObstacleSpeed = 5;
let obstaclesPerGeneration = 1;
let sideObstacleIntervalTime = 3000;
const collisionPadding = 15;
let lastSpeedUpScore = 0;
let lastObstacleTime = 0;
let lastSideObstacleTime = 0;
let lastPointItemTime = 0;

player.style.display = 'none';
scoreDisplay.style.display = 'none';

startButton.addEventListener('click', () => {
    startScreen.style.display = 'none';
    player.style.display = 'block';
    scoreDisplay.style.display = 'block';
    gameOver = false;
    score = 0;
    scoreDisplay.textContent = `Score: ${score}`;
    gameOverScreen.classList.add('hidden');

    document.querySelectorAll('.obstacle, .side-obstacle, .point-item').forEach(el => el.remove());

    currentObstacleSpeed = 5;
    obstaclesPerGeneration = 1;
    sideObstacleIntervalTime = 3000;
    lastSpeedUpScore = 0;
    lastObstacleTime = 0;
    lastSideObstacleTime = 0;
    lastPointItemTime = 0;

    gameMusic.play().catch(e => console.error("Music play failed:", e));
    gameLoop();
});

document.addEventListener('mousemove', (e) => {
    if (!gameOver) {
        const gameRect = gameContainer.getBoundingClientRect();
        const playerRect = player.getBoundingClientRect();
        let newLeft = e.clientX - gameRect.left - playerRect.width / 2;
        const leftBoundary = 20;
        newLeft = Math.max(leftBoundary, Math.min(newLeft, gameRect.width - playerRect.width));
        player.style.left = `${newLeft}px`;
    }
});

function checkDifficultyIncrease() {
    while (score >= lastSpeedUpScore + 300) {
        currentObstacleSpeed += 1;
        lastSpeedUpScore += 300;
        console.log(`Obstacle speed increased to ${currentObstacleSpeed}`);
    }
}

function createObstacle() {
    obstaclesPerGeneration = 1 + Math.floor(score / 100);
    if (obstaclesPerGeneration > 15) obstaclesPerGeneration = 15;

    for (let i = 0; i < obstaclesPerGeneration; i++) {
        const obstacle = document.createElement('div');
        obstacle.classList.add('obstacle');
        const obstacleType = Math.floor(Math.random() * 5);
        obstacle.style.backgroundImage = `url('images/obstacles/obstacle${obstacleType}.png')`;
        obstacle.style.left = `${Math.random() * (gameContainer.offsetWidth - 50)}px`;
        obstacle.style.top = `${-50 - (i * 100)}px`;
        gameContainer.appendChild(obstacle);
    }
}

function createSideObstacle() {
    const sideObstacle = document.createElement('div');
    sideObstacle.classList.add('side-obstacle');
    sideObstacle.style.backgroundImage = `url('images/side_obstacles/side_obstacle0.png')`;
    const fromLeft = Math.random() < 0.5;
    sideObstacle.style.left = fromLeft ? `0px` : `${gameContainer.offsetWidth - 80}px`;
    sideObstacle.style.top = `-80px`;
    gameContainer.appendChild(sideObstacle);
}

function createPointItem() {
    const pointItem = document.createElement('div');
    pointItem.classList.add('point-item');
    pointItem.style.backgroundImage = `url('images/items/point_item.png')`;
    pointItem.style.left = `${Math.random() * (gameContainer.offsetWidth - 40)}px`;
    pointItem.style.top = `-40px`;
    gameContainer.appendChild(pointItem);
}

function checkCollision(element1, element2) {
    const rect1 = element1.getBoundingClientRect();
    const rect2 = element2.getBoundingClientRect();

    const verticalOverlap = rect1.top + collisionPadding < rect2.bottom - collisionPadding && rect1.bottom - collisionPadding > rect2.top + collisionPadding;
    const horizontalOverlap = rect1.left + collisionPadding < rect2.right - collisionPadding && rect1.right - collisionPadding > rect2.left + collisionPadding;

    return verticalOverlap && horizontalOverlap;
}


function updateGameObjects() {
    document.querySelectorAll('.obstacle, .side-obstacle, .point-item').forEach(item => {
        const itemTop = parseFloat(item.style.top);
        if (itemTop > gameContainer.offsetHeight) {
            item.remove();
            if (item.classList.contains('obstacle')) {
                score += 10;
                scoreDisplay.textContent = `Score: ${score}`;
                checkDifficultyIncrease();
            }
        } else {
            item.style.top = `${itemTop + currentObstacleSpeed}px`;
        }

        if (checkCollision(player, item)) {
            if (item.classList.contains('point-item')) {
                item.remove();
                score = Math.floor(score * 1.2);
                scoreDisplay.textContent = `Score: ${score}`;
                checkDifficultyIncrease();
                sparkleSound.currentTime = 0;
                sparkleSound.play();
            } else {
                endGame();
            }
        }
    });
}

function gameLoop(timestamp) {
    if (gameOver) return;

    if (timestamp - lastObstacleTime > 1000) {
        lastObstacleTime = timestamp;
        createObstacle();
    }
    if (timestamp - lastSideObstacleTime > sideObstacleIntervalTime) {
        lastSideObstacleTime = timestamp;
        createSideObstacle();
    }
    if (timestamp - lastPointItemTime > 5000) {
        lastPointItemTime = timestamp;
        createPointItem();
    }

    updateGameObjects();

    requestAnimationFrame(gameLoop);
}

function saveScore(newScore) {
    let scores = JSON.parse(localStorage.getItem('penguinGameScores') || '[]');
    scores.push(newScore);
    scores.sort((a, b) => b - a);
    scores = scores.slice(0, 5);
    localStorage.setItem('penguinGameScores', JSON.stringify(scores));
}

function displayRanking() {
    let scores = JSON.parse(localStorage.getItem('penguinGameScores') || '[]');
    scoreList.innerHTML = '';
    scores.forEach((s, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = `${index + 1}. ${s} points`;
        scoreList.appendChild(listItem);
    });
}

function endGame() {
    gameOver = true;
    gameMusic.pause();
    gameMusic.currentTime = 0;

    finalScore.textContent = score;
    saveScore(score);
    displayRanking();

    gameOverScreen.classList.remove('hidden');
    startScreen.style.display = 'block';

    let blinkCount = 0;
    const blinkInterval = setInterval(() => {
        player.style.visibility = (blinkCount % 2 === 0) ? 'hidden' : 'visible';
        blinkCount++;
        if (blinkCount === 6) {
            clearInterval(blinkInterval);
            player.style.visibility = 'visible';
        }
    }, 200);
}