# Tasks: deadline-suffix-fix

## Status: ✅ DONE

All tasks completed on branch `fix-deadline-suffix`.

---

## Task List

### Task 1: 确认 deadline 字段用途

- [x] `src/types/report.ts` — 确认 `deadline` 字段仅用于追加，不做它用
- [x] `useFilterRules.ts` — 确认日期过滤逻辑保留
- [x] 结论：`deadline` 字段本身保留，仅移除追加到内容的逻辑

### Task 2: 修复 EditorPage.vue — currentChapterContent

- [x] 删除已完成项目区域的 deadline 追加（行 185-187）
- [x] 删除进行中项目区域的 deadline 追加（行 197-199）
- [x] 删除计划中项目区域的 deadline 追加（行 209-211）
- [x] 提交：`fix: remove deadline suffix from currentChapterContent`

### Task 3: 修复 EditorPage.vue — generateExportContent

- [x] 删除已完成项目区域的 deadline 追加（行 302-304）
- [x] 删除进行中项目区域的 deadline 追加（行 314-316）
- [x] 删除计划中项目区域的 deadline 追加（行 326-328）
- [x] 提交：`fix: remove deadline suffix from generateExportContent`

### Task 4: 修复 useReportExporter.ts — generateMarkdown

- [x] 删除已完成项目区域的 deadline 追加（行 113-115）
- [x] 删除进行中项目区域的 deadline 追加（行 126-128）
- [x] 删除计划中项目区域的 deadline 追加（行 139-141）
- [x] 提交：`fix: remove deadline suffix from generateMarkdown`

### Task 5: 验证

- [x] `grep -r "\.deadline" EditorPage.vue useReportExporter.ts` — 无残留
- [x] `npm test` — 23/23 passing
- [x] TypeScript build — main 分支既有错误（无关本次修复）

---

## Commits

| Commit | Description |
|--------|-------------|
| `c7694ab` | fix: remove deadline suffix from generateMarkdown |

（一次提交合并了 EditorPage.vue 和 useReportExporter.ts 的所有修改）