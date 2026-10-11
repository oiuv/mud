# 参合指出招初始化修复

日期：2026-10-11。来源：正式服 NPC 战斗调用 `canhe-zhi->query_action()` 时出现 `Value being indexed is zero`。

## 原因与修复

[参合指](../../kungfu/skill/canhe-zhi.c)原来在全局招式表的初始化表达式中，通过 `this_player()` 计算“极意”的五项数值。没有命令玩家的后台加载会先发生空对象调用，留下未完成初始化的招式表；之后普通攻击索引该表时再次报错。若由玩家加载成功，数值与随机结果又会固定为该加载者的数据，后续攻击者无法按自身修为发挥。

现在全局表仅保存固定招式内容。“极意”被选中后，复制该招式，再根据实际攻击者 `me` 的当前基本内功、指法、轻功与招架计算数值。每次独立计算，不污染共享表或先前返回的招式。

保留六式固定招式的数值、七式随机选择范围、临时指定招式的优先级，以及原来五项计算公式与随机范围。另一个“参合剑气”分支的十分之一判定、内力须大于 1000 和扣除 300 内力均不变；未新增修为门槛，未改反击、练习、绝招或公共战斗公式，不涉及存档转换。

## 隔离回归

```sh
node tools/tests/test_martial_audit.mjs --before=canhe_action
node tools/tests/test_martial_audit.mjs --group=canhe_action
node tools/test_gameplay.mjs
```

使用真实 FluffOS、游戏武学和人物动作入口，临时副本中的随机输入由测试控制，以稳定覆盖分支。人物均为合成 NPC，不使用报错日志中的玩家资料，不读取正式存档、不连接正式服或模型。这是缺陷回归，不是武学胜率或数值平衡采集。

- 旧代码基线：`af546461` 中的 `kungfu/skill/canhe-zhi.c`。负对照目录：`C:/Users/oiuv/AppData/Local/Temp/mud-martial-audit-ahWSiW`，163 项检查、68 项预期失败。明确复现初始化的空对象调用，以及普通出招索引空招式表；其余失败覆盖属性固定在加载者身上。测试脚本要求这两次预期异常、属性串用断言及无编译诊断，不能以任意测试异常代替复现。
- 正向回归覆盖：无玩家冷加载、两种加载者顺序、攻击者与当前命令玩家不同、各自属性与随机上下界、技能变更、零和一级基本功、结果互不污染、全部固定招式、内力 999/1000/1001 边界，以及现存人物在武学销毁重载后的动作调用。
- 修复后定向回归：`C:/Users/oiuv/AppData/Local/Temp/mud-martial-audit-RnuUta`，**163 项检查、0 失败**，无捕获或未捕获的运行异常；无 LPC 编译警告。
- 七组集成回归：**1852 项检查、0 失败，7/7 组通过**，总耗时 208.52 秒。交易与背包 212、公共战斗 486、具体武学 614、AI 通信 166、NPC 重连 36、世界活动 75、身份与任务奖励 263。这不是全库无缺陷证明。
- 集成证据目录位于 `C:/Users/oiuv/AppData/Local/Temp/`，依次为 `mud-commerce-audit-1oNtGq`、`mud-weapon-combat-m1XmeH`、`mud-martial-audit-fnrZG4`、`mud-ai-lpc-GVd3SE`、`mud-npc-reconnect-GBrijJ`、`mud-world-events-10fGmn`、`mud-identity-quest-IhytPr`。
- 本次修改的三个 LPC 文件格式化及 `--check`、测试脚本语法检查、`git diff --check` 均通过。Windows 驱动仍输出已知的 eval limit 平台提示，与本项无关。
- 首次负对照因测试夹具存在未使用变量警告，被验证脚本拒绝；修正夹具后重跑，上述目录才是有效负对照。

## 部署

部署新文件后，管理员执行 `update /kungfu/skill/canhe-zhi`，销毁并重新加载该武学即可。不要仅使用保留状态的 `reload`：旧对象可能已经留下空招式表或加载者的固定数值，需要重新初始化。无需删除 NPC、改玩家存档或因本项重启游戏。

隔离验证不代表正式服已加载；上线操作由管理员执行。
