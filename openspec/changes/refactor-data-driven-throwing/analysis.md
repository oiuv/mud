# 普通暗器迁移静态盘点

状态：2026-10-06，27 份原定义与完整蓝图/克隆观测已冻结，归并为 26 个品种；本批对象与业务隔离回归已通过，累计回归和交付检查见 validation.md。

## 范围与选择依据

当前 `/d` 直接继承 THROWING 的 33 份源码已逐份检查；27 份只有固定初始化，6 份特殊实现先保留。其他剩余类别中 CLUB 有 19 份直接定义；41 份带 skill 数据的书籍混有随机名称、自动加载和研读回调，乐器也含动作入口，不把目录数量当作可直接迁移数量。优先本批固定暗器，随后再分组评估其他类别。

只迁移 `/d` 的物品定义；`kungfu/class` 等目录中的实际消费者需同步引用，但不意味着扩大物品来源范围。`/clone` 暂不迁移，那里重复初始化代码不等于等价物品。

## 候选与短 ID

伤害栏为原 `init_throwing` 实参，不是测试观测。两个 `100010` 参数必须保留源码记录，但父类实际忽略第二参数，最终只设置 POINTED。实际 27 份定义形成 26 个品种；小李飞刀两份源码一致，其他同名金镖、铁莲子、飞石有真实差异。最终归并已由蓝图/克隆完整观测确认，不以同名强行合并。

| 原源码 | 玩家名称 | 建议 ID | 初始数量 | init_throwing 实参 |
| --- | --- | --- | ---: | --- |
| `d/beijing/npc/obj/jinbiao.c` | 金镖 | `jinbiao` | 10 | 50 |
| `d/beijing/npc/obj/throwing.c` | 飞璜石 | `feihuangshi` | 20 | 20, 100010 |
| `d/beijing/obj/jinbiao.c` | 金镖 | `jinbiao2` | 1 | 80, 100010 |
| `d/chengdu/npc/obj/feihuangshi.c` | 飞蝗石 | `feihuangshi2` | 20 | 25 |
| `d/chengdu/npc/obj/flower-leaf.c` | 花瓣 | `huaban` | 50 | 2 |
| `d/chengdu/npc/obj/lianzi.c` | 铁莲子 | `tielianzi` | 50 | 25 |
| `d/chengdu/npc/obj/tielianzi.c` | 铁莲子 | `tielianzi2` | 30 | 15 |
| `d/death/obj/weapon22.c` | 仙鹤神针 | `xianhe_zhen` | 50 | 50 |
| `d/death/obj/weapon23.c` | 天穹神针 | `tianqiong_zhen` | 50 | 70 |
| `d/death/obj/weapon24.c` | 龙翔神针 | `longxiang_zhen` | 50 | 100 |
| `d/death/obj/weapon25.c` | 雷霆神针 | `leiting_zhen` | 50 | 120 |
| `d/death/sky/npc/obj/feidao.c` | 小李飞刀 | `xiaoli_feidao` | 1 | 300 |
| `d/guiyun/npc/obj/shortblade.c` | 短刀 | `duandao` | 18 | 25 |
| `d/hangzhou/honghua/obj/tiedan.c` | 铁胆 | `tiedan` | 50 | 30 |
| `d/hangzhou/obj/eluanshi.c` | 鹅卵石 | `eluanshi` | 10 | 1 |
| `d/heimuya/npc/obj/shenzhen.c` | 黑血神针 | `heixue_zhen` | 50 | 50 |
| `d/jinshe/obj/jinshe-zhui.c` | 金蛇锥 | `jinshe_zhui` | 15 | 35 |
| `d/kaifeng/npc/obj/jinzhen.c` | 芙蓉金针 | `furong_zhen` | 50 | 50 |
| `d/lingjiu/npc/obj/jinzhen.c` | 斓蜈金针 | `lanwu_zhen` | 50 | 50 |
| `d/meizhuang/obj/qizi.c` | 棋子 | `qizi` | 40 | 10 |
| `d/sky/npc/obj/feidao.c` | 小李飞刀 | `xiaoli_feidao` | 1 | 300 |
| `d/tangmen/obj/feidao.c` | 小飞刀 | `feidao` | 5 | 15 |
| `d/tangmen/obj/jili.c` | 毒蒺藜 | `dujili` | 50 | 50 |
| `d/taohua/obj/huaban.c` | 桃花瓣 | `taohua_ban` | 50 | 2 |
| `d/taohua/obj/shizi.c` | 石子 | `shizi` | 10 | 2 |
| `d/xiyu/obj/bilinzhen.c` | 碧磷针 | `bilin_zhen` | 50 | 50 |
| `d/xiyu/obj/lianxindan.c` | 炼心弹 | `lianxin_dan` | 50 | 10 |

本批 27 个旧源码换为 1 个 `.lpc` 和 1 个 `.h`，净减 25 个运行期定义文件、26 个可编译源文件。旧定义已删除，逐文件 hash 与消费者审计通过。

## 保留的特殊定义

| 文件 | 名称 | 原行为与保留原因 |
| --- | --- | --- |
| `d/beijing/obj/yinzhen.c` | 银针 | `init/do_heal` 注册针灸，涉及技能、治疗、消耗及失败伤害 |
| `d/chengdu/npc/obj/tea-leaf.c` | 茶叶 | `do_effect` 消耗一片并回复精、进入忙状态 |
| `d/gumu/obj/bingpo-zhen.c` | 冰魄银针 | 初始化 `daub/*` 临时毒性、余量及来源信息 |
| `d/gumu/obj/yufeng-zhen.c` | 玉蜂针 | 初始化另一套 `daub/*` 临时毒性、余量及来源信息 |
| `d/kunlun/obj/sangmending.c` | 丧门钉 | `set_amount(random(5) + 10)`，另有既有毒性字段 |
| `d/mingjiao/yuan/obj/arrow.c` | 凤尾箭 | `is_arrow()` 箭矢标识、伤害比例及 setup 后实例属性 |

这些对象的源码与行为保持不变，实施时记录 hash 并将具体资料加入 `docs/architecture/data-driven-items-pending.md`。扩展台账时也盘点该分类在其他游戏目录的保留项，明确 `/clone` 不在实施范围内。

## 原父类决定的初始化与状态

- `inherit/weapon/throwing.c` 继承 COMBINED_ITEM 和 F_EQUIP。原 `init_throwing()` 与 `setup()` 在克隆上直接返回；只对最终虚拟蓝图初始化伤害、POINTED、throwing、no_wield、consistence 及动作，不能套用普通剑刀的装备初始化。
- `inherit/item/combined.c:22` 的 `set_amount` 将真实重量设为数量乘 base_weight，将 value 设为数量乘 base_value；数量为 nosave 独立变量。必须在属性/默认对象就绪后对蓝图和每个实例分别执行，不能只保存一个 dbase amount。
- 小李飞刀写入的 value=6000 被 base_value=0 覆盖，最终价值为零；归云短刀先写重量 7000，最终数量 18 × base_weight 300 = 5400，value 最终零，材质最终 steel。北京飞璜石缺 base_value，不能因原 set(value,50) 擅自补售价。这些结果已由真实驱动逐项核实。
- `combined.c:42` 移动按 base_name 合堆，`can_combine_to` 同样使用品种路径。归并后等价小李飞刀应正常合堆，不同金镖或铁莲子不能串堆；保留当前移动合堆的覆盖规则，不借本批设计毒性/绑定状态新合并机制。
- `cmds/std/get.c/drop.c/give.c/put.c` 通过 new(base_name) 拆分，再 set_amount；`feature/dealer.c` 通过 base_value、数量和原货表定价。物品创建初始数量和买卖数量不是同一概念。
- `kungfu/skill/tangmen-throwing/hua.c` 通过 handing 与 skill_type 识别普通暗器，既有命中分支 add_amount(-1)；其他绝招存在不同消耗和结果。本批不改技能效果，验证代表性真实调用及零数量销毁。
- 描述“淬毒”的普通暗器不因此自动获得毒性；保留原材质（例如石子 material=iron）、独立 damage 属性及默认值，不根据文案猜测玩法。

## 消费者核对

复用现有 token 级引用分析，识别绝对路径、相对路径和 __DIR__：共 41 处静态引用、30 个文件。行号为规划时工作区位置，不保证修改后不变。

| 消费者 | 静态引用数 | 原行号 |
| --- | ---: | --- |
| `d/chengdu/npc/tanghuai.c` | 3 | 31、32、34 |
| `d/death/npc/wangfangping.c` | 4 | 51、52、53、54 |
| `d/guiyun/npc/gaosan.c` | 1 | 44 |
| `d/hangzhou/baoshishan.c` | 1 | 18 |
| `d/hangzhou/honghua/an.c` | 1 | 51 |
| `d/hangzhou/honghua/meng.c` | 1 | 51 |
| `d/hangzhou/honghua/zhou.c` | 1 | 53 |
| `d/huanghe/caodi2.c` | 1 | 19 |
| `d/huanghe/shixiazi.c` | 1 | 21 |
| `d/jinshe/shandong.c` | 1 | 22 |
| `d/meizhuang/qishi.c` | 1 | 17 |
| `d/sky/npc/li.c` | 1 | 68 |
| `d/suzhou/huqiu.c` | 1 | 22 |
| `d/taohua/houyuan.c` | 1 | 22 |
| `kungfu/class/honghua/lu.c` | 2 | 105、333 |
| `kungfu/class/honghua/yu.c` | 1 | 91 |
| `kungfu/class/honghua/zhao.c` | 2 | 94、204 |
| `kungfu/class/lingjiu/sang.c` | 2 | 87、185 |
| `kungfu/class/meizhuang/heibai.c` | 1 | 116 |
| `kungfu/class/riyue/sang.c` | 2 | 98、148 |
| `kungfu/class/shang/ming.c` | 1 | 144 |
| `kungfu/class/shang/tai.c` | 1 | 105 |
| `kungfu/class/shang/zhen.c` | 1 | 96 |
| `kungfu/class/tangmen/tangrou.c` | 2 | 84、85 |
| `kungfu/class/taohua/huang.c` | 2 | 187、1015 |
| `kungfu/class/xingxiu/ding.c` | 1 | 221 |
| `kungfu/class/xingxiu/zhaixing.c` | 1 | 129 |
| `kungfu/class/zhenyuan/wangjianjie.c` | 1 | 111 |
| `kungfu/class/zhenyuan/wangjianying.c` | 1 | 95 |
| `kungfu/class/zhenyuan/wangweiyang.c` | 1 | 130 |

另外 1 个真实动态入口是 `d/beijing/npc/qianzhenglun.c` 的 `new(__DIR__ "obj/" + arg)`：仅增加 throwing 的规范路径分支，保持门派、三件额度、总库存、no_sell/value 实例覆盖和其他分支。另一个前缀线索是王方平的 `weapon2` 字符串，它不是本批 `weapon22..25` 的动态构造，不能误替换。

重点覆盖唐槐（3 件迁移货物 + 1 件保留茶叶）、王方平 4 种神针、7 个房间刷新入口，以及陆菲青、赵半山、桑土公、桑三娘、黄药师的携物/领取或其他包含创建语句的实际函数；任务中要求固定函数范围和真实分支，不以消费者编译代替业务执行。没有静态消费者的定义仍保留可创建品种，不擅自删除物品。

## 限定文案纠错

以下只改新数据中的对应 long，旧源码快照和原始驱动观测不改写；其他字段逐项对照，同步玩家更新说明。

- `d/chengdu/npc/obj/flower-leaf.c`：“上面还挂这晶莹的露珠”→“上面还挂着晶莹的露珠”。
- `d/taohua/obj/huaban.c`：同一处“挂这”→“挂着”。
- `d/chengdu/npc/obj/lianzi.c`：“沉颠颠”→“沉甸甸”。

不推断其他可疑文案对应的游戏功能，不修改“飞璜石”等物品名称或别名。

## 验证边界

本文件保留来源、范围与具体核对依据；已执行检查和测量结果以 validation.md 为准，不凭静态数量宣称性能改善。实现回归只运行临时 MUDLIB 和合成备份，不加载正式配置或玩家对象；沿用既有对象、消费者、存档转换、ID 和引用审计工具，不新建测试框架。实施基线为短兵器与台账提交 `55f5e073918809866a411bfbb61c2db718df07a2`，本批来源文件 hash 在实施冻结时记录。


## 实施冻结与验证记录

`tools/tests/throwing/baseline.json` 保存基线 `55f5e073918809866a411bfbb61c2db718df07a2`、27 份源码及 SHA-256、41 处静态替换（30 文件）、钱正伦动态入口和完整 31 个消费者原文；6 份特殊对象的 hash 未变。27 份旧蓝图及克隆观测已记录，实际 flag 均为 POINTED(8)，两份小李飞刀属性等价，26 个规范 ID 采用上表名称，未再机械拼接路径。

当前 54 个相关程序编译通过（不执行 create）；隔离对象、原命令、代表技能、业务函数及记录恢复合计 4,502 项检查通过。业务覆盖 17 个普通 NPC 的携物语句、赵半山/黄药师的两种构造分支、陆菲青与两位桑姓 NPC 的领取、钱正伦全部已迁移分支、2 家商店和 7 个房间。十六类累计回归与三轮性能数据见验证报告；不代表正式服或全部战斗已验收。
