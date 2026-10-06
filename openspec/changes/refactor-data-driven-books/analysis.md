# 普通秘籍与研读物迁移分析

## 基线与选类依据

2026-10-06 对 `ea5f6afd1d95f22c5dc47fe23081a927ee64e11a` 的当前源文件进行只读盘点；本次没有运行新物品、冻结驱动观测或修改正式数据。忽略注释后的继承扫描与研读属性扫描结合人工核对，不将函数数量当作唯一迁移依据。

- `/d` 中有 41 份带 `skill` 研读属性的物品：36 份计划迁移、5 份明确保留。
- 36 份的有效代码静态分组为 28 组，预计删除 36 份旧源文件，新增 1 份 `.lpc` 和 1 份 `.h`。等价性仍需旧、新真实驱动观测确认，不把静态分组当作已完成验收。
- `/d` 乐器另有 26 份直接继承 MI_QIN/MI_XIAO/MI_ZHENG 的定义；堆叠物剩余候选主要为北京丹药和特殊物品，普通蒙汗药仅两份。通用 ITEM 还混有任务、容器等不同功能，不把它们视为可整批迁移的一类。
- `/clone` 研读候选 185 份仅为本次属性扫描线索，尚未完成头文件/间接继承分类，不宣称这是完整台账；实施时按现有台账规范逐项盘点，保持源码不变。
- 工作区 `data/e2c_dict.o`、`data/emoted.o` 的既有修改不纳入本批。

## 计划品种与完整旧路径

以下 ID 描述物品本身，编号只区分真实品种，实施冻结后不随排序改变。`fojing1` 至 `fojing5` 不是旧文件数字的机械转换。所有物品保持原 ITEM 父类、名称和输入别名；除列出的描述纠错外，显示与有效数据保持。

| 规范 ID | 物品/差异 | 旧源码路径 |
|---|---|---|
| baibian_shentong | 百变神通，易容术 | `d/changan/npc/obj/book.c` |
| bojuan | 薄绢，内功 | `d/lingxiao/obj/book-silk.c` |
| boluomi_jing | 波罗蜜多心经，固定书名 | `d/kaifeng/npc/obj/jing4.c` |
| chaizhao_mishu | 拆招秘术 | `d/wudu/obj/book2.c` |
| changsheng_jue | 长生决，两份等价 | `d/death/sky/obj/jue.c`、`d/sky/obj/jue.c` |
| daodejing1 | 道德经上卷，蓝图消耗 20–29 | `d/quanzhen/npc/obj/daodejing-i.c` |
| daodejing2 | 道德经下卷，蓝图消耗 20–39 | `d/quanzhen/npc/obj/daodejing-ii.c` |
| daofa_jianjie | 刀法简介，保留 sen_cost | `d/changan/npc/obj/book_blade.c` |
| dujing2 | 毒经中篇，保留禁售及等级限制 | `d/wudu/obj/dujing2.c` |
| feilong_tanyun | 飞龙探云秘芨，两份等价 | `d/death/sky/obj/miji3.c`、`d/sky/obj/miji3.c` |
| fojing1 | 4 个随机书名；buddhism，10/10/50 | `d/emei/obj/fojing10.c`、`d/shaolin/obj/fojing10.c`、`d/shaolin/obj/fojing11.c` |
| fojing2 | 同 4 个书名；buddhism，20/20/100 | `d/emei/obj/fojing11.c` |
| fojing3 | 5 个随机书名；mahayana，10/10/50 | `d/emei/obj/fojing20.c` |
| fojing4 | 同 5 个书名；mahayana，20/20/100 | `d/emei/obj/fojing21.c` |
| fojing5 | 同 5 个书名；buddhism，20/20/100 | `d/shaolin/obj/fojing20.c`、`d/shaolin/obj/fojing21.c` |
| jingang_jing | 金刚经，固定书名 | `d/kaifeng/npc/obj/jing3.c` |
| kunlun_miji | 昆仑派秘籍；名称中的门派含义保留 | `d/kunlun/obj/force-book.c` |
| lengjia_jing | 楞伽经；保留 sanscrit 500 的嵌套条件 | `d/mingjiao/obj/jing.c` |
| niepan_jing | 大般涅磐经，固定书名 | `d/kaifeng/npc/obj/jing2.c` |
| qinggong_pian | 轻功篇 | `d/yanziwu/obj/dodgebook.c` |
| quanfa_jianjie | 拳法简介，保留 sen_cost | `d/changan/npc/obj/book_unarmed.c` |
| shiban | 石板，蓝图选定 finger/claw/strike/cuff/hand | `d/lingxiao/obj/book-stone.c` |
| siji_jianfa | 四季剑法，两份等价 | `d/death/sky/obj/miji2.c`、`d/sky/obj/miji2.c` |
| tiexian_quan | 铁线拳密芨，两份等价 | `d/death/sky/obj/miji1.c`、`d/sky/obj/miji1.c` |
| wuliang_jing | 无量寿经，固定书名 | `d/kaifeng/npc/obj/jing1.c` |
| xuedao_jing | 血刀刀谱，学习基本刀法 | `d/jingzhou/obj/xuedao-jing.c` |
| yueshan_yishu | 岳山遗书，两份等价 | `d/death/sky/obj/yishu.c`、`d/sky/obj/yishu.c` |
| zhu_pian | 旧竹片，轻功 | `d/lingxiao/obj/book-bamboo.c` |

佛经行的三数依次是 `jing_cost/difficulty/max_skill`。同名、同目录或相似描述都不足以证明等价；例如峨嵋 mahayana 与少林 buddhism 不能归并。

## 原行为中需要特别保留的差异

1. 本批都继承 ITEM，不具有 BOOK 的 `is_book()` 和 `extra_long()`。`cmds/skill/study.c` 按 `skill` mapping 判断可研读，不要求 BOOK；因此新程序也继承 ITEM。
2. 普通定义没有主动调用 `setup()`；不能照搬武器 provider 的 `init_*` 或 `setup()`。`book.c` 两次设置 value，最终为 100；应保留有效值而非第一处文本。
3. 随机书名在原 `create()` 的克隆判断前生成，蓝图和各克隆分别选名；单元素书名池仍按原池处理。
4. 石板的技能抽样发生于每次 create，但只有蓝图分支使用抽样结果，克隆实际沿用默认对象的技能。道德经的 jing_cost 只在蓝图分支随机。保持实际取值范围、生命周期和克隆有效值，不追求不同代码布局下全游戏随机序列逐次一致。
5. 刀法/拳法简介写的是 `sen_cost`，不是 `jing_cost`；study 按现有公式和最低 10 点消耗执行。本轮不擅自改字段或“修正”玩法。血刀刀谱教的是 `blade`，不按名称改成 xuedao-daofa。
6. 复合 `skill`、`skill/need` 等仍按现有迁移规范复制为独立实例数据，不污染其他克隆或注册表。

## 消费者与动态路径

现有引用扫描器发现 19 处静态引用（13 个文件），以及 11 处动态目录线索；逐个读源码后，实际预期修改 20 个消费者。

| 消费者 | 核对与实施范围 |
|---|---|
| `d/changan/npc/shuchi.c` | 两本基础书的 vendor_goods，真实 list/buy 与价格 |
| `d/changan/npc/yuanwai.c` | `cry_daughter()` 的书籍奖励与 give；保留原任务过程 |
| `d/kaifeng/cangjing2.c` | 4 本固定书名佛经的房间 objects |
| `d/lingxiao/book.c` | 4 项 books 数组中仅迁移 3 项；保留铁手掌、两次随机选择及原 mapping 重复键语义 |
| `d/mingjiao/obj/bag.c` | `do_open()` 每袋一次的楞伽经交付；不迁移油布包或重置 book_count |
| `d/quanzhen/npc/zhangjing.c`、`zhangli.c` | 上/下卷领取；各自门派与库存判断不变 |
| `d/sky/npc/hua.c`、`kou.c`、`li2.c`、`tie.c`、`xu.c` | 携带相应秘籍，不调整 NPC 技能及战斗 |
| `d/wudu/shufang.c` | 拆招秘术刷新，其余物品不变 |
| `d/emei/cangjingge.c`、`cangjinglou.c` | 各两条 fojing1/fojing2 + random(2) 选择改为明确的新路径池；保留选择概率、时机与借书拦截 |
| `d/shaolin/cjlou.c`、`jianyu.c` | 共三条随机旧路径；合并后等价选项仍保持原数量，其他房间/监狱功能不变 |
| `kungfu/class/shaolin/dao-chen.c`、`dao-xiang.c`、`d/xiangyang/npc/wuxiuwen.c` | 现有公开 ask_me/ask_me_1 的 name 可达 fojing10/11/20/21，增加精确的新路径分支；不新增 inquiry，不改变各自门派、库存或持有检查 |

动态线索 `d/changan/npc/fujiang.c` 只取 changjian/gangdao/gangzhang/changbian/axe，不可能创建本批书籍，保持不变并作为负例。本表是目前扫描及源码核对结果，实施还须审计旧路径残留与别名/相对路径，不将前缀命中都当成玩家入口。

## 明确保留的 5 件物品

| 名称 | 源码 | 保留理由 |
|---|---|---|
| 千字文 | `d/city/npc/obj/lbook3.c` | `query_autoload()` 返回 1；本批不引入新的自动保存行为子类 |
| 紫盖剑谱 | `d/hengyang/obj/zigai-book.c` | `create()` 对克隆执行 destruct；不能因只有 create 就当普通定义迁移或改为可克隆 |
| 两仪剑心得 | `d/kunlun/obj/lyj-book.c` | init/do_study 自定义研读，精力与进步公式独立 |
| 铁手掌 | `d/lingxiao/obj/book-iron.c` | HANDS 父类、护甲属性及战斗中 do_study；与已有手部装备保留项交叉计数 |
| 毒经上篇 | `d/wudu/obj/dujing1.c` | init/do_read 的配方展示功能，不能随普通属性丢弃 |

实施时将这些条目及范围外物品写入 `docs/architecture/data-driven-items-pending.md`，更新分类数、唯一文件数及铁手掌的交叉归属，保留旧批次的历史证据。

## 获准范围内的描述纠错

冻结旧源码保持不变；仅对新定义的 `long` 使用精确差异对照，并同步 `help/changelog`：

- 两份四季剑法：`奥决` → `奥诀`。
- 薄绢：`吐呐` → `吐纳`。
- 石板：`园园的石板` → `圆圆的石板`。

不更改“长生决”“铁线拳密芨”等现有物品名称或输入别名，不因可疑拼写调整技能 ID、字段或玩法。消费者本身的其他文案本批不扩大修改。

## 验证与部署边界

本文件前文保留规划时的静态分析口径。实施后按旧/新真实驱动分别验证全部定义、随机生命周期、study 成功/失败、实际消费者和精确存取；实际结果见 [validation.md](validation.md)，不以初始静态清单替代运行证据。

正式存档未扫描；任何“无需转换”的结论只适用于之后明确选定并完整检查的备份。上线需配套备份、按需转换与代码/记录回退，不以编译成功代替记录恢复验收。

## 实施补充（2026-10-06）

36 份来源/28 品种通过驱动对照，预计归并无需调整；每实例书名、石板仅蓝图保存技能、两卷道德经仅蓝图保存精力消耗均按原时机验证。无 setup、sen_cost 及 value 最后赋值仍保留，三类描述纠错已按字段逐项对照。

台账清点扩大至 BOOK、MEDICAL_BOOK、自定义 do_read/do_du/do_study、本地头文件及静态继承，另发现 12 件 /d 阅读物；这里只补记录，不迁移。剩余研读物共 219 件：/d 17、clone 197、u 5，与其他分类有 17 件交叉归属。具体名称、路径、行为和原因已更新到 `docs/architecture/data-driven-items-pending.md`，此前五件明确保留项和副将负例的 hash 均不变。
