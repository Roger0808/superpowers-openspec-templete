# 任务分解 — 去除关键字模式

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 删除 keyword 归类路径的所有代码和文件，系统只保留 AI 归类路径

**Architecture:** 删除 3 个文件/类型 + 修改 HomePage.vue（删除 import、ref、模板、函数、条件分支）

**Tech Stack:** Vue 3 TypeScript

---

## Task 1: 删除 LLMModeToggle.vue 及模板引用

**Files:**
- Delete: `src/components/common/LLMModeToggle.vue`
- Modify: `src/pages/HomePage.vue`

- [ ] **Step 1: 删除组件文件**

  ```bash
  rm src/components/common/LLMModeToggle.vue
  ```

- [ ] **Step 2: 移除 import**

  在 `src/pages/HomePage.vue` 第 263 行，删除：
  ```ts
  import LLMModeToggle from '../components/common/LLMModeToggle.vue'
  ```

- [ ] **Step 3: 移除模板中的 LLMModeToggle 及包裹 div**

  删除第 38-44 行（含注释和包裹 div）：
  ```html
  <!-- LLM 模式切换 - 在步骤 1 和 2 都显示 -->
  <div class="mode-toggle-wrapper">
    <LLMModeToggle
      v-model="parseMode"
      :llm-status="llmStatus"
    />
  </div>
  ```

- [ ] **Step 4: 构建验证**

  ```bash
  npm run build:check
  ```
  预期：无错误（此时 `parseMode` 引用仍存在但未使用，后续步骤处理）

- [ ] **Step 5: 提交**

  ```bash
  git add src/components/common/LLMModeToggle.vue src/pages/HomePage.vue
  git commit -m "feat: 移除关键词/AI模式切换UI"
  ```

---

## Task 2: 移除 parseMode ref 和 ParseMode 类型

**Files:**
- Modify: `src/pages/HomePage.vue`
- Modify: `src/types/llm.ts`

- [ ] **Step 1: 移除 ParseMode import（HomePage.vue 第 254 行）**

  将：
  ```ts
  import type { ParseMode, LLMStatus, LLMParseResult } from '../types/llm'
  ```
  改为：
  ```ts
  import type { LLMStatus, LLMParseResult } from '../types/llm'
  ```

- [ ] **Step 2: 删除 parseMode ref（第 285 行）**

  删除：
  ```ts
  const parseMode = ref<ParseMode>('llm')
  ```

- [ ] **Step 3: 修复模板中 parseMode 引用（第 68 行）**

  将：
  ```html
  <p>{{ parseMode === 'llm' ? 'AI 解析中...' : '解析 Excel 中...' }}</p>
  ```
  改为：
  ```html
  <p>AI 解析中...</p>
  ```

- [ ] **Step 4: 移除 ParseProgressBar 的 v-if（第 70 行）**

  将：
  ```html
  <ParseProgressBar
    v-if="parseMode === 'llm'"
    :progress="parseProgress"
    :text="`正在解析第 ${Math.round(parseProgress)}%`"
  />
  ```
  改为：
  ```html
  <ParseProgressBar
    :progress="parseProgress"
    :text="`正在解析第 ${Math.round(parseProgress)}%`"
  />
  ```

- [ ] **Step 5: 简化步骤 2 提示文字（第 88-91 行）**

  将：
  ```html
  <p class="section-hint">
    <span v-if="parseMode === 'keyword'">请确认解析结果是否正确</span>
    <span v-else>点击"确认并继续"将使用 AI 进行过滤和分类</span>
  </p>
  ```
  改为：
  ```html
  <p class="section-hint">点击"开始归类"将使用 AI 进行过滤和分类</p>
  ```

- [ ] **Step 6: 固定按钮文字（第 109 行）**

  将：
  ```html
  {{ parseMode === 'llm' ? '开始归类 ➡️' : '确认并继续 ➡️' }}
  ```
  改为：
  ```html
  开始归类 ➡️
  ```

- [ ] **Step 7: 删除 ParseMode 类型定义（llm.ts 第 187-188 行）**

  在 `src/types/llm.ts` 删除：
  ```ts
  /**
   * 解析模式
   */
  export type ParseMode = 'keyword' | 'llm'
  ```

- [ ] **Step 8: 构建验证**

  ```bash
  npm run build:check
  ```
  预期：无错误

- [ ] **Step 9: 提交**

  ```bash
  git add src/pages/HomePage.vue src/types/llm.ts
  git commit -m "refactor: 移除 parseMode ref 和 ParseMode 类型"
  ```

---

## Task 3: 移除 handlePreviewConfirm 中的 keyword 分支

**Files:**
- Modify: `src/pages/HomePage.vue`

- [ ] **Step 1: 删除 keyword 分支（第 418-423 行）**

  在 `handlePreviewConfirm` 函数中，删除：
  ```ts
  // 如果是关键词模式，直接跳到模板选择
  if (parseMode.value === 'keyword') {
    console.log('[归类] 关键词模式，跳过 AI 归类')
    currentStep.value = 4
    return
  }
  ```

- [ ] **Step 2: 构建验证**

  ```bash
  npm run build:check
  ```
  预期：无错误

- [ ] **Step 3: 提交**

  ```bash
  git add src/pages/HomePage.vue
  git commit -m "refactor: 删除 handlePreviewConfirm 中的 keyword 分支"
  ```

---

## Task 4: 删除 useContentMapper.ts 及其引用

**Files:**
- Delete: `src/composables/useContentMapper.ts`
- Modify: `src/pages/HomePage.vue`

- [ ] **Step 1: 删除 import 行（第 260 行）**

  删除：
  ```ts
  import { useContentMapper } from '../composables/useContentMapper'
  ```

- [ ] **Step 2: 删除解构调用（第 338 行）**

  删除：
  ```ts
  const { mapContentToChapter, identifyStatus, extractStatusText, extractDeadline, extractAssignee } = useContentMapper()
  ```

- [ ] **Step 3: 删除文件**

  ```bash
  rm src/composables/useContentMapper.ts
  ```

- [ ] **Step 4: 构建验证**

  ```bash
  npm run build:check
  ```
  预期：无错误（删除 import 后文件已无引用）

- [ ] **Step 5: 提交**

  ```bash
  git add -A
  git commit -m "refactor: 删除 useContentMapper（keyword 模式专用）"
  ```

---

## Task 5: 删除 keyword 专用函数并简化 generateReport

**Files:**
- Modify: `src/pages/HomePage.vue`

- [ ] **Step 1: 删除 buildChapters 函数（约第 538-580 行）**

  删除整个函数（含 JSDoc 注释）：
  ```ts
  /**
   * 根据 Excel 数据构建 7 个章节内容
   */
  function buildChapters(rows: ParsedExcelData['rows']): ChapterContent[] {
    // ... 整个函数体
  }
  ```

- [ ] **Step 2: 删除 splitContentBySections 函数（约第 622-675 行）**

  删除整个函数（含 JSDoc 注释）。

- [ ] **Step 3: 删除 mapSectionToChapter 函数（约第 677-739 行）**

  删除整个函数（含 JSDoc 注释）。

- [ ] **Step 4: 简化 generateReport 中的 else 分支（约第 516-521 行）**

  将：
  ```ts
  // 如果有归类结果（LLM 模式），使用归类结果构建章节
  if (classificationStore.state.result && classificationStore.state.result.items.length > 0) {
    const items = classificationStore.state.result.items as ClassificationItem[]
    chapters = buildChaptersFromClassification([...items])
    weekRange = classificationStore.state.result.rawData.length > 0
      ? classificationStore.state.result.rawData[0].time : ''
  } else {
    // 否则使用原始解析数据
    const rows = parsedData.value.rows
    chapters = buildChapters(rows)
    weekRange = rows.length > 0 ? rows[0].time : ''
  }
  ```
  改为：
  ```ts
  if (!classificationStore.state.result?.items?.length) {
    uploadError.value = '归类结果为空，请重新归类'
    currentStep.value = 3
    return
  }
  const items = classificationStore.state.result.items as ClassificationItem[]
  chapters = buildChaptersFromClassification([...items])
  weekRange = classificationStore.state.result.rawData.length > 0
    ? classificationStore.state.result.rawData[0].time : ''
  ```

- [ ] **Step 5: 构建验证**

  ```bash
  npm run build:check
  ```
  预期：无错误

- [ ] **Step 6: 运行单元测试**

  ```bash
  npm test
  ```
  预期：全部通过

- [ ] **Step 7: 提交**

  ```bash
  git add src/pages/HomePage.vue
  git commit -m "refactor: 删除 keyword 专用函数，简化 generateReport"
  ```

---

## 最终验证

```bash
# 确认无残留引用
grep -r "keyword\|parseMode\|LLMModeToggle\|useContentMapper\|ParseMode\|buildChapters\b\|splitContentBySections\|mapSectionToChapter" src/

# 构建
npm run build:check

# 测试
npm test
```

预期：grep 无结果（或只在 `buildChaptersFromClassification` 这类非 keyword 函数名中出现），构建通过，测试通过。
