# 九阳学习资格、兵器许可与难度采集

本批不改游戏源码、数值、门派或玩家数据。37条件、74正式记录与74独立成功烟雾完成；正式46条观察、28条原拒绝，0采集校验错误／残缺。只观察资格、难度与禁止练习，不冒充授课、熟练成长或自然养成；整体仍10/17。

## 原件与版本

E为`C:/tools/msys64/home/oiuv/mud-evidence/martial-data/`。条件、公开来源和样本计划始终不变，工具修正另冻版本，失败原件不覆盖。

| 系列 | 真实终态 | 记录状态 |
| --- | --- | --- |
| `review-mingjiao-jiuyang-learning-s1-20261014` | attempt-mqURTK，PID36648，SIGTERM，1.932秒 | 2条原件，0导入；准备时房间消息混入技能消息账 |
| `review-mingjiao-jiuyang-learning-s2-20261014` | attempt-5YOlFo，PID28132，SIGTERM，1.953秒 | 11条原件，6导入；工具误将不同性格的怒气上限都要求为5000 |
| `review-mingjiao-jiuyang-learning-s3-20261014` | 3独立驱动：code1／0／1 | 74条收齐但含2条准备错误，不算通过；固定根骨加值未获工具门禁准入 |
| `review-mingjiao-jiuyang-learning-s4-20261014` | attempt-u5s2st，PID48880，code0，2.464秒 | 冻结V4成功烟雾，74／74；CLI17.29秒，外层24.247秒 |
| `review-mingjiao-jiuyang-learning-f1-20261014` | attempt-5akHEp，PID50268，code0，2.908秒 | 冻结V4正式，74／74；CLI20.21秒，外层27.223秒 |

S3三个尝试分别导入61／12／1条，其中两条错误均为同一`raw-con-effective-high`条件的两个样本。是采集夹具准备失败，不登记为游戏缺陷，也不删除后算72条通过。

V2仅在准备完成后清空观察消息缓冲；V3仅按原USER性格核验怒气上限：光明5000、心狠4000、其余本矩阵性格0；V4仅允许该一个条件、发起角色的`apply/con=5`实验准备。没有扩大任意临时属性写入或修改原资格实现。

四版均为321工具、10476输入声明、125资格来源、15文件48可逆观察点。V4正式根审实际核对131公共源码副本与35夹具；声明数量不是实际运行文件数量，不声称全库运行覆盖。

## 观察分账

74原件执行82次真实USER命令：80次夹具`test_interface`入口调用原资格／难度接口，2次原`practice force 1`。测试入口受理不代表玩家原`learn`命令成功。

| 项目 | 正式结果 |
| --- | --- |
| USER命令执行／受理 | 82／80 |
| 原学习资格调用 | 72：允许42／拒绝30 |
| 原难度查询 | 8：非零返回8，1000或1400 |
| 原练习尝试／完成 | 2／0，均原拒绝 |
| 原兵器许可首次写入 | 32 |
| 精神／内力支出 | 0／0 |
| 学习点、等级、净熟练变化 | 均0 |

四个条件每个样本在同一个USER上调用两次。刀剑不足时首次返回1并开启许可，第二次返回0；剑或刀达标时第二次仍返回1。转世对照不擅加原`valid_learn`不存在的门槛。每步保存调用前后完整状态、USER身份、返回、原提示及许可值；不将两次接口观察算成两次学习成长。

先天悟性／根骨按原`query()`检查，即使有效属性较高也不能替代；难度由原六脉等级与转世条件决定。兵器许可写入本身不证明角色已具备所有兵器激发资格。

## 验证与报告

根完整V4审计实际退出0：当时321工具与冻结V4逐字节一致，来源、夹具和探针逆还原闭合，正式专报JSON全对象及Markdown字节重算一致。reader V5仅将一处新报表排除项从行首移至末尾，以保留旧接线前缀；完整报告字节不变，根V5补审actual0，不重采正常原件。

独立终审实际退出0：S4／F1共148原件、请求／options／台账、逐步许可／费用／身份、V4运行版本与V4／V5全JSON／MD／统计均闭合。完整计划重建另从实际F1隔离副本读取282个按需公共文件，逐文件核对冻结声明摘要；不回读未核实源码、不冒称工具归档是独立发行包。

最终reader V5全工具回归251文件2203/2203通过，0失败／取消／跳过，actual0，303.622秒。V4全套2200/2203的三个旧前缀断言失败保留，88项定向通过后才另跑V5全套，不放宽旧标准。四份离线LPC格式检查、OpenSpec严格校验与差异检查通过。

原件及报告目录分别为`E/review-mingjiao-jiuyang-learning-f1-20261014/`与`E/review-mingjiao-jiuyang-learning-f1-report-20261014/`。

- 系列指纹：`fa18939c4e01c67f24a7d602f0ae3eec6a3de96e48fcd1b286b9763d64a34fa1`。
- 原件摘要：`374a3a09d6cf6ef605fd325ddc24165eff14abb2dcf86f84af0baf89af1ccb40`。
- `school-combat.json`：`434f7b8ffcbf0540dc3208d86f94d81d19e1645a6e0d7777f24bb322ff57106d`。
- `school-combat.md`：`36104a565fd50806025f08c2c217b3f5e3514a7fa5cc4f476891da822489ba87`。
- `statistics.json`：`6e9654f9dd33cd260b10f1f867fe7db846042c2031cc575bf2f4717723d95ab0`。
- 根审计：`E/review-current-collection-20261014/root-jiuyang-learning-complete-audit-v4.json`。
- reader V5根补审：同目录`root-jiuyang-learning-complete-audit-v5.json`，仅声明的一份报表文件不同。
- 独立审计：同目录`jiuyang-learning-independent-audit.json`，SHA256 `fce6ecbe05b05f5f5a5cd9b6e951d550315badd03adeb657fdc597460a4267ad`。
- 全套工具日志与终态：同目录`jiuyang-learning-full-suite-v5.log`／`jiuyang-learning-full-suite-v5-meta.json`。

125来源摘要保持`700450cd84f598bc5a85009b97f753ca7df6c6d10af5547290d84b8d52c8901d`，不修改固定源码或原件。S4两条连接重置出现在保存记录之间；F1两组名字缓存rename／save失败，每组两条日志，不计成四次独立失败。两批各有1条平台eval警告；重复写入debug流的同事件不双计，原因未确定，不冒称持久化或日志全净。

先前[被动、防御与普通攻击](2026-10-14-school-mingjiao-jiuyang-results.md)保留独立报告与2094正式原件，不混入本组。实际研修、三九阳融合、容量、五绝招、三运功、交锋以及其他门派和全武学仍待采。
