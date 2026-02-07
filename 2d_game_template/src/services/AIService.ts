/**
 * AI服务 - Google AI Studio (Gemini) 集成
 */

import type { StreamCategory } from '../game/GameConfig';
import type { PlayerState } from '../game/PlayerData';
import * as DefaultContent from './DefaultContent';

interface AIResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
}

export class AIService {
  private apiKey: string = '';
  private cache: Map<string, string> = new Map();
  private pendingRequests: Map<string, Promise<string>> = new Map();

  setApiKey(key: string): void {
    this.apiKey = key.trim();
  }

  hasApiKey(): boolean {
    return this.apiKey.length > 0;
  }

  private async callGemini(prompt: string): Promise<string> {
    if (!this.hasApiKey()) {
      throw new Error('No API key configured');
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.9, maxOutputTokens: 1024 },
      }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data: AIResponse = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Empty response');
    return text;
  }

  private async cachedCall(key: string, prompt: string, fallback: () => string): Promise<string> {
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }

    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key)!;
    }

    if (!this.hasApiKey()) {
      return fallback();
    }

    const promise = this.callGemini(prompt)
      .then(result => {
        this.cache.set(key, result);
        this.pendingRequests.delete(key);
        return result;
      })
      .catch(() => {
        this.pendingRequests.delete(key);
        return fallback();
      });

    this.pendingRequests.set(key, promise);
    return promise;
  }

  async generateDanmakuAndComments(
    streamContent: string,
    category: StreamCategory,
    playerState: PlayerState
  ): Promise<{ danmaku: string[]; comments: Array<{ user: string; text: string }> }> {
    const key = `danmaku_day${playerState.currentDay}`;
    const categoryName = getCategoryName(category);
    const prompt = `你是一个直播弹幕生成器。场景：${categoryName}主播正在直播，内容是："${streamContent}"。
生成20条弹幕和10条评论（JSON格式，搞笑中国互联网风格）：
{"danmaku":["弹幕1",...],"comments":[{"user":"用户名","text":"内容"},...]}`; 

    try {
      const result = await this.cachedCall(key, prompt, () => {
        return JSON.stringify({
          danmaku: Array.from({ length: 20 }, () => DefaultContent.getDanmaku(category)),
          comments: Array.from({ length: 10 }, () => DefaultContent.getRandomComment()),
        });
      });

      const cleaned = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned);
    } catch {
      return {
        danmaku: Array.from({ length: 20 }, () => DefaultContent.getDanmaku(category)),
        comments: Array.from({ length: 10 }, () => DefaultContent.getRandomComment()),
      };
    }
  }

  async generateDailySummary(
    streamContent: string,
    category: StreamCategory,
    playerState: PlayerState
  ): Promise<{ summary: string; followerChange: number; fanClubChange: number; incomeChange: number }> {
    const key = `summary_day${playerState.currentDay}`;
    const base = playerState.stageId;
    
    const prompt = `主播模拟器AI裁判。分区：${getCategoryName(category)}，内容：${streamContent || '无'}，关注${playerState.followers}，收入${playerState.income}。
判断直播效果，输出JSON：{"summary":"搞笑评语","followerChange":${50*base}~${300*base},"fanClubChange":${3*base}~${20*base},"incomeChange":${200*base}~${1500*base}}`;

    try {
      const result = await this.cachedCall(key, prompt, () => {
        return JSON.stringify({
          summary: DefaultContent.getDailySummary(),
          followerChange: Math.round((50 + Math.random() * 250) * base),
          fanClubChange: Math.round((3 + Math.random() * 17) * base),
          incomeChange: Math.round((200 + Math.random() * 1300) * base),
        });
      });

      const cleaned = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned);
    } catch {
      return {
        summary: DefaultContent.getDailySummary(),
        followerChange: Math.round((50 + Math.random() * 250) * base),
        fanClubChange: Math.round((3 + Math.random() * 17) * base),
        incomeChange: Math.round((200 + Math.random() * 1300) * base),
      };
    }
  }

  async generateFuturePrediction(playerState: PlayerState, category: StreamCategory): Promise<string> {
    const key = 'future_prediction';
    const prompt = `主播模拟器游戏结束。玩家在${getCategoryName(category)}坚持20天，关注${playerState.followers}，收入${playerState.income}。
写一段这位主播的"未来发展"故事（150字，幽默搞笑脑洞大开）`;

    return this.cachedCall(key, prompt, DefaultContent.getFuturePrediction);
  }

  async preheat(streamContent: string, category: StreamCategory, playerState: PlayerState): Promise<void> {
    await Promise.allSettled([
      this.generateDanmakuAndComments(streamContent, category, playerState),
      this.generateDailySummary(streamContent, category, playerState),
    ]);
  }

  clearCache(): void {
    this.cache.clear();
    this.pendingRequests.clear();
  }
}

function getCategoryName(category: StreamCategory): string {
  const map: Record<StreamCategory, string> = {
    music: '音乐歌手区', dance: '舞蹈区', gaming: '游戏区', variety: '整活搞笑区',
  };
  return map[category] || '直播';
}
