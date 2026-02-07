/**
 * Main Game Scene - PixiJS 2D Template
 * 
 * 基础模板：玩家移动 + 简单地图 + 收集品 + 粒子特效 + 音效
 */

import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { Engine, GameScene } from '../engine/Engine';
import { World, Entity } from '../engine/World';
import { getAudioSystem, AudioSystem } from '../audio/AudioSystem';

// 格子大小
const CELL_SIZE = 32;

// 颜色
const COLORS = {
  floor: 0x1a1a2e,
  wall: 0x4a4a6a,
  player: 0x00ff87,
  enemy: 0xff6b6b,
  item: 0xffd700,
  particle: 0x00ffff,
};

// 收集品
interface Collectible {
  id: string;
  x: number;
  y: number;
  graphics: Graphics;
}

// 粒子
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: number;
  size: number;
  graphics: Graphics;
}

export class MainScene implements GameScene {
  public world: World;
  
  private engine: Engine;
  private container: Container;
  private mapContainer: Container;
  private entityContainer: Container;
  private particleContainer: Container;
  private uiContainer: Container;
  
  // Map data
  private mapWidth: number = 15;
  private mapHeight: number = 11;
  private grid: number[][] = [];
  
  // Player
  private player: Entity | null = null;
  private playerGraphics: Graphics | null = null;
  private playerTargetX: number = 0;
  private playerTargetY: number = 0;
  private playerDisplayX: number = 0;
  private playerDisplayY: number = 0;
  
  // Collectibles
  private collectibles: Collectible[] = [];
  private score: number = 0;
  
  // Particles
  private particles: Particle[] = [];
  
  // Camera
  private cameraX: number = 0;
  private cameraY: number = 0;
  
  // Animation
  private animPhase: number = 0;
  
  // Audio
  private audio: AudioSystem;
  private audioInitialized: boolean = false;
  
  constructor(engine: Engine) {
    this.audio = getAudioSystem();
    this.engine = engine;
    this.world = new World();
    
    // Create containers
    this.container = new Container();
    this.mapContainer = new Container();
    this.entityContainer = new Container();
    this.particleContainer = new Container();
    this.uiContainer = new Container();
    
    this.container.addChild(this.mapContainer);
    this.container.addChild(this.entityContainer);
    this.container.addChild(this.particleContainer);
    
    engine.app.stage.addChild(this.container);
    engine.app.stage.addChild(this.uiContainer);
  }
  
  init(): void {
    // Initialize audio (preload)
    this.audio.preload().then(() => {
      console.log('[MainScene] Audio preloaded');
    });
    
    // Generate simple map
    this.generateMap();
    
    // Render map
    this.renderMap();
    
    // Create player
    this.createPlayer();
    
    // Create collectibles
    this.createCollectibles();
    
    // Center camera
    this.centerCamera();
    
    // Create UI
    this.createUI();
  }
  
  private generateMap(): void {
    this.grid = [];
    
    for (let y = 0; y < this.mapHeight; y++) {
      const row: number[] = [];
      for (let x = 0; x < this.mapWidth; x++) {
        // Border walls
        if (x === 0 || x === this.mapWidth - 1 || y === 0 || y === this.mapHeight - 1) {
          row.push(1); // Wall
        } else {
          row.push(0); // Floor
        }
      }
      this.grid.push(row);
    }
    
    // Add some random walls (not blocking center area)
    for (let i = 0; i < 8; i++) {
      const x = this.engine.randomInt(2, this.mapWidth - 2);
      const y = this.engine.randomInt(2, this.mapHeight - 2);
      // Don't place wall in center
      if (Math.abs(x - 7) > 2 || Math.abs(y - 5) > 2) {
        this.grid[y][x] = 1;
      }
    }
  }
  
  private renderMap(): void {
    this.mapContainer.removeChildren();
    
    for (let y = 0; y < this.mapHeight; y++) {
      for (let x = 0; x < this.mapWidth; x++) {
        const tile = this.grid[y][x];
        const isWall = tile === 1;
        
        const rect = new Graphics();
        rect.rect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE - 1, CELL_SIZE - 1);
        rect.fill(isWall ? COLORS.wall : COLORS.floor);
        
        // Add grid lines for floor
        if (!isWall) {
          rect.stroke({ width: 0.5, color: 0x2a2a4e, alpha: 0.5 });
        }
        
        this.mapContainer.addChild(rect);
      }
    }
  }
  
  private createPlayer(): void {
    // Start in center
    const startX = 7;
    const startY = 5;
    
    // Create player entity
    this.player = {
      id: 'player',
      name: 'Player',
      x: startX,
      y: startY,
      hp: 100,
      maxHp: 100,
    };
    
    this.world.addEntity(this.player, ['player']);
    
    // Initialize display position
    this.playerTargetX = startX;
    this.playerTargetY = startY;
    this.playerDisplayX = startX;
    this.playerDisplayY = startY;
    
    // Create player graphics
    this.playerGraphics = new Graphics();
    this.entityContainer.addChild(this.playerGraphics);
    this.updatePlayerGraphics();
  }
  
  private createCollectibles(): void {
    const count = 5;
    let created = 0;
    
    while (created < count) {
      const x = this.engine.randomInt(1, this.mapWidth - 1);
      const y = this.engine.randomInt(1, this.mapHeight - 1);
      
      // Check if spot is empty and not player start
      if (this.grid[y][x] === 0 && !(x === 7 && y === 5)) {
        // Check if no other collectible here
        const exists = this.collectibles.find(c => c.x === x && c.y === y);
        if (!exists) {
          const graphics = new Graphics();
          this.entityContainer.addChild(graphics);
          
          this.collectibles.push({
            id: `item_${created}`,
            x,
            y,
            graphics,
          });
          created++;
        }
      }
    }
  }
  
  private updatePlayerGraphics(): void {
    if (!this.player || !this.playerGraphics) return;
    
    this.playerGraphics.clear();
    
    const px = this.playerDisplayX * CELL_SIZE + CELL_SIZE / 2;
    const py = this.playerDisplayY * CELL_SIZE + CELL_SIZE / 2;
    
    // Outer glow (breathing animation)
    const glowSize = CELL_SIZE * 0.45 + Math.sin(this.animPhase * 3) * 2;
    this.playerGraphics.circle(px, py, glowSize);
    this.playerGraphics.fill({ color: COLORS.player, alpha: 0.2 });
    
    // Middle glow
    this.playerGraphics.circle(px, py, CELL_SIZE * 0.38);
    this.playerGraphics.fill({ color: COLORS.player, alpha: 0.4 });
    
    // Body
    this.playerGraphics.circle(px, py, CELL_SIZE * 0.3);
    this.playerGraphics.fill(COLORS.player);
    
    // Eye/direction indicator
    this.playerGraphics.circle(px, py - 3, 3);
    this.playerGraphics.fill(0xffffff);
  }
  
  private updateCollectibleGraphics(): void {
    for (const item of this.collectibles) {
      item.graphics.clear();
      
      const px = item.x * CELL_SIZE + CELL_SIZE / 2;
      const py = item.y * CELL_SIZE + CELL_SIZE / 2;
      
      // Floating animation
      const floatY = Math.sin(this.animPhase * 4 + item.x) * 3;
      
      // Glow
      const glowSize = 10 + Math.sin(this.animPhase * 5) * 2;
      item.graphics.circle(px, py + floatY, glowSize);
      item.graphics.fill({ color: COLORS.item, alpha: 0.3 });
      
      // Star shape
      const size = 6;
      item.graphics.star(px, py + floatY, 5, size, size / 2, this.animPhase);
      item.graphics.fill(COLORS.item);
    }
  }
  
  private createUI(): void {
    // Instructions
    const style = new TextStyle({
      fontFamily: 'Courier New',
      fontSize: 14,
      fill: '#00ff87',
    });
    
    const instructions = new Text({
      text: 'WASD / Arrow Keys to move | Collect the stars!',
      style,
    });
    instructions.x = 10;
    instructions.y = 10;
    this.uiContainer.addChild(instructions);
  }
  
  private updateUI(): void {
    // Find or create score text
    let scoreText = this.uiContainer.children.find(
      c => (c as any)._isScoreText
    ) as Text | undefined;
    
    if (!scoreText) {
      const style = new TextStyle({
        fontFamily: 'Courier New',
        fontSize: 20,
        fill: '#ffd700',
        fontWeight: 'bold',
      });
      scoreText = new Text({ text: '', style });
      (scoreText as any)._isScoreText = true;
      scoreText.x = 10;
      scoreText.y = 35;
      this.uiContainer.addChild(scoreText);
    }
    
    scoreText.text = `Score: ${this.score}`;
  }
  
  private centerCamera(): void {
    const screenW = this.engine.app.renderer.width;
    const screenH = this.engine.app.renderer.height;
    const mapPixelW = this.mapWidth * CELL_SIZE;
    const mapPixelH = this.mapHeight * CELL_SIZE;
    
    this.cameraX = (screenW - mapPixelW) / 2;
    this.cameraY = (screenH - mapPixelH) / 2;
    
    this.container.x = this.cameraX;
    this.container.y = this.cameraY;
  }
  
  update(deltaTime: number): void {
    this.world.setTickInfo(this.engine.tick, deltaTime);
    this.animPhase += deltaTime;
    
    // Handle player input
    this.handlePlayerInput();
    
    // Smooth player movement
    this.updatePlayerPosition(deltaTime);
    
    // Check collectible pickup
    this.checkCollectibles();
    
    // Update particles
    this.updateParticles(deltaTime);
    
    // Update graphics
    this.updatePlayerGraphics();
    this.updateCollectibleGraphics();
    this.updateUI();
  }
  
  private handlePlayerInput(): void {
    if (!this.player) return;
    
    const input = this.engine.input;
    let dx = 0;
    let dy = 0;
    
    // Grid-based movement
    if (input.isKeyJustPressed('w') || input.isKeyJustPressed('arrowup')) dy = -1;
    else if (input.isKeyJustPressed('s') || input.isKeyJustPressed('arrowdown')) dy = 1;
    else if (input.isKeyJustPressed('a') || input.isKeyJustPressed('arrowleft')) dx = -1;
    else if (input.isKeyJustPressed('d') || input.isKeyJustPressed('arrowright')) dx = 1;
    
    if (dx !== 0 || dy !== 0) {
      // Start audio on first input (requires user interaction)
      if (!this.audioInitialized) {
        this.audioInitialized = true;
        this.audio.ensureResumed().then(() => {
          this.audio.playBGM();
        });
      }
      
      const newX = this.player.x + dx;
      const newY = this.player.y + dy;
      
      if (this.isWalkable(newX, newY)) {
        this.player.x = newX;
        this.player.y = newY;
        this.playerTargetX = newX;
        this.playerTargetY = newY;
        
        // Play move sound
        this.audio.play('move');
        
        // Spawn movement particles
        this.spawnMoveParticles();
      } else {
        // Hit wall - play sound and spawn impact particles
        this.audio.play('hit_wall');
        this.spawnWallHitParticles(newX, newY);
      }
    }
  }
  
  private updatePlayerPosition(deltaTime: number): void {
    const lerpSpeed = 15;
    this.playerDisplayX += (this.playerTargetX - this.playerDisplayX) * lerpSpeed * deltaTime;
    this.playerDisplayY += (this.playerTargetY - this.playerDisplayY) * lerpSpeed * deltaTime;
    
    // Snap when close
    if (Math.abs(this.playerDisplayX - this.playerTargetX) < 0.01) {
      this.playerDisplayX = this.playerTargetX;
    }
    if (Math.abs(this.playerDisplayY - this.playerTargetY) < 0.01) {
      this.playerDisplayY = this.playerTargetY;
    }
  }
  
  private checkCollectibles(): void {
    if (!this.player) return;
    
    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      const item = this.collectibles[i];
      
      if (item.x === this.player.x && item.y === this.player.y) {
        // Pickup!
        this.score += 10;
        
        // Play pickup sound
        this.audio.play('pickup');
        
        // Spawn celebration particles
        this.spawnPickupParticles(item.x, item.y);
        
        // Remove collectible
        item.graphics.destroy();
        this.collectibles.splice(i, 1);
        
        // Respawn after a delay if all collected
        if (this.collectibles.length === 0) {
          setTimeout(() => this.createCollectibles(), 1000);
        }
      }
    }
  }
  
  private spawnMoveParticles(): void {
    if (!this.player) return;
    
    const px = this.playerDisplayX * CELL_SIZE + CELL_SIZE / 2;
    const py = this.playerDisplayY * CELL_SIZE + CELL_SIZE / 2;
    
    for (let i = 0; i < 3; i++) {
      this.createParticle(px, py, COLORS.player, 0.3);
    }
  }
  
  private spawnWallHitParticles(x: number, y: number): void {
    const px = x * CELL_SIZE + CELL_SIZE / 2;
    const py = y * CELL_SIZE + CELL_SIZE / 2;
    
    for (let i = 0; i < 5; i++) {
      this.createParticle(px, py, COLORS.wall, 0.5);
    }
  }
  
  private spawnPickupParticles(x: number, y: number): void {
    const px = x * CELL_SIZE + CELL_SIZE / 2;
    const py = y * CELL_SIZE + CELL_SIZE / 2;
    
    for (let i = 0; i < 15; i++) {
      this.createParticle(px, py, COLORS.item, 0.8);
    }
  }
  
  private createParticle(x: number, y: number, color: number, speed: number): void {
    const angle = Math.random() * Math.PI * 2;
    const velocity = speed * 50 + Math.random() * 50;
    
    const graphics = new Graphics();
    this.particleContainer.addChild(graphics);
    
    this.particles.push({
      x,
      y,
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity,
      life: 0.5 + Math.random() * 0.3,
      color,
      size: 2 + Math.random() * 3,
      graphics,
    });
  }
  
  private updateParticles(deltaTime: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      
      p.x += p.vx * deltaTime;
      p.y += p.vy * deltaTime;
      p.vy += 100 * deltaTime; // Gravity
      p.vx *= 0.98; // Friction
      p.vy *= 0.98;
      p.life -= deltaTime;
      
      if (p.life <= 0) {
        p.graphics.destroy();
        this.particles.splice(i, 1);
        continue;
      }
      
      // Update graphics
      p.graphics.clear();
      p.graphics.circle(p.x, p.y, p.size * (p.life / 0.8));
      p.graphics.fill({ color: p.color, alpha: p.life });
    }
  }
  
  private isWalkable(x: number, y: number): boolean {
    if (x < 0 || x >= this.mapWidth || y < 0 || y >= this.mapHeight) {
      return false;
    }
    return this.grid[y][x] === 0;
  }
  
  onResize(width: number, height: number): void {
    this.centerCamera();
  }
  
  destroy(): void {
    this.container.removeChildren();
    this.uiContainer.removeChildren();
    for (const p of this.particles) {
      p.graphics.destroy();
    }
    this.particles = [];
    this.collectibles = [];
    this.world.clear();
  }
}
