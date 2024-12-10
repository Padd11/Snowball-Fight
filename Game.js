const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = 800;
canvas.height = 400;

// Game objects
const player = { x: 50, y: 300, width: 50, height: 50, color: 'blue', health: 3 };
const enemy = { x: 700, y: 300, width: 50, height: 50, color: 'red', health: 3, cooldown: 0 };
const snowballs = [];
const enemySnowballs = [];
let isGameOver = false;

// Touch control states
const touchControls = { left: false, right: false, up: false, space: false };

// Create buttons for movement and shooting (for touch controls)
const buttons = {
  left: { x: 20, y: canvas.height - 100, width: 50, height: 50, color: 'gray' },
  right: { x: 100, y: canvas.height - 100, width: 50, height: 50, color: 'gray' },
  up: { x: 180, y: canvas.height - 100, width: 50, height: 50, color: 'gray' },
  shoot: { x: canvas.width - 80, y: canvas.height - 100, width: 60, height: 50, color: 'gray' }
};

// Listen for touch events
canvas.addEventListener('touchstart', (e) => {
  const touch = e.touches[0];
  if (isInside(touch, buttons.left)) touchControls.left = true;
  if (isInside(touch, buttons.right)) touchControls.right = true;
  if (isInside(touch, buttons.up)) touchControls.up = true;
  if (isInside(touch, buttons.shoot)) touchControls.space = true;
}, false);

canvas.addEventListener('touchend', (e) => {
  touchControls.left = false;
  touchControls.right = false;
  touchControls.up = false;
  touchControls.space = false;
}, false);

// Helper function to check if a touch is inside a button
function isInside(touch, button) {
  return (
    touch.clientX >= button.x &&
    touch.clientX <= button.x + button.width &&
    touch.clientY >= button.y &&
    touch.clientY <= button.y + button.height
  );
}

// Helper functions
function drawRect({ x, y, width, height, color }) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, width, height);
}

function drawText(text, x, y, color = 'black', size = '20px') {
  ctx.fillStyle = color;
  ctx.font = `${size} Arial`;
  ctx.fillText(text, x, y);
}

function spawnSnowball(x, y, speed, isEnemy = false) {
  const snowball = { x, y, radius: 10, speed, color: isEnemy ? 'red' : 'white' };
  if (isEnemy) enemySnowballs.push(snowball);
  else snowballs.push(snowball);
}

function detectCollision(rect, ball) {
  return (
    ball.x + ball.radius > rect.x &&
    ball.x - ball.radius < rect.x + rect.width &&
    ball.y + ball.radius > rect.y &&
    ball.y - ball.radius < rect.y + rect.height
  );
}

// Game loop
function gameLoop() {
  if (isGameOver) return;

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw player and enemy
  drawRect(player);
  drawRect(enemy);

  // Draw health
  drawText(`Player Health: ${player.health}`, 20, 30, 'blue');
  drawText(`Enemy Health: ${enemy.health}`, 600, 30, 'red');

  // Handle player movement
  if (touchControls.left && player.x > 0) player.x -= 5;
  if (touchControls.right && player.x + player.width < canvas.width) player.x += 5;
  if (touchControls.up && player.y > 0) player.y -= 5;

  // Handle shooting
  if (touchControls.space) {
    spawnSnowball(player.x + player.width, player.y + player.height / 2, 5);
    touchControls.space = false; // Prevent holding space to spam snowballs
  }

  // Move snowballs
  snowballs.forEach((snowball, index) => {
    snowball.x += snowball.speed;
    ctx.beginPath();
    ctx.arc(snowball.x, snowball.y, snowball.radius, 0, Math.PI * 2);
    ctx.fillStyle = snowball.color;
    ctx.fill();
    ctx.closePath();

    // Check collision with enemy
    if (detectCollision(enemy, snowball)) {
      snowballs.splice(index, 1);
      enemy.health -= 1;
    }

    // Remove off-screen snowballs
    if (snowball.x > canvas.width) snowballs.splice(index, 1);
  });

  // Enemy logic
  if (enemy.cooldown <= 0) {
    spawnSnowball(enemy.x, enemy.y + enemy.height / 2, -5, true);
    enemy.cooldown = 50; // Cooldown for enemy snowballs
  } else {
    enemy.cooldown--;
  }

  // Move enemy snowballs
  enemySnowballs.forEach((snowball, index) => {
    snowball.x += snowball.speed;
    ctx.beginPath();
    ctx.arc(snowball.x, snowball.y, snowball.radius, 0, Math.PI * 2);
    ctx.fillStyle = snowball.color;
    ctx.fill();
    ctx.closePath();

    // Check collision with player
    if (detectCollision(player, snowball)) {
      enemySnowballs.splice(index, 1);
      player.health -= 1;
    }

    // Remove off-screen snowballs
    if (snowball.x < 0) enemySnowballs.splice(index, 1);
  });

  // Check for game over
  if (player.health <= 0 || enemy.health <= 0) {
    isGameOver = true;
    drawText(player.health <= 0 ? 'You Lose!' : 'You Win!', canvas.width / 2 - 50, canvas.height / 2, 'black', '30px');
    return;
  }

  // Draw buttons for touch controls
  drawRect(buttons.left);
  drawRect(buttons.right);
  drawRect(buttons.up);
  drawRect(buttons.shoot);

  requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();
