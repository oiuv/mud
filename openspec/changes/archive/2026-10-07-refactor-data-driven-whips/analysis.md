# 鞭类迁移范围核对

2026-10-06，只读核对基线 `da7027046add7e68a2ca38f04611c3c0cd745498`。本文件是实施前分析，不是运行等价或迁移成功报告；未创建新品种、删除旧物品、调用真实游戏或读取正式存档。

## 选择依据

对受跟踪源码作直接继承盘点，并用现有严格兵器解析器对固定初始化进行静态核验：

| `/d` 类别 | 直接继承文件 | 通过严格固定初始化核对 | 静态预分品种 |
| --- | ---: | ---: | ---: |
| WHIP | 33 | 32 | 25 |
| DAGGER | 24 | 23 | 22 |
| CLUB | 19 | 18 | 17 |

本批选普通鞭类，是当前同一路线中较大的非叠加兵器分类。THROWING 同有 33 份，但父类叠加、拆分、数量和投掷消耗需要独立设计与验收，不混入本批。普通 ITEM 和仓库外的 BOOK 等仍有较大整理空间，但数量不能直接当作可迁移文件数；需按实际行为细分，不能建立万能物品类。本次不扩展到 `/clone` 的书籍、独特兵器或其他类别。

扫描以 tokenizer 去除注释后识别继承；固定初始化暂用 WHIP/init_whip 到既有 BLADE 解析语法的等价归一化，仅用于静态判断，不改源码。实施时增加独立 WHIP 校验与拒绝测试，不复制 BLADE 的标志假设。别名差异可合并，品种归并仍须验证实际有效数据。

## 32 份来源及预分组

下表均为仓库相对路径，批内数据均以 `init_whip(伤害)` 初始化、未显式传入 flag；WHIP 父类实际设置 flag 为 0，不自动添加 STAFF 的 LONG。

| 名称/组 | 旧源码路径 | 伤害 |
| --- | --- | ---: |
| 蛇鞭 | `d/baituo/obj/shebian.c` | 30 |
| 拂尘甲 | `d/beijing/npc/obj/fuchen.c` | 20 |
| 皮鞭 | `d/beijing/npc/obj/whip.c` | 15 |
| 长鞭甲 | `d/changan/npc/obj/changbian.c` | 25 |
| 黑龙鞭 | `d/city/npc/obj/hlbian.c` | 35 |
| 钓杆 | `d/dali/npc/obj/diaogan.c` | 30 |
| 拂尘乙（六份） | `d/dali/obj/fuchen.c`、`d/emei/obj/fuchen.c`、`d/fuzhou/npc/obj/fuchen.c`、`d/fuzhou/obj/fuchen.c`、`d/quanzhou/npc/obj/fuchen.c`、`d/quanzhou/obj/fuchen.c` | 20 |
| 锁链 | `d/death/npc/obj/suolian.c` | 50 |
| 缠魂丝 | `d/death/obj/weapon26.c` | 50 |
| 盘龙索 | `d/death/obj/weapon27.c` | 55 |
| 烈火神鞭 | `d/death/obj/weapon28.c` | 60 |
| 麒麟鞭 | `d/death/obj/weapon29.c` | 70 |
| 馄饨灵索 | `d/death/obj/weapon30.c` | 90 |
| 玄冰索 | `d/death/obj/weapon31.c` | 110 |
| 神蛟丝·天残 | `d/death/obj/weapon32.c` | 140 |
| 神蛟丝·天缺 | `d/death/obj/weapon33.c` | 160 |
| 神蛟丝·噬月 | `d/death/obj/weapon34.c` | 180 |
| 神蛟丝·吞日 | `d/death/obj/weapon35.c` | 200 |
| 乌龙神蛟丝 | `d/death/obj/weapon36.c` | 220 |
| 流星锤 | `d/gaochang/npc/obj/liuxingchui.c` | 40 |
| 九节鞭 | `d/guiyun/npc/obj/jiujiebian.c` | 25 |
| 铁鞭 | `d/hangzhou/honghua/obj/tiebian.c` | 40 |
| 拂尘丙 | `d/kunlun/obj/fuchen.c` | 50 |
| 长鞭乙（三份） | `d/mingjiao/obj/changbian.c`、`d/shaolin/obj/changbian.c`、`d/tiezhang/obj/changbian.c` | 20 |
| 黑索 | `d/shaolin/obj/heisuo.c` | 120 |

甲/乙/丙仅为分析中的区分，不是最终 ID。拂尘甲与乙重量等数据不同，乙与丙伤害不同；长鞭甲与乙伤害不同，不可因同名而合并。最终可采用 `fuchen`、`fuchen2` 等稳定短 ID，以完整观测固定映射。

`d/luoyang/npc/obj/whip1.c` 有 `owner_is_killed()` 销毁回调，不进入普通组；保持原路径、源码 hash 和行为。流星锤、钓杆仍按旧 WHIP 行为，不改为 HAMMER 或工具；九节鞭原 `material="steal"`、原“馄饨灵索”名称、黑索 `no_sell/stable` 和钓杆 `rigidity` 均照旧，不在本次擅自纠错。

## 消费者

既有引用扫描得到 29 处精确引用、19 个文件：

- 王方平：`d/death/npc/wangfangping.c:55` 起十一项货表（weapon26–36）；保留完整货表顺序、价格、查找、付款与交付。
- 两处房间：`d/emei/chuwujian.c:14` 的拂尘、`d/tiezhang/bqshi.c:19` 的长鞭，原数量均为 1。
- 十三个普通 NPC 携物语句：`d/beijing/npc/dubi.c`、`d/death/npc/bai.c`、`hei.c`、`d/gaochang/npc/liwenxiu.c`、`waer.c`、`d/guiyun/npc/fengliang.c`、`d/hangzhou/honghua/yang.c`、`kungfu/class/duan/chu.c`、`daobf.c`、`kungfu/class/gumu/li.c`、`kungfu/class/quanzhen/sun.c`、`kungfu/class/wudu/cenqisi.c`、`kungfu/class/yunlong/ma.c`。李莫愁仅携带拂尘、不持用的行为须保留。
- 三渡：`kungfu/class/shaolin/du-e.c:128`、`du-jie.c:126`、`du-nan.c:125`，仅独特黑索已在其他对象身上时创建普通长鞭；必须实际验证该分支和黑索可取时的原分支，不能仅测试无条件 carry_object。

另有七条动态/前缀线索，核实其中三个是实际迁移入口：

| 文件 | 实际分支 | 保留规则 |
| --- | --- | --- |
| `d/beijing/npc/qianzhenglun.c` | `whip` → `d/beijing/npc/obj/whip` | 八卦门、个人三件兵器配额、总库存、实例 value=50/no_sell |
| `d/changan/npc/fujiang.c` | 五选一 case 3，`changbian` | 原随机选择、whip 技能、携带及持用；其余四分支不变 |
| `kungfu/class/shaolin/dao-chen.c` | 询问“皮鞭”传 `changbian` | 少林资格、present 持有检查、共享库存及交付 |

另四条仅为王方平 `weapon2/weapon3` 前缀以及武修文、道相防具入口；不为它们新增鞭类领取。精确扫描与三个动态入口合计 22 个实际消费者文件。三渡的 HEISUO 指向 `/clone/lonely/heisuo1/2/3`，与本批普通 `d/shaolin/obj/heisuo.c` 不同，不迁移或合并独特黑索。

## 实施及验收边界

复用 provider、精确注册存取与离线记录转换，预期新增 32 条历史映射（累计 1,145 条）；十四类品种数暂估 674，须在驱动观测后核实。净减 30 个运行期定义文件、31 个可编译源文件，不含测试和文档。

现有 SWORD/BLADE/STAFF 的副将、道尘夹具和 HAMMER/STAFF 的完整王方平货表依赖本批旧鞭路径。实施时从冻结源码恢复到临时测试副本，累计审计按新变更层核对；不重写旧十三类基线、不在运行期添加旧路径壳。

单独新增本批旧/新对象、交易/刷新/动态领取/三渡分支和存档恢复回归；性能在其他测试结束后独立测量，三组新旧交替、每来源 20 次，共 640 实例。正式服务器、玩家数据和其余未选类别不在本轮测试操作范围内。

## 实施复核（2026-10-06）

旧物品真实驱动观测已冻结到 `tools/tests/whip/baseline.json`：32 份旧蓝图及克隆、128 项初始检查通过，完整有效属性/重量/UID/EUID 确认 25 个品种。六份等价拂尘归为 `fuchen2`，三份等价长鞭归为 `changbian2`；其他拂尘/长鞭差异保留。WHIP 实际 `query("flag")` 为 0，DBASE 对零值不保存对应键，冻结 JSON 不为此补写字段。

最终仍为 29 处静态引用、三个动态入口、22 个消费者；所有精确调用迁至规范路径，32 份旧定义已删除，赤金鞭源码 hash 不变。普通 NPC 共十三处，李莫愁只携带的行为保持；三渡分别验证黑索可取和已占用两条原分支，独特兵器本体为隔离测试替身，不扩大验收范围。全量运行与性能结果分别记录于 [validation.md](validation.md)。
