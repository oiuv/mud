# S1组合与师承来源对账

## 范围和证据

本次只对账当前27个目录组的36对组合：35对旧对称组合及绝情谷1对非对称组合。逐项保存NPC `create` 中的技能、激发、准备、家族声明及相关资格函数，277份当前公开来源hash核对一致，解析错误0。**这是源码来源审计，不是新增原生样本、实际教学通过或最终配装观察。**

保全目录：`C:/tools/msys64/home/oiuv/mud-evidence/martial-data/audit-s1-pair-sources-20261029-v2/`，含 `source-audit.json`、`producer.mjs`、`summary.json`。本机忽略目录中的助手为 `temp/audit_s1_pair_sources_20261029.mjs`。

- 审计JSON SHA256：`de169f66d56bf08aeaafb0fa24d7a3d2d916b250bf823003cc0968b5a8345fc7`。
- 生产脚本 SHA256：`37a300d3e630fa27ca3884a33873a094c64b53b597c4be1381f98ae27edb9bbe`。
- 组合定义 SHA256：`3e3300e447c7c9e0f51175af5cc1f63ffd00f48696e65da0a012be01aab09d4b`。
- 当前来源指纹：`8ae4d9c9eb8ac77c0fd3dc7a08010d230e522a96a5bdf0bbb90e8db0ebe6bdce`。

旧v1仅含35对，误从已筛选的 `inventory.calls` 提取 `no_teach`，漏掉这些声明；保留旧件，但其中空列表不能作为“不限制教学”的依据。v2改从保留的 `create` 原文分词提取，另纳入非对称组合。v2摘要中的历史字段名 `blocked` 实际仅表示**存在声明**，不能不读回调就当作一律禁止。

## 逐对声明

“共列”表示同一NPC的 `create` 声明两门技能；“双备”进一步要求两门均有准备声明。可能存在条件分支和后续覆盖，均不等于实际运行时同时准备。家族列汇总该对成员相关NPC的声明，不表示每个NPC都具备整对组合。34对有共列、25对有双备声明，不能用此关闭全部实测缺口。

| 目录组 | 组合 | 共列NPC | 双备声明NPC | 相关NPC声明家族 |
| --- | --- | ---: | ---: | --- |
| duan | jinyu-quan / wuluo-zhang | 13 | 8 | 段氏皇族 |
| gaibang | jueming-tui / tongchui-zhang | 11 | 6 | 丐帮 |
| henshan | biluo-zhang / henshan-quan | 5 | 3 | 衡山派 |
| honghua | taiji-quan / wudang-zhang | 0 | 0 | 红花会 |
| hu | chuncan-zhang / hujia-quan | 2 | 2 | 关外胡家 |
| jueqing | chuanxin-zhang / tiexian-quan | 1 | 0 | 绝情谷 |
| jueqing | pokong-quan / guhong-zhang（非对称） | 2 | 0 | 绝情谷 |
| kunlun | kunlun-zhang / zhentian-quan | 1 | 0 | 昆仑派 |
| kunlun | sanyin-shou / kunlun-zhang | 1 | 1 | 昆仑派 |
| lingjiu | dusha-zhang / lansha-shou | 1 | 1 | 碧磷洞 |
| lingjiu | liuyang-zhang / zhemei-shou | 1 | 1 | 灵鹫宫、一字慧剑门 |
| lingxiao | lingxiao-quan / piaoxu-zhang | 11 | 11 | 凌霄城 |
| meizhuang | longzhua-gong / qianye-shou | 0 | 0 | 梅庄 |
| miao | chongtian-zhang / panlong-zhao | 1 | 1 | 中原苗家 |
| murong | banruo-zhang / yizhi-chan | 1 | 0 | 慕容世家 |
| murong | nianhua-zhi / sanhua-zhang | 1 | 0 | 慕容世家 |
| murong | fengyun-shou / yingzhua-gong | 1 | 0 | 慕容世家 |
| ouyang | lingshe-quan / shedu-qiqiao | 2 | 2 | 欧阳世家 |
| riyue | poyue-zhao / zhenyu-quan | 13 | 11 | 日月神教、黄河帮 |
| shang | bagua-quan / bagua-zhang | 3 | 3 | 商家堡 |
| shenlong | chousui-zhang / sanyin-wugongzhao | 1 | 1 | 神龙教 |
| shenlong | huagu-mianzhang / shenlong-bashi | 4 | 4 | 神龙教 |
| songshan | songshan-quan / songshan-zhang | 5 | 1 | 嵩山派 |
| tianlongsi | dashou-yin / yujiamu-quan | 1 | 0 | 密宗 |
| tianlongsi | huoyan-dao / dashou-yin | 1 | 0 | 密宗 |
| tiezhang | chuanxin-zhang / tiexian-quan | 2 | 1 | 铁掌帮 |
| wudu | tianchan-zhang / wusheng-zhao | 7 | 7 | 五毒教 |
| xiaoyao | liuyang-zhang / zhemei-shou | 2 | 2 | 逍遥派 |
| xiaoyao | panyang-zhang / qingyun-shou | 9 | 7 | 逍遥派 |
| xingxiu | chousui-zhang / sanyin-wugongzhao | 7 | 7 | 星宿派 |
| xuanming | dulong-shenzhua / xuanming-zhang | 3 | 0 | 玄冥谷 |
| xuanming | piaofeng-quan / feihua-zhang | 4 | 1 | 玄冥谷 |
| xuedao | dashou-yin / yujiamu-quan | 4 | 4 | 血刀门 |
| xueshan | dashou-yin / yujiamu-quan | 7 | 5 | 大轮寺 |
| yunlong | yunlong-shou / yunlong-zhua | 1 | 1 | 云龙门 |
| zhenyuan | bagua-quan / bagua-zhang | 5 | 3 | 八卦门 |

红花范围未找到武当掌法的技能声明，梅庄范围未找到千叶手的技能声明。旧G4实验仍可说明固定条件下的组合接口/准备/攻击轮结果，不能更名为对应NPC的原配装或教学；未在这些目录发现声明也不证明玩家绝不可能从别处学得。

## 教学限制逐项解释

本次提取7位NPC、14项与上述组合成员有关的 `no_teach` 声明，区分如下：

| NPC | 本次相关技能 | 当前源码事实（尚非新增教学实测） |
| --- | --- | --- |
| [赵半山](../../kungfu/class/honghua/zhao.c#L59) | taiji-quan | 字符串拒绝 |
| [黄钟公](../../kungfu/class/meizhuang/huang.c#L67) | longzhua-gong | 相邻字符串拼接后仍为拒绝文案 |
| [苗人凤](../../kungfu/class/miao/miao.c#L222) | chongtian-zhang | 条件回调；已有 `can_learn/miao/chongtian-zhang` 返回0；否则经验严格大于100000时写入许可并返回0，等号或更低拒绝 |
| [慕容博](../../kungfu/class/murong/murongbo.c#L203) | banruo-zhang、yizhi-chan、nianhua-zhi、sanhua-zhang、fengyun-shou、yingzhua-gong | 共用拒绝回调：首次设置 `has_asked/murongbo` 并返回−1，后续返回拒绝字符串；不是六项许可 |
| [苏星河](../../kungfu/class/xiaoyao/suxingh.c#L74) | liuyang-zhang、zhemei-shou | 字符串拒绝，提示向掌门求教 |
| [鹤笔翁](../../kungfu/class/xuanming/he.c#L59) | dulong-shenzhua、xuanming-zhang | 字符串拒绝，分别指向师兄及师父 |
| [鹿杖客](../../kungfu/class/xuanming/lu.c#L59) | xuanming-zhang | 字符串拒绝，提示向师父求教 |

上述“拒绝”只描述本NPC该入口，不代替技能自身 `valid_learn`、拜师、公开 `learn` 命令或其它取得入口。慕容博另有参合指条件回调，并非全部 `no_teach` 都拒绝；不由少林六门的结果推断参合指。

已有 `miao_murong_teaching.test.mjs` 检查的是绝招询问授予，不是这些普通学习回调的原生通过；[苗家书房结果](2026-10-29-miao-study-results.md)也不代替NPC普通教学。继续时先查原始系列中是否已有相同条件的可重验原件，确有缺口才新增测试。

后续[条件教学准备](2026-10-29-s1-learning-callback-prep.md)已核对公开learn→dbase默认求值链，特别禁止观察器为取快照而提前求值许可闭包；此准备不计新实采。

## 续接边界

共享本体已核验者复用[旧明教3704条](2026-10-29-s1-shared-body-reuse.md)、[武当掌48条](2026-10-29-s1-wudang-zhang-reuse.md)、[抽髓掌104条](2026-10-29-s1-chousui-reuse.md)等原身份数据，不重复计数、不改冻结标签。原NPC配装、条件教学及其它特殊内功搭配仍按实际证据单独对账。本次不新增游戏缺陷、不改游戏代码，4.2保持未完成，整体10/17。
