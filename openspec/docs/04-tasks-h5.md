# 任务分解 - H5 适配优化

**创建日期**: 2026-04-09
**阶段**: Tasks
**迭代**: 二次迭代 - H5 适配优化

---

## 1. 任务列表

### Phase 1: 基础设施

| 任务 | 说明 | 产出 |
|------|------|------|
| 1.1 | 创建 Drawer 抽屉组件 | `src/components/common/Drawer.vue` |

### Phase 2: 页面适配

| 任务 | 说明 | 产出 |
|------|------|------|
| 2.1 | 首页 H5 适配 | `src/pages/HomePage.vue` |
| 2.2 | 编辑页抽屉导航 | `src/pages/EditorPage.vue` |
| 2.3 | 归类预览响应式 | `ClassificationPreview.vue` |
| 2.4 | 归类编辑全屏弹窗 | `ClassificationEditor.vue` |
| 2.5 | 导出面板优化 | `ExportPanel.vue` |

### Phase 3: 验证

| 任务 | 说明 | 产出 |
|------|------|------|
| 3.1 | 构建验证 | `npm run build` |
| 3.2 | Lint 检查 | `npm run lint` |

---

## 2. 详细任务

### Task 1.1: Drawer 抽屉组件

**文件**: `src/components/common/Drawer.vue`

**功能**:
- 左侧滑出抽屉
- 遮罩层点击关闭
- 响应式宽度（小屏 85%）
- 动画过渡

**验收**:
- [ ] 抽屉从左侧滑出
- [ ] 遮罩点击关闭
- [ ] 小屏宽度 85% 且最大 320px

---

### Task 2.1: 首页 H5 适配

**文件**: `src/pages/HomePage.vue`

**改动**:
- 按钮高度 44px
- 上传区域 padding 增大
- 日期选择器间距调整

**验收**:
- [ ] 按钮触控区域 ≥ 44px
- [ ] 上传区域边框明显
- [ ] 间距舒适

---

### Task 2.2: 编辑页抽屉导航

**文件**: `src/pages/EditorPage.vue`

**改动**:
- 添加汉堡菜单按钮（小屏显示）
- 侧边栏改为抽屉组件
- 抽屉内复用 ChapterNav

**验收**:
- [ ] 小屏显示汉堡按钮
- [ ] 点击汉堡打开抽屉
- [ ] 抽屉内显示 7 章节导航
- [ ] 章节选择后关闭抽屉
- [ ] 桌面端保持原有布局

---

### Task 2.3: 归类预览响应式

**文件**: `src/components/classification/ClassificationPreview.vue`

**改动**:
- 统计卡片响应式
- 过滤栏横向滚动
- 卡片 grid 响应式

**验收**:
- [ ] 小屏统计卡片垂直堆叠
- [ ] 过滤栏可横向滚动
- [ ] 卡片自动换行
- [ ] 无横向滚动

---

### Task 2.4: 归类编辑全屏弹窗

**文件**: `src/components/classification/ClassificationEditor.vue`

**改动**:
- 小屏（< 480px）全屏弹窗
- 表单间距增大
- 按钮高度 48px

**验收**:
- [ ] 小屏全屏显示
- [ ] 表单元素间距合适
- [ ] 按钮触控区域 ≥ 44px

---

### Task 2.5: 导出面板优化

**文件**: `src/components/common/ExportPanel.vue`

**改动**:
- 格式卡片垂直堆叠
- 导出按钮高度 48px

**验收**:
- [ ] 小屏卡片垂直堆叠
- [ ] 导出按钮触控区域 ≥ 44px

---

### Task 3.1: 构建验证

```bash
npm run build
```

---

### Task 3.2: Lint 检查

```bash
npm run lint
```

---

## 3. 提交规范

每个任务完成后单独提交，格式：
```
feat(<页面>): <简短描述>
```

示例：
```
feat(home): 首页 H5 适配 - 触控区域优化
```

最后验证完成后提交汇总：
```
feat: 完成 5 个页面 H5 适配优化
```

---

*本文档为 Tasks 阶段产出*
