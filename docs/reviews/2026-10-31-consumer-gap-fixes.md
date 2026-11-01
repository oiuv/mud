# 消费者与冻结漏洞修复记录（对照 2026-10-31 维护者审查）

日期：2026-10-31。对照 `temp/goal.md` 顶部「必须先修的四类问题」逐项落实；只改离线工具、夹具与文档，保留全部既有未提交改动与失败原件。

## 一、S1 学习契约漏检（`school_s1_learning_cases.mjs`）

审查给出的四种被接受伪造（第二步改非学习命令、全体换学生身份、步间精神重置、删除零许可字段）已逐一拒绝：

- **逐步绑定计划原命令**：`step.command === teaching_expectations[i].action`。
- **真实角色绑定**：`step.student === raw.before[0].object`（样本真实对象）+ teaching_actor 形态 + 同一学生续行 + 教师实例绑定。
- **相邻状态连续**：步间精神/内力/已用潜能/技能/领悟/许可/标记逐一相等。
- **必需字段存在性**：jing/neili/learned_points/int 须存在且非 undefined，skills/learned/grants/s1_marks 须为对象，带许可条件时零许可键须**显式观察**（删除字段即拒绝，不以缺失默认 0 冒充观察）。

反例新增于 `school_s1_learning.test.mjs` 与 `strict_consumer_sweep.test.mjs`（错绑真实对象、删零许可字段、删必需字段等），并保留审查四例（非学习命令、换身份、步间重置）。

## 二、华山重施与防御契约漏检

- **重施时序**（`school_combat_cases.mjs`）：第二窗回调须 ≥ 首窗到期 + 原级数（`reenter ≥ exit + level`），首轮结束后 0.01/0.02 秒的伪二窗即使保留总 elapsed 也被拒；以首窗结束/二窗回调时差与重施前后状态判定，不只看总 elapsed。未新增旧原件没有的字段，不触发重采。
- **防御校验**（`school_huashan_school_defense_cases.mjs`）：`powerup.actor_side === 1`（错误 0 被拒）、增益执行方/侧与前置快照、进攻方无标记且属性未变、每轮两条 `dodge_checks`（base/settled、actor 0→target 1、huashan-shenfa）不得缺失或换名。

## 三、对账消费者冻结与副本保全

- `teaching_crosswalk.mjs` 的 `consumerFiles` 已含 `school_s1_learning_cases.mjs`（8 项），并新增 **consumer-snapshots 字节副本保全**（输出目录 `consumer-snapshots/`，`wx` 不覆盖）。
- 新对账版本 `E/audit-43-teaching-crosswalk-20261031-v6`（JSON SHA `f656f52c62d9c7d1e12db4b45bdcf87885bcb472d350cb756eb3c7718760b0c8`）：consumer_hashes 8 项、`consumer-snapshots/` 8 份字节副本、运行前后 hash 一致；声明关联 759/剩余 798 与 v5 相同（消费者修复不改关联面）。v2/v3 及旧冻结清单不改写、不回写。仅凭 8 项不宣称全部传递依赖闭包稳定。

## 四、「未关联=缺件」口径

已撤回绝对缺件表述：1473/791 为**精确入口口径下的未关联**，分层处置（已有数据待换锚/语句归属待核/整教师定点补采/静态异常与 NPC 自用）；检索范围、元数据关联不足、真正缺原件、已有效果缺实际传授分开记录。教学全矩阵正式补跑后关联 84→759（详见[矩阵结果](2026-10-31-4.3-teaching-matrix-results.md)），余 798 继续逐项处置，不按总数排新采。

## 五、原件复核与流程说明

- 修复后对同一批原件重新做通用+专用独立重验：**344/344、12/12、1200/1200 全部通过**（含新的真实对象与必需字段检查）；维护者手工核对的 344 记录/456 步零错位结论一致，无重采证据。全套工具自检 `temp/full-suite-20261031-v6.log`：**3218/3218 全绿、退出 0**（含新增反例）。
- 流程说明：教学全矩阵正式补跑（58130 样本）系依据 10-23「不等确认直接推进 4.3」授权执行，早于本审查“获明确确认后才进入 4.3 批量补采”的新要求被读到；成果按“后续成果保留并核验”保留（0 校验错误、58130/58130 独立重验），不再重复启动，4.3 勾选与 5.1 申请仍按新确认点执行。
