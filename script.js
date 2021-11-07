const cnvsLow = document.getElementById('layer1');

const ctxLow = cnvsLow.getContext('2d');

const cnvsUp = document.getElementById('layer2');

const ctxUp = cnvsUp.getContext('2d');

const platformWidth = 15;
const platformHeight = 120;

const hitSound = new Audio('sounds/hitSound.mp3');
const userGoalSound = new Audio('sounds/userGoalSound.mp3');
const aiGoalSound = new Audio('sounds/aiGoalSound.mp3');
const wallHitSound = new Audio('sounds/wallHitSound.mp3');

const player = {
    x: 10,
    y: cnvsLow.height / 2 - platformHeight / 2,
    width: platformWidth,
    height: platformHeight,
    score: 0,
}

const ai = {
    x: cnvsLow.width - (platformWidth + 10),
    y: cnvsLow.height / 2 - platformHeight / 2,
    width: platformWidth,
    height: platformHeight,
    score: 0,
}

const ball = {
    x: cnvsLow.width / 2,
    y: cnvsLow.height / 2,
    radius: 12,
    speed: 7,
    velocityX: 5,
    velocityY: 5,
}

function getMousePos(evt) {
    let rect = cnvsLow.getBoundingClientRect();
    if (player.y <= 0 && ((evt.clientY - rect.top) <= player.height / 2)) {
        player.y = 0;
    } else if (player.y >= cnvsLow.height - player.height && ((evt.clientY - rect.top) >= cnvsLow.height - player.height / 2)) {
        player.y = cnvsLow.height - player.height;
    } else {
        player.y = evt.clientY - rect.top - player.height / 2;
    }
}

let upArrowPressedByPlayer = false;
let downArrowPressedByPlayer = false;

// Включение клавиш "W", "S"
function keyDownHandler(event) {
    console.log(event.keyCode);
    switch (event.keyCode) {
        case 87:
            upArrowPressedByPlayer = true;
        case 83:
            downArrowPressedByPlayer = true;
    }
}

// Отключение клавиш "W", "S"
function keyUpHandler(event) {
    switch (event.keyCode) {
        case 87:
            upArrowPressedByPlayer = false;
        case 83:
            downArrowPressedByPlayer = false;
    }
}

function drawField() {
    ctxLow.strokeStyle = '#fff';

    // Горизонтальная линия, проходящая через середину поля
    ctxLow.lineWidth = 3;
    ctxLow.moveTo(0, cnvsLow.height / 2);
    ctxLow.lineTo(cnvsLow.width, cnvsLow.height / 2);
    ctxLow.stroke();

    // Вертикальная линия "сетка"
    ctxLow.lineWidth = 2;
    ctxLow.moveTo(cnvsLow.width / 2, 0);
    ctxLow.lineTo(cnvsLow.width / 2, cnvsLow.height);
    ctxLow.setLineDash([10, 8])
    ctxLow.stroke();
    ctxLow.setLineDash([]);

    // Надписи на поле "Игрок 1", "Игрок 2"
    ctxLow.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctxLow.font = '100px fantasy';
    ctxLow.fillText('ИГРОК', cnvsLow.width / 8, cnvsLow.height / 2.5);
    ctxLow.fillText('1', cnvsLow.width / 4.4, cnvsLow.height - cnvsLow.height / 2.5 + 80);
    ctxLow.fillText('ИГРОК', cnvsLow.width / 1.6, cnvsLow.height / 2.5);
    ctxLow.fillText('2', cnvsLow.width / 1.38, (cnvsLow.height / 3) * 2.2);
}

// Отрисовка платформ
function drawPlatform(x, y, width, height, color) {
    ctxUp.fillStyle = color;
    ctxUp.fillRect(x, y, width, height);
}

// Отрисовка игрового счета
function drawScore(x, y, score) {
    ctxUp.fillStyle = '#fff';
    ctxUp.font = '80px fantasy';
    ctxUp.fillText(score, x, y);
}

// Отрисовка мяча
function drawBall(x, y, radius, color) {
    ctxUp.fillStyle = color;
    ctxUp.beginPath();
    ctxUp.arc(x, y, radius, 0, Math.PI * 2); // π * 2 радиан = 360 градусов
    ctxUp.closePath();
    ctxUp.fill();
}

// Определение позиции курсора мыши
function getMousePos(evt) {
    let rect = cnvsLow.getBoundingClientRect();
    if (player.y <= 0 && ((evt.clientY - rect.top) <= player.height / 2)) {
        player.y = 0;
    } else if (player.y >= cnvsLow.height - player.height && ((evt.clientY - rect.top) >= cnvsLow.height - player.height / 2)) {
        player.y = cnvsLow.height - player.height;
    } else player.y = evt.clientY - rect.top - player.height / 2;
}

// Возврат игровых объектов в начальные положения
function reset(scored) {
    ball.x = cnvsLow.width / 2;
    ball.y = cnvsLow.height / 2;
    player.y = cnvsLow.height / 2 - platformHeight / 2;
    player.y = cnvsLow.height / 2 - platformHeight / 2;
    if (scored) {
        ball.velocityX = -5;
        ball.velocityY = -5;
    } else {
        ball.velocityX = 5;
        ball.velocityY = 5;
    }
    ball.speed = 7;
}

// Проверка столкновения мяча с игроками
function collisionDetect(curPlayer, ball) {
    curPlayer.top = curPlayer.y;
    curPlayer.right = curPlayer.x + curPlayer.width;
    curPlayer.bottom = curPlayer.y + curPlayer.height;
    curPlayer.left = curPlayer.x;

    ball.top = ball.y - ball.radius;
    ball.right = ball.x + ball.radius;
    ball.bottom = ball.y + ball.radius;
    ball.left = ball.x - ball.radius;

    return ball.left < curPlayer.right && ball.top < curPlayer.bottom && ball.right > curPlayer.left && ball.bottom > curPlayer.top;
}

// Изменение игрового процесса
function update() {
    if (upArrowPressedByPlayer && player.y > 0) {
        player.y -= 12;
    } else if (downArrowPressedByPlayer && (player.y < cnvsLow.height - player.height)) {
        player.y += 12;
    }

    let playerScore = false;
    if (ball.x - ball.radius < 0) {
        aiGoalSound.play();
        ai.score++;
        reset(playerScore);
    } else if (ball.x > cnvsLow.width) {
        userGoalSound.play();
        player.score++;
        playerScore = true;
        reset(playerScore);
    }

    if (ball.y + ball.radius >= cnvsLow.height || ball.y - ball.radius <= 0) {
        wallHitSound.play();
        ball.velocityY = -ball.velocityY;
    }

    ball.x += ball.velocityX;
    ball.y += ball.velocityY;

    ai.y += ((ball.y - (ai.y + ai.height / 2))) * 0.1;

    let curPlayer = (ball.x < cnvsLow.width / 2) ? player : ai;

    if (collisionDetect(curPlayer, ball)) {
        hitSound.play();
        let collidePoint = (ball.y - (curPlayer.y + curPlayer.height / 2));

        collidePoint = collidePoint / (curPlayer.height / 2);

        let angleRad = (Math.PI / 4) * collidePoint;

        let direction = (ball.x + ball.radius < cnvsLow.width / 2) ? 1 : -1;
        ball.velocityX = direction * ball.speed * Math.cos(angleRad);
        ball.velocityY = ball.speed * Math.sin(angleRad);

        ball.speed += 0.3;
    }
}

// Очистка движения и отрисовка всех игровых объектов
function render() {
    ctxUp.clearRect(0, 0, cnvsLow.width, cnvsLow.height);

    drawScore(cnvsLow.width / 4 - 15, cnvsLow.height / 6, player.score);

    drawScore(3 * cnvsLow.width / 4 - 15, cnvsLow.height / 6, ai.score);

    drawPlatform(player.x, player.y, player.width, player.height);

    drawPlatform(ai.x, ai.y, ai.width, ai.height);

    drawBall(ball.x, ball.y, ball.radius);
}

function loop() {
    update();
    render();
    requestAnimationFrame(loop);
}

addEventListener('mousemove', getMousePos);
addEventListener('keydown', keyDownHandler);
addEventListener('keyup', keyUpHandler);

drawField();

loop();