"""
招标数据自动去重、分类、标签筛选处理脚本
适用场景：绿电微网公司招投标线索初筛
"""

import csv
import os
import sys
import io
import re
from datetime import datetime
from collections import defaultdict

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

# ─── 分类规则配置 ───────────────────────────────────────────────

CATEGORY_RULES = {
    "光储充一体化": ["光储充", "光储充一体化"],
    "直流微网": ["直流", "微网", "微电网", "柔性直流", "直流母线"],
    "充电桩": ["充电桩", "充换电", "充电站", "有序充电"],
    "储能": ["储能", "电池", "削峰填谷", "储能系统"],
    "光伏": ["光伏", "分布式光伏", "太阳能", "屋顶光伏"],
    "数据中心供电": ["数据中心", "算力中心", "机房", "UPS", "供电系统"],
    "园区电力改造": ["园区", "配电改造", "节能改造", "能源管理"],
}

HIGH_PRIORITY_KEYWORDS = ["数据中心", "直流微网", "光储充", "零碳园区", "柔性直流"]
REQUIRED_FIELDS = ["project_name", "buyer", "publish_date", "notice_type", "link", "description"]
PROJECT_TYPE_PRIORITY = ["数据中心供电", "直流微网", "光储充一体化", "充电桩", "储能", "光伏", "园区电力改造"]


def normalize_text(value):
    """统一中英文大小写、空白和常见分隔符，提升匹配稳定性"""
    text = str(value or "").strip().lower()
    text = re.sub(r"\s+", "", text)
    text = re.sub(r"[，。；;、,.\-_/|（）()【】\\[\\]：:]", "", text)
    return text


def format_date(value):
    """把常见日期格式统一为 YYYY-MM-DD，无法识别时保留原值"""
    raw = str(value or "").strip()
    if not raw:
        return ""

    for pattern in ("%Y-%m-%d", "%Y/%m/%d", "%Y.%m.%d", "%Y年%m月%d日"):
        try:
            return datetime.strptime(raw, pattern).strftime("%Y-%m-%d")
        except ValueError:
            continue
    return raw


def validate_fields(rows):
    """检查输入 CSV 是否包含必要字段"""
    if not rows:
        raise ValueError("输入文件为空，请先准备招标样例数据")
    missing = [field for field in REQUIRED_FIELDS if field not in rows[0]]
    if missing:
        raise ValueError(f"输入文件缺少必要字段：{', '.join(missing)}")


def load_csv(filepath):
    """读取 CSV 文件，返回字典列表"""
    rows = []
    with open(filepath, "r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            rows.append(row)
    validate_fields(rows)
    return rows


def deduplicate(rows):
    """基于 project_name + buyer + link 三字段联合去重"""
    seen = set()
    unique_rows = []
    duplicates_removed = 0
    for row in rows:
        key = (
            normalize_text(row["project_name"]),
            normalize_text(row["buyer"]),
            normalize_text(row["link"]),
        )
        if key not in seen:
            seen.add(key)
            unique_rows.append(row)
        else:
            duplicates_removed += 1
    return unique_rows, duplicates_removed


def pick_project_type(matched_categories):
    """按绿电微网业务优先级选择主分类"""
    for category in PROJECT_TYPE_PRIORITY:
        if category in matched_categories:
            return category
    return matched_categories[0] if matched_categories else "其他/待人工分类"


def classify_project(row):
    """对单条记录进行分类、打标签、定优先级"""
    text = normalize_text(row["project_name"] + " " + row["description"])

    # 匹配标签
    matched_tags = []
    matched_categories = []
    for category, keywords in CATEGORY_RULES.items():
        for kw in keywords:
            if normalize_text(kw) in text:
                if category not in matched_categories:
                    matched_categories.append(category)
                if kw not in matched_tags:
                    matched_tags.append(kw)

    # 确定主分类
    project_type = pick_project_type(matched_categories)

    # 优先级判定
    high_hit = any(normalize_text(kw) in text for kw in HIGH_PRIORITY_KEYWORDS)
    if len(matched_categories) >= 2 or high_hit:
        priority = "高"
        reason = f"命中 {len(matched_categories)} 个核心标签：{'、'.join(matched_categories)}"
        if high_hit:
            reason += "；含高优关键词"
    elif len(matched_categories) == 1 and len(matched_tags) >= 2:
        priority = "中"
        reason = f"命中标签「{matched_categories[0]}」，描述明确"
    elif len(matched_categories) == 1:
        priority = "中"
        reason = f"命中标签「{matched_categories[0]}」"
    else:
        priority = "低"
        reason = "未命中核心标签，建议人工复核"

    return {
        "project_type": project_type,
        "tags": "、".join(matched_tags) if matched_tags else "无",
        "priority": priority,
        "reason": reason,
    }


def save_csv(rows, filepath):
    """保存处理结果到 CSV"""
    if not rows:
        print("⚠️ 无数据可保存")
        return

    fieldnames = [
        "project_name", "buyer", "publish_date", "notice_type",
        "link", "description", "project_type", "tags", "priority", "reason"
    ]

    with open(filepath, "w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for row in rows:
            row["publish_date"] = format_date(row.get("publish_date"))
            writer.writerow(row)


def print_summary(results):
    """打印处理摘要"""
    priority_count = defaultdict(int)
    category_count = defaultdict(int)
    for row in results:
        priority_count[row["priority"]] += 1
        category_count[row["project_type"]] += 1

    print("\n" + "=" * 50)
    print("📊 处理结果摘要")
    print("=" * 50)
    print(f"\n📋 有效记录数：{len(results)}")
    print("\n🏷️  分类分布：")
    for cat, count in category_count.items():
        print(f"   {cat}：{count} 条")
    print("\n🚦 优先级分布：")
    for p in ["高", "中", "低"]:
        print(f"   {p}优先级：{priority_count.get(p, 0)} 条")
    print("\n" + "=" * 50)


def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    input_file = os.path.join(script_dir, "sample_tender_data.csv")
    output_file = os.path.join(script_dir, "processed_tender_data.csv")

    print("🚀 开始处理招标数据...")
    print(f"   输入文件：{input_file}")

    # 1. 加载数据
    rows = load_csv(input_file)
    print(f"   原始记录数：{len(rows)}")

    # 2. 去重
    unique_rows, dup_count = deduplicate(rows)
    print(f"   去重后记录数：{len(unique_rows)}（移除 {dup_count} 条重复）")

    # 3. 分类 + 打标签 + 定优先级
    results = []
    for row in unique_rows:
        classification = classify_project(row)
        merged = {**row, **classification}
        results.append(merged)

    # 4. 按优先级排序（高 > 中 > 低）
    priority_order = {"高": 0, "中": 1, "低": 2}
    results.sort(key=lambda x: priority_order.get(x["priority"], 99))

    # 5. 保存结果
    save_csv(results, output_file)
    print(f"\n✅ 处理完成！结果已保存到：{output_file}")

    # 6. 打印摘要
    print_summary(results)

    # 7. 打印详细结果
    print("\n📝 详细处理结果：")
    print("-" * 50)
    for i, row in enumerate(results, 1):
        print(f"\n[{i}] {row['project_name']}")
        print(f"    采购方：{row['buyer']}")
        print(f"    分类：{row['project_type']} | 优先级：{row['priority']}")
        print(f"    标签：{row['tags']}")
        print(f"    判定原因：{row['reason']}")


if __name__ == "__main__":
    main()
