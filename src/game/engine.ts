import { GAME_SETTINGS, getPhysics, type Difficulty } from "./settings";

interface Pipe {
  x: number;
  topHeight: number;
  scored: boolean;
  coinCollected: boolean;
  hasCoin: boolean;
}

interface GameState {
  birdY: number;
  birdVelocity: number;
  birdRotation: number;
  pipes: Pipe[];
  score: number;
  coins: number;
  gameOver: boolean;
  started: boolean;
  countdown: number;
  frameCount: number;
  lastPipeSpawn: number;
  groundOffset: number;
}

export type GameEventType = "score" | "coin" | "death" | "start";

export class FlapEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private state: GameState;
  private difficulty: Difficulty;
  private animationId: number | null = null;
  private lastTime: number = 0;
  private onEvent: (type: GameEventType, data?: Record<string, unknown>) => void;

  constructor(
    canvas: HTMLCanvasElement,
    difficulty: Difficulty,
    onEvent: (type: GameEventType, data?: Record<string, unknown>) => void
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.difficulty = difficulty;
    this.onEvent = onEvent;

    // Set canvas size
    this.canvas.width = GAME_SETTINGS.CANVAS.WIDTH;
    this.canvas.height = GAME_SETTINGS.CANVAS.HEIGHT;

    this.state = this.initialState();
  }

  private initialState(): GameState {
    return {
      birdY: GAME_SETTINGS.CANVAS.HEIGHT / 2,
      birdVelocity: 0,
      birdRotation: 0,
      pipes: [],
      score: 0,
      coins: 0,
      gameOver: false,
      started: false,
      countdown: GAME_SETTINGS.GAMEPLAY.COUNTDOWN,
      frameCount: 0,
      lastPipeSpawn: 0,
      groundOffset: 0,
    };
  }

  start() {
    this.state = this.initialState();
    this.state.started = true;
    this.onEvent("start");
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  flap() {
    if (this.state.gameOver) return;
    if (!this.state.started) {
      this.start();
      return;
    }
    const physics = getPhysics(this.difficulty);
    this.state.birdVelocity = physics.jumpForce;
  }

  restart() {
    this.stop();
    this.state = this.initialState();
    this.drawFrame();
  }

  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  getScore() {
    return this.state.score;
  }

  getCoins() {
    return this.state.coins;
  }

  isGameOver() {
    return this.state.gameOver;
  }

  private loop(time: number) {
    const dt = Math.min((time - this.lastTime) / 16.667, 2); // Normalize to ~60fps
    this.lastTime = time;

    this.update(dt);
    this.drawFrame();

    if (!this.state.gameOver) {
      this.animationId = requestAnimationFrame((t) => this.loop(t));
    }
  }

  private update(dt: number) {
    if (this.state.gameOver || !this.state.started) return;

    const physics = getPhysics(this.difficulty);
    const s = this.state;
    const gs = GAME_SETTINGS;

    s.frameCount++;

    // Gravity
    s.birdVelocity += physics.gravity * dt;
    s.birdVelocity = Math.min(s.birdVelocity, gs.PHYSICS.MAX_FALL_SPEED);
    s.birdY += s.birdVelocity * dt;

    // Bird rotation based on velocity
    s.birdRotation = Math.min(Math.max(s.birdVelocity * 3, -30), 90);

    // Ground scroll
    s.groundOffset = (s.groundOffset + physics.pipeSpeed * dt) % 24;

    // Spawn pipes
    const now = performance.now();
    if (now - s.lastPipeSpawn > physics.spawnInterval || s.pipes.length === 0) {
      this.spawnPipe();
      s.lastPipeSpawn = now;
    }

    // Move pipes
    for (const pipe of s.pipes) {
      pipe.x -= physics.pipeSpeed * dt;
    }

    // Remove off-screen pipes
    s.pipes = s.pipes.filter((p) => p.x + gs.PIPES.WIDTH > -10);

    // Collision detection
    const birdX = gs.BIRD.START_X;
    const birdSize = gs.BIRD.SIZE;
    const groundY = gs.CANVAS.HEIGHT - gs.GROUND.HEIGHT;

    // Ground/ceiling collision
    if (s.birdY + birdSize > groundY || s.birdY - birdSize < 0) {
      this.die();
      return;
    }

    // Pipe collision
    for (const pipe of s.pipes) {
      const buffer = gs.GAMEPLAY.COLLISION_BUFFER;
      const inPipeX = birdX + birdSize > pipe.x + buffer && birdX - birdSize < pipe.x + gs.PIPES.WIDTH - buffer;

      if (inPipeX) {
        const gapTop = pipe.topHeight;
        const gapBottom = pipe.topHeight + physics.pipeGap;

        if (s.birdY - birdSize < gapTop + buffer || s.birdY + birdSize > gapBottom - buffer) {
          this.die();
          return;
        }
      }

      // Score when passing pipe
      if (!pipe.scored && pipe.x + gs.PIPES.WIDTH < birdX) {
        pipe.scored = true;
        s.score += physics.pointsPerPipe;
        this.onEvent("score", { score: s.score });
      }

      // Coin collection
      if (pipe.hasCoin && !pipe.coinCollected && inPipeX) {
        const coinY = pipe.topHeight + physics.pipeGap / 2;
        const dist = Math.abs(s.birdY - coinY);
        if (dist < birdSize + gs.COINS.SIZE) {
          pipe.coinCollected = true;
          s.coins++;
          s.score += gs.COINS.POINTS;
          this.onEvent("coin", { coins: s.coins, score: s.score });
        }
      }
    }
  }

  private spawnPipe() {
    const gs = GAME_SETTINGS;
    const physics = getPhysics(this.difficulty);
    const minTop = gs.PIPES.MIN_HEIGHT;
    const maxTop = gs.CANVAS.HEIGHT - gs.GROUND.HEIGHT - physics.pipeGap - gs.PIPES.MIN_HEIGHT;
    const topHeight = minTop + Math.random() * (maxTop - minTop);

    this.state.pipes.push({
      x: gs.CANVAS.WIDTH + 10,
      topHeight,
      scored: false,
      coinCollected: false,
      hasCoin: Math.random() < gs.COINS.SPAWN_CHANCE,
    });
  }

  private die() {
    this.state.gameOver = true;
    this.onEvent("death", { score: this.state.score, coins: this.state.coins });
  }

  drawFrame() {
    const ctx = this.ctx;
    const gs = GAME_SETTINGS;
    const s = this.state;
    const physics = getPhysics(this.difficulty);
    const W = gs.CANVAS.WIDTH;
    const H = gs.CANVAS.HEIGHT;
    const groundY = H - gs.GROUND.HEIGHT;

    // Sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
    skyGrad.addColorStop(0, "#4FC3F7");
    skyGrad.addColorStop(0.5, "#81D4FA");
    skyGrad.addColorStop(1, "#B3E5FC");
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, groundY);

    // Clouds
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    this.drawCloud(ctx, 60, 50, 40);
    this.drawCloud(ctx, 200, 80, 30);
    this.drawCloud(ctx, 320, 40, 35);
    this.drawCloud(ctx, 150, 130, 25);

    // Pipes
    for (const pipe of s.pipes) {
      // Top pipe
      ctx.fillStyle = gs.PIPES.COLOR;
      ctx.fillRect(pipe.x, 0, gs.PIPES.WIDTH, pipe.topHeight);
      // Top pipe cap
      ctx.fillStyle = gs.PIPES.CAP_COLOR;
      ctx.fillRect(pipe.x - 3, pipe.topHeight - 20, gs.PIPES.WIDTH + 6, 20);

      // Bottom pipe
      const bottomY = pipe.topHeight + physics.pipeGap;
      ctx.fillStyle = gs.PIPES.COLOR;
      ctx.fillRect(pipe.x, bottomY, gs.PIPES.WIDTH, groundY - bottomY);
      // Bottom pipe cap
      ctx.fillStyle = gs.PIPES.CAP_COLOR;
      ctx.fillRect(pipe.x - 3, bottomY, gs.PIPES.WIDTH + 6, 20);

      // Pipe highlights
      ctx.fillStyle = "rgba(255,255,255,0.1)";
      ctx.fillRect(pipe.x + 4, 0, 8, pipe.topHeight);
      ctx.fillRect(pipe.x + 4, bottomY, 8, groundY - bottomY);

      // Coin
      if (pipe.hasCoin && !pipe.coinCollected) {
        const coinX = pipe.x + gs.PIPES.WIDTH / 2;
        const coinY = pipe.topHeight + physics.pipeGap / 2;
        const pulse = 1 + Math.sin(s.frameCount * 0.1) * 0.15;

        ctx.save();
        ctx.translate(coinX, coinY);
        ctx.scale(pulse, pulse);

        // Coin glow
        ctx.beginPath();
        ctx.arc(0, 0, gs.COINS.SIZE + 4, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 215, 0, 0.2)";
        ctx.fill();

        // Coin body
        ctx.beginPath();
        ctx.arc(0, 0, gs.COINS.SIZE, 0, Math.PI * 2);
        ctx.fillStyle = gs.COINS.COLOR;
        ctx.fill();
        ctx.strokeStyle = "#DAA520";
        ctx.lineWidth = 2;
        ctx.stroke();

        // $ symbol
        ctx.fillStyle = "#8B6914";
        ctx.font = "bold 12px Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("$", 0, 0);

        ctx.restore();
      }
    }

    // Ground
    ctx.fillStyle = gs.GROUND.GRASS_COLOR;
    ctx.fillRect(0, groundY, W, gs.GROUND.GRASS_HEIGHT);
    ctx.fillStyle = gs.GROUND.COLOR;
    ctx.fillRect(0, groundY + gs.GROUND.GRASS_HEIGHT, W, gs.GROUND.HEIGHT - gs.GROUND.GRASS_HEIGHT);

    // Ground texture
    ctx.fillStyle = "rgba(0,0,0,0.05)";
    for (let x = -s.groundOffset; x < W; x += 24) {
      ctx.fillRect(x, groundY + gs.GROUND.GRASS_HEIGHT, 12, 2);
    }

    // Bird
    ctx.save();
    ctx.translate(gs.BIRD.START_X, s.birdY);
    ctx.rotate((s.birdRotation * Math.PI) / 180);

    // Bird body
    ctx.beginPath();
    ctx.arc(0, 0, gs.BIRD.SIZE, 0, Math.PI * 2);
    ctx.fillStyle = gs.BIRD.COLOR;
    ctx.fill();
    ctx.strokeStyle = "#E5A100";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Wing
    const wingAngle = Math.sin(s.frameCount * 0.3) * 15;
    ctx.save();
    ctx.rotate((wingAngle * Math.PI) / 180);
    ctx.beginPath();
    ctx.ellipse(-6, 2, 10, 5, -0.3, 0, Math.PI * 2);
    ctx.fillStyle = "#FFC400";
    ctx.fill();
    ctx.restore();

    // Eye
    ctx.beginPath();
    ctx.arc(6, -4, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(7.5, -4, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = "#011821";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(8, -4.5, 1, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();

    // Beak
    ctx.beginPath();
    ctx.moveTo(12, -1);
    ctx.lineTo(20, 2);
    ctx.lineTo(12, 5);
    ctx.closePath();
    ctx.fillStyle = "#ec652b";
    ctx.fill();

    ctx.restore();

    // Score
    ctx.fillStyle = "white";
    ctx.font = "600 48px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.strokeStyle = "rgba(0,0,0,0.2)";
    ctx.lineWidth = 3;
    ctx.strokeText(String(s.score), W / 2, 60);
    ctx.fillText(String(s.score), W / 2, 60);

    // Coins counter (top-right)
    if (s.coins > 0) {
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.font = "500 16px Inter, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(`💰 ${s.coins}`, W - 16, 30);
    }

    // "Tap to start" message
    if (!s.started) {
      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.font = "500 18px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Tap to start", W / 2, H / 2 + 60);
    }

    // Game over overlay
    if (s.gameOver) {
      ctx.fillStyle = "rgba(1, 24, 33, 0.6)";
      ctx.fillRect(0, 0, W, H);

      ctx.fillStyle = "white";
      ctx.font = "600 36px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Game Over", W / 2, H / 2 - 40);

      ctx.font = "400 18px Inter, sans-serif";
      ctx.fillText(`Score: ${s.score}`, W / 2, H / 2 + 10);
      ctx.fillText(`Coins: ${s.coins}`, W / 2, H / 2 + 40);

      ctx.font = "500 14px Inter, sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.fillText("Tap to continue", W / 2, H / 2 + 80);
    }
  }

  private drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
    ctx.beginPath();
    ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
    ctx.arc(x + size * 0.4, y - size * 0.15, size * 0.35, 0, Math.PI * 2);
    ctx.arc(x + size * 0.7, y, size * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }
}
