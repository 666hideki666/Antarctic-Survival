const player = document.getElementById('player');
const gameContainer = document.getElementById('game-container');
const scoreDisplay = document.getElementById('score');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScore = document.getElementById('final-score');
const startScreen = document.getElementById('start-screen');
const startButton = document.getElementById('start-button');
const gameMusic = document.getElementById('game-music');
const sparkleSound = document.getElementById('sparkle-sound'); // 追加
const scoreList = document.getElementById('score-list');

let score = 0;
let gameOver = true;
let obstacleGenerationInterval;
let sideObstacleGenerationInterval;
let pointItemGenerationInterval;
let currentObstacleSpeed = 5;
let obstaclesPerGeneration = 1;
let sideObstacleIntervalTime = 3000;
const collisionPadding = 15;
let lastSpeedUpScore = 0;

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
    
    document.querySelectorAll('.obstacle').forEach(obstacle => obstacle.remove());
    document.querySelectorAll('.side-obstacle').forEach(obstacle => obstacle.remove());
    document.querySelectorAll('.point-item').forEach(item => item.remove());

    currentObstacleSpeed = 5;
    obstaclesPerGeneration = 1;
    sideObstacleIntervalTime = 3000;
    lastSpeedUpScore = 0;

    if (obstacleGenerationInterval) {
        clearInterval(obstacleGenerationInterval);
    }
    obstacleGenerationInterval = setInterval(createObstacle, 1000);

    if (sideObstacleGenerationInterval) {
        clearInterval(sideObstacleGenerationInterval);
    }
    sideObstacleGenerationInterval = setInterval(createSideObstacle, sideObstacleIntervalTime);

    if (pointItemGenerationInterval) {
        clearInterval(pointItemGenerationInterval);
    }
    pointItemGenerationInterval = setInterval(createPointItem, 5000);

    gameMusic.play().then(() => {
        console.log("音楽が再生されました。");
    }).catch(error => {
        console.error("音楽の再生に失敗しました: ", error);
        console.log("ブラウザの自動再生ポリシーにより、音楽の再生がブロックされた可能性があります。ユーザーの操作後に再生を試みてください。");
    });
});

document.addEventListener('mousemove', (e) => {
    if (!gameOver) {
        const gameRect = gameContainer.getBoundingClientRect();
        const playerRect = player.getBoundingClientRect();
        let newLeft = e.clientX - gameRect.left - playerRect.width / 2;

        const leftBoundary = 20;
        if (newLeft < leftBoundary) {
            newLeft = leftBoundary;
        }

        if (newLeft > gameRect.width - playerRect.width) {
            newLeft = gameRect.width - playerRect.width;
        }

        player.style.left = `${newLeft}px`;
    }
});

function checkDifficultyIncrease() {
    while (score >= lastSpeedUpScore + 300) {
        currentObstacleSpeed += 1;
        lastSpeedUpScore += 300;
        console.log(`障害物の落下速度が ${currentObstacleSpeed}px に増加しました。 (現在のスコア: ${score})`);
    }
}

function createObstacle() {
    if (!gameOver) {
        obstaclesPerGeneration = 1 + Math.floor(score / 100);
        if (obstaclesPerGeneration > 15) obstaclesPerGeneration = 15;

        for (let i = 0; i < obstaclesPerGeneration; i++) {
            const obstacle = document.createElement('div');
            obstacle.classList.add('obstacle');
            const obstacleType = Math.floor(Math.random() * 4);
            obstacle.style.backgroundImage = `url('images/obstacles/obstacle${obstacleType}.png')`;
            obstacle.style.left = `${Math.random() * (gameContainer.offsetWidth - 50)}px`;
            obstacle.style.top = `${-50 - (i * 100)}px`;
            gameContainer.appendChild(obstacle);

            let obstacleInterval = setInterval(() => {
                if (!gameOver) {
                    const obstacleRect = obstacle.getBoundingClientRect();
                    const playerRect = player.getBoundingClientRect();

                    const playerLeft = playerRect.left + collisionPadding;
                    const playerRight = playerRect.right - collisionPadding;
                    const playerTop = playerRect.top + collisionPadding;
                    const playerBottom = playerRect.bottom - collisionPadding;

                    const obstacleLeft = obstacleRect.left + collisionPadding;
                    const obstacleRight = obstacleRect.right - collisionPadding;
                    const obstacleTop = obstacleRect.top + collisionPadding;
                    const obstacleBottom = obstacleRect.bottom - collisionPadding;

                    if (obstacleRect.top > gameContainer.offsetHeight) {
                        obstacle.remove();
                        clearInterval(obstacleInterval);
                        score += 10;
                        scoreDisplay.textContent = `Score: ${score}`;
                        checkDifficultyIncrease();

                    } else {
                        obstacle.style.top = `${obstacleRect.top + currentObstacleSpeed}px`;
                    }

                    if (
                        playerLeft < obstacleRight &&
                        playerRight > obstacleLeft &&
                        playerTop < obstacleBottom &&
                        playerBottom > obstacleTop
                    ) {
                        endGame();
                    }
                }
            }, 20);
        }
    }
}

function createSideObstacle() {
    if (!gameOver) {
        const sideObstacle = document.createElement('div');
        sideObstacle.classList.add('side-obstacle');
        sideObstacle.style.backgroundImage = `url('images/side_obstacles/side_obstacle0.png')`;

        const fromLeft = Math.random() < 0.5;
        if (fromLeft) {
            sideObstacle.style.left = `0px`;
        } else {
            sideObstacle.style.left = `${gameContainer.offsetWidth - 80}px`;
        }
        sideObstacle.style.top = `-80px`;
        gameContainer.appendChild(sideObstacle);

        let sideObstacleInterval = setInterval(() => {
            if (!gameOver) {
                const sideObstacleRect = sideObstacle.getBoundingClientRect();
                const playerRect = player.getBoundingClientRect();

                const playerLeft = playerRect.left + collisionPadding;
                const playerRight = playerRect.right - collisionPadding;
                const playerTop = playerRect.top + collisionPadding;
                const playerBottom = playerRect.bottom - collisionPadding;

                const obstacleLeft = sideObstacleRect.left + collisionPadding;
                const obstacleRight = sideObstacleRect.right - collisionPadding;
                const obstacleTop = sideObstacleRect.top + collisionPadding;
                const obstacleBottom = sideObstacleRect.bottom - collisionPadding;

                if (sideObstacleRect.top > gameContainer.offsetHeight) {
                    sideObstacle.remove();
                    clearInterval(sideObstacleInterval);
                } else {
                    sideObstacle.style.top = `${sideObstacleRect.top + currentObstacleSpeed}px`;
                }

                if (
                    playerLeft < obstacleRight &&
                    playerRight > obstacleLeft &&
                    playerTop < obstacleBottom &&
                    playerBottom > obstacleTop
                ) {
                    endGame();
                }
            }
        }, 20);
    }
}

function createPointItem() {
    if (!gameOver) {
        const pointItem = document.createElement('div');
        pointItem.classList.add('point-item');
        pointItem.style.backgroundImage = `url('images/items/point_item.png')`;
        pointItem.style.left = `${Math.random() * (gameContainer.offsetWidth - 40)}px`;
        pointItem.style.top = `-40px`;
        gameContainer.appendChild(pointItem);

        let pointItemInterval = setInterval(() => {
            if (!gameOver) {
                const pointItemRect = pointItem.getBoundingClientRect();
                const playerRect = player.getBoundingClientRect();

                const playerLeft = playerRect.left + collisionPadding;
                const playerRight = playerRect.right - collisionPadding;
                const playerTop = playerRect.top + collisionPadding;
                const playerBottom = playerRect.bottom - collisionPadding;

                const itemLeft = pointItemRect.left + collisionPadding;
                const itemRight = pointItemRect.right - collisionPadding;
                const itemTop = pointItemRect.top + collisionPadding;
                const itemBottom = pointItemRect.bottom - collisionPadding;

                if (pointItemRect.top > gameContainer.offsetHeight) {
                    pointItem.remove();
                    clearInterval(pointItemInterval);
                } else {
                    pointItem.style.top = `${pointItemRect.top + currentObstacleSpeed}px`;
                }

                if (
                    playerLeft < itemRight &&
                    playerRight > itemLeft &&
                    playerTop < itemBottom &&
                    playerBottom > itemTop
                ) {
                    pointItem.remove();
                    clearInterval(pointItemInterval);
                    score = Math.floor(score * 1.2);
                    scoreDisplay.textContent = `Score: ${score}`;
                    checkDifficultyIncrease();
                    sparkleSound.currentTime = 0; // 効果音を最初から再生
                    sparkleSound.play(); // 効果音再生
                }
            }
        }, 20);
    }
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
    clearInterval(obstacleGenerationInterval);
    clearInterval(sideObstacleGenerationInterval);
    clearInterval(pointItemGenerationInterval);
    document.querySelectorAll('.obstacle').forEach(obstacle => obstacle.remove());
    document.querySelectorAll('.side-obstacle').forEach(obstacle => obstacle.remove());
    document.querySelectorAll('.point-item').forEach(item => item.remove());

    finalScore.textContent = score;
    saveScore(score);
    displayRanking();

    gameOverScreen.classList.remove('hidden');
    startScreen.style.display = 'block';

    gameMusic.pause();
    gameMusic.currentTime = 0;

    player.style.transition = 'background-color 0.2s ease-in-out';
    let blinkCount = 0;
    const blinkInterval = setInterval(() => {
        if (blinkCount % 2 === 0) {
            player.style.backgroundColor = 'red';
        } else {
            player.style.backgroundColor = 'transparent';
        }
        blinkCount++;
        if (blinkCount === 6) {
            clearInterval(blinkInterval);
            player.style.backgroundColor = 'transparent';
            player.style.transition = '';
        }
    }, 200);
}