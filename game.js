"use strict";
// 🚀 Space Adventure Game - TypeScript Version
// A fun game for a 9-year-old and their developer Dad!
class Player {
    constructor(x, y) {
        this.width = 40;
        this.height = 40;
        this.speed = 5;
        this.x = x;
        this.y = y;
    }
    update() {
        // Handle movement based on keyboard input
        if (keys.ArrowLeft && this.x > 0) {
            this.x -= this.speed;
        }
        if (keys.ArrowRight && this.x < canvas.width - this.width) {
            this.x += this.speed;
        }
        if (keys.ArrowUp && this.y > 0) {
            this.y -= this.speed;
        }
        if (keys.ArrowDown && this.y < canvas.height - this.height) {
            this.y += this.speed;
        }
    }
    draw(ctx) {
        // Draw a cool spaceship
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        // Ship body
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(-15, -10, 30, 20);
        // Ship nose
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.moveTo(0, -15);
        ctx.lineTo(-10, -10);
        ctx.lineTo(10, -10);
        ctx.closePath();
        ctx.fill();
        // Engine flames
        ctx.fillStyle = '#ff6600';
        ctx.fillRect(-8, 10, 6, 8);
        ctx.fillRect(2, 10, 6, 8);
        ctx.restore();
    }
}
class Enemy {
    constructor(x, y) {
        this.width = 30;
        this.height = 30;
        this.speed = 2;
        this.x = x;
        this.y = y;
        this.color = `hsl(${Math.random() * 360}, 70%, 50%)`;
    }
    update() {
        this.y += this.speed;
    }
    draw(ctx) {
        // Draw an alien enemy
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        // Alien body
        ctx.fillStyle = this.color;
        ctx.fillRect(-12, -8, 24, 16);
        // Alien eyes
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(-8, -6, 4, 4);
        ctx.fillRect(4, -6, 4, 4);
        // Alien antennae
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-6, -8);
        ctx.lineTo(-8, -15);
        ctx.moveTo(6, -8);
        ctx.lineTo(8, -15);
        ctx.stroke();
        ctx.restore();
    }
}
class Bullet {
    constructor(x, y) {
        this.width = 4;
        this.height = 10;
        this.speed = 8;
        this.x = x;
        this.y = y;
    }
    update() {
        this.y -= this.speed;
    }
    draw(ctx) {
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        // Add a glow effect
        ctx.shadowColor = '#ffff00';
        ctx.shadowBlur = 10;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.shadowBlur = 0;
    }
}
class Star {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.speed = Math.random() * 2 + 1;
        this.brightness = Math.random() * 0.8 + 0.2;
    }
    update() {
        this.y += this.speed;
        if (this.y > canvas.height) {
            this.y = 0;
            this.x = Math.random() * canvas.width;
        }
    }
    draw(ctx) {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.brightness})`;
        ctx.fillRect(this.x, this.y, 1, 1);
    }
}
// Game state
let canvas;
let ctx;
let player;
let enemies = [];
let bullets = [];
let stars = [];
let score = 0;
let gameRunning = true;
let lastEnemySpawn = 0;
let lastShot = 0;
// Keyboard input tracking
const keys = {};
function checkCollision(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
        obj1.x + obj1.width > obj2.x &&
        obj1.y < obj2.y + obj2.height &&
        obj1.y + obj1.height > obj2.y;
}
function spawnEnemy() {
    const x = Math.random() * (canvas.width - 30);
    enemies.push(new Enemy(x, -30));
}
function spawnStars() {
    for (let i = 0; i < 100; i++) {
        stars.push(new Star());
    }
}
function updateScore() {
    const scoreElement = document.getElementById('score');
    if (scoreElement) {
        scoreElement.textContent = score.toString();
    }
}
function gameOver() {
    gameRunning = false;
    const gameOverElement = document.getElementById('gameOver');
    if (gameOverElement) {
        gameOverElement.style.display = 'block';
    }
}
function restartGame() {
    gameRunning = true;
    score = 0;
    enemies = [];
    bullets = [];
    player = new Player(canvas.width / 2 - 20, canvas.height - 60);
    const gameOverElement = document.getElementById('gameOver');
    if (gameOverElement) {
        gameOverElement.style.display = 'none';
    }
    updateScore();
}
function gameLoop() {
    if (!gameRunning) {
        requestAnimationFrame(gameLoop);
        return;
    }
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Update and draw stars
    stars.forEach(star => {
        star.update();
        star.draw(ctx);
    });
    // Update player
    player.update();
    player.draw(ctx);
    // Spawn enemies
    const currentTime = Date.now();
    if (currentTime - lastEnemySpawn > 1000) {
        spawnEnemy();
        lastEnemySpawn = currentTime;
    }
    // Handle shooting
    if (keys[' '] && currentTime - lastShot > 200) {
        bullets.push(new Bullet(player.x + player.width / 2 - 2, player.y));
        lastShot = currentTime;
    }
    // Update enemies
    enemies.forEach((enemy, enemyIndex) => {
        enemy.update();
        enemy.draw(ctx);
        // Check collision with player
        if (checkCollision(player, enemy)) {
            gameOver();
            return;
        }
        // Remove enemies that are off-screen
        if (enemy.y > canvas.height) {
            enemies.splice(enemyIndex, 1);
        }
    });
    // Update bullets
    bullets.forEach((bullet, bulletIndex) => {
        bullet.update();
        bullet.draw(ctx);
        // Check collision with enemies
        enemies.forEach((enemy, enemyIndex) => {
            if (checkCollision(bullet, enemy)) {
                bullets.splice(bulletIndex, 1);
                enemies.splice(enemyIndex, 1);
                score += 10;
                updateScore();
            }
        });
        // Remove bullets that are off-screen
        if (bullet.y < 0) {
            bullets.splice(bulletIndex, 1);
        }
    });
    requestAnimationFrame(gameLoop);
}
// Initialize game
function initGame() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    player = new Player(canvas.width / 2 - 20, canvas.height - 60);
    spawnStars();
    // Keyboard event listeners
    document.addEventListener('keydown', (e) => {
        keys[e.key] = true;
        if (e.key === 'r' || e.key === 'R') {
            restartGame();
        }
    });
    document.addEventListener('keyup', (e) => {
        keys[e.key] = false;
    });
    updateScore();
    gameLoop();
}
// Start the game when the page loads
document.addEventListener('DOMContentLoaded', initGame);
