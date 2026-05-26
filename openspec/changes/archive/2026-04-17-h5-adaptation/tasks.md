# H5 适配优化 - Tasks

**创建日期**: 2026-04-09
**变更**: h5-adaptation
**版本**: v1.0

---

## 1. 任务列表

### Phase 1: 基础设施

| 任务 | 说明 | 产出 | 状态 |
|------|------|------|------|
| 1.1 | 创建 Drawer 抽屉组件 | `src/components/common/Drawer.vue` | ✅ |

### Phase 2: 页面适配

| 任务 | 说明 | 产出 | 状态 |
|------|------|------|------|
| 2.1 | 首页 H5 适配 | `src/pages/HomePage.vue` | ✅ |
| 2.2 | 编辑页抽屉导航 | `src/pages/EditorPage.vue` | ✅ |
| 2.3 | 归类预览响应式 | `ClassificationPreview.vue` | ✅ |
| 2.4 | 归类统计响应式 | `ClassificationStats.vue` | ✅ |
| 2.5 | 归类编辑全屏弹窗 | `ClassificationEditor.vue` | ✅ |
| 2.6 | 导出面板优化 | `ExportPanel.vue` | ✅ |

### Phase 3: 验证

| 任务 | 说明 | 产出 | 状态 |
|------|------|------|------|
| 3.1 | 构建验证 | `npm run build` | ✅ |
| 3.2 | OpenSpec 归档 | `npx openspec archive h5-adaptation` | ⏳ |

---

## 2. 详细任务

### Task 1.1: Drawer 抽屉组件

**文件**: `src/components/common/Drawer.vue`

**功能**:
- 左侧滑出抽屉
- 遮罩层点击关闭
- 响应式宽度（小屏 85%）
- CSS transition 动画

**验收**:
- [x] 抽屉从左侧滑出
- [x] 遮罩点击关闭
- [x] 小屏宽度 85% 且最大 320px

---

### Task 2.1: 首页 H5 适配

**文件**: `src/pages/HomePage.vue`

**改动**:
- 按钮高度 44px
- 上传区域 padding 增大
- 日期选择器间距调整

**验收**:
- [x] 按钮触控区域 ≥ 44px
- [x] 上传区域边框明显
- [x] 间距舒适

---

### Task 2.2: 编辑页抽屉导航

**文件**: `src/pages/EditorPage.vue`

**改动**:
- 添加汉堡菜单按钮（小屏显示）
- 侧边栏改为隐藏（小屏）
- 复用 Drawer + ChapterNav

**验收**:
- [x] 小屏显示汉堡按钮
- [x] 点击汉堡打开抽屉
- [x] 抽屉内显示 7 章节导航
- [x] 章节选择后关闭抽屉
- [x] 桌面端保持原有布局

---

### Task 2.3: 归类预览响应式

**文件**: `src/components/classification/ClassificationPreview.vue`

**改动**:
- 过滤栏横向滚动
- 页脚按钮堆叠

**验收**:
- [x] 过滤栏可横向滚动
- [x] 页脚按钮垂直堆叠

---

### Task 2.4: 归类统计响应式

**文件**: `src/components/classification/ClassificationStats.vue`

**改动**:
- 统计卡片垂直堆叠

**验收**:
- [x] 小屏统计卡片垂直堆叠

---

### Task 2.5: 归类编辑全屏弹窗

**文件**: `src/components/classification/ClassificationEditor.vue`

**改动**:
- 小屏（< 480px）全屏弹窗
- 表单间距增大
- iOS 输入框 font-size 16px

**验收**:
- [x] 小屏全屏显示
- [x] 表单元素间距合适
- [x] 按钮触控区域 ≥ 44px

---

### Task 2.6: 导出面板优化

**文件**: `src/components/common/ExportPanel.vue`

**改动**:
- 85% 宽度面板（小屏）
- 全屏模式（< 480px）
- 按钮高度 48px
- 触控区域优化

**验收**:
- [x] 小屏面板宽度 85%
- [x] 全屏模式（< 480px）
- [x] 导出按钮触控区域 ≥ 44px

---

## 3. 提交历史

```
c8dc7f6 feat(export): 导出面板 H5 适配 - 全屏模式与触控优化
92d8b02 feat(classification): 归类编辑 H5 适配 - 全屏模态框
c9ed0fd feat(classification): 归类预览 H5 适配 - 响应式布局
bff534f feat(editor): 编辑页 H5 适配 - 抽屉式导航
72f84c3 feat(home): 首页 H5 适配 - 触控区域优化
d4a649f feat: 添加 Drawer 抽屉导航组件
```

---

## 4. 验证结果

| 验证项 | 结果 |
|--------|------|
| `npm run build` | ✅ 通过 |
| TypeScript 类型检查 | ✅ 通过 |
| Vite 构建 | ✅ 通过 |

---

## 5. 下一步

- [ ] 执行 `npx openspec archive h5-adaptation` 归档变更
- [ ] 合并到 main 分支

---

*本文档为 Tasks 阶段产出*
