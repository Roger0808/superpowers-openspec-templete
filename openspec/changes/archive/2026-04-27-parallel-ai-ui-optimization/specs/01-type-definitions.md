# 类型定义：AI 并行化与页面多余内容优化

## 1. 并发工具函数类型
```typescript
export async function runWithConcurrencyLimit<T, R>(
  items: T[],
  limit: number,
  taskFn: (item: T, index: number) => Promise<R>,
  onProgress?: (completed: number, total: number) => void
): Promise<R[]>
```
