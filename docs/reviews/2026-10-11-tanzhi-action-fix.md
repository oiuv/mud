# 弹指神通招式初始化修复

日期：2026-10-11。来源：正式服生成 NPC 在普通战斗中调用 `tanzhi-shentong->query_action()`，发生 `Value being indexed is zero`。

## 原因与修复范围

[弹指神通](../../kungfu/skill/tanzhi-shentong.c)原来在全局 `action_finger` 表初始化时，通过 `this_player()` 计算“极意”的数值。无命令玩家的后台加载会先发生空对象调用；未完成初始化的表随后被 `query_action()` 或 `query_skill_name()` 索引，继续报错。若由玩家加载成功，所有攻击者又会沿用该加载者的属性和当时的随机结果。

与[参合指修复](2026-10-11-canhe-action-fix.md)同类：全局表仅保存固定内容；选中“极意”时复制该招式，用实际攻击者 `me` 的当前基本内功、指法、轻功和招架计算五项数值，不修改共享表。

六式固定数值、七式均匀选择、原公式与随机范围不变；名称查询只选名称，不触发动态属性计算。未新增等级或内力门槛，未改变暗器激发、点穴、防御、练习和绝招逻辑，也未改公共战斗或玩家存档。

## 回归

```sh
node tools/tests/test_martial_audit.mjs --before=tanzhi_action
node tools/tests/test_martial_audit.mjs --group=tanzhi_action
node tools/test_gameplay.mjs
```

测试使用真实 FluffOS 和游戏武学、人物动作分派；仅在隔离副本中控制随机输入。所有人物都是合成 NPC，不复制报错日志中的账号、认证字段或存档。暗器分派测试使用已有测试兵器并仅设置其 `skill_type`，验证动作选择与公式，不代表完整投掷命中特效或实战平衡评测。

- 负对照使用 `af546461` 中的旧武学：`C:/Users/oiuv/AppData/Local/Temp/mud-martial-audit-DlEtBk`，166 项检查、70 项预期失败。三次预期异常分别来自初始化、名称查询和出招；另有属性串用断言失败。脚本核对异常次数、错误类型、指定失败标签及无编译诊断，其他测试错误不能当成复现。
- 修复后：`C:/Users/oiuv/AppData/Local/Temp/mud-martial-audit-d35gK4`，**166 项检查、0 失败**，无运行异常或 LPC 编译警告。
- 覆盖无玩家冷加载、全部招式名称、两种加载顺序、实际攻击者与命令玩家不同、五项公式与随机上下界、技能变更、零与一级基本功、返回值互不污染、六式固定数值、空手及暗器动作分派、现存 NPC 在武学重载后继续出招。
- 含参合指修复的七组集成回归：**2018 项检查、0 失败，7/7 组通过**，总耗时 179.18 秒。交易与背包 212、公共战斗 486、具体武学 780、AI 通信 166、NPC 重连 36、世界活动 75、身份与任务奖励 263。这不是全库无缺陷证明。
- 集成证据目录位于 `C:/Users/oiuv/AppData/Local/Temp/`，依次为 `mud-commerce-audit-QcH7iF`、`mud-weapon-combat-JyMbpg`、`mud-martial-audit-w9e8an`、`mud-ai-lpc-lfQJiy`、`mud-npc-reconnect-8P8JTu`、`mud-world-events-HiG5i8`、`mud-identity-quest-gIfmuE`。
- 最后按项目规范将两份新夹具的循环变量声明移到函数开头，再次执行具体武学回归：`mud-martial-audit-05wIBZ`，780 项检查、0 失败。两门武学及相关夹具的五份 LPC 文件格式化和 `--check`、测试脚本语法检查、`git diff --check` 均通过。Windows 驱动仅有已知 eval limit 平台提示。

## 同类风险记录（未在本次修改）

本次修复后，`kungfu/skill/` 的 `.c` / `.lpc` 文件中，仍有 **44 个文件**命中精确写法 `this_player()->query_skill`。这是检索候选数，不是 44 项已复现缺陷；调用在全局初始化还是正常命令上下文、基本技能与有效技能的区别，以及各武学选择流程均需逐一核实，不能直接批量替换。

已静态核实的同类全局初始化位置包括：

- [抽髓掌](../../kungfu/skill/chousui-zhang.c)：`action` 最后一式“极意”，从第 46 行开始读取加载者属性。
- [华山剑法](../../kungfu/skill/huashan-jian.c)：`action` 最后一式“极意”，从第 69 行开始读取加载者属性。

这两处尚未执行对应的无玩家加载、出招及公式回归，未修改、未计入本批通过项。其他候选可通过上述精确表达式重新检索；武学数据采集仍与线上缺陷修复分开。

## 部署

更新源码后执行 `update /kungfu/skill/tanzhi-shentong`，销毁并重新加载武学，重新初始化招式表；不要只使用保留旧状态的 `reload`。无需删除 NPC、重启游戏或修改玩家数据。若同时部署参合指修复，也执行 `update /kungfu/skill/canhe-zhi`。

隔离回归不代表正式服已更新；上线由管理员操作。
