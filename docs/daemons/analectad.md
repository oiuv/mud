# ANALECTA_D - 文选管理守护进程

## 概述
ANALECTA_D 是MUD游戏中的文选管理守护进程，负责收集、管理和维护游戏中的文选（精选文章）系统。它为游戏提供了一个完整的文学作品管理平台，支持文选的自动收集、分类存储和检索功能。

## 核心功能

### 文选收集
- **自动扫描**：启动时自动扫描所有文选文件
- **按年分类**：按年份对文选进行分类管理
- **文件解析**：解析文选文件的头信息和内容
- **实时更新**：支持动态添加和删除文选

### 文选管理
- **添加文选**：支持新文选的添加
- **删除文选**：支持按年份和编号删除文选
- **清空列表**：支持清空指定年份的文选列表
- **查询列表**：提供完整的文选列表查询

## 存储结构

### 文件存储
- **根目录**：`/data/analecta/`
- **年份分类**：每个年份一个子目录（如：`2002/`、`2023/`）
- **文件命名**：8位随机数字（如：`10000000.txt`）
- **文件格式**：标准文本文件，包含头部信息和内容

### 文选文件格式
```
subject : 测试文选                      -> 文选标题
author_name : 阿福                      -> 文选作者
author_id : jjgod                       -> 文选作者ID
time : 1012137565                       -> 创作时间
board : 客店留言板                      -> 发表地点
file : /data/analecta/2002/10000000.txt -> 保存文件
add_time : 1012137565                   -> 添加时间
content :
这里是内容。                            -> 文选内容
```

## 主要接口函数

### 查询功能
```lpc
// 查询所有文选列表
mapping query_analecta_list();

// 返回格式：
// ([
//     "2002": ({ (["subject":"标题1", ...]), (["subject":"标题2", ...]) }),
//     "2023": ({ (["subject":"标题3", ...]) })
// ])
```

### 管理功能
```lpc
// 添加一篇文选
int add_analecta(int year, mapping analecta);

// 参数：
// year - 年份（如：2023）
// analecta - 文选信息映射
//   - subject: 文选标题
//   - author_name: 作者名称
//   - author_id: 作者ID
//   - time: 创作时间戳
//   - board: 发表地点
//   - content: 文选内容

// 删除一篇文选
int delete_analecta(int year, int number);

// 清空一年的文选列表
int clear_analecta_list(int year);
```

## 使用示例

### 添加文选
```lpc
// 创建新文选
mapping new_analecta = ([
    "subject": "江湖风云录",
    "author_name": "风清扬",
    "author_id": "fengqingyang",
    "time": time(),
    "board": "华山论剑",
    "content": "华山论剑，群雄毕至..."
]);

// 添加到2023年文选
ANALECTA_D->add_analecta(2023, new_analecta);
```

### 查询文选
```lpc
// 获取所有文选列表
mapping all_analecta = ANALECTA_D->query_analecta_list();

// 遍历特定年份的文选
mapping *year_analecta = all_analecta["2023"];
if (arrayp(year_analecta)) {
    foreach (mapping analecta in year_analecta) {
        write(sprintf("标题：%s\n作者：%s\n",
                     analecta["subject"], analecta["author_name"]));
    }
}
```

### 删除文选
```lpc
// 删除2023年第3篇文选
ANALECTA_D->delete_analecta(2023, 3);
```

## 内部工作流程

### 启动收集
```lpc
// 系统启动时自动执行
void collect_all_analecta()

// 处理流程：
// 1. 扫描/data/analecta/目录下的所有年份
// 2. 对每个年份目录，扫描所有.txt文件
// 3. 解析每个文选文件的头信息
// 4. 构建完整的文选列表映射
```

### 文件解析
```lpc
// 解析单个文选文件
mapping parse_analecta(string file_name)

// 解析内容：
// - 读取前8行作为头部信息
// - 解析键值对格式
// - 处理空格和格式清理
// - 获取文件总行数
// - 返回完整的文选信息映射
```

## 数据管理

### 内存存储
- **analecta_list**：完整的文选列表映射
- **按年索引**：每个年份对应一个文选数组
- **动态更新**：添加/删除操作实时更新内存

### 文件系统
- **持久化存储**：所有文选以文件形式存储
- **自动备份**：文件系统级别的数据备份
- **版本控制**：通过时间戳记录创建和修改时间

## 错误处理

### 文件操作
- **空目录处理**：年份目录为空时跳过
- **无效文件**：文件大小为0或不可读时跳过
- **格式错误**：格式不正确的文件返回空映射

### 系统通知
```lpc
// 启动通知
CHANNEL_D->do_channel(this_object(), "sys", "文选系统已经启动。");

// 收集完成通知
CHANNEL_D->do_channel(this_object(), "sys", "文选信息收集完成。");
```

## 配置参数

### 系统常量
```lpc
#define ANALECTA_DIR    DATA_DIR + "analecta/"  // 文选根目录
#define HEAD_LINES      8                       // 头信息行数
```

### 文件命名规则
- **随机性**：8位随机数字确保唯一性
- **冲突处理**：重复时重新生成
- **扩展名**：统一使用.txt格式

## 系统启动

### 初始化流程
1. **设置权限**：以ROOT_UID身份运行
2. **频道注册**：注册为"文选精灵"频道
3. **列表初始化**：清空并重建文选列表
4. **自动收集**：扫描所有现有文选
5. **状态通知**：向系统报告启动完成

## 相关文件
- `/adm/daemons/analectad.c` - 守护进程实现
- `/data/analecta/` - 文选存储目录
- `/include/ansi.h` - ANSI颜色定义

## 注意事项
- 文选文件必须符合标准格式
- 年份目录不存在时会自动创建
- 文件删除后无法恢复
- 文选数量无上限限制
- 支持多线程并发访问

ANALECTA_D 为MUD提供了一个完整的文选管理系统，使游戏中的文学作品能够得到有效的收集、分类和管理，为玩家提供丰富的文化内容体验。该守护进程是游戏文化建设的重要组成部分。