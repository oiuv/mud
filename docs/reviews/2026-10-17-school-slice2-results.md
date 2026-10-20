# 门派代表切片第 2 批结果（wudu/tiezhang/shenlong/xuanming）

> 2026-10-20：本页为旧报告，当前消费者的附毒漏建模已修正，904 条重验通过；不代表完整门派能力。详见[阶段复核](2026-10-20-collection-stage-review.md)。

系列：`review-school-slice2-f1-20261017`。904/904 正式记录、0 验证错误、0 运行错误。仅代表既定条件下的采样状态。

## 各派代表绝招

| 门派 | 绝招 | 效果类型 | percent | 费用 | 特色 |
| --- | --- | --- | ---: | --- | --- |
| 五毒 | 五毒神掌「万毒噬体」 | 直伤(REMOTE) | 100(70+count) | hit=30/miss=0 | 毒 debuff、jing 创伤、miss 给目标忙乱 |
| 铁掌 | 铁掌掌法「掌心雷」 | 直伤(UNARMED) | 65 | hit=250/miss=100 | str/con 入 ap/dp |
| 神龙 | 蛇岛奇功「神龙再现」 | 直伤(REMOTE) | 50/55 | 150/180/100 | 两段命中（先 parry 后 dodge） |
| 玄冥 | 玄冥神掌「玄冥双行」 | 直伤(UNARMED) | 60/80 | 500/250 | 双掌连击、xuanming_poison |

## 条件矩阵

51 条件（wudu 12/tiezhang 14/shenlong 11/xuanming 14），含普通攻击基线、绝招基线、命中/未中分支、资格边界对（低/高一档）、valid_learn 边界对。

## 契约扩展（vs slice1）

1. UNARMED directType（tiezhang/xuanming）：不加 apply/damage
2. 双 do_damage（xuanming）：2 directs，fee 组合标识命中分支
3. 三段费用（shenlong）：parry/dodge/miss 分支
4. count 依赖 percent（wudu）：目标 shen/gender 驱动
5. character 覆盖：wudu 要"心狠手辣"、xuanming 禁"光明磊落"
6. feeMiss=0（wudu）：未命中不扣内

## 数据文件

- 证据：`C:/tools/msys64/home/oiuv/mud-evidence/martial-data/review-school-slice2-f1-20261017/`
- 统计：`C:/tools/msys64/home/oiuv/mud-evidence/martial-data/review-school-slice2-f1-stats-20261017/`
- 预研：`docs/reviews/2026-10-16-school-slice2-prep.md`
- 烟雾：`E/review-school-slice2-smoke2-20261017/`（85/85 全绿）

## 累计覆盖（2 批 8 派）

| 批次 | 门派 | 样本 | 状态 |
| --- | --- | ---: | --- |
| 第 1 批 | gaibang/xiaoyao/kunlun/duan | 892 | ✅ |
| 第 2 批 | wudu/tiezhang/shenlong/xuanming | 904 | ✅ |
| **合计** | **8 派** | **1796** | |
