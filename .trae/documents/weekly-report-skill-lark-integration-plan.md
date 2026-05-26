# weekly-report-python Skill 修改计划

## 需求概述

将周报生成 Skill 的输入源从本地 Excel 文件改为飞书文档/多维表格。

### 目标链接
- **URL**: `https://ecn7j0rosx4k.feishu.cn/wiki/M6U4wxsl6iH6EJkO4Jxc2MtwnPf?sheet=bee36a`
- **链接类型**: Wiki 链接，需要先解析为真实对象类型

### 数据要求
1. **自动获取最新日期的内容**
2. **只筛选以下产品组**:
   - SALES 组
   - ERP 组
   - WMS 组

---

## 实现步骤

### Step 1: 安装 lark-cli 并获取飞书文档结构

```bash
npm install -g lark-cli
```

解析 wiki 链接，确认文档类型（bitable/sheet/docx）

### Step 2: 分析飞书文档结构

读取文档/表格的字段结构，确定：
- 日期字段名称
- 产品组字段名称
- 内容字段名称
- 数据表名称

### Step 3: 修改 Skill 架构

#### 3.1 新增飞书数据源模块 `lark_data_source.py`

```python
"""
飞书数据源模块
从飞书文档/多维表格读取周报数据
"""

from typing import List, Optional
from dataclasses import dataclass
import subprocess
import json

@dataclass
class LarkRow:
    """从飞书读取的行数据"""
    time: str
    product_group: str
    content: str

class LarkDataSource:
    """飞书数据源"""

    def __init__(self, wiki_token: str, sheet_id: Optional[str] = None):
        self.wiki_token = wiki_token
        self.sheet_id = sheet_id

    def fetch_data(self, product_groups: List[str] = None) -> List[LarkRow]:
        """
        从飞书获取数据

        Args:
            product_groups: 要筛选的产品组列表，默认 ['SALES组', 'ERP组', 'WMS组']

        Returns:
            LarkRow 列表
        """
        # 1. 解析 wiki token 获取真实 obj_token
        node_info = self._get_node_info()

        # 2. 根据类型读取数据
        if node_info['obj_type'] == 'bitable':
            return self._fetch_from_bitable(node_info['obj_token'])
        elif node_info['obj_type'] == 'sheet':
            return self._fetch_from_sheet(node_info['obj_token'])
        else:
            raise ValueError(f"不支持的文档类型: {node_info['obj_type']}")

    def _get_latest_date_data(self, rows: List[LarkRow]) -> List[LarkRow]:
        """
        获取最新日期的数据
        逻辑：找到最新的"会议时间点"，返回该日期的所有记录
        """
        if not rows:
            return []

        # 解析所有日期，找到最大值
        dates = [self._parse_date(r.time) for r in rows if r.time]
        if not dates:
            return rows  # 没有日期时返回全部

        latest_date = max(dates)

        # 过滤出最新日期的记录
        return [r for r in rows if self._parse_date(r.time) == latest_date]

    def _filter_by_product_groups(self, rows: List[LarkRow], groups: List[str]) -> List[LarkRow]:
        """按产品组筛选"""
        return [r for r in rows if any(g in r.product_group for g in groups)]
```

#### 3.2 修改 `weekly_report.py` 主入口

添加飞书数据源参数：

```python
# 新增参数
parser.add_argument('--lark-wiki', help='飞书 Wiki 链接（会覆盖 excel_file）')
parser.add_argument('--lark-sheet', help='飞书表格 Sheet ID（配合 --lark-wiki 使用）')
parser.add_argument('--lark-groups', default='SALES组,ERP组,WMS组',
                    help='要筛选的产品组（逗号分隔，默认: SALES组,ERP组,WMS组）')
```

#### 3.3 修改主流程

```python
def main():
    args = parse_args()

    # 数据源选择
    if args.lark_wiki:
        # 使用飞书数据源
        from lark_data_source import LarkDataSource

        groups = [g.strip() for g in args.lark_groups.split(',')]
        lark_source = LarkDataSource(args.lark_wiki, args.lark_sheet)

        print("=" * 60)
        print("周报生成器 - 飞书数据源")
        print("=" * 60)

        print(f"\n[1/3] 从飞书获取数据...")
        rows = lark_source.fetch_data(product_groups=groups)

        # 自动获取最新日期
        print(f"\n[2/3] 筛选最新日期数据...")
        latest_rows = lark_source._get_latest_date_data(rows)
        print(f"最新日期共 {len(latest_rows)} 条记录")

        print(f"\n[3/3] 内容分类...")
        # ... 后续流程相同
    else:
        # 原有的 Excel 解析流程
        ...
```

### Step 4: 更新 SKILL.md 文档

新增飞书数据源使用说明：

```markdown
## 飞书数据源

### 从飞书多维表格/电子表格读取

```
/weekly-report --lark-wiki "https://ecn7j0rosx4k.feishu.cn/wiki/M6U4wxsl6iH6EJkO4Jxc2MtwnPf"
```

### 指定产品组筛选

默认筛选 SALES组、ERP组、WMS组，可自定义：

```
/weekly-report --lark-wiki "https://ecn7j0rosx4k.feishu.cn/wiki/xxx" --lark-groups "SALES组,ERP组"
```

### 自动获取最新日期

飞书数据源默认自动获取最新日期的内容，不需要额外参数。
```

---

## 文件修改清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `scripts/lark_data_source.py` | 新增 | 飞书数据源模块 |
| `scripts/weekly_report.py` | 修改 | 添加飞书参数和读取逻辑 |
| `SKILL.md` | 修改 | 新增飞书数据源使用说明 |
| `requirements.txt` | 修改 | 添加 subprocess（内置，无需添加）|

---

## 待确认事项

1. **文档类型**: 需要确认是 bitable（多维表格）还是 sheet（电子表格）
2. **字段名称**: 需要确认表格中的列名是否与原 Excel 一致
3. **日期格式**: 需要确认日期字段的格式，以便正确解析最新日期
4. **产品组值**: 确认 SALES组/ERP组/WMS组 在表格中的实际写法

---

## 依赖说明

本修改主要依赖 `lark-cli`，Python 层面不需要额外依赖。

```bash
# 安装 lark-cli
npm install -g lark-cli

# 用户需要先登录授权
lark-cli auth login --domain base  # 多维表格
lark-cli auth login --domain sheet # 电子表格
```
