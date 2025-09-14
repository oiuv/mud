# aliasd - 别名系统守护进程

## 功能概述

aliasd守护进程负责管理游戏命令的别名系统，提供全局命令别名映射功能，简化玩家操作。

## 核心数据结构

### 全局别名映射表
```lpc
mapping global_alias = ([
    "l":"look",
    "n":"go north",
    "e":"go east",
    "w":"go west",
    "s":"go south",
    "nu":"go northup",
    "eu":"go eastup",
    "wu":"go westup",
    "su":"go southup",
    "nd":"go northdown",
    "ed":"go eastdown",
    "wd":"go westdown",
    "sd":"go southdown",
    "ne":"go northeast",
    "se":"go southeast",
    "nw":"go northwest",
    "sw":"go southwest",
    "u":"go up",
    "d":"go down",
    "i":"inventory",
    "tt":"team talk",
]);
```

## 接口函数

### process_global_alias
```lpc
string process_global_alias(string arg)
```
处理输入的命令字符串，将其中的别名替换为实际命令。

**特殊处理规则：**
- 以`'`开头的文本自动转换为`say`命令
- 以`.`开头的文本自动转换为`skip`命令

**参数：**
- `arg`: 输入的命令字符串

**返回值：**
- 替换别名后的完整命令字符串
- 如果没有匹配的别名则返回原字符串

## 工作流程

1. **特殊字符检测**：检查命令是否以`'`或`.`开头，进行特殊处理
2. **命令解析**：将输入字符串按空格分割为单词数组
3. **别名匹配**：检查第一个单词是否在全局别名映射表中
4. **别名替换**：如果匹配成功，用实际命令替换别名
5. **返回结果**：返回处理后的完整命令字符串

## 别名列表

### 方向移动别名
| 别名 | 实际命令 |
|------|----------|
| l | look |
| n | go north |
| e | go east |
| w | go west |
| s | go south |
| ne | go northeast |
| se | go southeast |
| nw | go northwest |
| sw | go southwest |
| u | go up |
| d | go down |

### 特殊方向别名
| 别名 | 实际命令 |
|------|----------|
| nu | go northup |
| eu | go eastup |
| wu | go westup |
| su | go southup |
| nd | go northdown |
| ed | go eastdown |
| wd | go westdown |
| sd | go southdown |

### 功能命令别名
| 别名 | 实际命令 |
|------|----------|
| i | inventory |
| tt | team talk |

### 特殊文本别名
| 前缀 | 处理方式 |
|------|----------|
| '文本 | 转换为 say 文本 |
| .文本 | 转换为 skip 文本 |

## 使用示例

```lpc
// 基本别名替换
process_global_alias("n")  // 返回 "go north"
process_global_alias("l")  // 返回 "look"
process_global_alias("i")  // 返回 "inventory"

// 带参数的别名
process_global_alias("tt hello")  // 返回 "team talk hello"

// 特殊文本处理
process_global_alias("'大家好")  // 返回 "say 大家好"
process_global_alias(".test")    // 返回 "skip test"

// 无匹配别名
process_global_alias("score")  // 返回 "score"（原样返回）
```

## 技术特点

- **轻量级设计**：仅包含核心别名功能，无复杂逻辑
- **高效处理**：使用映射表实现O(1)时间复杂度的别名查找
- **可扩展性**：通过修改`global_alias`映射表可轻松添加新别名
- **特殊字符支持**：支持快捷的社交和跳过命令
- **安全处理**：保持原始命令结构，仅替换第一个单词