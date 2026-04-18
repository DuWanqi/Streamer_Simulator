# 技能树分页布局改造规格

## Why
用户要求将现有的四象限技能树布局改为类似赛博朋克2077的树状布局，分四页展示四个维度（口才/外貌/才艺/知识），并且必须基于提供的Figma HTML文件进行改造。

## What Changes
- **BREAKING**: 移除四象限布局，改为分页式树状布局
- **BREAKING**: 每个维度独立一页，共4页
- **BREAKING**: 基于Figma HTML的结构和样式进行改造
- 保留技能解锁逻辑和状态管理
- 添加页面切换导航

## Impact
- Affected code: `Game.ts` 的 `renderSkillTree()` 方法
- Affected config: `SkillTreeConfig.ts` 需要调整节点位置为树状结构

## ADDED Requirements

### Requirement: 分页式技能树布局
The system SHALL provide a paged skill tree layout similar to Cyberpunk 2077.

#### Scenario: 页面导航
- **WHEN** 用户进入技能树页面
- **THEN** 显示四个维度的标签页导航（口才/外貌/才艺/知识）
- **AND** 默认显示第一个维度

#### Scenario: 树状节点布局
- **WHEN** 用户切换到某个维度页面
- **THEN** 该维度的技能节点以树状结构展示
- **AND** 节点之间有连线表示解锁顺序
- **AND** 已解锁节点显示彩色，未解锁显示灰色

#### Scenario: 节点交互
- **WHEN** 用户点击节点
- **THEN** 右侧面板显示节点详情
- **AND** 满足条件时可消耗SP解锁

## MODIFIED Requirements
### Requirement: 技能树渲染
**Before**: 四象限布局，所有节点同时显示
**After**: 分页布局，每页显示一个维度的树状结构

## REMOVED Requirements
### Requirement: 四象限布局
**Reason**: 用户明确要求改为分页树状布局
**Migration**: 使用新的分页布局替代
