# 残血令与圣火神功连击叠加修复

日期：2026-10-11。来源：玩家反馈。此前定向回归及武学采集问题台账未覆盖该组合，不能用其他门派采集通过代替本项验证。

## 原因与影响

[残血令](../../kungfu/skill/shenghuo-ling/can.c)无论扰乱判定成功与否，都会最多调用7次普通攻击。旧实现只在成功时设置`shenghuo-ling/max_hit`；失败分支未设置，因此每次命中仍可能经[公共战斗](../../adm/daemons/combatd.c)触发[圣火神功](../../kungfu/skill/shenghuo-shengong.c)最多8次追加攻击。

内力、命中、被动判定及持续交战条件均满足时，上限为**7次原攻击＋56次追加攻击＝63次攻击调用**，不是每次必出56连击。内功原有`shenghuo-ling/hit`保护只能阻止每组追加攻击再次递归，不能阻止下一次残血令原攻击重新触发。

`max_hit`还被[圣火令法命中特效](../../kungfu/skill/shenghuo-ling.c)用来决定额外创伤，不能简单在失败分支也设置它，否则会改变原有成功／失败差异。

## 修复边界

只改`can.c`：在整个七连击循环前后对既有`shenghuo-ling/hit`加一／减一，阻止内功被动叠加，并保留进入前已有的保护状态。途中脱战的`break`同样经过清理。

原资格、扰乱概率、成功命中加成、成功创伤、失败效果、300点基础内力消耗和忙乱范围不变；普通攻击的圣火神功追加连击仍有效。未改内功或公共战斗公式，不涉及存档转换。

## 定向回归

```sh
node tools/tests/test_martial_audit.mjs --before=shenghuo
node tools/tests/test_martial_audit.mjs --group=shenghuo
node tools/test_gameplay.mjs
```

测试使用真实FluffOS、游戏武学及属性／伤害代码；临时副本中的战斗边界固定为命中，并控制两处武学的随机输入以稳定覆盖分支。这是确定性缺陷回归，**不是完整实战概率、伤害或胜率评测**。不连接正式服、不读取玩家存档，不调用模型。

- 修复前基线固定为`61d92f7c39449289f912c957d9d971daeccd775b`中的`can.c`。有效负对照：`C:/Users/oiuv/AppData/Local/Temp/mud-martial-audit-ipUu93`，80检查、5项预期失败；实际记录失败分支63次攻击、7次被动发动、0额外创伤。
- 修复后：`C:/Users/oiuv/AppData/Local/Temp/mud-martial-audit-z1yB7z`，**80检查、0失败**。成功／失败均7次；第三击脱战均3次；既有保护值0／3都正确恢复。固定每击100创伤输入时，成功分支700／300、失败分支0，成功效果未移给失败分支。
- 两分支结束后，正常内功被动仍能追加8次攻击，扣除原有160点内力并清理自身保护；399内力拒绝时不攻击、不扣费、不留标记。
- 首两次测试环境接入失败（`EJUiwj`、`GseRCL`）保留诊断，不作为缺陷复现。负对照现要求明确63次攻击记录且无运行异常，避免把测试环境报错误计为成功复现。
- 所改LPC文件格式化及`--check`、`git diff --check`通过；七组集成回归**1689检查、0失败**，耗时234.48秒（含准备）。其中交易212、公共战斗486、具体武学451、AI通信166、NPC重连36、世界活动75、身份与任务奖励263。
- 集成回归证据目录均在`C:/Users/oiuv/AppData/Local/Temp/`：依次为`mud-commerce-audit-1MhNq7`、`mud-weapon-combat-Hkde7s`、`mud-martial-audit-VHWPNN`、`mud-ai-lpc-dD4VYM`、`mud-npc-reconnect-p4DKZ3`、`mud-world-events-hWdmos`、`mud-identity-quest-OwXfbT`。此结果不是全库无缺陷证明。

## 线上加载

部署该修复后，游戏内执行`update /kungfu/skill/shenghuo-ling/can`即可加载此次游戏代码改动；无需因本项重启服务器、重置玩家或全量更新。隔离测试不代表正式服已经更新，实际加载由管理员操作。
