# 直接 EQUIP 防具：范围与迁移边界

日期：2026-10-06。源码基线：`beef12eae82f6d52e836cdf729ac6465e5b594b7`。
状态：本批迁移已实现，冻结原文及真实驱动观测见 `tools/tests/equip/baseline.json`；集成验收进度见 `tasks.md`，已执行证据见 `validation.md`。尚未部署或转换正式存档。

## 1. 为什么选择这一批

刀类已提交。重新扫描当前 Git 跟踪的 `/d` 源码，而非复用历史总量：

| 类别 | 直接继承文件 | 本次只读判断 |
| --- | ---: | --- |
| EQUIP | 56 | 全部只有固定初始化；25 份有 setup，31 份无 setup |
| HAMMER | 60 | 42 份通过现有固定武器模式；另 1 份重复设重可独立核对，其余含复合食物、乐器或死亡回调 |
| STAFF | 45 | 37 份通过现有固定武器模式，其余还需核对 |
| WHIP | 33 | 32 份通过现有固定武器模式 |
| DAGGER | 24 | 23 份通过现有固定武器模式 |
| CLUB | 19 | 18 份通过现有固定武器模式 |

武器模式不适用于叠加暗器，不能据解析失败把 THROWING 认定为不可迁移。宽泛 ITEM、复合食物及其他系列另行细分。本批优先 EQUIP，是因为明确的普通候选数和单一父类复用收益更高，不是把所有装备都放入一个万能类。

CodeGraph 已用于父类/调用定位，但索引存在未同步文件；候选与计数以当前源码、严格 token 解析和全游戏引用扫描为准。没有读取正式存档或运行期字典。

## 2. 精确范围

以下文件均为 `.c`。只迁移列出的直接 EQUIP 对象，不迁移对应目录中的其他内容。

### `d/city/npc/cloth/`：25 份

`belt`、`boots`、`bu-shoes`、`cloth`、`color-dress`、`dress`、`fu-cloth`、`gui-dress`、`hat`、`jade-belt`、`liu-dress`、`marry-dress`、`mini-dress`、`moon-dress`、`pink-dress`、`qi-dress`、`red-dress`、`scarf`、`sha-dress`、`shoes`、`xian-cloth`、`xiu-cloth`、`xiu-scarf`、`yan-dress`、`zi-dress`。

### `d/wanjiegu/npc/obj/`：28 份

`belt`、`blake-cloth`、`boots`、`bu-shoes`、`cloth`、`color-dress`、`dress`、`fu-cloth`、`gui-dress`、`hat`、`jade-belt`、`liu-dress`、`marry-dress`、`mini-dress`、`moon-dress`、`pink-dress`、`qi-dress`、`qing-cloth`、`red-dress`、`scarf`、`sha-dress`、`shoes`、`shoes2`、`xian-cloth`、`xiu-cloth`、`xiu-scarf`、`yan-dress`、`zi-dress`。

### `d/taohua/obj/`：3 份

`baichou`、`baipao`、`baiyi`。

全部只有 `create()`，名称、别名、重量和属性是固定表达式，无额外回调或运行时表达式。槽位分布：`cloth` 39、`feet` 7、`head` 6、`waist` 4。

## 3. 不能机械统一的差异

- 城市 25 份末尾调用 `setup()`；万劫谷 28 份和桃花岛 3 份不调用。`inherit/misc/equip.c::setup()` 会设置重量相关修正并调用 `ITEM_D->equip_setup()`，后者补初始耐久等属性。补上或删去调用会改变行为。
- `feature/equip.c::wear()` 先检查耐久，再占槽并应用属性。对无 setup 的品种须实测原穿戴成功/拒绝结果，不为了让测试通过先加耐久；疑似旧缺陷单独报告，不在重构中修复。
- `cmds/std/wear.c::do_wear()` 检查 `female_only`，直接 NPC `wear()` 与玩家命令不能视为同一入口。分别验证其原行为，不补全局性别校验。
- 两处同名物品可能有真实 `armor_prop/personality`、价格、颜色、别名、文案和初始化差异。例如两处马褂不能只因名称相同归并；`dress` 与 `pink-dress` 的价格/颜色也不同。
- 部分原 `remove_msg` 写成 `$将$n…`，桃花岛三件未设置材质；均保留原值/缺省状态，不借数据化修文案或补材质。
- EQUIP 不具有 CLOTH 的撕布以及 BOOTS/CLOTH 的洗涤等能力。按原父类复用，`armor_type` 仍是普通属性，不以显示名称重新继承其他类。

固定字段与实际蓝图/实例观测均得到 56 个不同的有效属性组（不以原路径/ID 区分）。因此最终保留 56 个规范品种；差异经驱动确认，不为减少品种数抹去真实属性。31 份无 setup 的旧定义确实因无耐久拒绝穿戴，新版保持相同结果。

## 4. 调用与既有测试依赖

复用 `cloth_inventory.mjs::references()` 检查绝对、无根斜杠、目录相对、`__DIR__`、常量宏及拼接形式，当前命中 **64 处静态引用、25 个文件，0 条匹配的动态前缀线索**。另以目录字面搜索补查；实施后仍须重扫，不将零线索当作所有动态情况的证明。

| 调用方 | 引用数 | 场景 |
| --- | ---: | --- |
| `d/city/npc/zeng.c` | 24 | 成衣铺货表，保留条目顺序、价格和付款/交付；`dress` 原本不在货表，不补商品 |
| 其余 24 个 NPC 文件 | 40 | `carry_object(...)->wear()`，按实际穿戴结果与加成对照 |

其余调用文件：`adm/npc/feng.c`、`b/yitian/npc/zhaomin2.c`；`d/city/npc/liususu.c`、`d/foshan/npc/fengyiming.c`、`d/gaochang/npc/liwenxiu.c`、`d/lingxiao/npc/a-xiu.c`、`d/shenfeng/npc/jinxiangyu.c`；`d/wanjiegu/npc/` 下 `fuer.c`、`gan.c`、`monk.c`、`mu.c`、`xier.c`、`zhong.c`、`zhongling.c`；`kungfu/class/` 下 `emei/zhou.c`、`honghua/chen.c`、`lingjiu/li.c`、`lingxiao/huawanzi.c`、`lingxiao/shiqing.c`、`miao/lan.c`、`riyue/ying.c`、`wudu/hetieshou.c`、`xiaoyao/shiqingl.c`、`xueshan/huodu.c`。

已定位需同步的历史测试：

- `audit_boots_migration.mjs` 将 `d/city/npc/cloth/shoes.c` 列为原批排除对象并检查原文。本轮明确选择该对象后，要核对它属于新批冻结范围/规范身份；不能简单删除“无洗涤/撕布能力”验收。
- `tools/tests/boots/business.lpc` 创建旧路径测试能力边界；当前测试改用新身份，历史对照仍用冻结原文。
- `test_cloth_objects.mjs` 为多个装备测试复制这份旧鞋源码。删除前改成按历史测试需求仅在临时副本恢复，不复活正式旧入口，不改写旧基线。
- 其他历史调用审计按本批允许替换分层核对；原始快照不能随新调用重写。

## 5. 实施与验证入口

沿用 `test_cloth_objects.mjs`、`compile_cloth_callers.mjs`，新增 `--equip` 选择及就近元数据/夹具，不新增执行器。沿用精确 `valid_variety_path()` 存储接入和 `migrate_item_records.mjs`，预计新增 56 条路径后共 1,033 条。

真实驱动逐项验证所有蓝图/克隆、原 setup 次数、耐久与穿戴结果、四种槽位、玩家性别限制及 NPC 直接穿戴、曾柔货表/买卖、背包/商店/盟主恢复。性能对照使用 56 个来源请求、每来源 20 个实例，共 1,120 个实例，三组交替独立驱动测量，不与其他本轮回归并行。

本文件保留盘点依据，测试通过范围以 `validation.md` 为准。56 份旧定义替换为两个文件，定义文件净减少 54 个，可编译源文件减少 55；正式切换仍需备份、预览、按需转换和冷启动，未读取或修改正式数据。
