# Test Specifications: deadline-suffix-fix

## No New Tests Required

本次变更是纯删除操作（删除 deadline 后缀拼接代码），现有测试套件应覆盖。

### 验证方式

```bash
# 1. 确认无 deadline 追加残留
grep -r "\.deadline" src/pages/EditorPage.vue src/composables/useReportExporter.ts
# 预期：无匹配

# 2. 单元测试通过
npm test
# 预期：所有测试通过

# 3. TypeScript 类型检查
npm run build:check
# 预期：类型检查通过
```

### 测试覆盖

现有测试应覆盖：
- 周报内容生成逻辑
- 导出功能

本次删除不影响测试覆盖范围。
