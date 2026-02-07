/**
 * 主播模拟器 - 主入口
 */

import { Game } from './game/Game';

async function main() {
  // 移除加载提示
  const loading = document.querySelector('.loading');
  if (loading) loading.remove();

  // 创建并初始化游戏
  const game = new Game();
  await game.init();

  // 存储到全局以便调试
  (window as any).game = game;
}

main().catch(console.error);
