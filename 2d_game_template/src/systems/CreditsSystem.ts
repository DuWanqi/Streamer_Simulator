/**
 * 滚动报幕系统 - 结局后的制作人员名单
 *
 * 背景使用完整立绘（白毛1.3.png）
 */

import type { PlayerData } from '../game/PlayerData';
import type { EndingResult } from './EndingSystem';

export interface CreditItem {
  type: 'title' | 'name' | 'role' | 'stat' | 'quote' | 'empty';
  content: string;
  delay: number; // 显示延迟（秒）
}

export class CreditsSystem {
  private playerData: PlayerData;
  private onComplete?: () => void;

  constructor(playerData: PlayerData) {
    this.playerData = playerData;
  }

  /**
   * 生成报幕序列
   */
  generateCredits(ending: EndingResult): CreditItem[] {
    const state = this.playerData.getState();
    const credits: CreditItem[] = [];

    // 开场
    credits.push({ type: 'empty', content: '', delay: 1 });
    credits.push({ type: 'title', content: '《主播模拟器：双面人生》', delay: 2 });
    credits.push({ type: 'empty', content: '', delay: 1 });

    // 主角
    credits.push({ type: 'role', content: '主  角', delay: 1.5 });
    credits.push({ type: 'name', content: '林小爱', delay: 1 });
    credits.push({ type: 'empty', content: '', delay: 0.5 });

    // 特别出演
    credits.push({ type: 'role', content: '特别出演', delay: 1.5 });

    if (state.npcRelations.doudou > 0) {
      credits.push({ type: 'name', content: '豆豆 — 最忠诚的伙伴', delay: 0.8 });
    }
    if (state.npcRelations.kexin > 0) {
      const kexinStatus = state.storyChoices['node4_kexin'] ? '永远的室友' : '善良的女孩';
      credits.push({ type: 'name', content: `可心 — ${kexinStatus}`, delay: 0.8 });
    }
    credits.push({ type: 'name', content: '房东太太 — 严厉的守护者', delay: 0.8 });
    if (state.npcRelations.yueya > 20) {
      credits.push({ type: 'name', content: '月牙儿 — 竞争对手', delay: 0.8 });
    }
    credits.push({ type: 'empty', content: '', delay: 0.5 });

    // 游戏数据
    credits.push({ type: 'role', content: '游戏数据', delay: 1.5 });
    credits.push({ type: 'stat', content: `最终人气：${PlayerData.formatNumber(state.followers)}`, delay: 0.8 });
    credits.push({ type: 'stat', content: `翻车次数：${state.failCount} 次`, delay: 0.8 });
    credits.push({ type: 'stat', content: `热搜记录：${state.trendingTopics.length} 条`, delay: 0.8 });
    credits.push({ type: 'stat', content: `善良值：${state.kindness} | 诚信值：${state.integrity} | 精神值：${state.sanity}`, delay: 0.8 });
    credits.push({ type: 'empty', content: '', delay: 0.5 });

    // 结局
    credits.push({ type: 'role', content: '最终结局', delay: 1.5 });
    credits.push({ type: 'name', content: ending.name, delay: 1 });
    credits.push({ type: 'quote', content: ending.truth, delay: 1.5 });
    credits.push({ type: 'empty', content: '', delay: 1 });

    // 感言
    credits.push({ type: 'role', content: '玩家留言', delay: 1.5 });
    credits.push({ type: 'quote', content: this.generatePlayerQuote(ending, state), delay: 2 });
    credits.push({ type: 'empty', content: '', delay: 1 });

    // 结尾
    credits.push({ type: 'title', content: '谢谢游玩', delay: 2 });
    credits.push({ type: 'empty', content: '', delay: 0.5 });
    credits.push({ type: 'quote', content: '在虚拟与现实之间，找到真正的自己', delay: 3 });
    credits.push({ type: 'empty', content: '', delay: 1 });

    return credits;
  }

  /**
   * 生成玩家感言
   */
  private generatePlayerQuote(ending: EndingResult, state: ReturnType<PlayerData['getState']>): string {
    const quotes: Record<string, string[]> = {
      reconciliation: [
        '我终于明白，真实比完美更珍贵。',
        '感谢这20天的陪伴，让我找回了自己。',
        '虚拟世界再精彩，也比不上现实中的温暖。',
      ],
      lost: [
        '也许这就是成长的代价。',
        '我得到了想要的一切，却失去了最重要的东西。',
        '如果可以重来，我会做出不同的选择。',
      ],
      escape: [
        '有时候，放弃也是一种勇气。',
        '逃离不是认输，而是为了更好地开始。',
        '平凡的生活，也有不平凡的意义。',
      ],
      collapse: [
        '生活不易，但我还在坚持。',
        '跌倒了，就再爬起来。',
        '也许明天会好一些。',
      ],
      redemption: [
        '感谢所有陪伴我的人，你们让我成为了更好的自己。',
        '虚拟与现实，我终于找到了平衡。',
        '这就是我想要的人生。',
      ],
    };

    const endingQuotes = quotes[ending.type] || quotes.reconciliation;
    return endingQuotes[Math.floor(Math.random() * endingQuotes.length)];
  }

  /**
   * 计算报幕总时长
   */
  calculateTotalDuration(credits: CreditItem[]): number {
    return credits.reduce((total, item) => total + item.delay, 0);
  }

  /**
   * 播放报幕（返回HTML字符串）
   */
  renderCredits(credits: CreditItem[]): string {
    const totalDuration = this.calculateTotalDuration(credits);

    let html = `
      <div id="credits-container" style="
        position: fixed;
        inset: 0;
        background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
        z-index: 1000;
        overflow: hidden;
        font-family: 'Noto Sans SC', sans-serif;
      ">
        <!-- 背景立绘 -->
        <div style="
          position: absolute;
          inset: 0;
          background-image: url('./portraits/character-full.png');
          background-size: contain;
          background-position: center;
          background-repeat: no-repeat;
          opacity: 0.15;
          filter: blur(2px);
        "></div>

        <!-- 滚动内容 -->
        <div id="credits-scroll" style="
          position: absolute;
          bottom: -100px;
          left: 0;
          right: 0;
          text-align: center;
          color: white;
          animation: credits-scroll ${totalDuration}s linear forwards;
        ">
    `;

    let currentDelay = 0;
    credits.forEach((item, index) => {
      currentDelay += item.delay;
      const style = this.getItemStyle(item.type);
      html += `
        <div style="
          ${style}
          opacity: 0;
          animation: fade-in 0.5s ease forwards;
          animation-delay: ${currentDelay - item.delay}s;
        ">
          ${item.content}
        </div>
      `;
    });

    html += `
        </div>

        <!-- 跳过按钮 -->
        <button id="skip-credits" style="
          position: absolute;
          bottom: 30px;
          right: 30px;
          padding: 10px 20px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.3);
          color: white;
          cursor: pointer;
          border-radius: 4px;
          font-size: 14px;
          z-index: 1001;
        ">跳过 (ESC)</button>

        <style>
          @keyframes credits-scroll {
            from { transform: translateY(100vh); }
            to { transform: translateY(-100%); }
          }
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        </style>
      </div>
    `;

    return html;
  }

  /**
   * 获取不同元素的样式
   */
  private getItemStyle(type: CreditItem['type']): string {
    const baseStyle = 'margin: 20px 0; text-shadow: 0 2px 4px rgba(0,0,0,0.5);';

    switch (type) {
      case 'title':
        return `${baseStyle} font-size: 2.5rem; font-weight: bold; color: #f49d25;`;
      case 'role':
        return `${baseStyle} font-size: 1.2rem; color: #a0a0a0; letter-spacing: 4px;`;
      case 'name':
        return `${baseStyle} font-size: 1.8rem; color: white;`;
      case 'stat':
        return `${baseStyle} font-size: 1.4rem; color: #54a0ff;`;
      case 'quote':
        return `${baseStyle} font-size: 1.3rem; color: #ffe66d; font-style: italic; max-width: 600px; margin: 20px auto; padding: 0 20px;`;
      case 'empty':
        return 'height: 60px;';
      default:
        return baseStyle;
    }
  }

  /**
   * 播放报幕（带回调）
   */
  play(ending: EndingResult, onComplete?: () => void): void {
    this.onComplete = onComplete;
    const credits = this.generateCredits(ending);
    const totalDuration = this.calculateTotalDuration(credits);

    // 渲染到页面
    const container = document.getElementById('ui-container');
    if (container) {
      container.innerHTML = this.renderCredits(credits);

      // 绑定跳过按钮
      const skipBtn = document.getElementById('skip-credits');
      if (skipBtn) {
        skipBtn.addEventListener('click', () => this.skip());
      }

      // 绑定ESC键
      const handleKeydown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          this.skip();
          document.removeEventListener('keydown', handleKeydown);
        }
      };
      document.addEventListener('keydown', handleKeydown);

      // 自动结束
      setTimeout(() => {
        this.complete();
      }, totalDuration * 1000);
    }
  }

  /**
   * 跳过报幕
   */
  skip(): void {
    const container = document.getElementById('credits-container');
    if (container) {
      container.remove();
    }
    this.complete();
  }

  /**
   * 报幕完成
   */
  private complete(): void {
    if (this.onComplete) {
      this.onComplete();
      this.onComplete = undefined;
    }
  }
}
