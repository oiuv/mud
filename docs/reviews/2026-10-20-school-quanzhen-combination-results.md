# 全真教互备组合结果（2026-10-20）

系列：`review-quanzhen-combination-f1-20261020`。142 条件 / 4,596 正式记录（4,560 观察 + 36 拒绝、0 校验错误），独立重验 PASS。仅代表既定条件下的采样状态，不是全部全真能力已测或强弱排名。

## 组合来源

两组独立双向互备（原 `valid_combine()` 声明）+ 一门无互备接口单备出招：

| 组合 | 技能A | 技能B | 来源 |
| --- | --- | --- | --- |
| 互备组1 | 重阳神掌（strike） | 终南指法（finger） | `valid_combine` 双向 |
| 互备组2 | 昊天掌（strike） | 七星手（hand） | `valid_combine` 双向 |
| 单备 | 空明拳（unarmed） | — | 无互备接口，仍可单备出招 |

原 NPC（丘处机/谭处端/马钰等）的 `prepare_skill` 配组只作源码依据，不移植到实验对象。

## 条件矩阵

142 条件覆盖三类方法：

1. **interface**（valid_combine 方向性）：每门技能对全部候选组合测试允许/拒绝，含负例（非技能名、自身、跨组）。
2. **prepare_sequence**（准备序列）：sequential / basics / names 三种准备路线 × 两种输入顺序，l200/l400/l800 三档；不是双方交锋先手。
3. **round**（单轮交锋）：solo / pair 准备状态下的 `fight_round`，每条件 100 样本。

基线等级 200/400/800 三档，加力 0；另有等级 400、加力 50、持剑、低身法、目标忙乱及取消准备等条件。空明拳单独覆盖无互备的单备出招路径。

## 关键发现

- 两组互备方向性一致：A 允许 B、B 允许 A，跨组互备拒绝。
- 重阳神掌/昊天掌同为 strike 类，经 prepare 命令配对时需指定具体技能名。
- 空明拳无 `valid_combine` 接口，单备即可出招，与互备组行为独立。

## 限制

- 仅单轮交锋观察，非完整持续效果；不含自然心跳恢复与多轮消耗。
- 实验等级/映射为赋值，不证明从师可学或同养成成本。
- 基本内功 600 未映射，隔离内功被动。

## 证据

- 原始数据：`E/review-quanzhen-combination-f1-20261020/`，E = `C:/tools/msys64/home/oiuv/mud-evidence/martial-data`
- 工具：`tools/tests/martial_data/school_quanzhen_combination_cases.mjs`
- 测试：`school_quanzhen_combination.test.mjs`（13/13 通过）
