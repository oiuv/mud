# 普通短兵器迁移范围核对

## 基线与选择依据

基线：`6ad10eeeec22acc6e7190a72352b3e59c2d68840`（鞭类迁移及兵器文案修正）。本文件以规划阶段源码核对为基础；实施已冻结全部原文并完成旧蓝图/克隆 92 项驱动检查。后续回归结果及覆盖边界见 validation.md，不等同于正式服验收。

从 Git 跟踪的 `/d` LPC 文件核对直接继承，并使用现有严格固定初始化解析器辅助分类：

| 类别 | 直接继承文件 | 本轮判断 |
| --- | ---: | --- |
| DAGGER | 24 | 23 份普通固定初始化，1 份带死亡销毁回调；选择本批 |
| CLUB | 19 | 18 份普通固定初始化，1 份额外行为；后续候选 |
| THROWING | 33 | 继承 COMBINED_ITEM，涉及数量、分合、消耗与禁持用；须独立设计，不能照搬普通武器迁移 |
| AXE / FORK / PIN / XSWORD | 7 / 1 / 1 / 1 | 数量较少，本批不迁移，未逐一判定可归并数量 |

这里不是全库全部 ITEM/书籍的最新排名。优先继续已有非叠加兵器路径；暗器虽然文件更多，但行为与当前分类模板不同，应另批核对。

## 来源与固定品种

以下路径相对仓库根目录。伤害是原 `init_dagger()` 参数，不是角色最终伤害；名称省略颜色标记。以下 ID 已经旧蓝图/克隆的完整有效数据及 UID/EUID 观测核实：23 份来源归为 22 组，编号不随排序变化。

| 旧文件 | 显示名称 | 伤害 | 规范 ID |
| --- | --- | ---: | --- |
| `d/beijing/npc/obj/dagger.c` | 匕首 | 4 | `bishou` |
| `d/city/npc/obj/dagger.c`、`d/city/obj/dagger.c` | 普通匕首 | 13 | `bishou2` |
| `d/jingzhou/obj/dagger.c` | 普通匕首 | 30 | `bishou3` |
| `d/city/npc/shanzi/bajiao-shan.c` | 芭蕉扇 | 15 | `bajiao_shan` |
| `d/city/npc/shanzi/chouwu-shan.c` | 绸舞扇 | 15 | `chouwu_shan` |
| `d/city/npc/shanzi/tanxiang-shan.c` | 檀香扇 | 15 | `tanxiang_shan` |
| `d/city/npc/shanzi/tuan-shan.c` | 团扇 | 15 | `tuanshan` |
| `d/city/npc/shanzi/yuban-shan.c` | 玉版扇 | 15 | `yuban_shan` |
| `d/city/npc/shanzi/yumao-shan.c` | 羽毛扇 | 15 | `yumao_shan` |
| `d/city/npc/shanzi/zhe-shan.c` | 折扇 | 15 | `zheshan` |
| `d/death/obj/weapon37.c` | 鱼肠剑 | 100 | `yuchang_jian` |
| `d/death/obj/weapon38.c` | 毒绫子 | 140 | `dulingzi` |
| `d/death/obj/weapon39.c` | 青阳神匕 | 160 | `qingyang_bi` |
| `d/guiyun/npc/obj/zheshan.c` | 油纸折扇 | 15 | `zheshan2` |
| `d/heimuya/npc/obj/bishou.c` | 月牙匕 | 35 | `yueya_bi` |
| `d/huanghe/npc/obj/bi.c` | 判官笔 | 20 | `panguanbi` |
| `d/huanghe/npc/obj/fenshuici.c` | 分水刺 | 5 | `fenshuici` |
| `d/meizhuang/npc/obj/panguan-bi.c` | 镔铁判官笔 | 25 | `panguanbi2` |
| `d/meizhuang/obj/maobi.c` | 毛笔 | 15 | `maobi` |
| `d/meizhuang/obj/panguanbi.c` | 判官笔 | 40 | `panguanbi3` |
| `d/meizhuang/obj/xiao.c` | 绿玉洞箫 | 50 | `yuxiao` |
| `d/xueshan/obj/gushan.c` | 铁骨扇 | 40 | `tiegu_shan` |

23 个来源按名称、重量、伤害、标志及固定属性的 token 对照预分为 22 组，仅两份扬州普通匕首合并；不能将荆州 30 伤害匕首与 13 伤害品种合并。运行期不保留地区前缀，也不因没有发现当前调用就遗漏历史物品记录。

### 必须保留的实际行为

- `inherit/weapon/dagger.c`：蓝图的 `init_dagger()` 设置 `flag | EDGED | SECONDARY`、`skill_type = dagger` 和默认动作；动词为 `slice/pierce/thrust`。候选传入标志均为零，当前有效标志为 6，不能复制 WHIP 的零标志或 STAFF 的 LONG。
- `feature/equip.c`：空手持用占主手；有主武器且另一手空闲时 DAGGER 可占副手；副手不叠加 `weapon_prop`。先装备短兵器再装备非副手武器时，原短兵器可转副手。测试必须执行原逻辑，不只断言标志数值。
- 名为鱼肠剑的品种仍是 DAGGER；毒绫子不新增毒效，绿玉洞箫不新增演奏。保留绿玉洞箫的 `steel`、月牙匕的 `stone`、黄河判官笔 `rigidity = 100`、油纸折扇的 `steel`/`unit = 对` 等旧数据，不以名称猜属性。
- 保留玩家输入别名，包括洞箫 `xu xiao`、铁骨扇 `tigu`；路径 ID 精简与输入别名不是同一件事。
- `weapon37/38/39` 没有自定义 `long`、持用和解除文案；保持原父类/命令默认表现，不擅自补字段。

### 排除对象

`d/luoyang/npc/obj/dagger1.c`（赤金匕首）实现 `owner_is_killed()` 销毁自身。此独有行为本批保持原源码及路径，以 hash 验证不变；普通品种不获得该回调。

## 调用范围

现有引用分析器识别字符串、相邻字符串拼接、局部宏及 `__DIR__`：25 处精确引用分布在 15 个消费者；另有钱正伦一个实际动态消费者，合计 16 个文件。

| 消费者 | 引用数 | 验证重点 |
| --- | ---: | --- |
| `d/city/npc/liususu.c` | 8 | 七种扇商品和自持团扇；八项货表中的书籍不迁移，原顺序不变；团扇只登记 `handing`，不改成 `wield` |
| `d/death/npc/wangfangping.c` | 3 | weapon37–39，整张货表的其他品种及顺序不变 |
| `d/meizhuang/shushi.c` | 2 | 毛笔 2、判官笔 1，保留秃笔翁条目及房间刷新 |
| `d/baituo/npc/playboy.c` | 1 | 折扇配装 |
| `d/guiyun/npc/fanyifei.c`、`zhucong.c` | 各 1 | 判官笔、油纸折扇配装 |
| `d/huanghe/npc/menmian.c`、`peng.c` | 各 1 | 分水刺、判官笔配装 |
| `d/meizhuang/npc/jiading.c` | 1 | 判官笔配装 |
| `d/wuguan/npc/zhuziliu.c` | 1 | 判官笔配装 |
| `kungfu/class/duan/zhu.c` | 1 | 判官笔配装 |
| `kungfu/class/meizhuang/tubi.c` | 1 | 判官笔配装 |
| `kungfu/class/riyue/jia.c`、`ying.c` | 各 1 | 判官笔、月牙匕配装 |
| `kungfu/class/xueshan/huodu.c` | 1 | 铁骨扇配装 |

动态入口 `d/beijing/npc/qianzhenglun.c:do_yao()` 原 `arg == "dagger"` 走 `new(__DIR__ "obj/" + arg)`；现显式指向 `/d/items/dagger/bishou`。只改构造路径，保留八卦门资格、每类库存、兵器累计限领三件、`value = 50` 和 `no_sell` 实例覆盖，其他参数分支不动。

引用分析另报王方平 `weapon3` 前缀线索；它不是对 `weapon37/38/39` 的动态构造，不改该条目。迁移后复扫全库真实调用；测试和历史文档中用于审计的旧路径不算运行期残留。

## 明确文字修复例外

按用户“描述错误可顺手纠正”的授权，仅修正下列内容，不将玩法保持要求解释为必须保留错别字：

| 来源及字段 | 原文片段 | 修正片段 |
| --- | --- | --- |
| 北京匕首 `long` | 看起相当普通 | 看起来相当普通 |
| 团扇 `long`（跨字符串拼接） | 制作的团宫 | 制作的团扇 |
| 荆州匕首 `unwield_msg` | 放会兜里 | 放回兜里 |

旧源码和驱动观测原样冻结；纠错仅作用于对应新定义字段，测试对这些精确差异单独断言，不对整份输出全局消除差异。其他文案、名称、颜色、别名、材质和属性照旧；玩家更新说明同步 `help/changelog`。

## 实施验收与收益口径

- 复用 `tools/tests/cloth_inventory.mjs`、`blade_inventory.mjs` 的解析与引用能力及现有 `test_cloth_objects.mjs`、`compile_cloth_callers.mjs` 入口，增加 DAGGER 分类而不另建执行框架。
- 对全部 23 个来源分别采集旧蓝图/克隆，再核对新品种；测试持用/解除、主副手转换、商店原有查询与购买、NPC/房间、存取与离线恢复。测试替身和未覆盖的完整战斗范围如实说明。
- `feature/user_storage.c` 只登记合法 DAGGER 品种；转换器增加 23 条精确旧路径，保持玩家、商店、显式旧袋及精确 `npc/meng-zhu.o` 装备字段边界。使用临时备份，不触及正式数据。
- 既有十四类冻结快照不重写；累计审计增加本批替换层，旧货表依赖仅在隔离测试目录补入原源码，不恢复运行期旧文件。
- 预计新增 2 个运行期定义文件、删除 23 个旧文件，净减 21；可编译源文件净减 22。测试夹具和文档不混入该口径。
- 性能在正确性验证后，三组新旧交替独立驱动，每组按 23 个原来源各创建 20 次（460 实例）；报告冷加载、热创建中位数、内存估算与程序数的实际结果，不用文件数推算线上总耗时。

## 实施核对补充

- 25 处静态引用分布于 15 个文件，加钱正伦动态入口共 16 个消费者；王方平 `weapon3` 仅是动态前缀线索。
- 刘素素之外的十二个静态 NPC 中，十一处直接持用；盈盈需覆盖独特鱼肠剑空闲/已被占用两个分支，不能用无条件携物替代。
- 钱正伦其余分支按旧行为保留：`waist` 引用的文件原本不存在；飞璜石在 COMBINED_ITEM 移动合并时按缺省 base_value 重算价值为零。这两点不是本批迁移引入，不在本批改变玩法。
