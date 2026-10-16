# 明教组合正式 F1：28 条件／840 记录的部分结果

仅汇总已闭合的组合组，不含独立烟雾 56 条，不含九位原 NPC，不代表整个明教或门派平衡评测完成。统计阶段未修改游戏、计划或原记录；发布仅同步已核对正文。统计步骤仅作原件读取、身份互比与描述统计，没有重新调用校验器或启动采集。

正式系列：`C:/tools/msys64/home/oiuv/mud-evidence/martial-data/review-mingjiao-combination-f1-20261016`；指纹 `3d413a27070d4b8b7468d048ef3012b76188f0b6e9bc1a79c2e719be79b5faa2`。
驱动原 PID 43360 自然退出 code 0 / signal null；原采集 840 条、无导入缺字节、无校验错误。根审计及独立审计均闭合，28 份 JSON 与 28 份 Markdown 字节互同。
总计 observed 838、refused 2，错误／不适用／缺失均 0；observed 是路径观察，不是技能生效率。

| 内容 | 条件数 | 正式记录 |
| --- | ---: | ---: |
| 原 valid_combine 接口 | 6 | 12 |
| 组合准备 | 12 | 24 |
| 清空重选／第三技能拒绝 | 2 | 4 |
| 原 fight 单轮 | 8 | 800 |

## 1. 接口与准备：保留原不对称关系

阴风刀 yinfeng-dao、透骨针 tougu-zhen；拈花指 nianhua-zhi、散花掌 sanhua-zhang；霹雳拳 pili-quan、飞花掌 feihua-zhang。后二者仅外部资格对照，不能当作九原 NPC 的组合。

| 原接口调用方 → 参数 | 返回值×样本数 |
| --- | --- |
| yinfeng-dao → tougu-zhen | 1×2 |
| tougu-zhen → yinfeng-dao | 1×2 |
| nianhua-zhi → sanhua-zhang | 1×2 |
| sanhua-zhang → nianhua-zhi | 1×2 |
| pili-quan → feihua-zhang | 1×2 |
| feihua-zhang → pili-quan | 0×2 |

prepare 双参数检查第一项的 valid_combine(第二项)；逐条加入则检查新技能对已有技能。原飞花掌许可的是 piaofeng-quan，不是 pili-quan，所以这里的方向性拒绝有对应源码依据。本统计只记录，不修正或擅自认定为平衡错误。

| 条件（各 2 样本） | 逐步原命令 → 返回 | 每样本最终准备键／实际顺序 | observed／refused |
| --- | --- | --- | --- |
| yinfeng-dao-tougu-zhen-names | `prepare yinfeng-dao tougu-zhen`→1 | `{"strike":"yinfeng-dao","finger":"tougu-zhen"}`／`["strike","finger"]` | 2／0 |
| yinfeng-dao-tougu-zhen-sequential | `prepare yinfeng-dao`→1<br>`prepare tougu-zhen`→1 | `{"strike":"yinfeng-dao","finger":"tougu-zhen"}`／`["strike","finger"]` | 2／0 |
| tougu-zhen-yinfeng-dao-names | `prepare tougu-zhen yinfeng-dao`→1 | `{"strike":"yinfeng-dao","finger":"tougu-zhen"}`／`["strike","finger"]` | 2／0 |
| tougu-zhen-yinfeng-dao-sequential | `prepare tougu-zhen`→1<br>`prepare yinfeng-dao`→1 | `{"strike":"yinfeng-dao","finger":"tougu-zhen"}`／`["strike","finger"]` | 2／0 |
| nianhua-zhi-sanhua-zhang-names | `prepare nianhua-zhi sanhua-zhang`→1 | `{"strike":"sanhua-zhang","finger":"nianhua-zhi"}`／`["strike","finger"]` | 2／0 |
| nianhua-zhi-sanhua-zhang-sequential | `prepare nianhua-zhi`→1<br>`prepare sanhua-zhang`→1 | `{"strike":"sanhua-zhang","finger":"nianhua-zhi"}`／`["strike","finger"]` | 2／0 |
| sanhua-zhang-nianhua-zhi-names | `prepare sanhua-zhang nianhua-zhi`→1 | `{"strike":"sanhua-zhang","finger":"nianhua-zhi"}`／`["strike","finger"]` | 2／0 |
| sanhua-zhang-nianhua-zhi-sequential | `prepare sanhua-zhang`→1<br>`prepare nianhua-zhi`→1 | `{"strike":"sanhua-zhang","finger":"nianhua-zhi"}`／`["strike","finger"]` | 2／0 |
| pili-quan-feihua-zhang-names | `prepare pili-quan feihua-zhang`→1 | `{"cuff":"pili-quan","strike":"feihua-zhang"}`／`["cuff","strike"]` | 2／0 |
| pili-quan-feihua-zhang-sequential | `prepare pili-quan`→1<br>`prepare feihua-zhang`→0 | `{"cuff":"pili-quan"}`／`["cuff"]` | 2／0 |
| feihua-zhang-pili-quan-names | `prepare feihua-zhang pili-quan`→0 | `{}`／`[]` | 0／2 |
| feihua-zhang-pili-quan-sequential | `prepare feihua-zhang`→1<br>`prepare pili-quan`→1 | `{"cuff":"pili-quan","strike":"feihua-zhang"}`／`["cuff","strike"]` | 2／0 |
| cancel-and-replace | `prepare yinfeng-dao tougu-zhen`→1<br>`prepare none`→1<br>`prepare yinfeng-dao`→1 | `{"strike":"yinfeng-dao"}`／`["strike"]` | 2／0 |
| third-refused | `prepare yinfeng-dao tougu-zhen`→1<br>`prepare pili-quan`→0 | `{"strike":"yinfeng-dao","finger":"tougu-zhen"}`／`["strike","finger"]` | 2／0 |

包括单轮前的准备在内，合计 846 步，受理 840、拒绝 6；原命令执行返回累计 840。这不是内力／精气消耗。
仅 feihua-zhang-pili-quan-names 的两条记录整体 refused。pili→feihua 逐条加入、第三技能拒绝仍记 observed，因为较早一步受理；绝不能因此宣称最后一步成功。清空后实际准备归空，再选阴风刀；第三项拒绝后原两项保留。

## 2. 单轮实际分布（每条件 100 个独立原样本）

| 条件 | 零／一／二击样本 | 总出击 | 至少一次 result=0 | 实际正伤害样本 | 每轮出击均值 | 对手气血净降均值／最大 | 对手有效气血净降均值 |
| --- | --- | ---: | ---: | ---: | ---: | --- | ---: |
| yinfeng-dao-solo | 15／85／0 | 85 | 27/100 | 25/100 | 0.85 | 45.34／258 | 12.59 |
| yinfeng-dao-tougu-zhen-pair | 23／2／75 | 152 | 49/100 | 47/100 | 1.52 | 107.82／439 | 38.15 |
| tougu-zhen-solo | 26／74／0 | 74 | 30/100 | 28/100 | 0.74 | 43.94／234 | 14.89 |
| tougu-zhen-yinfeng-dao-pair | 26／3／71 | 145 | 45/100 | 43/100 | 1.45 | 83.8／391 | 24 |
| nianhua-zhi-solo | 19／81／0 | 81 | 31/100 | 28/100 | 0.81 | 54.38／258 | 23.9 |
| nianhua-zhi-sanhua-zhang-pair | 23／4／73 | 150 | 48/100 | 44/100 | 1.5 | 106.1／455 | 35.85 |
| sanhua-zhang-solo | 27／73／0 | 73 | 26/100 | 25/100 | 0.73 | 48.5／248 | 18.05 |
| sanhua-zhang-nianhua-zhi-pair | 16／12／72 | 156 | 51/100 | 48/100 | 1.56 | 111.26／477 | 43.22 |

零击也是正常观察：保留原 fight 的守势及随机判定，不强行保证出手或两击。result=0 表示本次攻击命中判定，可能伤害为零；“正伤害样本”另按实际 damage>0 统计。各样本内连击相关，不把攻击次数当作独立试验，也不据这组随机差值排名。原报告的样本级 Wilson 区间原样保留在机器投影。

| 条件 | 实际准备顺序 | 有出击样本的首招技能×次数 | 零伤害命中判定次数 |
| --- | --- | --- | ---: |
| yinfeng-dao-solo | `["strike"]` | yinfeng-dao×85 | 2 |
| yinfeng-dao-tougu-zhen-pair | `["strike","finger"]` | yinfeng-dao×77 | 2 |
| tougu-zhen-solo | `["finger"]` | tougu-zhen×74 | 2 |
| tougu-zhen-yinfeng-dao-pair | `["strike","finger"]` | yinfeng-dao×74 | 4 |
| nianhua-zhi-solo | `["finger"]` | nianhua-zhi×81 | 3 |
| nianhua-zhi-sanhua-zhang-pair | `["strike","finger"]` | sanhua-zhang×77 | 8 |
| sanhua-zhang-solo | `["strike"]` | sanhua-zhang×73 | 1 |
| sanhua-zhang-nianhua-zhi-pair | `["strike","finger"]` | sanhua-zhang×84 | 5 |

调用是原 COMBAT_D->fight(USER0, USER1)，不是交替先手完整战斗。实际先招以原攻击事件为准：四个双准备条件均观察到 strike 在 finger 前，反写 prepare 参数没有改变本轮实际 preparation_order。此结论限本次记录，不承诺其他驱动、映射键序或玩法下恒定。原 action_flag 的 null 与 0 保留，不擅自补值。

## 3. 武器、技能与资源背景

双方均是真实非巫师 USER（userp/playerp/interactive=1、wizardp=0），角色为实验身份而非线上玩家或九原 NPC。空手 weapon="none"、handing="none"、weapon_flag=0、weapon_damage=0；没有携武器将“阴风刀”“透骨针”误作兵器。角色零加力，原始精气各 10000，内力／内力上限 6000，经验 10000000，原始五属性均 36。相关基本与特殊拳术均 200；force/dodge 基础 600、无特殊内功映射，实际有效 force/dodge 为 300；本组实际相关有效拳术 300，对照未激发 unarmed 为 100。目标基本 unarmed/force/dodge/parry 600、未映射，实际有效各 300。映射、准备及实际有效属性分别保存于每条样本，不能将技能原始 200 当作所有有效值，也不能从非对称有效属性推导门派公平性。
原单轮全部事件为 USER0→USER1 的普通攻击；本固定目标无前一轮守势，未观察反击，不以此否定完整战斗中的反击。800 单轮中 USER0 的 qi/eff_qi/jing/eff_jing/neili 下降与恢复均 0；USER1 仅 qi/eff_qi 下降，所有恢复与其余三种资源下降均 0。原气血下降与 damage 累计吻合；气血与有效气血不能相加作总伤害。不把这段立即观察中的零内力下降推广为绝招、持续毒或长期战斗免费。接口及准备的资源变化均 0。

## 4. 原件索引与限制

- 原系列／manifest：`C:/tools/msys64/home/oiuv/mud-evidence/martial-data/review-mingjiao-combination-f1-20261016/series.json`，SHA256 `19a8e9bd3abbb2f8e5f879c3d64f6491d919e108547b8ce7dd89e3c1664c2d88`。
- 根审计：`C:/tools/msys64/home/oiuv/mud-evidence/martial-data/review-mingjiao-combination-f1-root-audit-v1-20261016/audit.json`，SHA256 `bf7d3f7df69bdd5e46875a164a930bc92bc17453d25d0b00b8b9abff327c2cfa`。
- 独立审计：`C:/tools/msys64/home/oiuv/mud-evidence/martial-data/review-mingjiao-combination-independent-v1-20261016/audit.json`，SHA256 `b477dcbda109678cf7ff8c259ffd2e984d70981be05862fae74a6f9fcb9ae07c`。
- 原冻结：`C:/tools/msys64/home/oiuv/mud-evidence/martial-data/review-mingjiao-remaining-producers-freeze-v3-20261016/freeze.json`，SHA256 `e7c83f54bf0516d4207ad9f6cbae4739906084d7c0bcd7bba793ad14bab08e12`。
- 以下每行对应原报告与 Markdown；完整路径、hash、逐样本原 ledger 路径及 hash、原 raw 身份 hash、每步快照／技能／武器／资源明细均保存在 projection.json；sources.json 保存全部本次读取输入的前后 hash。

| 条件（前缀 school-mingjiao-combination-） | 原报告 SHA256 | 原 Markdown SHA256 |
| --- | --- | --- |
| yinfeng-dao-allows-tougu-zhen | `ed3333e5e0c57b655c66019a9013eb4d3ce2ded4aaff974dd68fe6eba8de1a94` | `b202df0cc256d9a750b7a0ebdc4dade9c732046bcb427b6d803e94e1d21cff07` |
| yinfeng-dao-tougu-zhen-names | `c6f9a0c6680ac21a03e7798ac0319bac089d42f655bca09b2b37eda8af659cf3` | `f5ecc7b6437c342fd5767526539907d464cff378dd3ececf20e745a779a25b10` |
| yinfeng-dao-tougu-zhen-sequential | `d251c0e38bf2d49180dede422ff50baa6b2f377842ba1e03a5176ab48b432a34` | `7e3d3390f0e43a432972cfe093451277ffeb427bd3dcb59a4baa4fc11cf0c1ca` |
| tougu-zhen-allows-yinfeng-dao | `917ba2cc4f344e6ae6b096567198afc84d018dc6608a4017773720dbf3c0a4bd` | `c25bcfc4db7c1f14f55b42caa53021f9894f6943dbf6ce2bad0329f9a186d809` |
| tougu-zhen-yinfeng-dao-names | `0910f919f1dec0a316a2ca32b500baa67bdf33a82f19ec93db8e3a7f7337d6bd` | `3b42ce1515ab35609e4ade07dd29da25c2f81093be73d9c15f774fb628947d8a` |
| tougu-zhen-yinfeng-dao-sequential | `c09900e99ac644ab7021cbb850d189e4a72e45e19ffccb40164d873d1bdd72ea` | `8d1723c9cb6e29ad2b8f3c99dcb3be3307a05713a345e87a11bc5aed1776fa3d` |
| nianhua-zhi-allows-sanhua-zhang | `1c655140c66e079f2b1ae020897f8a0828eadf6ee7c8fdc94e4f4235a8fb2922` | `008e6445f8fe686f05ae54d4a6ad4093ca4896ff60dbdf87c2933164f640ded7` |
| nianhua-zhi-sanhua-zhang-names | `77a622babaaabc10dc7c87a839095a31a484fc64b3bbc0edc11482e826935da9` | `b8017fcad0ccf2910fc13c1f121160270aefa9a90c52b7a8168d5613aec395e4` |
| nianhua-zhi-sanhua-zhang-sequential | `51fc0a74fddbf45c8a23c117982fec07e836e50053fcdbafd474a286243d58a2` | `f98641ea70165afaea7cadbfd500f6b19977c49b7e25be4a8d238d7f14673c2e` |
| sanhua-zhang-allows-nianhua-zhi | `ee67ae4eef0dc155a28d14e9201f1843ff08083b324acb887bd643517c7f1b4d` | `f1a687577696c3e0233b9a1665ca1e9bf3cae40209d9c383e937ea9fb287db81` |
| sanhua-zhang-nianhua-zhi-names | `7f51a748b6d17b63d21b20786bfc972f5a390869070dd5cd42e25043f6f4dddc` | `c58c0c864e6b54bf21a04e1a0f1745655bec2afa6af35e7541a46c80762d6b18` |
| sanhua-zhang-nianhua-zhi-sequential | `dc38629a5320a959a04c9e843493a3ecaa128868bb650884724079f8e6fc63fa` | `5d10ee2a67a18cfeaaab590a0306f607dc62ad97b35177ab150c8b2582e4d487` |
| pili-quan-allows-feihua-zhang | `ad099456c45ee54cabe53d21882d5b1d94c9ec18a507ff40793e334f00b35f31` | `a20d59b6835369939ed3fc408a66dd4c0d53243d22a20192768397b361f7c78b` |
| pili-quan-feihua-zhang-names | `c560baf9a94553ba15241b2fd0cacee06d598f3b19981250b9d63ae7090715f3` | `c6dabda3a36dfeaebe0250105f3036d858c1cb8051a85ef61520ec8049afa4ef` |
| pili-quan-feihua-zhang-sequential | `91dafb58eba4075226c85703abedc41e6cd058d641eef03feff269ec813c7a8d` | `f8f83abced72f25fd3afffc65e7c578124f2955776c261181355cdc02a105b91` |
| feihua-zhang-allows-pili-quan | `96582bb6de30d644cdf6f2558fbee7d4c3d9b47316c4bd4c3c8df8937b0b4624` | `d2f333c2dbb7df2bb198f18d64a28359cd30a228383c8f0c6eed1c6446efc0ce` |
| feihua-zhang-pili-quan-names | `9eaf54e768b5057a19679de9f3bb579c4cb8d88e196b4033583775a7495ab8f0` | `02cad79fc0c687f5f51e15b210e30a394a9c01e8858fc9379b20e6350583fda1` |
| feihua-zhang-pili-quan-sequential | `215c065ba1c8ab1626a5bc0d626da7198f120a423c400820355ec6e383f708b9` | `197f9d441ca583f63aaae7577bff960e08357a8dda16b487083651afa468916a` |
| cancel-and-replace | `27a48376ad6965712dad18c82357dd1c1eceea1e764cdbd276465eb59c56e61e` | `d4545f0ca7fdb2fe998460784d320aa1c6185dc848d97b83e61464f87afe0c66` |
| third-refused | `a75c44c0892f338c2a11aeeea84de17b1c94ca2041b947727ca856922d6a9eff` | `3444168f2cc2f8715391d541fd3d4f2bf78138ba2866d46c3c6d0647dce52fff` |
| yinfeng-dao-solo | `c3bb2eb4f7a9ed2800812d2aa9b1d6d3e7213379d1b06b6df6d6b3be7ef06fb7` | `dce2b6ac7c72bb5816736740b4f02e65f42e32ff673053f147f81a1a75ad34bb` |
| yinfeng-dao-tougu-zhen-pair | `455945adbd42515884bf2b55c75d65839cb3e53be196f8836db7f8390f15ad67` | `184e272144d980b87bbd0ee7f4130ba32cac765960d7dac8cc4477d24e478269` |
| tougu-zhen-solo | `e9a74850c9276c25cb438a6767902970a44d45ee329bbebe79ae58a727e6b6d7` | `a14d6e1c6585a264a42792d10ca6149df6c2f8145e03efa4d9add63e0d39562e` |
| tougu-zhen-yinfeng-dao-pair | `b4d1d0362b6018baed0f1a47a734c0ce9ce039337dca13925ef991cf8ef7ccdb` | `6d777a63eda9027b06f3fc3895278473e10047547ded5e95772a3cf3c35a5fff` |
| nianhua-zhi-solo | `18cb7813c8e5adcb543e7b1ebc4e441477dd3b81d67c7357cd28867d900795a8` | `a53dabc33c604be59028b39fa96998e5bf971a6e08a0a1b8a9e7090679f56a59` |
| nianhua-zhi-sanhua-zhang-pair | `aa65aec72a7fc11adf46243739157373dffc65ac83177c930ffc2f573bea2541` | `f509c0116c74f6e2a6625d1958d4f0fdb8b5f7e1c05e3cc54f60ebf44db1f3c4` |
| sanhua-zhang-solo | `50dd9b2e208b2188d1f5dce44472b87fe15cea4583890980fc87acf2e858fd43` | `539591bba7ef69ac1fa26216f0792e07c0ce704fbe1dffb5ea2b0c0e0b168031` |
| sanhua-zhang-nianhua-zhi-pair | `3cee2c584173ff7958de28d05776de45581a70e2dc60d1917134394e1cdd3a40` | `ec66fbfddeee044f448970f6eb11663303d1803accf57784afb48f654a7a7419` |

这里只是 28 条组合的正式分布，不合并其他 manifest、独立烟雾、九原 NPC 或 force 统计，不作门派强弱与数值调整建议。计划中准备期 integration/not_collected 等旧标签保留原样，不当作当前运行未完成的证据。首载、来源、权限与终态的严格验收引用已闭合的根／独立审计；本次不重复执行。

## 发布复核

根与独立逐数复核通过，28条件完整原effects、840原件及8单轮数值行闭合，973输入前后SHA未变；不增加新采集。根复核 C:/tools/msys64/home/oiuv/mud-evidence/martial-data/review-mingjiao-combination-f1-statistics-root-review-v1-20261016/review.json，SHA256 8568aad87a41d0912bdd2a4e076a0afd3fe84334cb3cc566bc749b86d4bd1751。机器投影projection.json SHA256 3301a62b9f82abf908ad71fff4e28a1939e857990abcf80e79ebf4307fce9980。

当前门派其余状态见[剩余批次进度](2026-10-16-school-mingjiao-remaining-producers-progress.md)，不以本组合结果代替原NPC自然交锋或全部明教完成。
