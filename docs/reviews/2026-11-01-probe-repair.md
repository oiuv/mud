# 武学采集工具修复与证据复核

日期：2026-11-01。范围仅限离线生成器、消费者、统计及文档；不修改游戏源码、公式、门派、玩家数据或旧原件，不启动新采集。

## 当前验收位置

保留 4.2 的既有阶段记录，撤回 4.3 的错误完成口径。清单为 **11/17**；4.3、5.1–5.3、6.1–6.2 待完成。本轮修好工具，不代表上述完整任务或整个 Goal 已通过。

先前的 627/706 formal 数量和 86%/96.7% 覆盖率来自不充分的关联检查，已撤回。旧版本化报告与原件保留；它们不是新版校验结果。

## 已修复的行为

- 教学命令从真实 inquiry 映射取话题，注释或字符串中的示例不作路由；无可核话题、教师身份或真实学习技能的条目进入 pending，不能静默省略或猜参数。
- 学习闸口必须给出教师实际声明的技能，命令为 `learn NPC_ID SKILL 1`。普通探测角色不预设虚构门派，避免统一卡在叛师确认。
- 能力探测必须逐入口提供 profile，指定 usage、资格依据、角色、装备、目标、观察窗口和预期。补齐对应基本技能；持器与徒手分开；不自动授予领悟，不伪造缺失主技能，不从最后一个 valid_enable 比较猜用法。
- 随机条件默认 100 次；只有显式确定性检查允许 2 次。执行管线保留计划的正式样本数，不再统一缩成 2 次。
- 消费者核对命令、真实身份、连续状态、实际 grants、学习进度及师承变化；不从 command_accepted、伪造 recruited 标记或错误字段推断成功。
- 能力 probe 记录需使用新版本契约并观察实际目标技能发动。通用调查仍不代替专用效果、回调或生命周期消费者。
- 教学 crosswalk 不把通用 probe 关联成已验收教学。新增 probe 依赖进入执行/消费者版本冻结；不回写旧系列身份。
- 覆盖索引复用 openSeries/readSamples/reviewSeries，核对冻结来源 hash、样本身份与内容、专用消费者、条件完整性和实际成功退出；分别列 formal、smoke、refused_only、unverified、config_only、none。不能将另一系列的烟雾样本补到空正式声明上。

## 本轮只读原件复核

证据根 `E = C:/tools/msys64/home/oiuv/mud-evidence/martial-data`。

| 系列 | 本轮检查 | 结论 |
| --- | --- | --- |
| `E/review-b21-f1-20261019` | 台账及通用/专用重验 2200/2200，2152 observed、48 refused；实际进程 code=0、signal=null，错误列表为空 | 对应 20 个入口有正式触达证据；不是全游戏覆盖 |
| `E/perform-probe-formal-20261101-v12` | 旧通用 probe，原计 92 observed、108 refused、2 error | 保留旧调查原件；没有新契约与专用效果验收，不计正式效果 |
| `E/teaching-probe-formal-20261101-v3` | 1486 条：1426 条通过调查结构检查的拒绝、44 条缺真实技能的学习命令、16 条运行错误 | 无成功教学观察；不完成 4.3 |

只对前两系列做限定目录的新版覆盖复核：730 个目录入口中 formal=20、unverified=101、none=609。这里的 none 仅表示这两个目录未提供合格引用，不能据此安排 609 项重新采集。

本轮读取的系列指纹依次为 dadb4cd5d4b739f9a5b4c2461605dd622def9da4cbd19ecd83ee350c8997c708、bf36e47fdd0e77720b7639579794f2e5bb5099614ddd4150adc3cae8abf3d87a、df00f0cc5da4f71da2f82f1be3c77cbcf63b8d7f2cb8475a7322f92c0347debc；限定覆盖所用 catalog SHA256 为 6600f87e0171e27266f70ff1c5b9fd6312874b2243a0312a5273833e3bd813c7。

v13/v14 能力批次存在 `effective skill mapping` 等夹具错误及部分写入，保留现场，不借用 v12 数量描述其结果，也不追认为通过。

## 使用与后续维护

`buildPerformProbePlan(coverage, readSource, { profiles })` 和 `buildTeachingProbePlan(plan, crosswalk, readSource, { learningSkills })` 返回 `conditions/pending`。先审 pending；直接执行包装器发现 pending 会报错，防止用兜底配置开整批。

能力输入按精确入口 ID 在 `probe_profiles` 中配置 usage、qualification_note、actor、target、observe_seconds、expected、samples；随机正式 samples 不少于 100，确定性检查另设 deterministic。教师计划的每条 row 指定真实 skill/topic 和可选 profile；学习技能也可通过 learning_skills 按声明 ID 指定。只选择已核实的小批次，不从静态候选直接宣称运行期资格。

覆盖工具只读，不启动驱动；输出必须是新目录：

```text
node tools/tests/martial_data/perform_entry_coverage.mjs EVIDENCE_ROOT CATALOG_JSON NEW_OUTPUT [SERIES_DIR ...]
```

省略 SERIES_DIR 扫描工具列出的既定根；显式提供时只核查这些目录。输出保留完整目录范围、错误、失败样本和未验收原因，不能只抄总数。

下一步先复用已有专用系列补关联；对真正缺合法配置的条目逐项核实，再烟雾、正式采集及独立重验。不要重复已有效的长时窗口，不修改旧原件补身份或参数，不因此调整武学平衡。

## 回归

本轮定向测试包含正确原件/状态正例及错误命令、外来学生/教师、虚假授权/招收、资源重置、错误样本内容、来源漂移、缺样本、烟雾冒充正式、非法用法/装备和正式采样量反例。

最终版本八模块 **66/66，0 失败、0 跳过，实际退出 0**（71.568 秒）；不是全库工具回归。模块为 perform_entry_coverage、perform_probe_cases、probe_observation、teaching_probe_cases、teaching_crosswalk、collection_review、ledger、execution 的 .test.mjs。CLI --help、OpenSpec strict 和 git diff --check 均退出 0；游戏目录及子模块 diff 为空。本轮没有修改 LPC，未重跑已有长时驱动窗口。

新版覆盖同时冻结复核前后全部登记的 JavaScript 消费者 hash，CLI 将字节副本保存到新输出目录 consumer-snapshots；若复核或保全期间文件改变则拒绝发布。生成器与新增观察器也进入新采集的执行版本身份，不把新规则写回旧系列。

实际 CLI 端到端只读复核也已退出 0：输出保留于 C:/Users/oiuv/AppData/Local/Temp/mud-probe-cli-check-D65LiC/coverage，单独 B21 获 20 formal、0 诊断，680 份登记的消费者副本齐全。该目录是复核报告，不是新模型调用或新驱动采样。
