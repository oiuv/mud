# B7 少林独有 21 招预研

少林派独有绝招批量，一次采集该派 perform 销账。kind 分布：direct 17/combo 2/control 1/buff 1（含凌空指穴与大手印 receive 直伤）。

## 绝招清单

| 招 | kind | type/percent | fee | 命中 |
| --- | --- | --- | --- | --- |
| jingang-zhi/fumo | direct | REMOTE/100 | 300/100 | ap/2+rand>dp |
| jingang-zhi/san | direct | UNARMED/150 | 800 | ap/2+rand>dp |
| rulai-zhang/zong | combo | 6×attack | 300/500 | ap/2+rand>dp + 碾压 |
| ranmu-daofa/huo | direct | WEAPON/130 | 400/200 | ap/2+rand>dp |
| ranmu-daofa/zhenyan | buff | 无 | 400 | 无 |
| nianhua-zhi/fuxue | control | 无 | 100/30 | 按经验判定 |
| xiuluo-zhi/jueming | direct | UNARMED/80 | 350/150 | ap/2+rand>dp |
| duoluoye-zhi/jimie | direct | UNARMED/70 | 500/200 | ap/2+rand>dp |
| wuxiang-zhi/wuse | direct | REMOTE/60 | 200/100 | ap/2+rand>dp |
| qufannao-zhi/lingkong | direct(receive) | 无 do_damage | 0 | ap/2+rand>dp |
| dacidabei-shou/yin | direct(receive) | 无 do_damage | 200 | 按经验判定 |
| yintuoluo-zhua/chixue | direct | UNARMED/120 | 400/100 | ap/2+rand>dp + 碾压 |
| longzhua-gong/zhua | direct | UNARMED/45 | 180/60 | ap/2+rand>dp |
| jimie-zhua/wuwo | direct | UNARMED/55 | 200/20 | ap/2+rand>dp |
| fengyun-shou/qinna | direct | UNARMED/30 | 80/20 | ap/2+rand>dp |
| sanhua-zhang/san | direct | UNARMED/40 | 150/50 | ap/2+rand>dp |
| woshi-zhang/po | direct | UNARMED/50 | 250/120 | ap/2+rand>dp |
| xumishan-zhang/ying | combo | 1×attack | 150 | ap/2+rand>dp |
| shenzhang-bada/bafang | direct | REMOTE/70 | 350/100 | ap/2+rand>dp |
| luohan-quan/xiangmo | direct | UNARMED/20 | 30/10 | ap/2+rand>dp |
| qingliang-jian/ming | direct | WEAPON/20 | 40/20 | ap/2+rand>dp |

## 关键约束

1. **万佛朝宗内力碾压**：`zong.c` 在 `max_neili > 目标*2` 时直接置目标气血/创伤为 0，扣 500 内力、自身忙乱 3，连击 9 次；否则扣 300、连击 6 次
2. **赤血连环爪内力碾压**：`chixue.c` 在 `max_neili > 目标*2` 且 `neili > 500` 时扣 500 内力走特殊分支
3. **燃木真焰临时增益**：`zhenyan.c` 置 `zhen_yan` 标记，`apply/attack+defense += skill*2/5`、`apply/damage += skill/4`，带到期回调；已激活时拒绝
4. **拈花拂穴按经验判定**：`fuxue.c` 命中判定按双方战斗经验，成功目标忙乱 `skill/19+2`，失败自身忙乱 3
5. **菩提寂灭自伤**：`jimie.c` 在 do_damage 后按伤害基数整除 4 扣自身气血
6. **凌空指穴直接伤血**：`lingkong.c` 走 `receive_damage/receive_wound`，不经过 `do_damage`
7. **大手印直接伤血**：`yin.c` 走 `receive_damage/receive_wound`，费用含 jiali
8. **一指点三脉无条件费用**：`san.c` 命中与失手均扣 800 内力，目标忙乱 `skill/30`
9. **擒拿目标忙乱**：`qinna.c` 命中目标忙乱 `ap/25+2`
10. **少林内功硬约束**：fumo/san/huo/zhenyan/wuse/chixue 要求 mapped force ∈ {hunyuan-yiqi, yijinjing, luohan-fumogong}

## 源码路径

绝招：jingang-zhi/{fumo,san}.c、rulai-zhang/zong.c、ranmu-daofa/{huo,zhenyan}.c、nianhua-zhi/fuxue.c、xiuluo-zhi/jueming.c、duoluoye-zhi/jimie.c、wuxiang-zhi/wuse.c、qufannao-zhi/lingkong.c、dacidabei-shou/yin.c、yintuoluo-zhua/chixue.c、longzhua-gong/zhua.c、jimie-zhua/wuwo.c、fengyun-shou/qinna.c、sanhua-zhang/san.c、woshi-zhang/po.c、xumishan-zhang/ying.c、shenzhang-bada/bafang.c、luohan-quan/xiangmo.c、qingliang-jian/ming.c

母技能：jingang-zhi.c、rulai-zhang.c、ranmu-daofa.c、nianhua-zhi.c、xiuluo-zhi.c、duoluoye-zhi.c、wuxiang-zhi.c、qufannao-zhi.c、dacidabei-shou.c、yintuoluo-zhua.c、longzhua-gong.c、jimie-zhua.c、fengyun-shou.c、sanhua-zhang.c、woshi-zhang.c、xumishan-zhang.c、shenzhang-bada.c、luohan-quan.c、qingliang-jian.c

基本技能：finger/hand/claw/cuff/strike/sword/blade、force/parry/dodge、buddhism/jingluo-xue、martial-cognize、hunyuan-yiqi

## 条件矩阵

约 120 条件（smoke 同）：每招 baseline + 主门（level）边界对 + hit/miss（dpSkills），特殊约束另列。
- zhenyan：+already-active
- fuxue：+target-busy
- zong/chixue：+instant-death
- fumo/san/huo/zhenyan/wuse/chixue：+wrong-force

## 基线排除同步

- `school_combat_report.mjs` 过滤器加 `!c.b7`
- `school_mingjiao_remaining_base_integration.test.mjs` 正则加 `(?:!c\.b7 && )?`，条件排除加 `b7-`，legacy 清单加 b7 两文件
- 各集成测试 `startsWith('b6-')` 后追加 `startsWith('b7-')`
