# 首组 NPC 教学采集结果

系列：`9f9f94019a11d4c3477e3d411dff64d4a36e2ad3ba543eed292c03e88705c15c`；证据摘要：`e1a152bfca0604ba238d3ae8e1998c823dbc3ba6959d2ca717e01a6c5cff9ece`。

6 个目录分组、20 名教师、73 条教师／主题组合，554 个条件、1108 条样本，实际询问 1352 次。
有领悟进展 330 条、完全未获进展 778 条；拒绝是原条件对照，不混入正常效果分母。

| 教师来源 | 主题数 | 条件数 | 样本数 | 有进展 / 无进展 | 实际询问次数 | 关联问题 |
| --- | ---: | ---: | ---: | --- | ---: | --- |
| /kungfu/class/hu/hufei | 11 | 80 | 160 | 44 / 116 | 182 | — |
| /kungfu/class/hu/huyizhi | 1 | 7 | 14 | 4 / 10 | 16 | — |
| /kungfu/class/huashan/yue-buqun | 5 | 36 | 72 | 20 / 52 | 82 | — |
| /kungfu/class/jueqing/chi | 5 | 34 | 68 | 20 / 48 | 78 | MA-003、MA-004 |
| /kungfu/class/riyue/fan | 1 | 7 | 14 | 4 / 10 | 16 | — |
| /kungfu/class/riyue/feng | 1 | 7 | 14 | 4 / 10 | 16 | — |
| /kungfu/class/riyue/jia | 1 | 7 | 14 | 4 / 10 | 16 | — |
| /kungfu/class/riyue/qin | 1 | 9 | 18 | 8 / 10 | 20 | MA-020 |
| /kungfu/class/riyue/ren | 5 | 43 | 86 | 38 / 48 | 136 | — |
| /kungfu/class/riyue/sang | 3 | 22 | 44 | 12 / 32 | 50 | — |
| /kungfu/class/riyue/shangguan | 3 | 21 | 42 | 12 / 30 | 48 | — |
| /kungfu/class/riyue/xiang | 2 | 14 | 28 | 8 / 20 | 32 | — |
| /kungfu/class/riyue/zhao | 1 | 9 | 18 | 4 / 14 | 20 | — |
| /kungfu/class/shaolin/da-mo | 10 | 86 | 172 | 52 / 120 | 196 | MA-017 |
| /kungfu/class/shaolin/du-e | 2 | 16 | 32 | 8 / 24 | 36 | — |
| /kungfu/class/shaolin/du-jie | 2 | 16 | 32 | 8 / 24 | 36 | — |
| /kungfu/class/shaolin/du-nan | 2 | 16 | 32 | 8 / 24 | 36 | — |
| /kungfu/class/shaolin/wuming | 3 | 23 | 46 | 12 / 34 | 52 | — |
| /kungfu/class/shaolin/xuan-ci | 3 | 24 | 48 | 12 / 36 | 54 | — |
| /kungfu/class/wudang/zhang | 11 | 77 | 154 | 48 / 106 | 230 | — |

每个条件独立重复两次；这是确定性门槛与状态核验，不用于估计随机教学成功率。
有进展包括递进领悟和已知错误字段，不代表正常学会或能够施展。连续询问保留同一学生／教师及原资源变化。
只覆盖本组已核对询问，不代表该教师的普通学习、拜师、所有绝招或所在门派全部能力均已采集。
逐条件状态、贡献／精神支出分布及原始记录引用保存在 JSON。游戏实现和玩家数据未修改。
## 来源与限制

- 源码 `275580a64ae2f535cdf1da2a510c8391f6681677`，FluffOS `20260929-5270e7d6-328aaf10`；2026-10-08 完成。
- 原始系列：`C:\Users\oiuv\AppData\Local\Temp\mud-martial-data-qyc5Jx`；运行 `attempt-uhm2uU`，驱动退出码 0，13.127 秒，验证错误 0、残缺尾行 0。含公开源码快照的执行阶段约 27.58 秒。
- 完整逐条件 JSON：`C:\Users\oiuv\AppData\Local\Temp\mud-teaching-report-20261008`。先前 `mud-martial-data-3ZwiVi` 单条件烟雾和 `mud-martial-data-W7WRQx` 全条件烟雾不混入本报告。
- 554 条件中 165 个有进展、389 个完全拒绝；各自重复两次。重复询问、太极图递进及跨主题授课使实际问询次数达到 1352 次；这不是 1352 个独立角色样本。
- 普通学习、拜师、绝招施展与教师问询是不同入口。本组未覆盖全部 42 个 class 分组，OpenSpec 4.2/4.3 保持未完成。

## 已复现而未修复的问题

- MA-003：裘千尺破甲推山写入 `jia` 而非 `tui`，扣除 100 贡献；正确标记仍为 0。
- MA-004：裘千尺无影掌授予 `tie-zhang/ying` 并扣 400 贡献；当前源码没有该施展入口。这里真实验证授课，不冒充已执行缺失的绝招。
- MA-017：达摩清心／乱气询问的标记错位和顺序依赖已复现。固定初态下重复询问清心剑，基本内功从 100→101→102；乱气标记只有首次增加。不能把两次奖励当两项新领悟，也不据此外推无限升级收益。
- MA-020：秦伟邦贡献 79 时拒绝，80／99／100 时授予并分别余下 -20／-1／0；再问不继续扣除。负数保留，不由测试工具修正。

位置、hash、最小触发条件和样本编号见[问题台账](../architecture/martial-arts-data-findings.md)；复跑与证据约定见[采集方法](../architecture/martial-arts-dataset.md)。本轮没有修改任何游戏实现。

