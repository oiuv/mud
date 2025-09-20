# CLOSED_D - 闭关系统守护进程

## 概述
CLOSED_D 是MUD游戏的闭关系统守护进程，负责管理玩家进入"闭关"修炼状态。闭关是一种特殊的冥想/修炼状态，玩家在此期间可以提升自己的技能和能力，同时暂时与游戏世界隔离。

## 核心功能

### 闭关状态管理
- **状态跟踪**：记录所有处于闭关状态的玩家
- **持久化存储**：闭关数据跨游戏会话保存
- **自动加载**：游戏重启时自动恢复闭关会话
- **心跳监控**：定期检查闭关状态并处理相关逻辑

### 闭关类型支持
- **标准闭关**：基础冥想修炼（由 `/cmds/skill/closed` 处理）
- **经脉突破**：经脉修炼突破（由 `/cmds/skill/breakup` 处理）
- **策划谋略**：战略规划活动（由 `/cmds/usr/scheme` 处理）

## 主要接口函数

### 闭关注册
```lpc
void user_closed(object user)
```
- **参数**：`user` - 进入闭关状态的玩家对象
- **功能**：
  - 设置玩家短描述为"盘膝而坐，正在瞑目闭关修炼"
  - 记录开始时间到玩家临时数据
  - 存储玩家ID和起始房间到闭关用户映射表
  - 保存状态到持久化存储
  - 调整心跳频率以更频繁处理

### 解除闭关
```lpc
void user_opened(object user)
```
- **参数**：`user` - 离开闭关状态的玩家对象
- **功能**：
  - 清除"doing"状态和短描述
  - 删除临时闭关数据
  - 从闭关用户映射表中移除用户
  - 如无用户则禁用心跳
  - 清除起始房间数据并保存玩家状态

### 继续闭关活动
```lpc
void continue_doing(object user_ob)
```
- **参数**：`user_ob` - 要处理的玩家对象
- **功能**：根据玩家当前的"doing"状态继续相应的闭关活动
- **支持活动**：
  - `"closed"` - 标准闭关（调用 `/cmds/skill/closed`）
  - `"breakup"` - 经脉突破（调用 `/cmds/skill/breakup`）
  - `"scheme"` - 策划谋略（调用 `/cmds/usr/scheme`）

## 数据结构与存储

### 主要数据结构
```lpc
mapping closed_users = 0;
```
- **格式**：`([ 用户ID : 起始房间路径 ])`
- **用途**：映射用户ID到他们的闭关起始房间路径
- **持久化**：通过 F_SAVE 继承自动保存/加载

### 数据流程
1. **进入**：调用 `user_closed()` 时添加用户数据到映射表
2. **持久化**：通过 `save()` 调用保存数据到 `/data/closed` 文件
3. **恢复**：守护进程创建时通过 `restore()` 从文件加载数据
4. **清理**：玩家完成闭关时通过 `map_delete()` 移除条目

## 配置与初始化

### 初始化过程
```lpc
void create()
{
    seteuid(getuid());
    restore();              // 加载之前的会话数据
    set_heart_beat(3);      // 初始时3秒间隔
}
```

### 心跳管理
- **默认间隔**：初始化时为3秒
- **活跃状态**：有用户时为10-20秒（10 + random(10)）
- **非活跃状态**：无用户闭关时禁用（0）
- **版本检查**：仅当 VERSION_D 报告版本兼容时才处理

### 清理处理器
```lpc
void remove()
void mud_shutdown()
```
两个函数都通过调用 `save()` 确保在守护进程销毁或MUD关闭前保存数据。

## 使用示例

### 注册玩家闭关
```lpc
// 从命令或其他守护进程
CLOSED_D->user_closed(this_player());
```

### 检查闭关状态
```lpc
// 获取所有闭关用户
mapping users = CLOSED_D->query_closed_users();
if (sizeof(users))
{
    foreach (string user_id, string room in users)
    {
        write(sprintf("%s 在 %s 闭关\n", user_id, room));
    }
}
```

### 为加载的用户继续闭关
```lpc
// 由 load_all_users() 自动调用
CLOSED_D->continue_doing(user_object);
```

## 系统集成

### 命令系统集成
守护进程与三个专门的命令处理器集成：

1. **`/cmds/skill/closed`** - 标准闭关
   - `continue_closing(user)` - 继续冥想修炼
2. **`/cmds/skill/breakup`** - 经脉突破
   - `continue_breaking(user)` - 继续经脉修炼
3. **`/cmds/usr/scheme`** - 策划系统
   - `continue_scheme(user)` - 继续战略规划

### 登录系统集成
```lpc
// 心跳期间自动加载用户
login_ob = new(LOGIN_OB);
login_ob->set("id", u);
if (login_ob->restore())
{
    user_ob = LOGIN_D->make_body(login_ob);
    // ... 设置并进入世界
}
```

### 错误处理与日志记录
系统包含全面的错误处理：
- 缺失用户文件日志：`"closed：没有玩家(%s)"`
- 身体创建失败日志：`"closed：无法生成玩家(%s)"`
- 恢复失败日志：`"closed：无法读取玩家(%s)的档案"`

### 版本控制集成
```lpc
if (!VERSION_D->is_version_ok())
    return;
```
确保守护进程仅在MUD版本兼容时运行。

## 相关文件
- `/adm/daemons/closed.c` - 闭关系统守护进程
- `/adm/daemons/versiond` - 版本兼容性检查
- `/cmds/skill/closed` - 标准闭关实现
- `/cmds/skill/breakup` - 经脉突破实现
- `/cmds/usr/scheme` - 策划系统实现
- `/data/closed` - 持久化存储文件

## 注意事项
- 玩家必须有明确的闭关类型定义
- 不同闭关类型会调用不同的处理程序
- 巫师角色死亡不会生成尸体（在相关系统中）
- 幽灵状态的角色物品会直接掉落
- 负重能力基于力量属性计算
- 神值计算方式在玩家和NPC间有区别
- 闭关数据自动保存到 `/data/closed` 文件
- 支持运行时动态添加删除闭关会话
- 数字转换支持极大数值（到兆位）
- 所有功能都经过严格的边界条件处理

CLOSED_D 为MUD游戏提供了标准化的闭关管理机制，确保不同闭关类型的玩家具有合适的处理配置，同时管理闭关状态转换和数据持久化，是角色修炼系统的重要组成部分。