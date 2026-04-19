/**
 * 测试模块统一导出
 */

export {
  GameTestFramework,
  createGameTestFramework,
  runQuickTest,
  type TestResult,
  type TestSuite,
  type TestCase
} from './GameTestFramework';

export {
  GameFlowSimulator,
  createGameFlowSimulator,
  quickSimulate,
  type SimulationConfig,
  type SimulationResult,
  type DayLog
} from './GameFlowSimulator';

/**
 * 运行完整测试套件
 * 包括设计文档验证和游戏流程模拟
 */
export async function runFullTest(): Promise<{
  designTests: any[];
  flowSimulation: any;
  report: string;
}> {
  console.log('🎮 开始运行主播模拟器完整测试套件...\n');

  // 1. 运行设计文档测试
  console.log('📋 第一步：验证设计文档一致性...');
  const { createGameTestFramework } = await import('./GameTestFramework');
  const testFramework = createGameTestFramework();
  const designTests = await testFramework.runAllTests();
  const designReport = testFramework.generateReport();
  console.log(designReport);

  // 2. 运行游戏流程模拟
  console.log('\n🎲 第二步：模拟游戏流程...');
  const { createGameFlowSimulator } = await import('./GameFlowSimulator');
  const simulator = createGameFlowSimulator();
  const flowSimulation = await simulator.simulate({ strategy: 'balanced', verbose: true });
  const flowReport = simulator.generateReport(flowSimulation);
  console.log(flowReport);

  // 3. 生成综合报告
  const summary = `
========================================
    综合测试报告
========================================

✅ 设计文档测试: ${designTests.filter(t => t.passed).length}/${designTests.length} 通过
✅ 游戏流程模拟: ${flowSimulation.success ? '成功' : '发现问题'}

结局: ${flowSimulation.ending}
最终粉丝数: ${flowSimulation.finalState.followers.toLocaleString()}
翻车次数: ${flowSimulation.finalState.failCount}

${flowSimulation.issues.length > 0 ? '⚠️ 发现的问题:\n' + flowSimulation.issues.map(i => '  - ' + i).join('\n') : '✅ 未发现严重问题'}

========================================
    测试完成
========================================
  `;

  console.log(summary);

  return {
    designTests,
    flowSimulation,
    report: summary
  };
}

/**
 * 运行快速测试
 */
export async function runQuickCheck(): Promise<boolean> {
  const { createGameTestFramework } = await import('./GameTestFramework');
  const framework = createGameTestFramework();
  const results = await framework.runAllTests();
  
  const allPassed = results.every(r => r.passed);
  
  if (allPassed) {
    console.log('✅ 所有测试通过！');
  } else {
    console.log(`❌ 测试失败: ${results.filter(r => !r.passed).length} 项未通过`);
  }
  
  return allPassed;
}

/**
 * 运行多次游戏模拟，统计结局分布
 */
export async function runBatchSimulation(count: number = 10): Promise<void> {
  console.log(`🎲 开始运行 ${count} 次游戏模拟...\n`);
  
  const { createGameFlowSimulator } = await import('./GameFlowSimulator');
  const simulator = createGameFlowSimulator();
  
  const { results, statistics } = await simulator.runMultipleSimulations(count, {
    strategy: 'balanced',
    verbose: false
  });

  console.log('========================================');
  console.log('    批量模拟统计报告');
  console.log('========================================\n');
  
  console.log('结局分布:');
  Object.entries(statistics.endingDistribution).forEach(([ending, count]) => {
    const percentage = ((count / results.length) * 100).toFixed(1);
    console.log(`  ${ending}: ${count}次 (${percentage}%)`);
  });
  
  console.log('\n数值统计:');
  console.log(`  平均粉丝数: ${Math.floor(statistics.averageFollowers).toLocaleString()}`);
  console.log(`  平均翻车次数: ${statistics.averageFailCount.toFixed(1)}`);
  console.log(`  问题发生率: ${(statistics.issueRate * 100).toFixed(1)}%`);
  
  console.log('\n========================================');
}

// 如果直接运行此文件，执行完整测试
if (typeof window !== 'undefined') {
  // 浏览器环境，暴露到全局
  (window as any).GameTester = {
    runFullTest,
    runQuickCheck,
    runBatchSimulation
  };
}
