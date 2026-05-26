#!/usr/bin/env python3
"""
周报生成器 - 主入口
独立运行的 Python 脚本，支持从 Excel 或飞书电子表格读取数据

用法:
    # 从飞书读取（推荐）
    python weekly_report.py --lark-wiki "https://ecn7j0rosx4k.feishu.cn/wiki/xxx"
    python weekly_report.py --lark-sheet "WFolsXhG0hLEA5tderVcTWHdnEb"

    # 从 Excel 读取
    python weekly_report.py input.xlsx

选项:
    --lark-wiki: 飞书 Wiki 链接（会自动解析为 spreadsheet token）
    --lark-sheet: 飞书电子表格 token（直接指定，跳过 Wiki 解析）
    --lark-groups: 要获取的产品组（逗号分隔，默认: Sales组,ERP组,WMS组）
    --no-latest: 不过滤最新日期，获取所有日期的数据
    --output, -o: 输出目录（默认: 当前目录）
    --filename, -f: 输出文件名（默认: 周报_YYYY-MM-DD.md）
    --title, -t: 周报标题（默认: 产品周报）
    --week-start: 周开始日期（默认: 自动计算）
    --week-end: 周结束日期（默认: 自动计算）
    --api-key: MiniMax API Key（默认: 环境变量）
    --no-ai: 禁用 AI 分类（使用关键词匹配）
    --open, --no-open: 生成后是否打开文件
    --help, -h: 显示帮助信息
"""

import argparse
import os
import sys
import re
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional, Tuple, List

SCRIPT_DIR = Path(__file__).parent.absolute()
sys.path.insert(0, str(SCRIPT_DIR))

try:
    from excel_parser import ExcelParser, ExcelRow
    from classifier import ContentClassifier, ClassifiedItem
    from report_generator import ReportGenerator, ReportOptions
    from config_loader import get_config
    from lark_data_source import LarkDataSource, parse_wiki_url, LarkRow
    HAS_LARK = True
except ImportError as e:
    print(f"[警告] 导入飞书模块失败: {e}")
    print("[警告] 将只支持 Excel 模式")
    HAS_LARK = False
    from excel_parser import ExcelParser, ExcelRow
    from classifier import ContentClassifier, ClassifiedItem
    from report_generator import ReportGenerator, ReportOptions
    from config_loader import get_config

_config = get_config()


def get_current_week_dates() -> tuple:
    """获取当前周的起止日期（周一到周日）"""
    today = datetime.now()
    monday = today - timedelta(days=today.weekday())
    sunday = monday + timedelta(days=6)
    return monday.strftime('%Y-%m-%d'), sunday.strftime('%Y-%m-%d')


def parse_lark_url(url: str) -> Tuple[str, Optional[str]]:
    """解析飞书 URL，返回 (token, sheet_id)"""
    sheet_id = None

    sheet_match = re.search(r'sheet=([a-zA-Z0-9]+)', url)
    if sheet_match:
        sheet_id = sheet_match.group(1)

    token_match = re.search(r'/wiki/([a-zA-Z0-9]+)', url)
    if not token_match:
        token_match = re.search(r'/sheets/([a-zA-Z0-9]+)', url)

    if token_match:
        wiki_token = token_match.group(1)
        if HAS_LARK:
            return parse_wiki_url(wiki_token)
        return wiki_token, sheet_id

    return url, sheet_id


def parse_args():
    """解析命令行参数"""
    parser = argparse.ArgumentParser(
        description='周报生成器 - 从 Excel 或飞书生成 Markdown 周报',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog='''
示例:
  # 飞书模式（推荐）
  python weekly_report.py --lark-wiki "https://ecn7j0rosx4k.feishu.cn/wiki/M6U4wxsl6iH6EJkO4Jxc2MtwnPf"
  python weekly_report.py --lark-sheet "WFolsXhG0hLEA5tderVcTWHdnEb" --lark-groups "Sales组,ERP组"

  # Excel 模式
  python weekly_report.py input.xlsx
  python weekly_report.py input.xlsx -o ~/Documents/周报
  python weekly_report.py input.xlsx -f 我的周报.md --title "研发周报"
  python weekly_report.py input.xlsx --no-ai  # 禁用 AI，使用关键词匹配
        '''
    )

    parser.add_argument('excel_file', nargs='?', help='Excel 文件路径（支持 .xlsx, .xls, .csv）')
    parser.add_argument('--lark-wiki', help='飞书 Wiki 链接（会覆盖 excel_file）')
    parser.add_argument('--lark-sheet', help='飞书电子表格 token（直接指定 spreadsheet token）')
    parser.add_argument('--lark-groups', default='Sales组,ERP组,WMS组',
                        help='要获取的产品组（逗号分隔，默认: Sales组,ERP组,WMS组）')
    parser.add_argument('--no-latest', action='store_true',
                        help='不过滤最新日期，获取所有日期的数据')
    parser.add_argument('--output', '-o', default=_config.get_default_output_dir(),
                        help='输出目录（默认: 配置文件中的值）')
    parser.add_argument('--filename', '-f', default='',
                        help='输出文件名（默认: 周报_YYYY-MM-DD.md）')
    parser.add_argument('--title', '-t', default='产品周报',
                        help='周报标题（默认: 产品周报）')
    parser.add_argument('--week-start', default='',
                        help='周开始日期（默认: 自动计算本周一）')
    parser.add_argument('--week-end', default='',
                        help='周结束日期（默认: 自动计算本周日）')
    parser.add_argument('--api-key', default='',
                        help='MiniMax API Key（默认: 环境变量 MINIMAX_API_KEY）')
    parser.add_argument('--model', default='MiniMax-M2.7-highspeed',
                        help='AI 模型（默认: MiniMax-M2.7-highspeed）')
    parser.add_argument('--no-ai', action='store_true',
                        help='禁用 AI 分类（使用关键词匹配）')
    parser.add_argument('--open', action='store_true', default=True,
                        help='生成后打开文件（默认: 打开）')
    parser.add_argument('--no-open', action='store_false', dest='open',
                        help='生成后不打开文件')

    return parser.parse_args()


def lark_to_excel_rows(lark_rows: List[LarkRow]) -> List[ExcelRow]:
    """将 LarkRow 转换为 ExcelRow"""
    excel_rows = []
    for row in lark_rows:
        excel_rows.append(ExcelRow(
            time=row.time,
            product_group=row.product_group,
            content=row.content
        ))
    return excel_rows


def main():
    """主函数"""
    args = parse_args()

    use_lark = bool(args.lark_wiki or args.lark_sheet)

    if use_lark and not HAS_LARK:
        print("错误: 飞书模块不可用，请确保 lark_data_source.py 存在")
        sys.exit(1)

    if use_lark:
        run_lark_mode(args)
    else:
        run_excel_mode(args)


def run_lark_mode(args):
    """飞书模式"""
    print("=" * 60)
    print("周报生成器 - 飞书数据源")
    print("=" * 60)

    if args.lark_wiki:
        spreadsheet_token, sheet_id = parse_lark_url(args.lark_wiki)
        if not spreadsheet_token:
            print("错误: 无法解析 Wiki 链接")
            sys.exit(1)
        print(f"Wiki 链接: {args.lark_wiki}")
    else:
        spreadsheet_token = args.lark_sheet
        sheet_id = None
        print(f"电子表格 Token: {spreadsheet_token}")

    groups = [g.strip() for g in args.lark_groups.split(',')]
    print(f"产品组: {', '.join(groups)}")
    print(f"自动获取最新日期: {'否' if args.no_latest else '是'}")

    output_dir = Path(args.output)
    output_dir.mkdir(parents=True, exist_ok=True)

    if not args.filename:
        date_str = datetime.now().strftime('%Y-%m-%d')
        args.filename = f"周报_{date_str}.md"
    output_path = output_dir / args.filename

    week_start = args.week_start or get_current_week_dates()[0]
    week_end = args.week_end or get_current_week_dates()[1]

    # API Key 优先级：命令行参数 > 环境变量 > 配置文件
    from config_loader import get_config
    config = get_config()
    api_key = args.api_key or os.environ.get('MINIMAX_API_KEY') or os.environ.get('ANTHROPIC_API_KEY') or config.get_api_key()

    print(f"输出文件: {output_path}")
    print(f"周报标题: {args.title}")
    print(f"周期: {week_start} ~ {week_end}")
    print(f"AI 模式: {'禁用' if args.no_ai else ('启用' if api_key else '无 API Key，使用关键词匹配')}")
    print("-" * 60)

    print("\n[1/3] 从飞书获取数据...")
    lark_source = LarkDataSource(spreadsheet_token)

    rows = lark_source.fetch_data(
        product_groups=groups,
        fetch_latest_only=not args.no_latest
    )

    if not rows:
        print("错误: 无法从飞书获取数据")
        sys.exit(1)

    latest_date = lark_source.get_latest_date(rows)
    print(f"成功获取 {len(rows)} 条数据")
    if latest_date:
        print(f"最新日期: {latest_date}")

    print("\n[2/3] 内容分类...")
    excel_rows = lark_to_excel_rows(rows)

    def on_progress(current, total, message):
        print(f"\r  进度: {current}/{total} - {message}", end='', flush=True)

    classifier = ContentClassifier(api_key=api_key, model=args.model)

    if args.no_ai:
        items = classifier.classify_with_keywords(excel_rows)
    else:
        items = classifier.classify_with_ai(excel_rows, on_progress=on_progress)

    print()
    print(f"分类完成: {len(items)} 条有效内容")

    print("\n[3/3] 生成周报...")

    options = ReportOptions(
        title=args.title,
        week_start=week_start,
        week_end=week_end,
        include_deadline=True,
        include_confidence=False
    )

    generator = ReportGenerator(options)
    report_content = generator.generate(items)

    if generator.save_to_file(report_content, str(output_path)):
        print(f"\n成功! 周报已生成: {output_path}")

        if args.open:
            try:
                if sys.platform == 'darwin':
                    os.system(f'open "{output_path}"')
                elif sys.platform == 'win32':
                    os.system(f'start "" "{output_path}"')
                else:
                    os.system(f'xdg-open "{output_path}"')
                print("已自动打开文件")
            except Exception as e:
                print(f"打开文件失败: {e}")
    else:
        print("\n错误: 生成周报失败")
        sys.exit(1)

    print("=" * 60)


def run_excel_mode(args):
    """Excel 模式"""
    if not args.excel_file:
        print("错误: 请指定 Excel 文件或使用 --lark-wiki 从飞书读取")
        print("用法: python weekly_report.py <excel_file> [options]")
        print("帮助: python weekly_report.py --help")
        sys.exit(1)

    excel_path = Path(args.excel_file)
    if not excel_path.exists():
        print(f"错误: 文件不存在: {excel_path}")
        sys.exit(1)

    if not args.filename:
        date_str = datetime.now().strftime('%Y-%m-%d')
        args.filename = f"周报_{date_str}.md"

    output_dir = Path(args.output)
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / args.filename

    week_start = args.week_start
    week_end = args.week_end
    if not week_start or not week_end:
        ws, we = get_current_week_dates()
        week_start = week_start or ws
        week_end = week_end or we

    api_key = args.api_key or os.environ.get('MINIMAX_API_KEY') or os.environ.get('ANTHROPIC_API_KEY')

    print("=" * 60)
    print("周报生成器")
    print("=" * 60)
    print(f"输入文件: {excel_path}")
    print(f"输出文件: {output_path}")
    print(f"周报标题: {args.title}")
    print(f"周期: {week_start} ~ {week_end}")
    print(f"AI 模式: {'禁用' if args.no_ai else ('启用' if api_key else '无 API Key，使用关键词匹配')}")
    print("-" * 60)

    print("\n[1/3] 解析 Excel 文件...")
    parser = ExcelParser(str(excel_path))
    rows = parser.parse()

    if not rows:
        print(f"错误: {parser.get_error()}")
        sys.exit(1)

    print(f"成功解析 {len(rows)} 条数据")

    print("\n[2/3] 内容分类...")

    def on_progress(current, total, message):
        print(f"\r  进度: {current}/{total} - {message}", end='', flush=True)

    classifier = ContentClassifier(api_key=api_key, model=args.model)

    if args.no_ai:
        items = classifier.classify_with_keywords(rows)
    else:
        items = classifier.classify_with_ai(rows, on_progress=on_progress)

    print()
    print(f"分类完成: {len(items)} 条有效内容")

    print("\n[3/3] 生成周报...")

    options = ReportOptions(
        title=args.title,
        week_start=week_start,
        week_end=week_end,
        include_deadline=True,
        include_confidence=False
    )

    generator = ReportGenerator(options)
    report_content = generator.generate(items)

    if generator.save_to_file(report_content, str(output_path)):
        print(f"\n成功! 周报已生成: {output_path}")

        if args.open:
            try:
                if sys.platform == 'darwin':
                    os.system(f'open "{output_path}"')
                elif sys.platform == 'win32':
                    os.system(f'start "" "{output_path}"')
                else:
                    os.system(f'xdg-open "{output_path}"')
                print("已自动打开文件")
            except Exception as e:
                print(f"打开文件失败: {e}")
    else:
        print("\n错误: 生成周报失败")
        sys.exit(1)

    print("=" * 60)


if __name__ == '__main__':
    main()
