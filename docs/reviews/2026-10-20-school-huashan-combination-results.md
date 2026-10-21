# 华山派互备组合结果（2026-10-20）

系列：`review-huashan-combination-f1-20261020`。198 条件 / 5,688 正式记录（5,628 观察 + 60 拒绝、0 校验错误），独立重验 PASS。仅代表既定条件下的采样状态，不是全部华山能力已测或强弱排名。

## 组合来源

三组独立双向互备（原 `valid_combine()` 声明）：

| 组合 | 技能A | 技能B | 来源 |
| --- | --- | --- | --- |
| 互备组1 | 劈石破玉拳（cuff） | 混元掌（strike） | `valid_combine` 双向 |
| 互备组2 | 华山拳（cuff） | 华山掌（strike） | `valid_combine` 双向 |
| 互备组3 | 华山拳法（cuff） | 华山掌法（strike） | `valid_combine` 双向 |

三组之间不互备（跨组 `valid_combine` 拒绝）。`huashan-quanfa` 激发 cuff，非 unarmed。

原 NPC（岳不群/风清扬等）的 `prepare_skill` 配组只作源码依据。

## 条件矩阵

198 条件覆盖三类方法（与全真同模式）：

1. **interface**：每门技能对全部候选组合测试允许/拒绝，含跨组负例。
2. **prepare_sequence**：sequential / basics / names 三种准备路线 × 两种输入顺序，l200/l400/l800；不是双方交锋先手。
3. **round**：solo / pair 准备下的单轮交锋，每条件 100 样本。

另有等级 400、加力 50、持剑、低身法、目标忙乱及取消准备等边界，具体以冻结条件为准。

## 关键发现

- 三组互备各自独立，同 usage（cuff/strike）不同技能名经 prepare 命令区分。
- 跨组互备一致拒绝，与源码 `valid_combine` 声明吻合。
- 华山拳法/华山掌法组是独立于华山拳/掌的互备关系，非别名。

## 限制

- 仅单轮交锋观察，非完整持续效果。
- 实验等级/映射为赋值，不证明从师可学或同养成成本。
- 基本内功 600 未映射，隔离内功被动。

## 证据

- 原始数据：`E/review-huashan-combination-f1-20261020/`，E = `C:/tools/msys64/home/oiuv/mud-evidence/martial-data`
- 工具：`tools/tests/martial_data/school_huashan_combination_cases.mjs`
- 测试：`school_huashan_combination.test.mjs`
