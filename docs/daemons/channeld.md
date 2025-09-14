# channeld - 频道守护进程

## 📋 概述

channeld 是炎黄群侠传MUD游戏的频道通信守护进程，负责管理游戏内所有聊天频道的消息分发、权限控制和跨MUD通信。基于实际代码实现，提供完整的频道系统功能。

## 🎯 主要功能

### 1. 频道管理
- **15个标准频道**: sys, wiz, debug, inter, chat, ic, bill, ultra, shout, rumor, sing, party, family, rultra, waidi
- **权限控制**: 基于用户身份、门派、帮派、等级等条件
- **动态频道名**: party和family频道根据实际名称动态显示

### 2. 消息分发系统
- **消息格式化**: 支持说话和动作两种消息格式
- **听众过滤**: 根据频道权限和用户需求过滤接收者
- **消息日志**: 记录非隐私频道的消息日志

### 3. 跨MUD通信
- **互联支持**: wiz, ic, ultra频道支持跨MUD通信
- **协议处理**: 处理intermud通信协议
- **消息转发**: 在互联MUD间转发频道消息

## 💻 技术实现

### 核心数据结构

```lpc
mapping channels = ([
    "sys":(["msg_speak": HIR"【系统报告】%s：%s\n"NOR, "only": "wiz", "name": "系统"]),
    "chat":(["msg_speak": HIC"【东拉西扯】%s：%s\n"NOR, "name": "闲聊"]),
    "party":(["msg_speak": HIG"【本帮话语】%s：%s\n"NOR, "only": "party", "name": "帮派"]),
    "family":(["msg_speak": HIG"【同门话语】%s：%s\n"NOR, "only": "family", "name": "同门"]),
    // ... 更多频道配置
]);
```

### 主要函数接口

#### 频道消息处理
```lpc
int do_channel(object me, string verb, string arg, int emote)
```
- 处理频道发言请求，包括权限验证、消息格式化、听众查找

#### 听众判断
```lpc
int filter_listener(object ppl, string only, object me)
```
- 判断用户是否有权限收听指定频道

#### 消息日志
```lpc
void channel_log(string msg, string verb, object user)
```
- 记录频道消息到日志文件

## 🔄 工作流程

### 频道发言处理
1. **权限验证** → 检查频道存在性和用户权限
2. **消息处理** → 格式化消息内容，处理动作消息
3. **听众查找** → 过滤符合条件的接收者
4. **消息分发** → 发送给所有有效听众
5. **日志记录** → 记录非隐私频道的消息

### 权限检查逻辑
- **巫师频道**: `wiz_level(me) >= 3`
- **门派频道**: `ppl->query("family/family_name") == me->query("family/family_name")`
- **帮派频道**: `ppl->query("party/party_name") == me->query("party/party_name")`
- **同盟频道**: `ppl->query("league/league_name") == me->query("league/league_name")`

## ⚙️ 频道配置详解

### 标准频道列表
| 频道 | 显示名称 | 权限要求 | 跨MUD | 特殊配置 |
|------|----------|----------|--------|----------|
| sys | 系统报告 | 巫师 | 否 | omit_log: 1 |
| wiz | 巫师频道 | 巫师 | 是 | intermud支持 |
| debug | 调试信息 | 巫师 | 否 | omit_log: 1 |
| inter | 同盟交谈 | 同盟 | 否 | name_raw: 1 |
| chat | 东拉西扯 | 无 | 是 | 基础闲聊频道 |
| ic | 异域传闻 | 无 | 是 | intermud支持 |
| bill | 转手交易 | 无 | 否 | name_raw: 1, omit_log: 1 |
| ultra | 大宗师 | 大宗师 | 是 | intermud支持 |
| shout | 长啸 | 无 | 否 | 特殊格式处理 |
| rumor | 谣言四起 | 无(年龄≥30) | 是 | anonymous: "某人" |
| sing | 心府乐笙 | 无 | 否 | 歌唱专用格式 |
| party | 本帮话语 | 帮派 | 否 | 动态帮派名 |
| family | 同门话语 | 门派 | 否 | 动态门派名 |
| rultra | 塞外宗师 | 大宗师 | 否 | for_listen: 1 |
| waidi | 外敌入侵 | 无 | 否 | omit_log: 1 |

### 动态频道名处理
party和family频道会根据实际帮派/门派名称动态生成频道名：
```lpc
// 帮派频道名生成
party = me->query("party/party_name");
channels["party"]["msg_speak"] = HIG"【" + party + "】%s：%s\n"NOR;

// 门派频道名生成
family = me->query("family/family_name");
channels["family"]["msg_speak"] = HIG"【" + family + "】%s：%s\n"NOR;
```

## ⚠️ 开发注意事项

### 权限验证
1. **严格权限检查** - 所有频道必须进行权限验证
2. **动态权限** - party/family频道权限随组织变化
3. **年龄限制** - rumor频道有年龄限制（≥30岁）

### 消息安全
1. **输入验证** - 所有用户输入必须验证
2. **长度限制** - 消息长度需要合理限制
3. **内容过滤** - 敏感内容需要过滤处理

### 性能考虑
1. **听众过滤** - 高效的听众查找和过滤机制
2. **消息缓存** - 避免重复的消息格式化操作
3. **日志管理** - 合理的日志记录策略

## 🔧 开发接口

### 发送频道消息
```lpc
// 使用标准接口
CHANNEL_D->do_channel(me, "chat", "大家好！");
```

### 频道权限检查
```lpc
// 检查用户权限
if (!filter_listener(me, "wiz", this_player()))
    return notify_fail("你没有权限使用这个频道。\n");
```

### 自定义频道配置
```lpc
// 添加新频道（需要在channels映射中定义）
channels["new_channel"] = ([
    "msg_speak": HIG"【新频道】%s：%s\n"NOR,
    "only": "custom_permission",
    "name": "新频道"
]);
```

## 📋 频道命令

### 标准频道命令
```bash
chat [消息]      # 闲聊频道
rumor [消息]     # 谣言频道（年龄≥30）
party [消息]     # 帮派频道（动态名称）
family [消息]    # 门派频道（动态名称）
bill [消息]      # 交易频道
shout [消息]     # 长啸
sing [消息]      # 歌唱频道
sys [消息]       # 系统报告（巫师）
wiz [消息]       # 巫师频道（巫师）
ultra [消息]     # 大宗师频道（宗师）
inter [消息]     # 同盟交谈（同盟）
ic [消息]        # 异域传闻
debug [消息]     # 调试信息（巫师）
waidi [消息]     # 外敌入侵
rultra [消息]    # 塞外宗师（大宗师）
```

---
*基于 adm/daemons/channeld.c 实际代码实现*
*维护团队：炎黄群侠传开发组*