# 技术架构 — 去除关键字模式

**创建日期**: 2026-04-17
**变更**: 去除关键字
**版本**: v1.0

---

## 1. 当前架构

```
handlePreviewConfirm()
  ├── [keyword 模式] → 跳过归类 → currentStep = 4
  └── [llm 模式]    → classifyRows() → buildChaptersFromClassification()

generateReport()
  ├── [有归类结果] → buildChaptersFromClassification(items)
  └── [无归类结果] → buildChapters(rows)  ← keyword 路径
```

## 2. 目标架构

```
handlePreviewConfirm()
  └── classifyRows() → buildChaptersFromClassification()

generateReport()
  └── buildChaptersFromClassification(items)
```

## 3. 删除清单

### 3.1 删除文件

| 文件 | 原因 |
|------|------|
| `src/components/common/LLMModeToggle.vue` | 切换按钮组件，完全移除 |
| `src/composables/useContentMapper.ts` | keyword 专用映射，`identifyStatus` 等只被 `buildChapters` 使用 |

### 3.2 修改文件

**`src/types/llm.ts`**
- 删除第 188 行：`export type ParseMode = 'keyword' | 'llm'`

**`src/pages/HomePage.vue`**

| 内容 | 行号（参考） |
|------|-------------|
| `import { useContentMapper }` | 260 |
| `import LLMModeToggle` | 263 |
| `import type { ParseMode, ... }` — 去掉 `ParseMode` | 254 |
| `const parseMode = ref<ParseMode>('llm')` | 285 |
| `const { mapContentToChapter, identifyStatus, ... } = useContentMapper()` | 338 |
| `<LLMModeToggle ... />` 及包裹 div | 38-44 |
| `parseMode === 'llm' ? 'AI 解析中...' : '解析 Excel 中...'` | 68 |
| `v-if="parseMode === 'llm'"` on ParseProgressBar | 70 |
| `<span v-if="parseMode === 'keyword'">` | 89 |
| `parseMode === 'llm' ? '开始归类 ➡️' : '确认并继续 ➡️'` | 109 |
| keyword 分支（`if parseMode.value === 'keyword'`）| 419-423 |
| `buildChapters` 函数 | 541-580 |
| `splitContentBySections` 函数 | 626-675 |
| `mapSectionToChapter` 函数 | 680-739 |
| else 分支（`buildChapters(rows)` fallback）in `generateReport` | 516-521 |

## 4. 风险

| 风险 | 说明 | 缓解 |
|------|------|------|
| 编译错误 | import 未清理干净 | 每步后执行 `npm run build:check` |
| 行为回归 | AI 路径已覆盖全部归类场景 | 低风险；现有测试验证 |
