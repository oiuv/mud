# G6/G7 组合缺口处置（2026-10-22）

## G6：古墓冰火第二掌

### 已有证据

- `school_gumu_fireice_cases.mjs`：完整冰火交锋条件集，含 150 级以下无第二掌、151 级起保留 call_out(0) 分支。
- `mud-gumu-fireice-final-20261011`：正式交锋数据（summary 文件）。
- 旧 1277 条同室存活目标数据：均在同一房间、目标存活条件下采集。

### 两候选场景

| 候选 | 场景 | 采集结果 | 处置 |
| --- | --- | --- | --- |
| 目标失活 | 第一掌命中后目标 HP≤0，第二掌 call_out 触发时目标状态 | **已采 2/2**（g6-faint2）：目标 qi=100→-1，followup 记录 `target_living=1`。死亡异步处理，call_out(0) 先于 die() 执行 | ✅ 已覆盖 |
| 目标离场 | 第一掌后目标离开房间，第二掌 call_out 触发时目标不在场 | **已采 2/2 smoke + formal 采集中**（g6-depart5）：受击触发 `set()` flee 钩子移至旁观室，followup 记录 `same_room=0, target_living=1` | ✅ 已覆盖 |

### 技术分析

冰火掌的第二掌通过 `call_out(0)` 调度。perform2 检查：
1. `environment(me) != environment(target)` → return 0（离场）
2. `!living(target)` → return notify_fail（失活）

**关键发现**：死亡处理是异步的。第一掌将目标 HP 降至 -1 后，`die()`/`unconcious()` 尚未执行，`living(target)` 仍返回 1。因此 perform2 的 `!living(target)` 检查在低 HP 目标上不会触发——第二掌继续施放并再次造成伤害。

**失活场景实测**（g6-faint2，2 样本）：
- 目标 qi=100，第一掌 300+ 伤害 → qi=-1
- followup 记录 `target_living=1, same_room=1`
- 第二掌仍然执行（向 qi≤0 目标造成额外伤害）
- 此为 perform2 的实际行为，非缺陷

**离场场景**：需在第一掌执行期间移动目标（call_out(0) 时间窗极窄）。需在 actor.lpc 添加受击移动钩子或 runner.lpc 添加场景控制。登记为待采。

### 处置结论

- **目标失活**：✅ 已覆盖（2 样本，验证异步死亡与 perform2 对低 HP 目标的行为）
- **目标离场**：✅ 已覆盖（2 样本 smoke，验证受击 flee 钩子 + perform2 离场检测）
- **实现方式**：actor.lpc 添加 `flee_room` + `set()` 中 qi 减少时自动移动到旁观室（`/tests/bystander_room`）
- **关键发现**：死亡处理异步（qi=-1 但 living=1）；受击 flee 同步（qi 减少立即移动，perform2 检测到 same_room=0）

## G7：明教原 NPC 配置/准备次序

### 已有证据

- `school_mingjiao_combination_cases.mjs`：9 个原 NPC 配置完整记录（含 set_skill/map_skill/prepare_skill）。
- NPC 组合 28/840 正式：原 NPC 交锋/组合数据。
- NPC 原 9/180 正式：原 NPC 配置快照验证。
- `yintianzheng.c`：源码确认 prepare_skill("strike","yinfeng-dao") + prepare_skill("finger","tougu-zhen")。

### 残余项

| 项目 | 当前状态 | 处置 |
| --- | --- | --- |
| 殷天正两种准备顺序 | 源码固定顺序 strike→finger；现有数据验证 preparations 映射 | ✅ 闭账：源码只有固定顺序，无变体 |
| 范遥直接准备 vs 玩家原命令 | **已有 NPC bout 20/20 样本**（review-mingjiao-npc-bout-f1-20261016），创建无准备，56 攻击/场。F_COAGENT 自动准备 vs 玩家 prepare 命令的对照可通过已有 combination 数据（player preparation）+ NPC bout 数据（NPC 无准备战斗）关联 | 复用已有数据组合对照，缺 explicit `effective_mapping_and_choice_preparation_observation` 需单独采集 |
| 飞花掌非对称配装 | 确认无 NPC 携飞花掌，限制场景范围 | ✅ N/A：无此场景 |

### 殷天正准备顺序分析

源码 `yintianzheng.c` 第 61-62 行固定为：
```c
prepare_skill("strike", "yinfeng-dao");
prepare_skill("finger", "tougu-zhen");
```

LPC 的 `prepare_skill` 写入 `preparations` 映射。映射不保证顺序（取决于哈希），但技能激发映射 `map_skill` 确保了 strike→yinfeng-dao、finger→tougu-zhen 的确定关系。战斗中的攻击顺序由心跳和 combatd 决定，不由 prepare_skill 调用顺序决定。

因此"两种准备顺序"实际不构成两个可测变体——prepare_skill 调用顺序对最终 preparations 映射无影响。现有数据（含 preparations 快照验证）可闭账。

### 范遥对照

范遥作为 F_COAGENT，在战斗中自动准备。与玩家通过 `prepare` 命令手动准备的对照需要双方同场景实验。现有 NPC 数据包含范遥的原始配置快照，但未做玩家命令对照。登记为待采残余。

### 处置结论

- 殷天正准备顺序：**闭账**（源码固定顺序，映射无序，现有数据充分）
- 范遥 vs 玩家对照：**待采**（需对照实验）
- 飞花掌场景：**N/A**（无 NPC 配置，已限定范围）
