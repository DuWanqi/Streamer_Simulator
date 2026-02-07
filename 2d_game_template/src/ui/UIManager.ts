/**
 * UI管理器 - 管理所有HTML UI场景
 */

import type { GameScene } from '../game/GameStateManager';
import { $ } from '../utils/helpers';

export abstract class UIScreen {
  protected container: HTMLElement;
  
  constructor(containerId: string) {
    this.container = document.getElementById(containerId) || document.createElement('div');
  }

  abstract render(): void;
  abstract show(): void;
  abstract hide(): void;
  abstract destroy(): void;
}

export class UIManager {
  private screens: Map<GameScene, UIScreen> = new Map();
  private currentScreen: UIScreen | null = null;
  private uiContainer: HTMLElement;

  constructor() {
    // 创建UI容器
    this.uiContainer = document.createElement('div');
    this.uiContainer.id = 'ui-container';
    this.uiContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 100;
      pointer-events: auto;
    `;
    document.body.appendChild(this.uiContainer);
  }

  registerScreen(scene: GameScene, screen: UIScreen): void {
    this.screens.set(scene, screen);
  }

  showScreen(scene: GameScene): void {
    // 隐藏当前屏幕
    if (this.currentScreen) {
      this.currentScreen.hide();
    }

    // 显示新屏幕
    const screen = this.screens.get(scene);
    if (screen) {
      screen.show();
      this.currentScreen = screen;
    }
  }

  getContainer(): HTMLElement {
    return this.uiContainer;
  }

  destroy(): void {
    for (const screen of this.screens.values()) {
      screen.destroy();
    }
    this.screens.clear();
    this.uiContainer.remove();
  }
}
