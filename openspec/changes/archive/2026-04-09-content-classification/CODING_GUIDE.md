# 编码指南 - 内容归类功能

**创建日期**: 2026-04-03
**阶段**: Spec → Implementation
**功能**: Excel/Word 内容智能归类

---

## ⚠️ OpenSpec 规范核心原则

> **规范先行**：先写规范文档，再写代码。代码必须严格符合规范文档。

```
┌─────────────────────────────────────────────────────────────┐
│                  OpenSpec 规范开发流程                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. 编写规范文档（specs/）                                  │
│     └── 01-type-definitions.md                              │
│     └── 02-api-specifications.md                            │
│     └── 03-component-interfaces.md                          │
│                          ↓                                  │
│  2. 编写代码（src/）                                        │
│     └── 代码必须符合规范文档                                  │
│     └── 类型、接口、API 必须与规范一致                       │
│                          ↓                                  │
│  3. 验证代码                                                 │
│     └── npx openspec validate                               │
│     └── npm run typecheck                                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📚 OpenSpec CLI 命令

> ⚠️ **重要**：使用 OpenSpec CLI 命令进行项目管理，而不是 bash 命令。

### 1. 查看项目状态

```bash
# 列出所有变更
npx openspec list

# 列出所有规范
npx openspec list --specs

# 查看交互式仪表盘
npx openspec view

# 查看当前变更状态
npx openspec status --change content-classification
```

### 2. 查看规范和变更

```bash
# 查看变更详情
npx openspec show content-classification

# 查看规范详情
npx openspec show content-classification --type spec

# 查看特定规范文档
npx openspec show content-classification/specs/llm/01-type-definitions
```

### 3. 获取下一步指引

```bash
# 获取下一步指令
npx openspec instructions

# 获取特定 artifact 的指令
npx openspec instructions 01-type-definitions.md --change content-classification

# 查看可用模板
npx openspec templates --schema spec-driven
```

### 4. 校验

```bash
# 校验当前变更
npx openspec validate content-classification

# 校验所有变更和规范
npx openspec validate --all

# 严格校验
npx openspec validate content-classification --strict
```

---

## 📋 开发流程

### Day 1: 类型定义

**步骤 1**: 获取下一步指引

```bash
npx openspec instructions 01-type-definitions.md --change content-classification
```

**步骤 2**: 查看规范文档

```bash
# 查看类型定义规范
npx openspec show content-classification/specs/llm/01-type-definitions

# 查看 API 规范
npx openspec show content-classification/specs/llm/02-api-specifications

# 查看组件接口规范
npx openspec show content-classification/specs/llm/03-component-interfaces
```

**步骤 3**: 实现代码

按照规范文档编写代码文件：

- `src/types/classification.ts` - 归类类型定义
- `src/types/word.ts` - Word 生成类型定义

**步骤 4**: 校验

```bash
# OpenSpec 校验
npx openspec validate content-classification

# TypeScript 类型检查
npm run typecheck
```

---

### Day 2: API 实现

**步骤 1**: 获取指引

```bash
npx openspec instructions 02-api-specifications.md --change content-classification
```

**步骤 2**: 实现 API

按照 `02-api-specifications.md` 规范实现：

- `src/composables/useClassificationStore.ts` - 归类状态管理
- `src/composables/useWordGenerator.ts` - Word 生成

**步骤 3**: 校验

```bash
npx openspec validate content-classification
npm run test
```

---

### Day 3-4: 组件实现

**步骤 1**: 获取指引

```bash
npx openspec instructions 03-component-interfaces.md --change content-classification
```

**步骤 2**: 实现组件

按照 `03-component-interfaces.md` 规范实现：

- `src/components/classification/ClassificationPreview.vue`
- `src/components/classification/ClassificationEditor.vue`
- `src/components/classification/ClassificationList.vue`
- `src/components/classification/ClassificationItemCard.vue`
- `src/components/classification/ClassificationStats.vue`

**步骤 3**: 集成测试

```bash
npx openspec validate content-classification --all
npm run test
```

---

## 📦 代码与规范对应关系

```
规范文档                                              代码文件
─────────────────────────────────────────────────────────────────────────────

openspec/changes/content-classification/specs/llm/
├── 01-type-definitions.md      →  src/types/classification.ts
│                                →  src/types/word.ts
│
├── 02-api-specifications.md    →  src/composables/useClassificationStore.ts
│                                →  src/composables/useWordGenerator.ts
│
└── 03-component-interfaces.md
    →  src/components/classification/
       ├── ClassificationPreview.vue
       ├── ClassificationEditor.vue
       ├── ClassificationList.vue
       ├── ClassificationItemCard.vue
       └── ClassificationStats.vue
```

---

## 📝 OpenSpec 规范检查清单

### 类型定义检查

- [ ] 类型名称与 `01-type-definitions.md` 一致
- [ ] 字段名称与规范一致
- [ ] 字段类型与规范一致
- [ ] JSDoc 引用规范路径

### API 检查

- [ ] 函数名称与 `02-api-specifications.md` 一致
- [ ] 参数类型与规范一致
- [ ] 返回类型与规范一致

### 组件检查

- [ ] 组件名称与 `03-component-interfaces.md` 一致
- [ ] Props 与规范一致
- [ ] Emits 与规范一致
- [ ] Slots 与规范一致

---

## 🛠️ 常用命令汇总

### OpenSpec 命令

```bash
# 查看状态
npx openspec list                              # 列出变更
npx openspec list --specs                       # 列出规范
npx openspec status --change content-classification  # 查看状态

# 查看内容
npx openspec show content-classification        # 查看变更
npx openspec view                               # 交互式仪表盘

# 获取指引
npx openspec instructions                        # 下一步指引
npx openspec templates                           # 查看模板

# 校验
npx openspec validate content-classification     # 校验变更
npx openspec validate --all                      # 校验所有
```

### 代码检查命令

```bash
# TypeScript 类型检查
npm run typecheck

# ESLint
npm run lint

# 单元测试
npm run test

# 全部检查
npm run typecheck && npm run lint && npm run test
```

---

## 📊 开发任务清单

### Day 1: 类型定义

- [ ] `src/types/classification.ts`
  - [ ] ClassificationItem
  - [ ] ClassificationResult
  - [ ] ProductGroup
  - [ ] ClassificationStatus
  - [ ] StatusTag
  - [ ] ClassificationState

- [ ] `src/types/word.ts`
  - [ ] WordTemplate
  - [ ] WordExportOptions

### Day 2: API 实现

- [ ] `src/composables/useClassificationStore.ts`
  - [ ] setRawData()
  - [ ] classifyRows()
  - [ ] confirmItem()
  - [ ] updateItem()

- [ ] `src/composables/useWordGenerator.ts`
  - [ ] generate()
  - [ ] exportToFile()

### Day 3: 组件实现

- [ ] `ClassificationPreview.vue`
- [ ] `ClassificationList.vue`
- [ ] `ClassificationItemCard.vue`

### Day 4: 组件实现 + 测试

- [ ] `ClassificationEditor.vue`
- [ ] `ClassificationStats.vue`
- [ ] 集成测试
- [ ] Bug 修复

---

## ⚠️ 常见问题

### Q: 如何查看规范文档？

**A**: 使用 `npx openspec show` 命令：

```bash
npx openspec show content-classification/specs/llm/01-type-definitions
```

### Q: 规范和代码不一致怎么办？

**A**: 以规范为准，修改代码。规范是"宪法"，代码必须符合规范。

### Q: 如何确保代码符合规范？

**A**:
1. 写代码前使用 `npx openspec instructions` 获取指引
2. 写代码时对照规范文档
3. 写代码后使用 `npx openspec validate` 校验

### Q: 如何查看下一步该做什么？

**A**:

```bash
npx openspec instructions
npx openspec status --change content-classification
```

---

## ✅ 完成标准

- [ ] 所有代码符合规范文档
- [ ] `npx openspec validate` 通过
- [ ] `npm run typecheck` 通过
- [ ] `npm run lint` 通过
- [ ] `npm run test` 通过

---

## 📚 参考资源

- [OpenSpec CLI 文档](https://github.com/studyzy/OpenSpec-cn/blob/main/docs/cli.md)
- [项目能力清单](../../../../capabilities.md)
- [project.md](../../../../project.md)
- [变更 README.md](../../README.md)
- [项目主规范](../../specs/)

---

*本文档说明了如何使用 OpenSpec CLI 完成编码*
*遵循原则：规范先行，代码必须符合规范*
