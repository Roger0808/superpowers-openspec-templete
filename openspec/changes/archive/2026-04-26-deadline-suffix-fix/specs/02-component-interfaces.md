# Component Interfaces: deadline-suffix-fix

## No Changes

本次变更不修改任何组件接口。

变更涉及的代码位置：
- `EditorPage.vue` — 计算属性 `currentChapterContent`、函数 `generateExportContent`
- `useReportExporter.ts` — 函数 `generateMarkdown`

以上接口保持不变，本次仅删除内部实现中拼接 `deadline` 后缀的代码。
