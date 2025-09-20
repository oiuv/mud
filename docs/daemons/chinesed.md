# CHINESE_D - 中文处理守护进程

## 概述
CHINESE_D 是MUD游戏的中文处理守护进程，提供数字转中文、英译中、日期格式化等中文处理功能。它维护一个可持久化的中英文字典，并支持多种中文格式化需求。

## 核心功能

### 数字转中文
- **完整支持**：支持负数、小数、大数字
- **位数完整**：从个位到兆位（万亿）
- **格式规范**：符合中文数字表达习惯
- **零值处理**：正确处理零的显示

### 翻译管理
- **英译中**：提供英文字符串到中文的翻译
- **持久化存储**：翻译字典保存到文件
- **动态更新**：支持运行时添加和删除翻译
- **批量操作**：支持字典的导入导出

### 日期格式化
- **干支纪年**：支持天干地支纪年法
- **中文日期**：完整的中文日期表达
- **月份显示**：中文月份表示
- **时辰系统**：支持传统时辰表示

## 主要接口函数

### 数字转换
```lpc
// 数字转中文
string chinese_number(int i)

// 支持范围：任意整数（包括负数）
// 示例：
// chinese_number(123) -> "一百二十三"
// chinese_number(-5) -> "负五"
// chinese_number(10000) -> "一万"
```

### 翻译功能
```lpc
// 英文字符串翻译
string chinese(string str)

// 参数：
// str - 要翻译的英文字符串
// 返回：对应的中文翻译，无翻译时返回原字符串

// 示例：
// chinese("attack") -> "攻击"
```

### 逆向查找
```lpc
// 中文查找英文
string find_skill(string value)

// 参数：
// value - 中文字符串
// 返回：对应的英文字符串，未找到返回0
```

### 日期格式化
```lpc
// 完整中文日期
string chinese_date(int date, int year)

// 参数：
// date - 时间戳
// year - 基准年份偏移
// 返回：干支纪年的完整中文日期
// 示例："甲子年三月十五日午时三刻"

// 中文月份
string chinese_month(int date)

// 中文月日
string chinese_monthday(int date)
```

## 常量定义

### 数字常量
```lpc
// 中文数字位
nosave string *c_digit = ({"零", "十", "百", "千", "万", "亿", "兆"})

// 中文数字
nosave string *c_num = ({"零", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"})

// 天干
nosave string *sym_tian = ({"甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"})

// 地支
nosave string *sym_di = ({"子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"})
```

## 数据存储

### 字典文件
```lpc
#define E2C_DICTIONARY DATA_DIR + "e2c_dict"
// 存储位置：/data/e2c_dict
// 存储内容：英文字符串到中文的映射关系
```

### 存储结构
```lpc
mapping dict = ([]);
// 格式：(["english_key": "中文翻译"])
```

## 数字转换规则

### 转换规则
- **0-10**：直接使用"零"到"十"
- **11-19**："十" + 个位数
- **20-99**："几十" + 个位数
- **100-999**："几百" + 剩余部分
- **1000-9999**："几千" + 剩余部分
- **万位以上**：递归处理，逐级添加"万"、"亿"、"兆"

### 特殊处理
- **负数**：前缀添加"负"
- **零值**：直接返回"零"
- **省略零**：高位零值适当省略

## 翻译管理

### 添加翻译
```lpc
// 添加新翻译
void add_translate(string key, string chn)

// 参数：
// key - 英文键
// chn - 中文翻译
// 操作：添加到字典并保存到文件
```

### 删除翻译
```lpc
// 删除翻译
void remove_translate(string key)

// 操作：从字典中删除指定键并保存文件
```

### 字典操作
```lpc
// 获取完整字典
mapping data()
// 返回：完整的翻译字典映射

// 导出翻译
void dump_translate(int type)
// type=0：文本格式导出到/CHINESE_DUMP
// type=1：JSON格式导出到/CHINESE_DUMP.json
```

## 使用示例

### 基本使用
```lpc
// 数字转换
write(CHINESE_D->chinese_number(12345));  // "一万二千三百四十五"
write(CHINESE_D->chinese_number(-99));     // "负九十九"

// 翻译查询
write(CHINESE_D->chinese("attack"));      // 返回对应中文

// 逆向查找
write(CHINESE_D->find_skill("攻击"));      // 返回"attack"
```

### 日期格式化
```lpc
// 完整中文日期
write(CHINESE_D->chinese_date(time(), 0));
// 输出示例："癸卯年三月十五日午时三刻"

// 中文月份
write(CHINESE_D->chinese_month(time()));  // "三月"

// 中文月日
write(CHINESE_D->chinese_monthday(time())); // "三月十五日"
```

### 管理操作
```lpc
// 添加翻译
CHINESE_D->add_translate("fireball", "火球术");

// 删除翻译
CHINESE_D->remove_translate("fireball");

// 查看字典
mapping dict = CHINESE_D->data();
```

## 字符串验证功能

### 控制字符检查
```lpc
int check_control(string name)
// 检查是否包含控制字符（ASCII < 32）
// 返回：1=包含控制字符，0=无控制字符
```

### 空格检查
```lpc
int check_space(string name)
// 检查是否包含空格
// 返回：1=包含空格，0=无空格
```

### 换行符检查
```lpc
int check_return(string name)
// 检查是否包含换行符
// 返回：1=包含换行符，0=无换行符
```

### 中文字符检查
```lpc
int check_chinese(string name)
// 检查是否为纯中文字符串
// 返回：1=纯中文，0=包含非中文字符
```

### 长度检查
```lpc
int check_length(string str)
// 获取字符串长度
// 返回：字符串长度
```

## 系统配置

### 初始化
```lpc
void create()
{
    seteuid(getuid());
    restore();  // 从文件加载字典
}
```

### 持久化
```lpc
void remove()
{
    save();  // 退出时保存字典
}

string query_save_file()
{
    return E2C_DICTIONARY;  // 返回保存文件路径
}
```

## 相关文件
- `/adm/daemons/chinesed.c` - 中文处理守护进程
- `/data/e2c_dict` - 翻译字典文件
- 依赖：NATURE_D（用于日期相关功能）

## 注意事项
- 字典自动保存到/data/e2c_dict文件
- 支持运行时动态添加删除翻译
- 数字转换支持极大数值（到兆位）
- 日期格式化需要NATURE_D支持
- 中文字符检查按UTF-8编码处理
- 所有功能都经过严格的边界条件处理

CHINESE_D 为MUD游戏提供了完整的中文处理解决方案，涵盖数字转换、翻译管理、日期格式化和字符串验证等功能，是中文游戏环境的重要支持组件。'