# 普通乐器迁移范围分析

## 基线与统计口径

基线：`aab4cff1e5b17ecadd0eb36ffd3581d6a7995ec8`。这是只读源码分析，不是已实施或真实驱动验收记录。

已核对 `include/music.h` 的三个 MI 宏、直接继承，以及 `XSWORD` 经 `inherit/weapon/xsword.c` 获得的吹箫能力。按这三个演奏家族，当前 `/d` 有 27 件，其中 24 件为 ITEM 乐器、3 件兼作武器；`/clone` 的 4 件武器乐器不迁移。本批 24 件均为固定属性初始化加共有 `init/play`，未发现可以完全等价合并的品种，最终分组仍须用旧蓝图/克隆有效属性核验。

选择本批是因为共同演奏行为清晰且有 24 份定义可统一维护，不声称它是全库所有剩余 ITEM 中数量最大的集合。普通 ITEM 还混有钥匙、机关和任务信物，不能仅凭初始化相似并入此批。

## 拟迁移清单

正式路径为 `/d/items/<家族>/<ID>`。ID 按资产命名，不含来源地区；数据表自然排序，编号固定后不随排序变化。名称/别名中的历史写法不随内部 ID 改写。

| 原文件 | 家族 | 规范 ID | 显示名（去颜色） | 重量 | value |
| --- | --- | --- | --- | ---: | ---: |
| `d/baituo/obj/tiezheng.c` | zheng | `tiezheng` | 铁筝 | 300 | 5000 |
| `d/baituo/obj/zheng.c` | zheng | `guzheng` | 古筝 | 300 | 50 |
| `d/changan/npc/obj/muqin.c` | qin | `muqin` | 木琴 | 600 | 50 |
| `d/hengyang/npc/obj/huqin.c` | qin | `huqin` | 胡琴 | 600 | 50 |
| `d/hengyang/npc/obj/tanmuqin.c` | qin | `tanmuqin` | 檀木琴 | 600 | 50 |
| `d/hengyang/npc/obj/zhuxiao.c` | xiao | `zhuxiao` | 翠竹萧 | 600 | 50 |
| `d/hengyang/yueqi/honghuqin.c` | qin | `honghuqin` | 红木胡琴·五玄 | 800 | 2000 |
| `d/hengyang/yueqi/huqin.c` | qin | `huqin2` | 普通胡琴 | 600 | 200 |
| `d/hengyang/yueqi/jiaoyeqin.c` | qin | `jiaoyeqin` | 蕉叶古琴·明朝 | 700 | 800000 |
| `d/hengyang/yueqi/jiuxiaoqin.c` | qin | `jiuxiaoqin` | 九霄环佩·唐朝 | 600 | 400000 |
| `d/hengyang/yueqi/qin-jimo.c` | qin | `jimo_qin` | 七玄流银·寂寞 | 1000 | 5000000 |
| `d/hengyang/yueqi/qin-jueyin.c` | qin | `jueyin_qin` | 七玄流银·绝音 | 1000 | 5000000 |
| `d/hengyang/yueqi/qin-konggu.c` | qin | `konggu_qin` | 七玄流银·空谷 | 1000 | 5000000 |
| `d/hengyang/yueqi/qin-tianlai.c` | qin | `tianlai_qin` | 七玄流银·天籁 | 1000 | 5000000 |
| `d/hengyang/yueqi/shixuanqin-zhanguo.c` | qin | `shixuanqin` | 十玄古琴·战国 | 700 | 100000 |
| `d/hengyang/yueqi/tanhuqin.c` | qin | `tanhuqin` | 檀木胡琴 | 800 | 1000 |
| `d/hengyang/yueqi/zhongnishi.c` | qin | `zhongniqin` | 仲尼式琴·宋朝 | 500 | 200000 |
| `d/hengyang/yueqi/zhuxiao-liuquan.c` | xiao | `liuquan_xiao` | 碧玉洞萧·流泉 | 600 | 5000000 |
| `d/hengyang/yueqi/zhuxiao-qingyin.c` | xiao | `qingyin_xiao` | 碧玉洞萧·清音 | 600 | 5000000 |
| `d/hengyang/yueqi/zhuxiao-shuiyun.c` | xiao | `shuiyun_xiao` | 碧玉洞萧·水云 | 600 | 5000000 |
| `d/hengyang/yueqi/zhuxiao-youlan.c` | xiao | `youlan_xiao` | 碧玉洞萧·幽兰 | 600 | 5000000 |
| `d/hengyang/yueqi/zhuxiao.c` | xiao | `zhuxiao2` | 普通竹萧 | 600 | 200 |
| `d/kunlun/obj/jwqin.c` | qin | `jiaoweiqin` | 焦尾琴 | 600 | 10000 |
| `d/taohua/obj/zhuxiao.c` | xiao | `zhuxiao3` | 竹萧 | 300 | 10 |

同名不代表等价：两种胡琴的显示和价格不同；三种竹萧的别名、重量、描述或价格不同；同价的流银琴和碧玉洞萧仍有名称、颜色、刻字差异。不能据价格或父类相同合并。

## 创建与使用行为

- 三类原对象均为 `ITEM + MI_QIN/MI_XIAO/MI_ZHENG`，`create()` 调用 `setup()`；`init()` 分别注册 `play_qin/play_xiao/play_zheng` 到 `play`。
- 三个 MI 实现先解析可选的 `with <物品别名>`；不匹配当前物品时返回 0，再转交原 `tanqin-jifa/chuixiao-jifa/guzheng-jifa`，不自行判断演奏条件。
- 原技能检查参数、曲谱技能、适配类别及忙碌状态，以曲谱等级加演奏技法的一半计算档位；档位门槛为 15、30、60、90、150、225、300。
- 成功进入演奏分支后沿用 `3 + random(3)` 忙时和原曲谱 `do_effect(me)`。最低档仍调用效果，不擅自改成高等级才生效；不新增战斗、携带或门派限制。
- 分别核验原蓝图/克隆重量、默认对象、setup 派生属性及 UID/EUID，不用静态表值代替实际结果。

## 调用点

静态表达式扫描得到 27 处引用，分布在 11 个文件。包括绝对路径、`__DIR__` 拼接和没有开头斜线的路径；不是仅搜索完整字符串。

| 消费者 | 引用数 | 保留行为 |
| --- | ---: | --- |
| `d/baituo/wuqiku.c` | 1 | 古筝刷新数量、其他物品及 replace_program |
| `d/changan/npc/liu.c` | 1 | 刘老实木琴货表、价格及购买行为 |
| `d/hengyang/npc/feiyan.c` | 15 | 原乐器货表与顺序；三本自定义书不迁移，不补售 tanhuqin |
| `d/taohua/daojufang.c` | 3 | 三个随机分支的竹萧和其他物品数量、分布 |
| `kungfu/class/henshan/liu.c` | 1 | 原携带/handing 对象 |
| `kungfu/class/henshan/mo.c` | 1 | 原携带/handing 对象 |
| `kungfu/class/kunlun/hezudao.c` | 1 | 原携带/handing 对象 |
| `kungfu/class/ouyang/ouyangfeng.c` | 1 | 铁筝携带；规范化原无首斜线引用 |
| `kungfu/class/riyue/qu.c` | 1 | 原携带/handing 对象 |
| `kungfu/class/riyue/ying.c` | 1 | 原携带/handing 对象 |
| `kungfu/class/xiaoyao/kanggl.c` | 1 | 原携带/handing 对象 |

动态候选 `d/changan/npc/fujiang.c` 的 `obj/ + weapon_file` 只来自 changjian、gangdao、gangzhang、changbian、axe，不包含木琴；保留源码/hash，不机械替换。实施时复扫全库并核对新增引用。

## 保留项与负例

| 文件 | 不纳入原因 |
| --- | --- |
| `d/dali/npc/obj/yaoqin.c` | HAMMER + MI_QIN，仍是可挥舞武器 |
| `d/meizhuang/obj/qin.c` | SWORD + MI_QIN，武器伤害及挥舞属性 |
| `d/taohua/obj/yuxiao.c` | XSWORD，间接演奏能力与剑类初始化 |
| `clone/lonely/tieqin.c` | /clone 暂不迁移；武器与特殊命中效果 |
| `clone/lonely/yaoqin.c` | /clone 暂不迁移；武器与特殊命中效果 |
| `clone/lonely/dongxiao.c` | /clone 暂不迁移；XSWORD、克隆销毁 |
| `clone/lonely/yuxiao.c` | /clone 暂不迁移；XSWORD、克隆销毁与命中效果 |

`d/kunlun/obj/guzheng.c` 及 `d/xiyu/obj/tongbo.c`、`tonggu.c`、`tonghao.c` 仅有乐器外观，没有上述演奏继承，不因名称相似纳入或补加演奏功能。将 7 件保留项及这些范围外负例同步到未迁移台账；与已有武器类别交叉列出的文件按路径去重统计。

## 预期收益与验收边界

24 份旧定义替换为三个 provider 和三个数据头文件，预计净减少 18 个运行期定义文件、21 个可编译源文件。不将新增开发测试文件计入运行期收益，不承诺编译档案总数一定恰好减少 21。

为保持三套原始能力而采用三个小类，不新增全类型工厂或数据解释器。测试复用既有隔离真实驱动、对象比较、消费者与存档恢复设施；全量 LPC 警告、累计分类回归和性能绝对值分别报告。正式数据、在线服务及 /clone 不动；存档转换仅在显式备份或临时记录中验证。
