# 变更设计：AI 并行化与页面多余内容优化

## 1. 架构设计

### 1.1 并发池设计 (Concurrency Pool)
使用基于 Promise 的并发控制器，避免一次性发起过多请求导致 API 封禁（429）。
签名：`runWithConcurrencyLimit(items, limit, taskFn, onProgress)`

### 1.2 UI 优化设计
直接在 DOM 中删除对应的 `<section>` 标签和相关 CSS（主要是 `.features` 和 `.features-grid` 相关的代码段），不对既有步骤逻辑产生任何影响。

## 2. 数据结构设计
并发工具本身是泛型的，不侵入业务数据结构。

## 3. 安全与容错
如果并发中某个 Promise 失败，需要在并发控制器外部捕获异常，或者通过 try-catch 让单条失败不影响整体（目前由于代码已经完成，实际采用的方案是在并发内部将错误抛出，由外部业务逻辑如批量解析函数本身进行兜底）。
