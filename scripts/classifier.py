#!/usr/bin/env python3
"""
AI 分类模块
实现过滤规则和章节分类逻辑

重要：章节定义和映射规则严格按照 Vue 代码保持不变
"""

import re
import json
from typing import List, Dict, Optional, Any
from dataclasses import dataclass, asdict

try:
    import anthropic
    HAS_ANTHROPIC = True
except ImportError:
    HAS_ANTHROPIC = False

from excel_parser import ExcelRow
from config_loader import get_config

# 获取配置
_config = get_config()

# MiniMax API 配置（从配置文件读取）
MINIMAX_BASE_URL = _config.get_base_url()
MINIMAX_MODEL = _config.get_model()


# ============ 常量定义 - 完全按照 Vue 代码保持不变 ============

# 7个业务章节 - 严格按照 useLLMParser.ts 中的 CHAPTER_META 保持不变
CHAPTERS = [
    {
        "id": "chapter-1",
        "title": "来福商城与卡册",
        "keywords": ["来福", "卡册", "如意", "C网"],
        "productGroups": ["SALES 组"]
    },
    {
        "id": "chapter-2",
        "title": "三方对接项目",
        "keywords": ["三方对接", "三方项目"],
        "productGroups": ["SALES 组"]
    },
    {
        "id": "chapter-3",
        "title": "采购与集采管理",
        "keywords": ["采购管理", "集采", "SRM"],
        "productGroups": ["ERP 组"]
    },
    {
        "id": "chapter-4",
        "title": "三方供应链",
        "keywords": ["三方供应链", "京东", "丰享", "盒马", "华润", "麦德龙"],
        "productGroups": ["ERP 组"]
    },
    {
        "id": "chapter-5",
        "title": "销售与财务管理",
        "keywords": ["销售管理", "异常单", "财务管理", "售后", "特批", "业绩", "对账", "授信"],
        "productGroups": ["ERP 组"]
    },
    {
        "id": "chapter-6",
        "title": "竞价平台与异常单",
        "keywords": ["竞价平台", "异常单", "配品"],
        "productGroups": ["ERP 组"]
    },
    {
        "id": "chapter-7",
        "title": "履约监控与物流一体化",
        "keywords": ["履约监控", "物流一体化", "WMSX", "本网履约", "快递", "专车", "人力包装"],
        "productGroups": ["WMS 组"]
    }
]

# 需要过滤的分类关键词（在分类标题中出现就过滤整个分类下的条目）
FILTER_CATEGORY_KEYWORDS = [
    "需求调研阶段", "需求分析阶段", "调研阶段",
    "需求确认中", "需求评审中", "PRD设计中",
    "方案设计中", "售前阶段"
]

# 需要过滤的内容关键词 - 完全按照 contentFilter.ts 保持不变
FILTER_CONTENT_KEYWORDS = [
    "需求调研", "需求分析阶段", "需求调研中", "需求确认中", "需求评审中",
    "下周计划", "下周", "下月", "后续", "以后", "将来", "未来",
    "跟进中", "调研中", "进行中", "处理中",
    "待确认", "待讨论", "待评审", "待排期",
    "暂缓", "暂停", "停滞",
    "PRD设计"
]


@dataclass
class ClassifiedItem:
    """分类后的条目"""
    index: int
    chapter_id: str
    chapter_title: str
    status: str  # completed / in_progress / planned
    status_text: str  # [完结] / [变更] / [无变更] 等
    key_info: str
    deadline: str
    confidence: float
    product_group: str
    raw_content: str


class ContentClassifier:
    """内容分类器"""

    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        """
        初始化分类器

        Args:
            api_key: MiniMax API Key（优先级：参数 > 配置文件 > 环境变量）
            model: 模型名称（优先级：参数 > 配置文件）
        """
        self.api_key = api_key or _config.get_api_key()
        self.model = model or MINIMAX_MODEL

    def preprocess_content(self, content: str) -> str:
        """
        预处理内容：删除需要过滤的分类下的条目
        """
        lines = content.split('\n')
        processed_lines = []
        current_category = ''

        # 匹配分类标题的正则
        category_pattern = re.compile(r'^[\d一二三四五六七]+[.、]\s*(.+?)\s*$')

        for line in lines:
            trimmed_line = line.strip()
            if not trimmed_line:
                continue

            # 检查是否是分类标题
            category_match = category_pattern.match(trimmed_line)
            if category_match:
                title = category_match.group(1).strip()
                # 检查这个分类是否需要过滤
                should_filter = any(kw in title for kw in FILTER_CATEGORY_KEYWORDS)
                if should_filter:
                    current_category = '__FILTER__' + title
                    print(f"[Classifier] 预处理过滤分类: {title}")
                else:
                    current_category = title
                continue

            # 如果当前分类被标记为过滤，跳过所有条目
            if current_category.startswith('__FILTER__'):
                continue

            processed_lines.append(trimmed_line)

        return '\n'.join(processed_lines)

    def contains_filter_keyword(self, content: str) -> bool:
        """检查内容是否包含需要过滤的关键词 - 完全按照 Vue 规则"""
        return any(keyword in content for keyword in FILTER_CONTENT_KEYWORDS)

    def remove_at_mentions(self, content: str) -> str:
        """删除 @xxx 格式的人名标注 - 完全按照 Vue 规则"""
        # 删除 @xxx 格式
        content = re.sub(r'@[\w\u4e00-\u9fff]+', '', content)
        return content.strip()

    def remove_parenthetical(self, content: str) -> str:
        """过滤括号内的内容 - 完全按照 Vue 规则"""
        # 过滤中文括号【】
        content = re.sub(r'【[^】]*】', '', content)
        # 过滤中文括号（）
        content = re.sub(r'（[^）]*）', '', content)
        # 过滤英文括号()
        content = re.sub(r'\([^)]*\)', '', content)
        # 过滤中文书名号《》
        content = re.sub(r'《[^》]*》', '', content)
        return content.strip()

    def classify_content(self, content: str, product_group: str) -> str:
        """
        根据内容判断属于哪个章节（简单关键词匹配）
        严格按照 Vue 代码逻辑：优先根据产品组映射，其次根据关键词
        """
        # 第一步：根据产品组映射（优先按照 Vue 代码的 productGroups 规则）
        chapter_id = self._guess_chapter_from_product_group(product_group)
        if chapter_id:
            return chapter_id

        # 第二步：根据关键词匹配
        content_lower = content.lower()
        for chapter in CHAPTERS:
            for keyword in chapter['keywords']:
                if keyword in content_lower or keyword in content:
                    return chapter['id']

        # 默认返回第一章
        return 'chapter-1'

    def _guess_chapter_from_product_group(self, product_group: str) -> Optional[str]:
        """
        根据产品组名称映射章节 - 严格按照 Vue 代码的 productGroups 规则
        WMS 组必须映射到 chapter-7（履约监控与物流一体化）
        """
        group_normalized = product_group.strip().lower()

        # 严格按照 Vue 代码的 productGroups 映射
        for chapter in CHAPTERS:
            for pg in chapter.get('productGroups', []):
                pg_normalized = pg.strip().lower()
                # 匹配：例如 "Sales组" 匹配 "SALES 组"
                if pg_normalized in group_normalized or group_normalized in pg_normalized:
                    return chapter['id']

        # 额外的匹配规则，确保 WMS 组的内容在履约监控章节
        if any(kw in group_normalized for kw in ['wms', 'wmsx', '履约', '物流', '快递', '专车']):
            return 'chapter-7'

        return None

    def extract_deadline(self, content: str) -> str:
        """提取日期信息"""
        # 匹配各种日期格式
        patterns = [
            r'(\d{1,2}[/.]\d{1,2})',  # 3.24, 4.2, 2024/3/24
            r'(\d{1,2}月\d{1,2}日)',  # 3月24日
            r'(预计\d{1,2}月\d{0,2}初?)',  # 预计4月初
            r'(本周|\d{1,2}周后)',  # 本周, 2周后
        ]

        for pattern in patterns:
            match = re.search(pattern, content)
            if match:
                return match.group(1)

        return ''

    def build_system_prompt(self) -> str:
        """构建系统提示词 - 严格按照 Vue 代码保持一致"""
        # 严格按照 Vue 代码的格式：数字索引 + 标题 (ID)
        chapter_list = '\n'.join([
            f'{idx + 1}. {ch["title"]} ({ch["id"]})'
            for idx, ch in enumerate(CHAPTERS)
        ])

        return f"""你是一个专业的周报解析助手。你的任务是：
1. 将产品组的内容分类到正确的周报章节
2. 识别内容状态（已完成[completed]、进行中[in_progress]、计划中[planned]）
3. 提取状态标签（如[完结]、[无变更]、[新增]）
4. 提取截止时间和负责人（如有）

可用章节：
{chapter_list}

请用 JSON 格式返回结果：
{{"chapterId": "chapter-X", "chapterTitle": "章节标题", "status": "completed|in_progress|planned", "statusText": "状态标签", "deadline": "截止时间（如有）", "assignee": "负责人（如有）", "confidence": 0.0-1.0, "processedContent": "处理后的内容"}}

注意：
- 只返回 JSON，不要有其他文字
- 如果无法确定章节，返回 chapter-1
- deadline 只提取时间点，不需要"上线"等动词
- WMS组的内容必须分类到 chapter-7（履约监控与物流一体化）
- 根据产品组进行章节映射：
  - SALES 组 → chapter-1 或 chapter-2
  - ERP 组 → chapter-3、chapter-4、chapter-5 或 chapter-6
  - WMS 组 → chapter-7"""

    def classify_with_ai(self, rows: List[ExcelRow], on_progress: Optional[callable] = None) -> List[ClassifiedItem]:
        """
        使用 AI 进行分类

        Args:
            rows: ExcelRow 列表
            on_progress: 进度回调 (current, total, message)

        Returns:
            ClassifiedItem 列表
        """
        if not self.api_key:
            print("[Classifier] 未配置 API Key，使用关键词匹配进行分类")
            return self.classify_with_keywords(rows)

        if not HAS_ANTHROPIC:
            print("[Classifier] 未安装 anthropic 库，使用关键词匹配进行分类")
            return self.classify_with_keywords(rows)

        all_items = []
        system_prompt = self.build_system_prompt()

        for i, row in enumerate(rows):
            if on_progress:
                on_progress(i + 1, len(rows), f"正在处理: {row.product_group}")

            # 预处理内容 - 按照 Vue 规则
            processed_content = self.preprocess_content(row.content)
            processed_content = self.remove_at_mentions(processed_content)
            processed_content = self.remove_parenthetical(processed_content)

            # 构建用户内容
            user_content = f"时间: {row.time}\n产品组: {row.product_group}\n内容: {processed_content}"

            try:
                # 调用 AI (MiniMax Anthropic 兼容接口)
                client = anthropic.Anthropic(
                    api_key=self.api_key,
                    base_url=MINIMAX_BASE_URL
                )
                response = client.messages.create(
                    model=self.model,
                    max_tokens=16384,
                    system=system_prompt,
                    messages=[
                        {"role": "user", "content": user_content}
                    ]
                )

                # 解析响应 (MiniMax 返回 content 数组，可能包含 thinking 和 text)
                content = ''
                if response.content:
                    for block in response.content:
                        # 跳过 thinking 块，只处理 text 块
                        if hasattr(block, 'text') and block.text:
                            content = block.text
                            break
                items = self._parse_ai_response(content, row, i)

                # 过滤
                for item in items:
                    if not self.contains_filter_keyword(item.key_info):
                        all_items.append(item)
                    else:
                        print(f"[Classifier] 后处理过滤: {item.key_info[:50]}...")

            except Exception as e:
                print(f"[Classifier] AI 分类失败: {e}，使用关键词匹配")
                items = self.classify_single_with_keywords(row, i)
                for item in items:
                    if not self.contains_filter_keyword(item.key_info):
                        all_items.append(item)

        return all_items

    def _parse_ai_response(self, content: str, row: ExcelRow, row_index: int) -> List[ClassifiedItem]:
        """解析 AI 响应 - 严格按照 Vue 代码的返回格式"""
        items = []

        # 清理 JSON
        content = content.replace('```json\n', '').replace('```\n', '').replace('```', '').strip()

        # 提取 JSON - Vue 代码返回的是单个对象，不是数组
        try:
            data = json.loads(content)

            # 如果是数组，取第一个元素；如果是对象，直接使用
            if isinstance(data, list):
                item_data = data[0] if data else {}
            else:
                item_data = data

            # 如果为空，返回空列表
            if not item_data:
                print(f"[Classifier] AI 响应为空")
                return []

            chapter_id = item_data.get('chapterId', self._guess_chapter_from_product_group(row.product_group) or 'chapter-1')
            chapter_title = item_data.get('chapterTitle', row.product_group)
            status = item_data.get('status', 'completed')
            status_text = item_data.get('statusText', '[完结]')
            key_info = item_data.get('processedContent', row.content)
            deadline = item_data.get('deadline', '')
            confidence = item_data.get('confidence', 0.5)

            items.append(ClassifiedItem(
                index=row_index,
                chapter_id=chapter_id,
                chapter_title=chapter_title,
                status=status,
                status_text=status_text,
                key_info=key_info,
                deadline=deadline,
                confidence=confidence,
                product_group=row.product_group,
                raw_content=row.content
            ))

        except json.JSONDecodeError as e:
            print(f"[Classifier] JSON 解析失败: {e}")
            # 尝试提取数组
            array_match = re.search(r'\[[\s\S]*\]', content)
            if array_match:
                try:
                    items_list = json.loads(array_match.group(0))
                    if isinstance(items_list, list) and items_list:
                        item_data = items_list[0]
                        chapter_id = item_data.get('chapterId', self._guess_chapter_from_product_group(row.product_group) or 'chapter-1')
                        chapter_title = item_data.get('chapterTitle', row.product_group)
                        items.append(ClassifiedItem(
                            index=row_index,
                            chapter_id=chapter_id,
                            chapter_title=chapter_title,
                            status=item_data.get('status', 'completed'),
                            status_text=item_data.get('statusText', '[完结]'),
                            key_info=item_data.get('processedContent', row.content),
                            deadline=item_data.get('deadline', ''),
                            confidence=item_data.get('confidence', 0.5),
                            product_group=row.product_group,
                            raw_content=row.content
                        ))
                except json.JSONDecodeError:
                    print(f"[Classifier] JSON 数组解析也失败")

        return items

    def parse_items_from_content(self, content: str) -> List[str]:
        """
        从内容中解析出多个条目
        支持格式：
        - 条目1
        - 条目2
        1. 条目1
        2. 条目2
        """
        lines = content.split('\n')
        items = []
        current_item = []

        for line in lines:
            line = line.strip()
            if not line:
                continue

            # 检查是否是新条目的开始（以 - 或数字. 开头）
            is_new_item = bool(re.match(r'^[\-\*\+]|^\d+[.、]', line))

            if is_new_item:
                # 保存之前的条目
                if current_item:
                    items.append('\n'.join(current_item))
                current_item = [line]
            else:
                # 继续当前条目
                current_item.append(line)

        # 保存最后一个条目
        if current_item:
            items.append('\n'.join(current_item))

        return items

    def classify_with_keywords(self, rows: List[ExcelRow]) -> List[ClassifiedItem]:
        """
        使用关键词匹配进行分类（无 AI 时备用）
        解析每个产品组内的多个条目，对每个条目单独过滤和分类
        严格按照 Vue 代码的过滤和映射规则
        """
        all_items = []
        item_index = 0

        for row in rows:
            # 预处理整个内容 - 按照 Vue 规则
            processed_content = self.preprocess_content(row.content)
            processed_content = self.remove_at_mentions(processed_content)
            processed_content = self.remove_parenthetical(processed_content)

            # 解析出多个条目
            items = self.parse_items_from_content(processed_content)

            for item_content in items:
                item_content = item_content.strip()
                if not item_content:
                    continue

                # 检查过滤
                if self.contains_filter_keyword(item_content):
                    print(f"[Classifier] 关键词过滤: {item_content[:50]}...")
                    continue

                # 分类 - 严格按照 Vue 规则，优先产品组映射
                chapter_id = self.classify_content(item_content, row.product_group)
                chapter_info = next((ch for ch in CHAPTERS if ch['id'] == chapter_id), CHAPTERS[0])

                # 提取日期
                deadline = self.extract_deadline(item_content)

                # 判断状态
                status = 'completed' if any(kw in item_content for kw in ['已上线', '已发布', '已完成', '已完结', '上线']) else 'in_progress'
                status_text = '[完结]' if status == 'completed' else '[变更]'

                # 清理条目内容（移除开头的 - 或数字.）
                clean_content = re.sub(r'^[\-\*\+]\s*|^\d+[.、]\s*', '', item_content)

                all_items.append(ClassifiedItem(
                    index=item_index,
                    chapter_id=chapter_id,
                    chapter_title=chapter_info['title'],
                    status=status,
                    status_text=status_text,
                    key_info=clean_content,
                    deadline=deadline,
                    confidence=0.7,
                    product_group=row.product_group,
                    raw_content=row.content
                ))
                item_index += 1

        return all_items

    def classify_single_with_keywords(self, row: ExcelRow, index: int) -> List[ClassifiedItem]:
        """对单行数据进行关键词分类"""
        return self.classify_with_keywords([row])


def classify_content(rows: List[ExcelRow], api_key: Optional[str] = None) -> List[ClassifiedItem]:
    """
    便捷函数：对内容进行分类

    Args:
        rows: ExcelRow 列表
        api_key: API Key

    Returns:
        ClassifiedItem 列表
    """
    classifier = ContentClassifier(api_key=api_key)
    return classifier.classify_with_ai(rows)


if __name__ == '__main__':
    # 测试代码
    from excel_parser import ExcelRow, parse_excel

    test_rows = [
        ExcelRow(
            time="2024-03-20",
            product_group="SALES 组",
            content="1. 来福商城与卡册\n- salespc任务调度中心额度处理导出文件新增表头-3.24已上线\n- 来福商城优化-新增额度主码、额度模板一键回收权限修改-4.2上线"
        ),
        ExcelRow(
            time="2024-03-20",
            product_group="ERP 组",
            content="1. 采购与集采管理\n- SRM系统新增供应商准入流程-开发中\n- 商品池优化-新增批量导入功能-4.5上线"
        ),
        ExcelRow(
            time="2024-03-20",
            product_group="WMS 组",
            content="1. 履约监控与物流一体化\n- WMSX系统优化-新增履约成本统计功能-3.25上线\n- 快递对接优化-新增多家快递公司支持-4.1上线"
        )
    ]

    classifier = ContentClassifier()
    items = classifier.classify_with_keywords(test_rows)

    print(f"\n分类结果 ({len(items)} 条):\n")
    for item in items:
        print(f"- [{item.chapter_title}] {item.status_text} {item.key_info[:50]}...")
