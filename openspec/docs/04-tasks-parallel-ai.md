# 任务分解：AI 并行化与页面多余内容优化

## 1. 第一阶段：基础工具与重构 (Task Group 1)
- [ ] 创建 `src/utils/concurrency.ts` 并通过单元测试。
- [ ] 提取 `src/components/home/FeatureIntro.vue`。
- [ ] 提取 `src/components/home/StepIndicator.vue`。
- [ ] 提取 `src/components/home/UploadSection.vue`。

## 2. 第二阶段：AI 并行化应用 (Task Group 2)
- [ ] 修改 `src/composables/useClassificationStore.ts` 接入并行执行逻辑。
- [ ] 修改 `src/composables/useLLMParser.ts` 接入并行执行逻辑。
- [ ] 验证进度条在并发情况下的准确性。

## 3. 第三阶段：页面优化与清理 (Task Group 3)
- [ ] 在 `HomePage.vue` 中根据 `currentStep` 隐藏 `FeatureIntro`。
- [ ] 完成 `HomePage.vue` 的组件化重构，清理内联代码。
- [ ] 修复可能出现的响应式布局问题。

## 4. 第四阶段：验证 (Task Group 4)
- [ ] 运行 `npm run build:check`。
- [ ] 模拟多数据 Excel 上传验证并发性能。
