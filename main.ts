const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
const scoreDisplay = document.getElementById("scoreDisplay") as HTMLElement;

const CANVAS_WIDTH: number = 500;
const CANVAS_HEIGHT: number = 400;
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

// Posisi dan ukuran keranjang (posisi awal X = 200, Y = 330)
let basketX: number = 200;
let basketY: number = 330;
const basketWidth: number = 90;
const basketHeight: number = 35;
const basketSpeed: number = 16;

// Posisi dan ukuran buah (posisi awal X = 230, Y = 80)
let fruitX: number = 230;
let fruitY: number = 80;
const fruitRadius: number = 15;
let fruitSpeedY: number = 2.6;

let score: number = 0;

// Efek teks "+1" saat buah berhasil ditangkap
let popupText: string = "";
let popupX: number = 0;
let popupY: number = 0;
let popupAlpha: number = 0;

function drawBackground(): void {
  // Langit gradasi lembut
  const skyGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  skyGrad.addColorStop(0, "#e0f7fa");
  skyGrad.addColorStop(0.75, "#f1f8e9");
  skyGrad.addColorStop(1, "#c8e6c9");
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Awan dekoratif
  ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
  ctx.beginPath();
  ctx.arc(95, 65, 20, 0, Math.PI * 2);
  ctx.arc(115, 60, 25, 0, Math.PI * 2);
  ctx.arc(138, 66, 18, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(385, 52, 18, 0, Math.PI * 2);
  ctx.arc(405, 48, 22, 0, Math.PI * 2);
  ctx.arc(424, 54, 16, 0, Math.PI * 2);
  ctx.fill();

  // Rumput di bagian bawah canvas
  ctx.fillStyle = "#81c784";
  ctx.fillRect(0, CANVAS_HEIGHT - 22, CANVAS_WIDTH, 22);
  ctx.fillStyle = "#66bb6a";
  ctx.fillRect(0, CANVAS_HEIGHT - 22, CANVAS_WIDTH, 4);
}

function drawBasket(): void {
  // Bayangan keranjang
  ctx.fillStyle = "rgba(15, 23, 42, 0.14)";
  ctx.beginPath();
  ctx.ellipse(
    basketX + basketWidth / 2,
    basketY + basketHeight + 6,
    basketWidth * 0.45,
    6,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Badan keranjang
  const basketGrad = ctx.createLinearGradient(basketX, basketY, basketX, basketY + basketHeight);
  basketGrad.addColorStop(0, "#b4692c");
  basketGrad.addColorStop(1, "#7c3f12");
  ctx.fillStyle = basketGrad;
  ctx.beginPath();
  ctx.roundRect(basketX, basketY, basketWidth, basketHeight, [4, 4, 14, 14]);
  ctx.fill();

  // Garis anyaman pada keranjang
  ctx.strokeStyle = "rgba(255, 237, 213, 0.35)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(basketX + 6, basketY + 14);
  ctx.lineTo(basketX + basketWidth - 6, basketY + 14);
  ctx.moveTo(basketX + 10, basketY + 24);
  ctx.lineTo(basketX + basketWidth - 10, basketY + 24);
  ctx.stroke();

  // Bibir atas keranjang
  ctx.fillStyle = "#d97706";
  ctx.beginPath();
  ctx.roundRect(basketX - 4, basketY - 3, basketWidth + 8, 8, 4);
  ctx.fill();
}

function drawFruit(): void {
  // Badan apel merah dengan gradasi
  const appleGrad = ctx.createRadialGradient(
    fruitX - 5,
    fruitY - 5,
    3,
    fruitX,
    fruitY,
    fruitRadius
  );
  appleGrad.addColorStop(0, "#ff6b6b");
  appleGrad.addColorStop(0.7, "#e11d48");
  appleGrad.addColorStop(1, "#9f1239");

  ctx.beginPath();
  ctx.arc(fruitX, fruitY, fruitRadius, 0, Math.PI * 2);
  ctx.fillStyle = appleGrad;
  ctx.fill();
  ctx.closePath();

  // Kilau kecil pada buah
  ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
  ctx.beginPath();
  ctx.ellipse(fruitX - 5, fruitY - 5, 3.5, 6, -0.5, 0, Math.PI * 2);
  ctx.fill();

  // Tangkai buah
  ctx.beginPath();
  ctx.moveTo(fruitX, fruitY - fruitRadius + 1);
  ctx.quadraticCurveTo(fruitX + 2, fruitY - fruitRadius - 8, fruitX + 6, fruitY - fruitRadius - 9);
  ctx.strokeStyle = "#5c3615";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.stroke();

  // Daun hijau kecil
  ctx.fillStyle = "#22c55e";
  ctx.beginPath();
  ctx.ellipse(fruitX - 5, fruitY - fruitRadius - 5, 6, 3, -0.4, 0, Math.PI * 2);
  ctx.fill();
}

function drawPopup(): void {
  if (popupAlpha > 0) {
    ctx.save();
    ctx.globalAlpha = popupAlpha;
    ctx.font = "bold 18px 'Segoe UI', sans-serif";
    ctx.fillStyle = "#15803d";
    ctx.textAlign = "center";
    ctx.fillText(popupText, popupX, popupY);
    ctx.restore();

    popupY -= 1;
    popupAlpha -= 0.025;
  }
}

function syncScoreUI(): void {
  scoreDisplay.textContent = String(score);
}

function resetFruit(): void {
  fruitY = 24;
  const minX: number = fruitRadius + 14;
  const maxX: number = CANVAS_WIDTH - fruitRadius - 14;
  fruitX = Math.floor(Math.random() * (maxX - minX + 1)) + minX;
}

function update(): void {
  fruitY += fruitSpeedY;

  const hitHorizontal: boolean =
    fruitX + fruitRadius >= basketX && fruitX - fruitRadius <= basketX + basketWidth;
  const hitVertical: boolean =
    fruitY + fruitRadius >= basketY && fruitY - fruitRadius <= basketY + basketHeight;

  if (hitHorizontal && hitVertical) {
    score += 1;
    syncScoreUI();
    popupText = "+1";
    popupX = fruitX;
    popupY = basketY - 10;
    popupAlpha = 1;
    resetFruit();
  } else if (fruitY - fruitRadius > CANVAS_HEIGHT) {
    resetFruit();
  }
}

function render(): void {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  drawBackground();
  drawFruit();
  drawBasket();
  drawPopup();
}

function gameLoop(): void {
  update();
  render();
  requestAnimationFrame(gameLoop);
}

window.addEventListener("keydown", (event: KeyboardEvent) => {
  if (event.key === "ArrowLeft") {
    basketX -= basketSpeed;
    if (basketX < 0) {
      basketX = 0;
    }
  } else if (event.key === "ArrowRight") {
    basketX += basketSpeed;
    if (basketX + basketWidth > CANVAS_WIDTH) {
      basketX = CANVAS_WIDTH - basketWidth;
    }
  }
});

syncScoreUI();
gameLoop();