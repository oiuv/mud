# martial_summary — 6.1 三层资料汇总的统计与核对脚本

`collect-martial-arts-dataset` 任务 6.1（兵器/门派/全武学三层资料汇总）的可复现统计脚本与小型索引产物。
原始大样本与大账目留在仓库外证据目录 `E = C:/tools/msys64/home/oiuv/mud-evidence/martial-data`
（probe 正式 12 系列、`acceptance-51-53-20261115-final/` 5.3 验收账等），本目录只保存生成脚本与小型 JSON 索引/统计。

文件名前缀 `a61_` 对应 6.1 工作日志中的脚本名（旧工作副本曾在 temp/ 下，现全部迁入本目录；temp/ 下同名旧副本不再维护）。

## 运行方式

全部脚本从仓库根目录运行（`node tools/martial_summary/<脚本>.mjs`），只读 `E` 与游戏源码，
生成器写出同目录下同名 `.json`；先生成统计，再运行核对脚本。成本生成器完成后运行 `a61_render_costs.mjs`，仅同步汇总文档的成本表。分类回归运行 `node --test tools/martial_summary/cost_outcome.test.mjs`。

| 脚本 | 输出 | 作用 |
| --- | --- | --- |
| `a61_stats.mjs` | `a61_stats.json` | 语料/门派/目录角色/武器用法分组统计（coverage 槽位口径） |
| `a61_probe_truth.mjs` | `a61_probe_truth.json` | probe 正式 12 系列全量槽位/结局真值（文件级与 coverage 级双口径） |
| `a61_weapon_dedup.mjs` | `a61_weapon_dedup.json` | 兵器主技能去重（catalog 父源 valid_enable 扫描） |
| `a61_costs.mjs` | `a61_costs.json` | 逐条目施放成本/伤害通道，按结局与 5.3 验证状态分账（正常施放/落空反噬/资格拒绝/取代校验失败/无契约 + 全尝试观测包络） |
| `a61_fingerprints.mjs` | `a61_fingerprints.json` | 双源码快照分版统计与 kungfu 技能源 sha256 交叉比对 |
| `a61_cond_series.mjs` | `a61_cond_series.json` | 条件→系列索引（跨系列同名条件标 primary/also） |
| `a61_selfaudit.mjs` | — | 算术恒等式核对（分项↔合计、去重、处置账、成本分账），失败非零退出 |
| `a61_doc_check.mjs` | — | 汇总文档表格数字与统计 JSON 转录核对，失败非零退出 |
| `a61_spotcheck.mjs` | — | 数据语义抽查（对 E 真实原件与游戏源码逐项核对），失败非零退出 |

## 数据语义口径（a61_costs.mjs）

- **normal_effect 正常施放**：5.3 已验证的 observed，包含目标恢复、伤害、控制及自体增益等。目标恢复的指标包括 eff_qi_recovery 等，施放者正常气血费用不把成功治疗变成反噬。结果分类在 `cost_outcome.mjs`；这是已验证样本的汇总分类，不替代 5.3 的效果正确性校验。
- **miss_backlash 合法落空/保护无效与反噬**：已验证的攻击无目标受效或 surge-force/roar 的合法无效分支归 miss；tao 反噬须同时有源码分支依据、昏迷和气血归零。自身掉血不单独作为反噬依据；治疗目标的恢复事件属于正常受效，施放者的正常自损费用仍保留。
- **refused 资格拒绝**：refused 且拒绝语义验证通过；通道记录的是拒绝副作用，不是施放成本。
- **unverified 取代/校验失败**：5.3 重放失败槽位（via: entry-closure/superseded/special），另列；槽位键为 系列名+条件+槽位（跨系列同名槽位不混）。
- **no_contract 无契约**：MA-136 复现条件，另列。
- **envelope 全尝试观测包络**：全部尝试不分结局的 min..max，仅作尝试包络，不是正常使用成本。
- 伤害 qi_cost 与创伤 eff_qi_cost/jing_cost 分列不相加；未观察通道（如 busy=null）跳过不填零。
