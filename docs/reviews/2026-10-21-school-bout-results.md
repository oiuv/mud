# 四派组合交锋数据复核（2026-10-21）

本页汇总本次引用的全真、华山、明教、桃花 24 个系列。它们是有限代表配置，不是四派全部组合和单项能力。数据按冻结条件重验，不能将“保存过多少次”直接作为覆盖量。

## 次数、版本和覆盖分开

| 门派 | 保存次数 | 按完整冻结条件去重的通过槽位 | 条件 ID 覆盖/当前代表计划 | 与当前工厂配置一致的通过条件 |
| --- | ---: | ---: | ---: | ---: |
| 全真 | 240 | 240 | 12/12 | 12/12 |
| 华山 | 460 | 180 | 9/10 | 8/10 |
| 明教 | 480 | 220 | 11/12 | 9/12 |
| 桃花 | 200 | 180 | 8/8 | 4/8 |
| 合计 | 1380 | 820 | 40/42 | 33/42 |

1380 次保存均通过当前消费者对各自冻结条件的重验，但完整冻结条件计数包含桃花同 ID 的不同配置，因此不是 820 个同版本随机样本。按 ID/编号不区分配置会得到 800，**这个数只能做粗略 ID 覆盖索引，不能代替正式数据的版本校验**。

当前配置匹配逐字段比较，仅忽略 qualification_note 与 qualification_sources 两个说明/来源字段；源码、原始条件及执行版本仍记录在[结构化摘要](2026-10-21-collection-repair-summary.json)中。该映射不是重签旧样本，不合并跨版本分布。

本次引用系列中完全未保存有效样本的条件 ID：

- `school-huashan-bout-huashan-quan-huashan-zhang-l400-jiali50-ordinary`：华山第二组合、加力 50、**ordinary**，不是旧报告所说的第二组 perform。
- `school-mingjiao-bout-nianhua-zhi-sanhua-zhang-l400-jiali0-perform`：明教第二组合、加力 0、perform。

此外有七个有历史有效样本、但与当前配置不完全相同的条件，不判成坏数据，也不默认可混算：

- 华山第二组合 ordinary、加力 0：旧领悟键 `huashan-zhang/piao`，现为 `huashan-quan/song`。
- 明教第二组合 ordinary、加力 0/50：旧领悟键 `sanhua-zhang/san`，现为 `nianhua-zhi/fuxue`。
- 桃花第一组合的四条件：旧配置没有 `qimen-wuxing`，当前配置增加 400 级。

Claude 应先核对这些差异对对应路径是否有影响，按实际版本明确复用理由或另建新系列；不能仅按同名 ID 合并。

## 配置及解释限制

- 四派均为 400 级实验配置；加力 0/50、原 USER 心跳与 30 秒观察，每条件 20 场、交替先手。具体身份、属性、激发、准备、装备及技能以各 frozen condition 为准，不证明从师可学或同养成成本。
- 全真前两组 ordinary 持剑且没有互备准备，实际用全真剑法；对应 perform 为空手互备。它们分别是合法历史配置，**不是只改变是否施展绝招的受控对照**，不能将伤害差异全归因于 perform。
- 华山/明教/桃花的测试工具曾在采集中修改绝招选择、领悟键或附加技能；同名条件仍可能是不同实验配置，原 manifest 和失败尝试均保留。
- 普通策略不得主动发动绝招，perform 必须有真实发动；原费用、忙乱、心跳恢复和攻击轮数分别验证。撤回未按唯一版本计算的“47–52 攻击/场”“100–289 launches/条件”等汇总，不以原宽范围数字作当前数据结论。
- 多个系列因后续绝招未发动而 SIGTERM，之前已保存且重验通过的记录可单独复用，但不能把整个系列写成“code 0、NO ERRORS”。华山 final1 没有 samples 目录，作为完整性异常保全，不补造样本。

## 证据

R = `C:/tools/msys64/home/oiuv/mud-evidence/martial-data/review-repair-20261021`。

- 全真：`mud-martial-quanzhen-bout-f1-v2-20261021`。
- 华山：`mud-martial-huashan-bout-f{2,4,5,6,7,8,9}-20261021`、`mud-martial-huashan-bout-final{1,2,3,4}-20261021`。
- 明教：`mud-martial-mingjiao-bout-f{3,4,5,6,7}-20261021`、`mud-martial-mj-bout-final{2,3}-20261021`、`mud-martial-mj-bout-rest{1,3}-20261021`。
- 桃花：`mud-martial-taohua-bout-f{4,5}-20261021`、`mud-martial-th-bout-rest2-20261021`。

R/replay.json 保存每个槽位的尝试与执行版本，R/preservation.json 保存完整归档及直接原件的核验清单。路径原来在 Windows Temp，现已保全到 R；原件仍保留。详见[修复与续接](2026-10-21-collection-repair-review.md)。4.2 仍未完成。
