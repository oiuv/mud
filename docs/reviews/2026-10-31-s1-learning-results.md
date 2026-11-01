# S1 普通学习回调：矩阵夹具修复与严格消费者

日期：2026-10-31。范围：S1 普通学习（`s1-learning`）25 条件的夹具、观察器与消费者修复；不修改游戏运行期源码、数值或存档。

## 一、问题与根因

旧 `smoke-s1-learning-v68..v75` 反复在同一处失败：`s1-learning-miao-chongtian-exp100001` 等预期 observed 的条件实际 refused，随后 SIGTERM。核对原始记录与源码后确认两个夹具缺陷：

1. **技能资格夹具缺基本技能**：`chongtian-zhang` 的 `valid_learn` 要求 `strike ≥ 60`（另有内功、内力、空手检查），而旧夹具只设了目标技能 50 与 force，条件被 `你的基本掌法火候太浅。` 拒绝——拒绝文本被误记为许可回调拒绝。准备矩阵（`E/prep-s1-learning-callback-20261029-v1/matrix.json`）逐条件给出的夹具（unarmed/claw/strike/finger/hand/whip 各 60）在旧条件生成中被简化丢失。
2. **观察器提前污染许可**：旧 `prepare_s1_learning` 对 expected=observed 的条件直接预置 `can_learn/*` 并 `map_delete` 教师 `no_teach` 回调，绕开了被测回调本身；预许可、自然取得与许可后技能拒绝三种语义被混为一谈。

另有慕容 `has_asked/murongbo` 共享标记、同学生续行 `time/learn` 同秒守卫、刀白凤 `recognize_apprentice` 家族/性别/经验闸口与飞凤鞭法 `valid_learn` 长鞭要求，均未在旧夹具中表达。

## 二、修复内容

### 条件夹具（`tools/tests/martial_data/school_s1_learning_cases.mjs`）

- 21 条矩阵条件逐条恢复矩阵夹具：每技能基本技能 60、`force 198`（有效内功 99）技能拒绝变体、经验 99999/100000/100001 边界、家庭映射（中原苗家/慕容世家等原名与辈分）、精神/潜能/忙乱原值。
- 采样数按矩阵：3 个随机进度条件各 100、其余 2，正式合计 **336**；烟雾每条件 2（合计 42）。
- 新增刀白凤四条件（矩阵外，源码钉对 `daobf.c` 的 `recognize_apprentice`）：家族/性别/经验三闸口拒绝与成功认徒各 2/2，成功条件按原 `valid_learn` 要求持长鞭（`/clone/weapon/changbian`）并具备基本鞭法 60。
- 多动作条件恢复原设计：`real-repeat` 同学生两次原 `learn`（最小间隔 2 秒，绕开原 `time/learn` 同秒守卫且步间不改状态）、`murong-repeat` 两步、`murong-cross-skill-shared-mark` 六路少林技能完整链。
- 教师源码 sha256 逐一校验（8 名教师与矩阵来源一致）。

### 运行器与观察器（`runner.lpc`、`teaching_observer.lpc`）

- `prepare_s1_learning` 不再删除 `no_teach` 回调、不再按 expected 预置许可；仅显式 `s1_pre_grant` 夹具（预许可条件）写入许可，教师技能等级按条件声明核验（不改原 NPC 数值）。
- 新增 `advance_s1_teaching` 步进器：逐步执行原 `learn` 命令，条件声明最小步间隔时用 `call_out` 等待，同学生续行不插入任何状态修改。
- 快照新增 `s1_marks`（`has_asked/murongbo`、`can_learn/daobaifeng` 临时标记）与 `teacher_no_teach`（**raw** 读取，不求值回调）。

### 严格消费者（同条件文件 `validateS1LearningRecord`）

逐变体校验，替代“只看 outcome 与数组存在”的弱消费者：

| 校验面 | 内容 |
| --- | --- |
| 许可 | `can_learn/miao/chongtian-zhang` 前后快照：自然取得 0→1、预许可 1→1、拒绝条件 0→0、许可后技能拒绝 0→1 且技能不增长 |
| 标记 | `has_asked/murongbo` 0→1（首拒）/1→1（后续与跨技能链）；`can_learn/daobaifeng` 0→1（认徒成功） |
| 熟练 | 成功条件技能或领悟增长；拒绝条件技能、领悟均不变 |
| 费用 | 精神支出=原公式 `(100+2×等级)/30`（6/次）、潜能 +1/次、内力不变；`real-repeat` 合计 12/2 |
| 命令 | 逐步原命令返回值按矩阵（含技能拒绝返回 0）、同一学生续行 |
| 原文 | 字符串拒绝原句、许可授予原话、少林禁教两句、认徒四句、内功火候拒绝句逐条送达；`teacher_no_teach` 原声明类别一致 |

## 三、验证

- 单元回归：新增 `school_s1_learning.test.mjs` 4 项（矩阵采样口径、夹具原值、完整语义通过、缺许可/缺进度/错误费用/缺步/缺句/缺标记拒绝）；`school_combat_cases` 8、`execution` 29、四模块 44、历史矩阵 2 均通过（非全套重跑）。历史矩阵测试的“10-29 窗口条件数”断言由 570/562 更新为 574/566：daobf 四条件为工作区既有新增（此前即未同步断言），旧前缀样本数与快照 hash 未动。
- 烟雾 `smoke-s1-learning-v77-20261031`：50/50 导入、0 校验错误、驱动退出 0；独立重验 `temp/replay-s1-learning-smoke-v77-20261031-v1.json` 50/50 通过。`smoke-v76` 因装备校验白名单未接纳原长鞭而在末条件失败（48/50），保留不改写。
- 正式 `formal-s1-learning-v4-20261031`：344 计划（矩阵 336 + daobf 8）。结果见下节。

## 四、正式结果

`E/formal-s1-learning-v4-20261031`：**344/344 导入、0 校验错误、驱动退出 0**（原生 207.4 秒/含准备 221.2 秒）；独立重验 `temp/replay-s1-learning-formal-v4-20261031-v1.json` **344/344 通过**（0 缺样/0 pending），统计另存 `E/report-s1-learning-formal-v4-20261031`。整体 302 观察/42 预期拒绝，与计划口径一致（随机进度三条件各 100 + 认徒成功 2 观察，其余 42 拒绝）。

| 条件 | 记录/计划 | 观察 | 拒绝 |
| --- | ---: | ---: | ---: |
| honghua-zhao-taiji-quan-string-refusal | 2/2 | 0 | 2 |
| meizhuang-huang-longzhua-gong-string-refusal | 2/2 | 0 | 2 |
| xiaoyao-suxingh-liuyang-zhang-string-refusal | 2/2 | 0 | 2 |
| xiaoyao-suxingh-zhemei-shou-string-refusal | 2/2 | 0 | 2 |
| xuanming-he-dulong-shenzhua-string-refusal | 2/2 | 0 | 2 |
| xuanming-he-xuanming-zhang-string-refusal | 2/2 | 0 | 2 |
| xuanming-lu-xuanming-zhang-string-refusal | 2/2 | 0 | 2 |
| miao-chongtian-exp99999 | 2/2 | 0 | 2 |
| miao-chongtian-exp100000 | 2/2 | 0 | 2 |
| miao-chongtian-exp100001 | 100/100 | 100 | 0 |
| miao-chongtian-existing-permission | 100/100 | 100 | 0 |
| miao-chongtian-permission-before-force-refusal | 2/2 | 0 | 2 |
| miao-chongtian-real-repeat | 100/100 | 100 | 0 |
| murong-banruo-zhang-first-refusal | 2/2 | 0 | 2 |
| murong-yizhi-chan-first-refusal | 2/2 | 0 | 2 |
| murong-nianhua-zhi-first-refusal | 2/2 | 0 | 2 |
| murong-sanhua-zhang-first-refusal | 2/2 | 0 | 2 |
| murong-fengyun-shou-first-refusal | 2/2 | 0 | 2 |
| murong-yingzhua-gong-first-refusal | 2/2 | 0 | 2 |
| murong-repeat | 2/2 | 0 | 2 |
| murong-cross-skill-shared-mark | 2/2 | 0 | 2 |
| duan-daobf-feifeng-bian-wrong-family | 2/2 | 0 | 2 |
| duan-daobf-feifeng-bian-wrong-gender | 2/2 | 0 | 2 |
| duan-daobf-feifeng-bian-low-exp | 2/2 | 0 | 2 |
| duan-daobf-feifeng-bian-success | 2/2 | 2 | 0 |

关键语义（严格消费者逐条核过，非抽样）：

- 自然取得 100 条：许可 `can_learn/miao/chongtian-zhang` 0→1 伴随教师原话「今日我就传你白鹤冲天掌」，随后技能进度增长；预许可 100 条 1→1 且不重复授予；许可后技能拒绝 2 条许可 0→1 但 `valid_learn` 原火候拒绝句返回原命令失败、无进度。
- 同学生续行 100 条×2 步：第二步跨过原 `time/learn` 同秒守卫后再学，合计精神 12/潜能 2 每样本（全批成功学习 402 次、精神 2412、潜能 402，均为原公式费用）。
- 慕容少林禁教共享标记 18 次 0→1：首拒原话、后续与六路跨技能链均为「你还是安心学本门功夫吧。」，技能/领悟/资源全程不变。
- 刀白凤认徒：三闸口拒绝原句各 2，成功认徒 2 条 `can_learn/daobaifeng` 0→1 并带长鞭学习进度。
- 旧弱消费者系列（`formal-s1-learning-20261030` 等）按严格契约复核为 0/214 通过（318 缺样），保留原件不改写、不计入关联。

## 五、限制

- 仅覆盖 25 个具名条件（8 名教师的普通学习回调），不代表各教师全部课程、绝招授权（ask_skill/teach_pfm）或 4.3 的 1557 条声明闭环；b30 预置领悟效果不作传授证据。
- 拒绝记录证明的是该条件下原闸口行为，不证明函数其他分支；成功记录为原命令即时进度，不含完整养成。
- 旧 `formal-s1-learning-20261030`（14/532，SIGTERM）与 v2/v3（214/532）等弱消费者时代原件保留原样，不满足严格契约，不计入本次关联。
- 4.3 教学逐条索引的精确关联（`recognize_apprentice` 等资格函数）由教学对账工具的后续版本处理，见 2026-10-30 教学证据对账的扩展检索。
