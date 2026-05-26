# 快速安装指南

## 30秒快速开始

### 1. 复制技能文件夹

将整个 `weekly-report-feishu-manual` 文件夹复制到你的项目中：

```
你的项目/
└── skills/ 或 .trae/skills/
    └── weekly-report-feishu-manual/  ← 这个文件夹
        ├── SKILL.md
        ├── README.md
        ├── package.yaml
        └── examples/
```

### 2. 配置 lark-cli

确保已安装 `lark-cli` 并登录你的飞书账号：

```bash
# 检查是否安装
lark-cli --version

# 如果没有安装，安装方式参考飞书官方文档
```

### 3. 验证权限

确保你有访问以下飞书文档的权限：
- https://ecn7j0rosx4k.feishu.cn/wiki/M6U4wxsl6iH6EJkO4Jxc2MtwnPf?sheet=bee36a

### 4. 开始使用

重启你的 AI 助手，然后说："帮我生成周报"

---

## 文件结构说明

```
weekly-report-feishu-manual/
├── SKILL.md              # 技能核心配置和规则（必需）
├── README.md             # 使用说明文档
├── package.yaml          # 包信息文件
└── examples/             # 示例文件夹
    └── 2026-05-17-example.md  # 示例周报输出
```

## 导入方式

### Claude Code / Trae 用户

1. 将文件夹复制到项目根目录的 `.trae/skills/` 下
2. 重启编辑器，技能自动加载

### 其他 AI 助手

1. 将文件夹复制到项目的 `skills/` 目录
2. 按照你的 AI 助手文档说明导入技能

---

## 常见问题

**Q: 技能没有生效怎么办？**

A: 检查以下几点：
- 文件夹是否在正确的位置（`.trae/skills/` 或 `skills/`）
- `SKILL.md` 文件名是否正确
- 重启 AI 助手

**Q: 无法读取飞书数据？**

A: 检查：
- `lark-cli` 是否已登录
- 是否有访问飞书文档的权限

**Q: 周报保存到哪里？**

A: 默认保存到 `output/YYYY-MM-DD.md`，同时尝试保存到桌面

---

## 联系与反馈

如有问题或建议，请联系技能维护者。
