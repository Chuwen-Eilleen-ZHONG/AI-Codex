const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const speedEl = document.getElementById("speed");
const statusEl = document.getElementById("status");

const laneCount = 3;
const laneWidth = canvas.width / laneCount;
const playerY = canvas.height - 95;
const playerSize = 34;

let gameRunning = false;
let gameOver = false;
let score = 0;
let lane = 1;
let speed = 3;
let obstacleTimer = 0;
let animationId = null;

const obstacles = [];

function resetGame() {
  gameRunning = true;
  gameOver = false;
  score = 0;
  lane = 1;
  speed = 3;
  obstacleTimer = 0;
  obstacles.length = 0;
  setStatus("奔跑中");
}

function laneCenter(laneIndex) {
  return laneIndex * laneWidth + laneWidth / 2;
}

function spawnObstacle() {
  const obstacleLane = Math.floor(Math.random() * laneCount);
  obstacles.push({
    lane: obstacleLane,
    y: -60,
    size: 36,
  });
}

function update() {
  if (!gameRunning) return;

  score += 1;
  speed = 3 + Math.min(6, score / 350);

  obstacleTimer += 1;
  const spawnInterval = Math.max(28, 70 - Math.floor(score / 80));
  if (obstacleTimer >= spawnInterval) {
    obstacleTimer = 0;
    spawnObstacle();
  }

  for (let i = obstacles.length - 1; i >= 0; i -= 1) {
    const obs = obstacles[i];
    obs.y += speed;

    if (obs.y > canvas.height + 80) {
      obstacles.splice(i, 1);
      continue;
    }

    const playerX = laneCenter(lane);
    const obsX = laneCenter(obs.lane);
    const collidesX = Math.abs(playerX - obsX) < (playerSize + obs.size) * 0.42;
    const collidesY = Math.abs(playerY - obs.y) < (playerSize + obs.size) * 0.5;

    if (collidesX && collidesY) {
      gameRunning = false;
      gameOver = true;
      setStatus("失败（空格重开）");
    }
  }

  scoreEl.textContent = String(score);
  speedEl.textContent = `${(speed / 3).toFixed(1)}x`;
}

function drawTrack() {
  const topWidth = canvas.width * 0.28;
  const bottomWidth = canvas.width * 0.95;
  const centerX = canvas.width / 2;

  const leftTop = centerX - topWidth / 2;
  const rightTop = centerX + topWidth / 2;
  const leftBottom = centerX - bottomWidth / 2;
  const rightBottom = centerX + bottomWidth / 2;

  ctx.fillStyle = "#3f4f5a";
  ctx.beginPath();
  ctx.moveTo(leftTop, 0);
  ctx.lineTo(rightTop, 0);
  ctx.lineTo(rightBottom, canvas.height);
  ctx.lineTo(leftBottom, canvas.height);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
  ctx.lineWidth = 2;
  for (let i = 1; i < laneCount; i += 1) {
    const t = i / laneCount;
    const xTop = leftTop + (rightTop - leftTop) * t;
    const xBottom = leftBottom + (rightBottom - leftBottom) * t;
    ctx.beginPath();
    ctx.moveTo(xTop, 0);
    ctx.lineTo(xBottom, canvas.height);
    ctx.stroke();
  }
}

function drawPlayer() {
  const x = laneCenter(lane);
  ctx.fillStyle = "#3bffcb";
  ctx.beginPath();
  ctx.roundRect(x - playerSize / 2, playerY - playerSize / 2, playerSize, playerSize, 8);
  ctx.fill();

  ctx.fillStyle = "#0b1f2b";
  ctx.fillRect(x - 8, playerY - 8, 5, 5);
  ctx.fillRect(x + 3, playerY - 8, 5, 5);
}

function drawObstacles() {
  ctx.fillStyle = "#ff5757";
  obstacles.forEach((obs) => {
    const x = laneCenter(obs.lane);
    ctx.beginPath();
    ctx.roundRect(x - obs.size / 2, obs.y - obs.size / 2, obs.size, obs.size, 6);
    ctx.fill();
  });
}

function drawOverlay() {
  if (gameRunning) return;

  ctx.fillStyle = "rgba(0, 0, 0, 0.48)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.font = "bold 34px sans-serif";
  ctx.fillText(gameOver ? "游戏结束" : "准备开跑", canvas.width / 2, canvas.height / 2 - 20);

  ctx.font = "20px sans-serif";
  ctx.fillText("按空格开始", canvas.width / 2, canvas.height / 2 + 22);
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawTrack();
  drawObstacles();
  drawPlayer();
  drawOverlay();
}

function loop() {
  update();
  render();
  animationId = requestAnimationFrame(loop);
}

function setStatus(text) {
  statusEl.textContent = text;
}

document.addEventListener("keydown", (event) => {
  if (event.code === "ArrowLeft" && gameRunning) {
    lane = Math.max(0, lane - 1);
  }

  if (event.code === "ArrowRight" && gameRunning) {
    lane = Math.min(laneCount - 1, lane + 1);
  }

  if (event.code === "Space") {
    event.preventDefault();
    if (!gameRunning) {
      resetGame();
    }
  }
});

setStatus("待开始");
render();
loop();

window.addEventListener("beforeunload", () => {
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
});
