/**
 * 游戏状态管理器
 */

export type GameScene =
  | 'start'
  | 'settings'
  | 'category_select'
  | 'main_hub'
  | 'attribute_panel'
  | 'stream_planning'
  | 'livestream'
  | 'daily_summary'
  | 'victory'
  | 'game_over';

export type SceneChangeHandler = (newScene: GameScene, oldScene: GameScene | null) => void;

export class GameStateManager {
  private currentScene: GameScene = 'start';
  private sceneHistory: GameScene[] = [];
  private listeners: SceneChangeHandler[] = [];

  getCurrentScene(): GameScene {
    return this.currentScene;
  }

  changeScene(newScene: GameScene): void {
    const oldScene = this.currentScene;
    this.sceneHistory.push(oldScene);
    this.currentScene = newScene;
    console.log(`[GameState] Scene: ${oldScene} → ${newScene}`);
    for (const listener of this.listeners) {
      listener(newScene, oldScene);
    }
  }

  goBack(): void {
    if (this.sceneHistory.length > 0) {
      const prevScene = this.sceneHistory.pop()!;
      const oldScene = this.currentScene;
      this.currentScene = prevScene;
      for (const listener of this.listeners) {
        listener(prevScene, oldScene);
      }
    }
  }

  onSceneChange(handler: SceneChangeHandler): () => void {
    this.listeners.push(handler);
    return () => {
      this.listeners = this.listeners.filter(l => l !== handler);
    };
  }

  reset(): void {
    this.sceneHistory = [];
    this.changeScene('start');
  }
}
