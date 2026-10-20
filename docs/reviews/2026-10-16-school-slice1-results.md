# 门派代表切片首批结果（gaibang/xiaoyao/kunlun/duan）

系列：`review-school-slice1-f2-20261016`。892/892 正式记录、0 验证错误、0 运行错误。每条件随机效果 100 次、确定性效果 2 次、拒绝边界 2 次。仅代表既定条件下的采样状态，不是强弱排名。

## 各派代表绝招

| 门派 | 绝招 | 效果类型 | 对方气血支出 | 对方创伤 | 自身内力支出 | 特色 |
| --- | --- | --- | ---: | ---: | ---: | --- |
| 丐帮 | 打狗棒「缠字诀」 | 控制 | 0 | 0 | 50 | 命中后忙乱 level/18+2 回合 |
| 逍遥 | 凌波微步「洛神凌波」 | 增益 | 0 | 0 | 400 | 临时 dex+level/30、lingbo 标记 |
| 昆仑 | 乾坤剑「乾坤劲」 | 直伤(WEAPON) | 514 | 165 | 150 | 60% 创伤转化 |
| 段氏 | 一阳指「神指点穴」 | 直伤(REMOTE) | 309 | 0 | 200 | 0% 创伤、no_perform 封锁 |

## 各派普通攻击基线

| 门派 | 主兵器 | 对方气血支出 | 对方创伤 | 备注 |
| --- | --- | ---: | ---: | --- |
| 丐帮 | staff(棒) | 88 | 20 | 混天功自动运功 |
| 逍遥 | dodge(徒手) | 2 | 0 | 增益为主 |
| 昆仑 | sword(剑) | 92 | 24 | |
| 段氏 | finger(指) | 134 | 41 | 内力消耗 19.5（含双方） |

## 资格边界

四派各采 3 处门槛（技能等级/内功/真气/属性）的低/高边界对，拒绝消息原文完整记录：

- 丐帮缠字诀：level 59/60、effective-force 99/100、neili 99/100
- 逍遥洛神凌波：level 119/120、neili 599/600
- 昆仑乾坤劲：level 99/100、effective-force 149/150、neili 299/300
- 段氏神指点穴：level 119/120、jingluo 119/120、neili 199/200

valid_learn 边界：丐帮 staff 99/100、逍遥 dex 29/30、昆仑 effective-force 179/180、段氏 con 33/34。

## 数据文件

- 证据：`C:/tools/msys64/home/oiuv/mud-evidence/martial-data/review-school-slice1-f2-20261016/`
- 统计：`C:/tools/msys64/home/oiuv/mud-evidence/martial-data/review-school-slice1-f2-stats-20261016/`
- 烟雾验证：smoke13（77/77 全绿）；smoke1–12 失败系列保留为证据

## 工具修复记录（f1→f2 期间）

1. `query_str()` 力量因子：`feature/attribute.c` 中 `query_str()` 含 `max(hand-skill)/10` 加成，duan 的 finger=200 → effective_str=56。模型改用 `effective_str` 字段。
2. 光明磊落创伤减免：`do_damage` 对 `character='光明磊落'` 目标减伤 20%。runner.lpc 补捕获 slice1 分组的 character 字段。
3. sparse 嵌套访问：`sparse(o,k)` 只处理单层数值，支持集改用 `sparse(target.temp?.apply ?? {}, 'armor')` 直达叶值。
4. armor 钳制：匹配 combatd `if (armor<1) armor=1`，`Math.max(1, ...)` 替代 `||100`。
5. ordinary neili 账目：普通攻击内功自动运功的 neili 消耗由 metrics 驱动记入 stableState。
6. weapon consistence：武器耐久度递减为正常行为，stableState 统一跳过比较。
