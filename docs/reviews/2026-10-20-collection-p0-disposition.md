# 4.2 缺口处置与声明去重（2026-10-20；10-21 勘误）

本页只做采集处置，不改游戏、旧系列或原始数据。证据根 E 为
`C:/tools/msys64/home/oiuv/mud-evidence/martial-data/`。

## 八个暂缓配置

早期草稿把八项统一记为 N/A，这是错误的。当前工具以 `b29Dispositions` 区分六项
`pending_fixture` 和两项 `unreachable_dispatch`；`b29Pending` 仅表示本批不生成条件。
缺夹具、道具或观察窗口不免除整个采集项目的覆盖义务。

| 条目 | 当前处置 | 依据与后续工作 |
| --- | --- | --- |
| lonely-sword/jue | 待演练夹具 | 源码为无目标演练，战斗中拒绝；须测学习进度，不能用战斗拒绝代替 |
| dugu-jiujian/jue | 待演练夹具 | 同上；已有其他批结果须按条件与实际进度核对后复用 |
| jinshe-zhui/tuwu | 待专用道具 | 要求 `jinshe zhui` 身份；通用弹药不满足 |
| xuanyuan-arrow/baibu | 待专用道具 | 要求 `is_arrow()`；须配置真实资格道具 |
| yujian-shu/yujian | 待多段观察 | `perform2` 及 call_out 循环；已有 B23 数据须核对是否覆盖同一能力与所需窗口 |
| five-avoid/break | 待多轮观察 | 原 `while (count--)` 调用 `COMBAT_D->fight()`；不能因即时消费者不支持销账 |
| six-finger/zongheng | 分发不可达处置 | `six-finger.c` 分发至 `liumai-shenjian/`，该目录无 zongheng；保留替代入口核对 |
| taixuan-gong/xuan-top | 分发不可达处置 | `taixuan-gong.c` 分发至 `perform/`；顶层 xuan 不属此路径，实际 `perform/xuan.c` 仍需自身证据 |

源码位置及理由保留在工具的处置表中。六项待夹具不算验收完成；两项不可达仅处置所列
分发路径，不外推为同名能力全局不可用。

## 声明去重不是效果覆盖

| 版本 | 配置声明 | 活动配置槽 | 唯一声明路径 | 唯一活动声明路径 |
| --- | ---: | ---: | ---: | ---: |
| B26 batch2 前 | 506 | 498 | 470 | 465 |
| B26 batch2 后 | 508 | 500 | 472 | 467 |

差异为新增天罗地网掌 wang 与盘根错节斧 cuo 两条路径。35 组重复声明涉及71个槽，
多余36次；其中3次为暂缓槽，活动槽多余33次。以上是配置表统计，不是“已通过的唯一绝招数”。
多版本、重复采集、正常观察、拒绝、错误与烟雾须分别统计。

## B26 控制／缴械

| 条目 | 系列 | 保存的只读重验结果 |
| --- | --- | --- |
| tianluo-diwang/wang | `E/review-b26-batch2-tianluo-f1-20261020` | 106/106（100观察、6拒绝） |
| pangen-cuojiefu/cuo | `E/review-b26-batch2-pangen-f1-20261020` | 106/106（100观察、6拒绝） |

天罗 wang：等级60、轻功40、单备掌法、内力70门槛，扣内力60；命中目标忙乱
`level/16+2`，自身忙乱2–3，失败自身1。盘根 cuo：等级100、有效内功120、最大内力800、
当前内力100及斧激发门槛，扣30；命中目标忙乱`level/18+1`，失败自身2。

原草稿“72/72纯控制、7/7缴械均已覆盖、余量0”来自一次性配置字符串扫描，
**只能作为待核对候选，不能作为实测闭合依据**。须逐项关联实际入口、冻结条件、
有效样本和状态校验。不要按“约40招减几个批次”推算实际余量。

### 超出 B26 消费者但仍在项目范围的候选

- exert：`beiming-shengong/suck`、`xixing-dafa/suck`、`huagong-dafa/hua`、
  `force/dispel`、`sanku-shengong/dispel`、`force/shot`、`lingyuan-xinfa/break`。
  由内功能力阶段核对已有数据和缺口，不是整个 Goal 的 N/A。
- 自卸或生成武器：`quanzhen-jian/lian`、`huntian-baojian/exert/sword`。
  不算夺取目标兵器，但其自身能力仍须有对应采集。
- 附加控制候选19项：`canhe-zhi/you`、`dabei-zhang/bei`、`duanjia-sword/jue`、
  `feifeng-bian/xi`、`fengmo-zhang/luan`、`houquan/zhen`、`jingzhong-bafa/bafa`、
  `jiuyin-shengong/shou`、`jiuyin-shengong/xin`、`jiuyin-shengong/zhang`、
  `jiuyin-shengong/zhi`、`jiuyin-shengong/zhua`、`kuangfeng-blade/kuang`、
  `luohan-gun/shibaluohan`、`qianzhu-wandushou/wan`、`qingliang-daxuefa/ding`、
  `shou-yin/jie`、`xuanfeng-leg/kuangfeng`、`zijinbagua-dao/bagua`。
  此数也是旧静态候选，不是已核实剩余分母；先对应已有 direct/combo 数据，再补真正缺口。

当前仍为10/17，4.2未完成。关联：[前次复核](2026-10-20-collection-stage-review.md)、
[本次修复与交接](2026-10-21-collection-repair-review.md)、[组合缺口](2026-10-20-school-combination-gaps.md)。
