---
name: weekly-report-python
description: "从 Excel 文件或飞书电子表格生成产品周报的 Python 工具。支持智能 AI 过滤和分类，自动生成 Markdown 格式周报。当用户提到写周报、生成周报、从飞书生成周报时触发本 Skill。"
---

# 周报生成器 Skill

独立的 Python 周报生成工具，支持从飞书电子表格或本地 Excel 文件读取数据，直接生成周报。

## 功能特性

- **飞书数据源**: 直接从飞书电子表格读取，支持自动获取最新日期
- **Excel 解析**: 支持 .xlsx, .xls, .csv 格式
- **智能过滤**: 自动过滤需求调研、下周计划、跟进中等无效内容
- **AI 分类**: 支持 MiniMax API 进行智能分类
- **7大章节**: 自动归类到正确的业务章节
- **产品组映射**: 根据产品组自动映射到对应章节
- **Markdown 输出**: 生成规范的 Markdown 格式周报

## 数据源

### 飞书电子表格（推荐）

支持从飞书电子表格直接读取数据：

| Sheet 名称 | 对应产品组 |
|-----------|-----------|
| Sales组 | Sales组 |
| ERP组 | ERP组 |
| WMS组 | WMS组 |

**特点**：
- 自动获取最新日期的内容
- 只获取指定产品组的数据
- 无需手动导出 Excel

### Excel 文件

文件应包含以下三列：

| 列名 | 说明 |
|------|------|
| 会议时间点 | 时间信息，如"周一"、"2024-03-20" |
| 产品组 | 产品组/业务线名称 |
| 同步信息内容 | 具体的工作内容描述 |

## 7大业务章节（与 Vue 代码保持一致）

| 章节 | 关键词 | 产品组映射 |
|------|--------|-----------|
| 来福商城与卡册 | 来福、卡册、如意、C网 | SALES组 |
| 三方对接项目 | 三方对接、三方项目 | SALES组 |
| 采购与集采管理 | 采购管理、集采、SRM | ERP组 |
| 三方供应链 | 三方供应链、京东、丰享、盒马、华润、麦德龙 | ERP组 |
| 销售与财务管理 | 销售管理、异常单、财务管理、售后、特批、业绩、对账、授信 | ERP组 |
| 竞价平台与异常单 | 竞价平台、异常单、配品 | ERP组 |
| 履约监控与物流一体化 | 履约监控、物流一体化、WMSX、本网履约、快递、专车、人力包装 | WMS组 |

## 过滤规则（与 Vue 代码保持一致）

以下内容会被自动过滤（不出现在周报中）：

1. **需求相关**: 需求调研、需求分析阶段、需求确认中、需求评审中、PRD设计
2. **计划相关**: 下周计划、下周、下月、后续、以后、将来、未来
3. **进行中**: 跟进中、调研中、进行中、处理中、待确认、待讨论
4. **暂停**: 待评审、待排期、暂缓、暂停、停滞
5. **@人名**: @xxx 格式的人名标注会被删除
6. **括号内容**: 【】、（）、()、《》 括号内的内容会被过滤

## 使用方式

### 从飞书读取（推荐）

#### 方式一：使用 Wiki 链接

```
/weekly-report --lark-wiki "https://ecn7j0rosx4k.feishu.cn/wiki/M6U4wxsl6iH6EJkO4Jxc2MtwnPf"
```

#### 方式二：直接指定电子表格 Token

```
/weekly-report --lark-sheet "WFolsXhG0hLEA5tderVcTWHdnEb"
```

#### 指定产品组

默认获取 Sales组、ERP组、WMS组，可自定义：

```
/weekly-report --lark-sheet "TOKEN" --lark-groups "Sales组,ERP组"
```

#### 获取所有日期数据

默认只获取最新日期，添加 `--no-latest` 获取全部：

```
/weekly-report --lark-sheet "TOKEN" --no-latest
```

### 从 Excel 读取

```
/weekly-report input.xlsx
```

### 其他选项

```
# 指定输出目录
/weekly-report --lark-sheet "TOKEN" --output ~/Documents/周报

# 指定周报标题
/weekly-report --lark-sheet "TOKEN" --title "研发周报"

# 禁用 AI（使用关键词匹配）
/weekly-report --lark-sheet "TOKEN" --no-ai
```

## 输出示例

```markdown
# 产品周报

**周期**: 2024-03-18 ~ 2024-03-24

---

## 本周统计
- **总计**: 12 项
- **已完成**: 8 项
- **进行中**: 4 项

---

## 来福商城与卡册

- salespc任务调度中心额度处理导出文件新增表头-3.24已上线

- 来福商城优化-新增额度主码、额度模板一键回收权限修改

---

## 履约监控与物流一体化

- WMSX系统优化-新增履约成本统计功能-3.25上线

---

*Generated at 2024-03-24 15:30:00*
```

## 配置

### API Key 配置

#### 方式一：配置文件（推荐）

编辑 `config.yaml` 文件，填写你的 API Key：

```yaml
minimax:
  api_key: "your-api-key-here"
  base_url: "https://api.minimaxi.com/anthropic"
  model: "MiniMax-M2.7-highspeed"
```

#### 方式二：环境变量

```bash
export MINIMAX_API_KEY="your-api-key"
```

#### 方式三：命令行参数

```bash
/weekly-report --lark-sheet "TOKEN" --api-key "your-api-key"
```

**优先级**: 命令行参数 > 环境变量 > 配置文件

### 配置文件路径

默认路径: `~/.workbuddy/skills/weekly-report-python/config.yaml`

也可以通过环境变量指定：
```bash
export WEEKLY_REPORT_CONFIG="/path/to/config.yaml"
```

### 依赖安装

```bash
pip install pandas openpyxl anthropic
```

## 前置条件

使用飞书数据源前，需要：

1. **安装 lark-cli**:
   ```bash
   npm install -g lark-cli
   ```

2. **登录授权**:
   ```bash
   npx lark-cli auth login --domain sheets
   ```

## 文件结构

```
weekly-report-python/
├── SKILL.md              # Skill 配置
└── scripts/
    ├── weekly_report.py   # 主入口
    ├── excel_parser.py    # Excel 解析
    ├── lark_data_source.py # 飞书数据源
    ├── classifier.py      # AI 分类（与 Vue 代码保持一致）
    ├── report_generator.py # 周报生成
    └── config_loader.py   # 配置加载
```

## 常见问题

**Q: 飞书数据源无法连接？**
A: 确保已安装 `lark-cli` 并完成登录授权（见上方的"前置条件"）。

**Q: AI 分类失败怎么办？**
A: 使用 `--no-ai` 参数禁用 AI，程序会使用关键词匹配进行分类。

**Q: 过滤规则太严格？**
A: 当前规则与原 Vue 程序保持一致，如需调整请修改 `classifier.py` 中的 `FILTER_CONTENT_KEYWORDS`。

**Q: 如何自定义章节？**
A: 修改 `classifier.py` 中的 `CHAPTERS` 常量（与 Vue 代码保持一致）。

**Q: 如何获取飞书表格 Token？**
A: 从飞书表格 URL 中获取，例如：`https://ecn7j0rosx4k.feishu.cn/sheets/{TOKEN}`

**Q: 默认获取哪些产品组？**
A: 默认获取 Sales组、ERP组、WMS组，可通过 `--lark-groups` 参数自定义。

**Q: WMS组的内容在哪个章节？**
A: WMS组的内容自动映射到"履约监控与物流一体化"章节。
