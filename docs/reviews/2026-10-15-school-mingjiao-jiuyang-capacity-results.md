# 九阳内力容量查询采集

容量窗口23个条件的46条正式、46条独立烟雾均完整导入，根核与独立终验、报告重算和归档均通过。正式结论只用F1原件，不拿烟雾补正式或混算两系列。本页不代表九阳全部能力或明教门派已完成；整体任务仍10/17，当前整个明教完成后暂停goal。

本窗口只调用原查询，不调用内力成长。角色技能、资源、家庭和特技均为明示实验赋值，不证明玩家自然取得资格、养成速度或门派强弱。游戏源码、公式、教学、正式服务和玩家存档未改。

## 已观察查询值

每个下表查询均有两个F1正式原件，独立烟雾另有两个。九阳附加项与两种USER容量上限是不同接口，不能混成一个数值。

| 实验等级 | 九阳附加项 | 当前映射上限 | 全部已学上限 |
| --- | ---: | ---: | ---: |
| 200 | 750 | 3750 | 3750 |
| 400 | 3000 | 9000 | 9000 |
| 800 | 12000 | 24000 | 24000 |

200级基线的其余实验条件，两上限分别观测到：`improve/neili=10` 为4125，破关为5250，神秘特技为4350，通脉为4312；神秘使用原先天根骨40，不以有效根骨替代。少林出家身份为4250，明教同样出家身份仍3750，未把原500加成扩至所有门派。

额外预存1000级圣火神功时，当前映射仍为九阳：当前上限3750，全部已学上限23000。只是预存兼修查询，不表示该配置已按自然教学取得。原全部已学查询的 `.c` 筛选保持原行为。

## 调用与状态边界

46个原USER单次命令均受理，实际command cost合46；一次查询计一次，成本不转成次数。九阳技能对象提供6次附加项查询，继承自 `/clone/user/user` 的原方法提供40次两上限查询，定义归属来自实际 `function_exists`。

46个原件的两USER身份、技能、映射、记录资源与临时状态在前／即时／最终三态保持一致，所有已记录资源／事件计数均为0，9键步骤和真实消息观察闭合。并不证明未记录的名称／种族或底层learned空值原类型；既有快照将learned规范化后比较。无武器、攻击、回调、自然养成或完整交锋结论。

## 正式终验

F1指纹 `9cb2e350a209018bccfdea5f1b0a012af01fe9096eb7d9796d94796f464f907b`，`smoke=false`；23条件、46正常观察、拒绝／运行及校验错误／断尾／中断均0。46原件的命令受理和实际成本各46，两侧metrics实际均空映射；零事件不等同于完整交锋或忙乱0秒，通用统计中忙乱仍为未知。

原系列与S1逐字段比较，只有 `identity.execution.smoke` 改变；条件、来源、工具、时钟及原options字节一致。定义归属为九阳技能6次、USER原方法40次，返回值与两角色三态、9键步骤、原消息窗口逐条核验。46窗共92个不同实际USER克隆，不把两个系列的角色或样本混用。

## 版本与证据

`E` 为仓库外 `C:/tools/msys64/home/oiuv/mud-evidence/martial-data/`。使用 [修炼接线V2](2026-10-14-school-mingjiao-jiuyang-cultivation-prep.md#2026-10-15-接线与版本冻结)：343声明工具、10498声明输入；137资格来源、35实际夹具及15文件48观察位点保持，游戏与公开源码不变。

- S1系列：`E/review-mingjiao-jiuyang-capacity-s1-20261015/runs/attempt-35lv6q`，指纹 `52215a8cd801165aed25cdc508550c6366ba0a1ce66a80cfbd22f2cddc1e7b5f`，`smoke=true`。原驱动PID43964退出0且已实查不存在；驱动1.891秒、CLI15.87秒、包装23.663秒分列，46导入、错误／断尾／中断均0。
- 根终验：`E/review-current-collection-20261014/jiuyang-capacity-s1-root-audit.json`，SHA256 `3019f447f3e7c0125fba5c52ad790a0b19bc571d3e9f7850c3d30bd0587ccb8b`；全10498当前输入、10155实际公开副本、343冻结工具、35夹具与15文件48位点逆还原，46原件／请求／台账及三消费者均实际通过。实际 `mudlib/tests/options.json` 的46条参数与请求／清单逐项相等，`fault=null`。
- 烟雾专报：`E/review-mingjiao-jiuyang-capacity-s1-report-20261015/capacity.json` SHA256 `6bba74766c168631fa8859e27cbe98aafefb88ac60edf3e98f30b89356dfa4ba`；`capacity.md` 为 `137f11c66be58f83d1e6ffaade50f857e5661db208294339aa0a691b4dd9e632`。专报使用原smoke清单；公共正式报表入口实际拒绝该系列，未翻改模式。
- 驱动原输出SHA256 `6b735f8f2285ef42220cfd8c9c000d908219d46e54d08b31385006a0587827fb`。有平台eval限制警告；第196行连接重置、第197行连接重置与DATA SAVED同行，后续第228／229行分别为46/46和完成。诊断原样保留，不推断原因、不称日志全净或持久化／重启通过。

- S1独审：`E/review-current-collection-20261014/jiuyang-capacity-s1-independent-audit.json` SHA256 `c449149ad64dbed56bcc0d29193527ca0dc6d597f8ea1c50b58faf032ec06d29`，完整报告JSON／MD及原件独立重算一致。
- F1：`E/review-mingjiao-jiuyang-capacity-f1-20261015/runs/attempt-zBa5U4`；原驱动PID26340退出0且已实查不存在，驱动1.923秒、CLI17.61秒、包装25.661秒分列。原输出SHA256 `16b5fe0da691d5a7f75116e63366aafd9c5ecec18d03641a59583b918412bd1a`，两条连接重置在192／193行，随后228／229行46/46及完成；平台警告保留，原因未知。
- F1根审：`E/review-current-collection-20261014/jiuyang-capacity-f1-root-audit.json` SHA256 `b9c7574644646618b5b4518ee1a01c4192ed0e132a9663685f4cd2109ac959db`，全10498当前输入／10155实际公开副本／343冻结工具／35夹具／15文件48逆还原及46原件／账本／请求、三消费者均通过。
- F1独审：`E/review-current-collection-20261014/jiuyang-capacity-f1-independent-audit.json` SHA256 `431df18805b74e7c2fa15ec49a8f63f3ff7b6db8d5ee4570ad9b88cea43a2a5c`；137实际资格来源、343工具、35夹具、15文件48逆还原与46原件核对，不冒称再次读全10155副本。完整公共严格报表、23专项及统计均重算一致，原件末次稳定，协作帖 mud `01a13b64-bbb7-7f52-9049-fa765c56a3d6`。
- F1完整报告 `E/review-mingjiao-jiuyang-capacity-f1-report-20261015`：`school-combat.json` SHA256 `1892dec95730b94e3e440e70b7e4a1981f7ed6f67eee8c8b8bf5268200b61911`，`school-combat.md` 为 `029bf1ffd1a9cdff3693832a610f816cc36394a54149bdd456c3bd22e513b8e9`，`statistics.json` 为 `478b5a8c4790fb8882a9177a8a83296f1d2033d578f03a9c5c56feaa2bfa5a05`。

研究、融合和其余明教能力仍待采，不将本窗口计为整个门派完成。
