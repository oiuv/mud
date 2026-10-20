# 公共技能特殊效果缺口预研

只读调研，覆盖 skill-music-results 未覆盖的 4 项 + 七弦门槛正端。

## 1. 双人合奏（笑傲江湖专属）

全库仅 `xiaoao-jianghu.c` 含合奏逻辑。

**触发条件**：
- 两名不同 ID 奏者，各自 raw 笑傲 ≥ 100
- 间隔 ≤ 30 秒（`> 30` 失效）
- 听者清醒存活同房间、无既存 powerup

**MA-009 方向缺陷**：弹琴→吹箫触发合奏；吹箫→弹琴不触发（other 标记写错）。

**效果**：听者 apply/attack+dodge 各 +min(第二奏者 raw, 听者有效内功)/6，raw/2 秒后 call_out 解除。

## 2. 自然解除（两套机制）

- **笑傲 powerup**：call_out(lvl/2) 解除
- **condition 系统**：heart_beat 每 5-15 秒 tick，三种模式（倒计时/阈值/概率）

## 3. 国歌日本附加攻击

**触发**：competition_with 场景 + 对手 nation=日本 + raw ≥ 200

**公式**：额外攻击 = min(10, floor((raw-200)/10))

**边界**：200→0 次、210→1 次、300→10 次

## 4. 七弦独立 hit_ob

**七重资格门**：raw≥180、max_neili≥2500、neili≥500、内力压制、对手 max_neili≥10、对手不忙、damage≥150

**效果**：busy(1) + neili-100 + qi damage(raw/5+dmg/3) + qi wound(raw/8+dmg/5)

## 5. 七弦准确门槛

三个门槛 180/180/100 全部 raw 值、严格小于。270 内功门用有效值。正端=阈值可通过。

## 实施状态与 3/4/5 计划（2026-10-17）

### 已实施（1+2，独立新系列 `public-special-`）

按确认决策新建 slice 风格独立系列，填补 skill-music-results 声明的准确边界与独立 hit_ob 缺口，不改旧 `public-music` 矩阵。工具链：`tools/tests/martial_data/public_special_cases.mjs`（条件+校验）+ `public_special_cases.test.mjs`（纯测）；接入 `ability_cases.mjs` 聚合与 `execution.mjs` 资格来源核验；`runner.lpc` 为 hit_ob 加 qixian 白名单并为 `public-special` 开 before/after 快照。采集入口 `node tools/collect_martial_data.mjs abilities --smoke|--samples 2 --case-prefix public-special-`。

- **七弦门槛正端（item 1）**：3 个 raw 边界对（unarmed/sword 179-180、tanqin 99-100，固定前序门 force540/sword540/tanqin180/max_neili3000/qixian0），slice 风格 learnGate，`valid_learn` 原接口直接观察。6 条件 12 正式样本。
- **七弦独立 hit_ob（item 2）**：4 个资格门边界对（raw 179/180、max_neili 2499/2500、damage 149/150、对手 max_neili 9/10），每对低端返回 0（无状态变化）/高端触发并核验原公式 busy(1)、me 内力-100、目标 qi 伤 `raw/5+dmg/3`、qi 创 `raw/8+dmg/5`。8 条件 16 正式样本。接口输入 damage_bonus 不冒充最终掉血。

纯测 6/6、execution 集成 34/34 全绿；smoke 采集 14/14 复核：learn 99/179 拒绝原句入册、100/180 通过；hit raw-179 返回 0 零状态变化、raw-180 触发（实测 neili 6000→5900、qi 10000→9898=180/5+200/3、eff_qi 10000→9938=180/8+200/5、busy 1），与原公式一致。

### 待实施计划（3/4/5，需新夹具）

三项目前最接近 skill-music `music` 方法（原 play 命令 + do_effect），但各需新夹具；不并入 `public-special` 接口组，另建 `music` 子系列或独立命令。实施时沿用本系列的来源冻结、双 USER 快照与原命令入口原则。

- **国歌附加攻击（item 3）**：`chinese-anthem` do_effect 需 competition_with 场景——构造 `query_competitor()` 返回对手且对手 `nation=日本` 的在战双人。夹具：在 runner 增 competitor 绑定（`set_competitor` 或等价原接口），actor 原始 chinese-anthem ≥200。边界 raw 200/210/300 → 0/1/10 次 `COMBAT_D->do_attack`（`min(10,floor((raw-200)/10))`）。验证：逐次 do_attack 次数、目标 nation 判定、无 competitor 时仅消息分支。计划 ~4 条件 8 正式样本。
- **双人合奏（item 4）**：`xiaoao-jianghu` do_effect 需两名不同 ID 奏者（各 raw 笑傲≥100）间隔 ≤30 秒同房间、听者清醒存活无既存 powerup。夹具：runner 增双奏者序列（A 先 play 后 B play，可控间隔与 ID），听者第三人。分支：正序（弹琴→吹箫）触发合奏 / 反序不触发（MA-009 other 标记写错）/ 同 ID / 超时 >30s / 听者已 powerup。效果：听者 apply/attack+dodge 各 `min(第二奏者 raw, 听者有效内功)/6`。计划 ~6 条件 12 正式样本。
- **自然解除（item 5）**：合奏 powerup 的 `call_out(lvl/2)` 移除（raw/2 秒）。夹具：在合奏触发基础上增加真实等待（`observe_seconds` 跨过 raw/2），核验解除前后 apply/attack+dodge 归零、解除消息。可与 item 4 同夹具，仅延后观察窗。计划 ~4 条件 8 正式样本（含触发+解除生命周期）。condition 系统自然解除（heart_beat tick）另属公共 condition 采集，不混入本音乐组。

以上 3/4/5 需先在 runner 落地 competitor / 双奏者 / 定时等待夹具并各配纯测与 smoke，再冻结正式系列；不以已实现的 1+2 接口组替代。
