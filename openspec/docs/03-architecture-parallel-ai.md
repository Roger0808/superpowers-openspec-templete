# 技术架构：AI 并行化与页面多余内容优化

## 1. 技术方案：并发控制

### 1.1 并发工具函数
在 `src/utils/concurrency.ts` 中实现：
```typescript
/**
 * 带有并发限制的异步任务执行器
 */
export async function runWithConcurrencyLimit<T, R>(
  items: T[],
  limit: number,
  taskFn: (item: T) => Promise<R>,
  onProgress?: (completed: number, total: number) => void
): Promise<R[]>
```

### 1.2 应用层修改
- **useClassificationStore.ts**: 将 `classifyRows` 中的 `for` 循环替换为 `runWithConcurrencyLimit`。
- **useLLMParser.ts**: 将 `parseBatch` 中的 `for` 循环替换为 `runWithConcurrencyLimit`。

## 2. UI 重构设计

### 2.1 组件抽取
- `src/components/home/UploadSection.vue`: 封装上传逻辑。
- `src/components/home/FeatureIntro.vue`: 封装核心功能介绍。
- `src/components/home/StepIndicator.vue`: 封装步骤指示器。

### 2.2 状态驱动显示
使用 Vue 3 的 `v-if` 或 `v-show` 结合 `currentStep` 状态控制组件显示。

## 3. 容错设计
- 使用 `Promise.allSettled` 的思想（或在 `runWithConcurrencyLimit` 中捕获异常）确保部分失败不会影响全局。
- 如果某个请求由于并发过快导致 429 错误，需配合 `LLMService` 中的重试机制。
