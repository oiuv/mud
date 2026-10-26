# 证据核验与工具修复（2026-10-24）

> 关联：[4.2 自审](2026-10-22-task-4.2-self-review.md)、[S 残余处置](2026-10-22-s-residual-disposition.md)、[G6/G7 处置](2026-10-22-g6-g7-disposition.md)、[缺口台账](2026-10-20-school-combination-gaps.md)

## 背景

续接 Goal（`temp/goal.md`）要求先恢复进度、核验既有质量，再补齐 4.2。本次对 2026-10-21 至 10-23 的完成声明做文件级核验，并修复阻塞采集的工具缺陷。

**验收依据**（design.md）：缺失原始证据不能宣称可复核；烟雾不能替代完整样本；配置扫描不证明实际效果覆盖；仅因夹具缺条件而拒绝的入口仍需继续调查。

## 一、声明核验结果

| # | 声明 | 判定 | 实际证据 |
| --- | --- | --- | --- |
| 1 | G3 合成 371 样本（xianglong 243 + baihua 122 + below-threshold 6） | **与声明不符** | Temp 全部 `mud-martial-g3-*20261022` 14 目录 samples 为空；E 无对应系列。且计划本身只有 **4 条件 / 204 计划样本**（`school_composite_synthesis_cases.mjs`，`school_composite_synthesis.test.mjs:14` 断言 `cases.length===4`），与 371 对不上 |
| 2 | 合成校验反例 7/7 全绿 | **当前不可复现** | 7 项反例全部 ENOENT 失败，因 `school_composite_synthesis_validation.test.mjs:10` 硬编码依赖已消失的 `Temp/mud-martial-g3-formal6-20261022/samples` |
| 3 | G5 缺失 4 条件 × 20 样本 | **部分验证** | huashan、mingjiao 各 20 条有样本（`mud-martial-{huashan,mingjiao}-bout-rest1-20261022`）；**wudang 太极剑 jiali 0/50 两条件 0 样本**，`g5-missing-wudang1/2` 为空壳 |
| 4 | G6 目标失活 2/2 | **已验证** | `mud-martial-g6-faint2-20261023/samples/school-gumu-fireice-l200-target-faint.{0,1}.json` 2 条，字段支持 qi=100→-1、`target_living=1`、`same_room=1` |
| 5 | G6 目标离场 2/2（same_room=0） | **与声明不符** | `g6-depart*` 6 目录 samples 全 0，全盘无 `same_room` 样本 |
| 6 | G6 边界 2/2 | **证据缺失** | `g6-boundary-20261023` samples=0 |
| 7 | 全量回归 3087/3087 全绿 | **证据缺失** | 仅文档口头声明；`verification.md` 无对应记录。本次实跑得 **3087 项 / 3070 通过 / 17 失败** |
| 8 | S7 三项已完成（feifeng-bian/xi 等） | **与声明不符** | `mud-martial-npc-grant-*` 全系 samples=0，coverage 全部 `recorded: 0` |
| 9 | S7 十项「采集中」 | **与声明不符** | 同上，0 样本 |
| 10 | G5 perform 扩展 280 条 | **已验证** | `E/review-repair-20261021/mud-martial-bout-perform-*` 合计 280（f3 40 + f4 40 + shaolin-f2 80 + emei 80 + gumu 40）；去重后 240 唯一槽位（武当 f3/f4 重复 40） |

**结论**：G6 失活、G5 perform 280、G5 huashan/mingjiao 补采有效可复用；G3 371、G6 离场/边界、wudang 太极剑、S7 全部、3087 全绿 **均无原始证据支撑**，按纪律降级为「待采/待核实」，不得作为 4.2 闭账依据。

## 二、证据保全（Temp → E）

10-21 之后新增系列仅存于易失 Temp。已按既有 preserve 模式非破坏性复制入 `E/preserve-temp-20261024/`，17 个含真实样本目录：

- **重点**：`slice-combination-f6`（7424 条，G4 核心证据）、`g6-faint2`（2 条，G6 失活唯一证据）、`mingjiao-bout-rest1`（240）、`taohua-bout-rest1`（160）、`huashan-bout-*`（140）、`qz-comb-smoke`（284）等
- 逐目录记录 `manifest.txt`（COPIED/ALREADY/MISSING/FAILED + 文件数）
- 空壳目录（npc-grant 全系、g3 全系、g5-missing、g6-depart/boundary）保留现场用于审计失败轨迹，未计入有效证据

## 三、工具缺陷修复（仅 tools/tests，未触游戏源码）

### 1. b30-perform 采集阻塞（S7 根因）

- `validateNpcGrantPerformRecord` 断言 `collection_group === 'npc-grant-perform'`，条件实际写 `'b30-perform'`（登记表、分发、runner、90+ 基线排除均用后者）→ **每条必被拒**
- `npcGrantPerformConditions(catalog, opts)` 未接收 `readSource` → `source_evidence` 哈希恒为空串；调试时注释掉 `ability_source`/`source_evidence` 掩盖了问题
- **修复**：组名断言改回 `b30-perform`；签名改为 `(catalog, readSource, opts)`，缺源即断言失败；恢复 `ability_source`（path/sha256/entry_id）与 `source_evidence`，并对 catalog sha256 交叉校验；调用点传入 `readSource`
- **验证**：58 条件（29 绝招 × 观察/拒绝）构建成功、ID 唯一、**58/58 具备完整 64 位 sha256 证据**；新增 `school_npc_grant_cases.test.mjs` 5/5 通过

### 2. 激发映射自映射导致 `effective skill mapping` 失败

- 首轮烟雾 3 条校验错误，实为 1 条真实错误：`*DATA FAIL: effective skill mapping`（`runner.lpc:1305` 校验 `query_skill_mapped(key) == value`）
- 根因：`actorMappings = { force: 'force', dodge: 'dodge', parry: 'parry', ... }` 自映射（同 slice-combination 历史问题）
- **修复**：只映射真实 `usage → skill`；测试加反例锁住（自映射必须拒绝）

### 3. 冻结基线计数未同步

- 新增模块未登记排除，导致 `legacyFiles` 计数 `10538 !== 10536`、`10383 !== 10381` 等
- **该失败先于本轮已存在**（Codex 的 `school_npc_grant_cases.mjs`、`school_public_exert_cases.mjs` 未登记）
- 按既有排除法补登记（`school_mingjiao_remaining_{base,perform}_integration`、`taohua_{control,combo,attack}_integration`），冻结数字不变

### 4. B22/B29/collection_review 计数与新夹具脱节

- b22 新增 `lonely-sword/jue` 非战斗演练（`kind: practice`, `nonCombat: true`, 带门槛对）——A3 落地；`dugu-jiujian/jue` 同模式（A4）
- jinshe-zhui/tuwu、xuanyuan-arrow/baibu 已建专用弹药夹具并转入可采配置，但 `gates: []` —— **已按源码补门槛对**：
  - `tuwu.c`：level [99,100]、neili [299,300]，拒绝句照抄原文
  - `baibu.c`：level [99,100]、neili [99,100]，拒绝句照抄原文
- 同步计数断言（b22 10→11；b29 dispositions 8→6、pending_fixture 6→4、implemented 47→49；collection_review declarations 508→509 等），**每处注明漂移来源**，非照抄实际值消音

**验证**：b22 + b29 + collection_review 合计 **26/26 通过**。

## 四、当前工具自检基线

实跑 `node --test --test-concurrency=4 "tools/tests/martial_data/*.test.mjs"`：

- 修复前：**3087 项 / 3070 通过 / 17 失败**
- 17 项失败构成：7 合成反例（G3 证据丢失）、3 b29、3 文件计数基线、B22 1、collection_review 1、taohua 2（其中 1 为同一计数问题）
- 上述工具侧问题本轮已修（含 G3 校验测试的证据路径耦合，见下）

### G3 校验反例的证据耦合修复

`school_composite_synthesis_validation.test.mjs` 原硬编码依赖 `Temp/mud-martial-g3-formal6-20261022/samples` 的真实观测样本，该目录已消失导致 7 项反例全部 ENOENT。

**修复**：基线样本改为三级来源——`COMPOSITE_SAMPLE_DIR` 环境变量 → 历史 Temp 路径 → `E/preserve-temp-20261024/` 保全路径；均缺失时用条件合成一个满足校验器契约的最小合法样本。

**口径（重要）**：合成基线只用于验证「校验器能拒绝坏记录」，**不是实采证据**，不能用来闭账 G3。修复后 10/10 通过（3 静态 + 1 干净样本 + 6 反例），但这只证明校验器逻辑正确。G3 合成学习链的实采仍列**待采**，须另开新正式系列，并真正执行「子技能达标后取得主技能」的过程。

待真实样本补采后，设 `COMPOSITE_SAMPLE_DIR` 即可切回真实证据基线，无需改代码。

## 五、4.2 仍未闭合（不得勾选）

按 design.md「每个独立能力入口有实测或确认不适用的依据」：

| 缺口 | 状态 | 说明 |
| --- | --- | --- |
| G3 合成学习链 | **待采** | 371 样本无证据；须另开新正式系列，且要真正执行「子技能达标后取得主技能」过程 |
| G6 离场/边界 | **待采** | 两候选中仅失活有证据 |
| G5 wudang 太极剑 jiali 0/50 | **待采** | 2 条件 × 20 样本 |
| S7 / b30-perform | **待采** | 工具已修通，58 条件可采；19 项附加控制仍缺逐项效果证据 |
| A3-A6 演练/多段窗口 | **部分** | A3/A4 已落地（b22 practice）；yujian-shu/yujian 多段窗口、five-avoid/break 多轮循环仍待补夹具 |
| S1-S6 各残余 | **待采/待核** | 处置文档中把成员能力、独立接口边界推给 4.3/第 5 章，属缩减 4.2 范围，不予采纳 |
| 另四派组合交锋 | **待采** | 42 条件仅覆盖全真/华山/明教/桃花；武当/少林/峨嵋/古墓无完整组合交锋 bout |
| B1 六脉纵横替代入口 | **待核** | 分发不可达成立，但需核对 liumai-shenjian 系列是否有等价控制 |

## 六、处置文档中涉嫌缩减 4.2 范围之处

1. `2026-10-22-s-residual-disposition.md:13`：S1「组合成员能力的完整枚举属于 4.3 及后续全武学阶段」——4.2 明确要求「组合**及其单项能力**」
2. `:29`：S2「独立接口边界测试属于 4.3/第 5 章范围」——valid_parry/valid_damage 独立边界属 4.2「单项能力」
3. `:29`：S2「现有 jiali 0/50 数据可用于趋势判断」——趋势 ≠ 效果覆盖
4. `:89`：S6「门派级防御可通过已有交锋数据间接验证」——间接验证无逐条效果证据，不能闭账
5. `2026-10-22-task-4.2-self-review.md:115`：未完成项表「S1-S7 … 4.3/第 5 章继续」

以上不改变 4.2 验收范围；残余须逐项采集或给出有依据的不适用处置。

## 七、合规

- 未修改游戏运行期 `.c/.lpc/.h`、武学数值、公式、门派配置、子模块、玩家存档、正式服务配置
- 未连接正式服，未读取私密账号或存档，未调用模型或收费服务
- 测试使用隔离副本、临时角色、本机回环端口
- 未提交、推送、部署
- 明确错误只记录不修（`baibu.c` 消息写「至少要有一支箭」而代码判 `amount < 3`，文实不符，留缺陷台账）
