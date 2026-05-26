# Tasks: remove-keyword-mode

## 1. 删除 LLMModeToggle.vue 及引用

- [x] 1.1 删除 `src/components/common/LLMModeToggle.vue` 文件
- [x] 1.2 从 `HomePage.vue` 移除 `import LLMModeToggle`
- [x] 1.3 从模板中移除 `<LLMModeToggle ... />` 及包裹 div（第 38-44 行）
- [x] 1.4 执行 `npm run build:check` 验证无错误

## 2. 移除 parseMode ref、ParseMode 类型及相关模板引用

- [x] 2.1 从 `HomePage.vue` 移除 `ParseMode` import（保留 `LLMStatus`、`LLMParseResult`）
- [x] 2.2 删除 `const parseMode = ref<ParseMode>('llm')` ref
- [x] 2.3 修复模板：`<p>AI 解析中...</p>`（移除三元表达式）
- [x] 2.4 移除 `ParseProgressBar` 上的 `v-if="parseMode === 'llm'"`
- [x] 2.5 简化步骤 2 提示文字为固定文本
- [x] 2.6 按钮文字固定为 `开始归类 ➡️`（移除三元表达式）
- [x] 2.7 从 `src/types/llm.ts` 删除 `ParseMode = 'keyword' | 'llm'` 类型
- [x] 2.8 执行 `npm run build:check` 验证无错误

## 3. 移除 handlePreviewConfirm 中的 keyword 分支

- [x] 3.1 删除 `handlePreviewConfirm` 中的 `if (parseMode.value === 'keyword')` 分支

## 4. 删除 useContentMapper.ts 及引用

- [x] 4.1 从 `HomePage.vue` 移除 `import { useContentMapper }`
- [x] 4.2 移除 `const { mapContentToChapter, identifyStatus, extractStatusText, extractDeadline, extractAssignee } = useContentMapper()`
- [x] 4.3 删除 `src/composables/useContentMapper.ts` 文件
- [x] 4.4 执行 `npm run build:check` 验证无错误

## 5. 删除 keyword 专用函数并简化 generateReport

- [x] 5.1 删除 `buildChapters` 函数
- [x] 5.2 删除 `splitContentBySections` 函数
- [x] 5.3 删除 `mapSectionToChapter` 函数
- [x] 5.4 简化 `generateReport` else 分支：改为无归类结果时显示错误并返回步骤 3
- [x] 5.5 执行 `npm run build:check` 验证无错误

## 6. 验证与测试

- [x] 6.1 运行 `npm run build:check` 构建验证
- [x] 6.2 运行 `npm test` 确保测试全绿
- [x] 6.3 确认无残留引用：`grep -r "keyword\|parseMode\|LLMModeToggle\|useContentMapper\|ParseMode" src/`

## 7. 提交与推送

- [x] 7.1 提交所有变更
- [x] 7.2 推送到远程
