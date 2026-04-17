# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Streamer Simulator (主播模拟器)** — An AI-native simulation/management game built with TypeScript + Vite + PixiJS v8. The player role-plays as a live streamer trying to become a top influencer over 20 in-game days. All user-facing text is Chinese. Integrates Google Gemini 2.0 Flash for dynamic content generation (danmaku, summaries, predictions).

**The actual project lives in `2d_game_template/`** (originated from a platform template). All commands below are relative to that directory.

## Commands

```bash
cd 2d_game_template
npm install        # Install dependencies (pixi.js, typescript, vite)
npm run dev        # Start dev server on http://localhost:5179 (strict port)
npm run build      # Type-check with tsc, then vite build to dist/
npm run preview    # Serve production build locally
```

No test framework, linter, or formatter is configured. `tsc` type-checking during build is the only automated quality gate.

## Architecture

### Dual-layer rendering

1. **PixiJS canvas layer** (`#pixi-container`, z-index 5) — initialized but **mostly unused**. The `engine/` directory (Engine.ts, World.ts, Input.ts) and `MainScene.ts` are vestigial from the template.
2. **HTML/DOM UI layer** (`#ui-container`, z-index 10) — the entire game UI is rendered here as inline HTML template literals inserted via `innerHTML`.

### Core file: `src/game/Game.ts` (~2400 lines)

The central orchestrator. Contains all 10 scene render methods (`renderStartScreen`, `renderLivestream`, etc.), each building a complete HTML page as a template literal with inline styles. Event binding is done imperatively via `querySelector` + `addEventListener`.

### Key modules

| File | Role |
|------|------|
| `game/Game.ts` | Main game class, all scene rendering and event handling |
| `game/GameConfig.ts` | Constants, types, stage definitions (5 stages with multipliers) |
| `game/GameStateManager.ts` | Scene state machine with history tracking |
| `game/PlayerData.ts` | Player state model with observer pattern (`onChange`) |
| `services/AIService.ts` | Gemini API client with caching and async preheat |
| `services/DefaultContent.ts` | Extensive hardcoded fallback content (Chinese internet memes) |
| `systems/EventPool.ts` | Weighted random event generation with stage multipliers |
| `utils/helpers.ts` | `randomPick`, `weightedRandom`, `delay`, DOM helpers |

### Scene flow

```
start -> settings
start -> category_select -> stream_planning -> main_hub -> attribute_panel
                                               main_hub -> livestream -> daily_summary
                                               daily_summary -> stream_planning (next day)
                                               victory | game_over
```

### AI async preheat pattern

When the player confirms their stream plan, AI requests are fired in parallel (`Promise.allSettled`) to pre-generate content while the player spends time on attribute upgrades. Every AI-powered feature in `AIService.ts` has a corresponding fallback in `DefaultContent.ts` — both files must be kept in sync for new content types.

### Cross-cutting concerns

- **Stage system**: `GameConfig.ts` defines 5 stages with multiplier arrays consumed by `PlayerData.ts` (level-up), `EventPool.ts` (event impact), and `Game.ts` (UI). Changing stage definitions requires updating all three.
- **Category system**: 4 streaming categories (`music`, `dance`, `gaming`, `variety`). Adding a new category requires updating `GameConfig.ts`, `DefaultContent.ts`, `AIService.ts`, and the category-select UI in `Game.ts`.
- **Audio**: `AudioSystem.ts` is a singleton, deferred until first user interaction (autoplay policy).

## Constraints

- **Never modify** `src/platform/Bridge.ts`
- **Frontend only** — no Python, no backend (per AGENTS.md)
- Tailwind CSS loaded via CDN (not installed as dependency)
- Styling done primarily with inline `style=` attributes in template literals
- API key stored in `PlayerData.state.apiKey` (memory only, no localStorage)
- TypeScript strict mode, `noEmit: true`, ES2020 target, ESNext modules
