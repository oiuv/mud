# fields与动作初始化只读交叉审查

范围：当前diff中的MA-135三门及同类抽髓、MA-118两门筛选、MA-082/083条件参数与伤害、MA-111属性消费。对照当前 `feature/skill.c`、`feature/attribute.c`、`adm/daemons/combatd.c` 和 `field_fixes.lpc`。只新增此报告，不启动驱动、不修改生产代码；不重复审查状态组资源修正。既有全绿是有限夹具证据，不替代下面真实消费链复核。

## 确认的问题：MA-111普通防御贡献没有等价保留

`shexing-lifan/guiyuan.c`原同时增加根层临时`str`和`dex`。本轮保留str，但将dex施加/撤回都移到`apply/dex`。`feature/attribute.c::query_dex()`确实读`apply/dex`，因此有效身法现在增加；可是 `combatd.c::skill_power()`防御分支仍在约391行直接乘 `dbase["dex"] + temp["dex"]`，不读query_dex，也不读apply/dex。

具体反例：基本dex40，已有root temp/dex11，技能增量4。原运功期间普通防御系数含40+15=55；当前改法期间rootdex仍11，普通防御系数仅40+11=51。这里的“系数”是skill_power的后置乘数，不声称最终闪避概率固定降低4/55，因为还有等级幂、其他状态和对手。

`field_fixes.check_guiyuan()`只验query_dex增加4、rootdex11保留、解除后apply/dex5恢复；它没有观测公共skill_power，所以无法发现旧防御贡献消失。str的真实消费者已正确保留，但同样的论证也适用于dex：不能只对str保留旧消费，称dex没有消费。

建议补原skill_power防御前/中/后、两种已有独立root/apply偏移的对照；再由主Agent确认保持旧rootdex贡献并让有效身法生效的最小策略。若决定只迁移到apply/dex，需要显式接受普通防御玩法变化，不能将其宣称完全等价的错字段修复。本报告没有擅自修改它或设计全局属性框架。

## MA-135：公式、随机界与共享返回值

| 文件 | 当前读取和五字段公式对照 | 审查结论 |
|---|---|---|
| `dagou-bang.c` | 保留有效force/staff/dodge/parry读取；force/2+random(force)，attack=staff/4+random(staff/2)，dodge=dodge/4+random(force/3)，parry=parry/4+random(parry/3)，damage=force/3+random(staff/3) | 未见抄错；原random(sizeof(action))仍选择全部动作，没有借修复新增等级门槛 |
| `qiankun-jian.c` | 保留raw force/sword/dodge/parry；五项分母分别2、4、6、6、4，各随机界原样 | 未见raw/effective混淆；严格level>lvl、NewRandom(i,20,level/5)保留 |
| `yiyang-zhi.c` | 徒手极意保留raw force/finger/dodge/parry五项；指法>=与杖法>差别保留；持器分支仍直接走原action_staff | 未把杖法错误套成指法动态极意，也没有统一两种原阈值 |
| `chousui-zhang.c`同类补修 | raw force/strike/dodge/parry与乾坤同分母，damage随机读strike/2，dodge随机仍读force/3 | 未以“更对称”猜改历史公式；五个普通dmage字段更名为damage属于另一明确修复 |

四门仅动态极意先`copy(selected)`再写数值；字段均标量，不涉及嵌套mapping再被修改。模块表中的0占位不被出招当成最终值；所有选中极意路径在return前填五项。普通静态动作仍返回原mapping，但本次代码不写这些mapping，所以没有本次引入的共享污染。若未来调用者主动修改静态动作mapping，属于另一个旧接口风险，本次没证据说明已经发生。

fields测试A/B两对象的实际顺序是A低随机、B高随机、B低随机、A高随机，虽然不严格每次交换，仍覆盖两对象各自上下界。每次保留前一个mapping序列化快照，下一次计算后检查未变化，能抓住不copy便修改共享极意的错误。无命令玩家冷载独立断言也切中了模块this_player依赖。

限制：当前测试未在同一角色上修改技能后再出招，不过源码每次调用query_skill，不再缓存加载者值；这点有直接代码依据。每次出招重新随机是此次动态化的预期，不应将其称为与原加载一次随机序列完全相同。

## MA-118：候选过滤

`suxin-jian.c`、`sad-strike.c`都按原数组顺序逐项执行`level > action[i]["lvl"]`，只保留符合的mapping，再沿用原NewRandom参数。没有排序、重编号、改门槛或把严格>变成>=。不合格项被剔除后候选分布自然改变，这是解决原前缀包含高门槛项所必需，不等于擅自做数值平衡。

fields控制候选索引0..19，在70/71/99/100/101/160/161逐次检查返回lvl<当前等级。这些选定等级的候选少于20，所以足以遍历其候选，不仅靠随机“没出现高招”。没有对全部等级和概率分布做全面实采；未出现候选时仍return0，保持原无匹配语义。

## 条件类型与伤害字段

- `poison.c`、`damo.c`现分别校验level为int、remain为int、id为string。旧括号把逻辑或的结果交给intp，现括号修正准确，不改变正常合法条件本身。没有把字段名、施毒人或持续时间顺带迁移。
- `damo.c`气血分支补`qw=qd/2`后仍走原eff_qi上限约束；与同函数精神创伤及公共毒伤结构一致。不是把当前伤害qd误作最终创伤，也不改qd实际调用来源。
- fields条件用例验证错误remain、错误id拒绝无伤，合法条件仍实际扣当前值与半值创伤；不意味着任意非mapping的恶意调用均已验收。函数形参本为mapping，本次不为假设输入增加新运行时框架。
- `bingcan-duzhang.c`与抽髓的dmage→damage均保留原五数值，真实公共攻击在action["damage"]上消费百分比强化；动作字段值不是最终伤害。fields逐动作检查正确字段和值、旧拼字不存在，属于字段贡献前提验证，不是十种动作的全战斗伤害分布。

## 已排除的误报与保留风险

1. `query_skill()`无raw参数表示基本技能/2+有效映射+apply；打狗原本使用此口径，不能为格式统一改raw。乾坤/一阳/抽髓原显式raw则准确保持。
2. 根层temp/str不是死数据：公共skill_power攻击与普通/直接伤害都直接消费。保留str不是漏改，本报告发现的是dex也有类似消费者，不能忽略。
3. 共享极意写入前copy、旧返回值不会随其他角色重算而变；未找到公式/分支抄错的确定错误。
4. `guiyuan.remove_effect`原对象销毁/外部强清共享标记等生命周期限制本次没有扩展证明。其自然到期不是手动调用回调通过便自动成立，不以此报告关闭全生命周期。

结论：MA-135与MA-118当前公式和筛选未见确定新增错误，类型括号与qd/2修正有充分同接口依据。MA-111存在明确普通防御贡献迁移不等价，需主Agent处置并补消费链回归；本报告不宣称fields全分支已通过。

## 复核后经主 Agent 确认的局部修正

上述MA-111差异已获明确授权修复：归元施加/撤回同时维护原root temp/dex与新增apply/dex，不修改公共combatd公式。root项保留普通防御倍率，apply项让query_dex生效；当前skill_power不读apply/dex，因此不在同一次普通防御计算中重复叠加。原str加减保持。

fields新增直接调用隔离原`/tests/actual_combat::skill_power(...,SKILL_USAGE_DEFENSE,0)`（不是spy）的前/中/后断言：原rootdex11→15，按实际原防御因子验证精确+4；期间另加root3/apply2后撤销自身4，留下root14/apply7与原str7；重复解除不再扣。有效身法独立验证，重施拒绝不叠加。根因是此前只看query_dex遗漏skill_power直接读取旧字段，不是驱动行为变化。

新增源码及夹具待主 Agent 串行驱动复测，本报告不把旧1994/0视为新断言证据。
