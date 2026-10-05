# 普通头饰数据化验证报告

日期：2026-10-05。实现基线 `b081c7ffd4febbeaff6b13595e306e29ea0b84b6`；mudcore
`ecea802adc5075f1b86e55ee7c4b11f541f714c4` 未修改。环境为 Windows、Node.js v24.21.0，
本地驱动输出版本 `fluffos 20260929-5270e7d6-91de2eaf`。以下均为本批重新执行的开发验收，
不代表已提交、已部署或正式存档已经转换。

以下原实施、命令和性能记录保留为命名修订前的验收历史；三类 ID 精简的最新验收另见文末，
不将旧路径数量、旧命名或旧性能测量冒充当前结果。

## 实施结果

- 39 个旧 HEAD 定义归为 36 个语义品种，共用 `d/items/headwear.lpc` 与 `headwear_data.h`。
  两份钢盔和三份铁头盔分别合并；真实颜色、文案、价格、性别或门派标记差异仍独立保留。
- 修改 29 个文件中的 45 处静态引用，以及钱正伦的 `helmet` 动态分支，共 30 个调用文件。
  `feet` 与其他分支、护具共享限额、库存及实例价格/禁售覆盖保持。
- 删除全部 39 个旧定义，无逐品种文件、转发壳或运行期旧路径别名。旧原文仍可从 Git 基线和
  `tools/tests/headwear/baseline.json` 恢复；2 个特殊死亡销毁头饰及 4 个无关动态调用保持原文。
- 精确存取登记与统一离线转换已接入 HEAD；三类共有 462 条历史路径映射
  （CLOTH 404、BOOTS 19、HEAD 39），不转换未选特殊头饰，不扩大记录字段范围。
- 17 种花饰经旧对象实测确认蓝图重 10、克隆重 0。数据使用可选 `clone_weight: 0` 保留历史行为，
  没有新增 `instance` 属性层，也没有更改重量、文案或装备能力。

## 命令与结果

从仓库根目录执行；下列命令最终退出码均为 0。

| 命令 | 本次结果 |
| --- | --- |
| `node tools/tests/headwear_inventory.mjs` | 39 份原文/哈希/解析结果、36 组通过 |
| `node tools/tests/test_headwear_objects.mjs bin/driver.exe --all --baseline-only` | 117 项旧重量/槽位断言通过 |
| `node tools/tests/test_headwear_objects.mjs bin/driver.exe` | 348 项代表品种断言通过，随后才扩批 |
| `node tools/tests/test_headwear_objects.mjs bin/driver.exe --all` | 删除旧文件后，5669 项断言通过 |
| `node tools/tests/test_boots_objects.mjs bin/driver.exe --all` | 2612 项断言通过 |
| `node tools/tests/test_cloth_objects.mjs bin/driver.exe --all` | 28382 项断言及迁移包装流程通过 |
| `node --test tools/tests/test_item_records.mjs` | 9 项测试通过；三类混合、冲突、旧袋、预览/副本/备份、幂等性 |
| `node tools/tests/compile_headwear_callers.mjs bin/lpcc.exe` | 删除旧文件后，34/34 程序编译通过 |
| `node tools/tests/audit_headwear_migration.mjs` | 45 静态 + 1 动态、定义等价、无键冲突、无旧文件及壳、未选对象不变 |
| `node tools/tests/audit_boots_migration.mjs` | 19 → 8，15 个调用文件通过 |
| `node tools/tests/audit_cloth_migration.mjs` | 202 → 148，744 个调用文件通过 |
| `node tools/format_lpc.mjs <本次37个文件>` / 同参数加 `--check` | 37 个新增/修改 LPC 与头文件通过；最终无待格式化文件 |
| `node --check <本次修改或新增的各个mjs文件>` | 10 个脚本语法通过 |
| `openspec validate refactor-data-driven-headwear --strict` | 通过 |
| `git diff --check` | 通过 |

完整对象测试使用原始旧对象与新对象逐项比较，并执行真实装备、移动、交易、房间刷新、存取及序列化代码；
钱正伦领取用实际 `do_yao()` 函数体，角色、显示辅助及店主在线状态使用夹具。测试覆盖女性/男性限制、
头部槽位与加成、穿脱文案、实例覆盖及复合状态隔离、UID/EUID、一次初始化、按路径重建，
以及未增加洗涤、晾干或撕布功能。2 个排除头饰的原死亡回调也实际执行并确认销毁。

三类完整对象回归合计 36663 项断言，零失败；计数包含重复路径与兼容性断言，不能解释为同等数量的独立业务场景。
调用编译在临时源码副本中进行，编译但不执行 NPC 构造体；它不是完整正式服启动测试。
旧 CLOTH/BOOTS 调用审计逐层核对已批准的后续替换，不重写旧基线或放宽为任意现状。

本轮测试曾定位并修复两处问题：代表测试错误地假定零重花饰克隆的完整详情应等于蓝图；以及钱正伦
动态分支补丁位置错误。前者改为分别对照自身原行为，后者修正分支位置；最终代表、全量和编译全部复测通过。

原始临时输出位于 Windows 用户临时目录：旧重量 `mud-cloth-K6DvaR`、代表 `mud-cloth-dJqlfP`、
最终 HEAD `mud-cloth-z1biUt`、BOOTS `mud-cloth-IQfL8z`、CLOTH `mud-cloth-mU5ezx`、
记录测试 `mud-record-tests-aZXTje`、最终编译 `mud-cloth-compile-2sul6e`。这些目录不提交且可能被系统清理，
以上命令可重跑；版本化基线和测试代码保留在仓库。

## 本批性能

`node tools/tests/test_headwear_objects.mjs bin/driver.exe --bench` 通过。
6 个独立驱动进程，旧/新各 3 轮且顺序交替，每轮相同 39 个历史来源请求、780 个实例。
原始输出来自 `mud-cloth-7x9EOF/benchmark.json`，保存为本目录的 [benchmark.json](benchmark.json)，
其中 `version=0` 为旧实现，`version=1` 为新实现。

| 指标（三轮中位数） | 旧实现 | 新实现 |
| --- | ---: | ---: |
| 冷加载全部来源 | 65.170 ms | 27.430 ms |
| 热创建 780 个实例 | 5.462 ms | 73.353 ms |
| 每个实例平均热创建时间 | 0.0070 ms | 0.0940 ms |
| 蓝图阶段内存增量 | 180415 B | 136164 B |
| 实例阶段内存增量 | 617560 B | 918160 B |
| 游戏侧定义文件 | 39 | 2 |

本机测量冷加载减少约 57.9%；热创建约为旧实现的 13.4 倍，每件绝对增加约 0.087 ms。
780 实例连同蓝图的驱动内存净增加 256349 B（约 250.3 KiB），不是整服 RSS。
内存是各阶段 `memory_info()` 差值，包含该阶段加载/创建开销；时间也不能外推为正式服吞吐量。
本批收益主要为定义集中、真实重复归并及少维护 37 个游戏侧文件，代价为虚拟创建和实例隔离开销；
测试/迁移资料的文件数不计入游戏侧文件减少量。

## 交付与部署边界

维护约定及可重复命令已同步到 `docs/architecture/data-driven-headwear.md`，
统一部署流程仍使用 `docs/architecture/data-driven-items.md`，没有增加第二套转换工具。
实现保持 proposal/design 的范围，三份增量规范的初始化、类别隔离和混合记录场景均有上述对应验证。
先前鞋靴归档和主规范同步的工作区改动原样保留，未修改 mudcore、FluffOS 或 AI 服务。

没有读取、转换或覆盖正式玩家/商店记录，没有停止或重启正式服务，没有提交或推送。
上线仍需对停服备份运行统一预览；存在旧身份时先生成并核对转换副本，再将代码与记录配套切换。
零变更只适用于实际检查范围，不表示未检查的记录安全；回退也必须配套恢复代码与原始备份。

## 三类简洁 ID 修订验收（2026-10-05）

用户确认将命名修订扩大至全部已迁移 CLOTH、BOOTS、HEAD。审查 192 个品种后精简 79 个 ID：
CLOTH 57、BOOTS 3、HEAD 19；其余 113 个保持。`buyi2`、`shiweifu2`、`xiuhuaxie2`、
`chahua1`–`chahua13` 等采用有意义的短名称和固定编号。玩家名称、别名、属性、行为及
148/8/36 的分组结果不变，没有增加运行期别名或每品种文件。

新旧映射为 `tools/tests/item_id_renames.json`；原源码、哈希、快照和旧评测报告保留。
统一转换器现覆盖 541 条历史路径（CLOTH 461、BOOTS 22、HEAD 58），包含之前已发布的
CLOTH/BOOTS 规范路径及本批 HEAD 长 ID，全部一步到达最终 ID。转换范围、只预览默认值、
显式新目录输出、原字节备份及正式部署边界不变。

本轮重新执行：

| 验证 | 结果 |
| --- | --- |
| 三类 `audit_*_migration.mjs` | 数据与原定义一致，744/15/30 个调用文件通过，静态及已知动态入口无漏改 |
| `test_cloth_objects.mjs bin/driver.exe --all` | 28382 项断言，零失败；迁移包装回归通过 |
| `test_boots_objects.mjs bin/driver.exe --all` | 2612 项断言，零失败 |
| `test_headwear_objects.mjs bin/driver.exe --all` | 5669 项断言，零失败 |
| 三类 `compile_*_callers.mjs bin/lpcc.exe` | CLOTH 746/746、BOOTS 18/18、HEAD 34/34；列表有重叠，不相加作独立文件数 |
| `node --test tools/tests/test_item_ids.mjs tools/tests/test_item_records.mjs` | 14 项测试全部通过 |
| 项目 LPC formatter 及 `--check` | 当前迁移涉及的 309 个新增/修改 LPC 与头文件通过 |
| `node --check` | 当前修改/新增的 14 个 mjs 脚本语法通过 |
| 三类原始源码审计 | CLOTH 202、BOOTS 19、HEAD 39 份原定义/哈希核对通过 |
| OpenSpec 严格校验及 `git diff --check` | 通过 |

新增身份测试核对全部 192 个品种及原始成员、ID 唯一性与有效字符、编号稳定、历史快照不变，
并扫描游戏调用和定义，确认没有旧长 ID 残留。新增转换测试覆盖全部 79 个改名：玩家、商店、
明确选定的旧袋同时包含旧/新规范路径；保留分立实例记录，商店同价数量合并，三类价格冲突均拒绝，
未选旧袋及无关文本不变，原字节可恢复，重复转换零变更。测试使用临时合成数据，不接触正式存档。

新增身份测试最初错误地把 CLOTH 每组的代表命名表视为全部历史成员表，导致等价布衣成员断言失败；
已按冻结定义的等价分组展开全部来源，未改动游戏数据或放宽品种保持要求，最终 14 项全部复测通过。

本轮隔离输出：CLOTH `mud-cloth-GwgEiZ`、BOOTS `mud-cloth-c3i9uK`、HEAD `mud-cloth-iD4Ifc`；
调用编译分别为 `mud-cloth-compile-sZSsJm`、`mud-cloth-compile-AHeazH`、`mud-cloth-compile-eb8dkc`；
最终记录测试为 `mud-record-tests-b6iKhh`。它们位于 Windows 用户临时目录，不提交，可能被系统清理。
本轮没有重新测量性能，前文性能结果仍仅对应原命名版本。

命名通则已同步到根 AGENTS.md、三类维护文档及本变更规范；没有修改 mudcore、FluffOS、AI、
正式玩家数据或运行服务；以上为提交前验收记录。此前已部署服装/鞋靴的服务器也须先预览停服备份，
存在旧规范 ID 时转换并核对后再配套切换代码，不能只更新代码而忽略存档。

### 发布前复核

2026-10-05 再次审查并执行三类全量驱动回归（28382/2612/5669 项，零失败）、
14 项命名与记录转换测试、三类调用编译（746/18/34 全部通过）、旧源码哈希及调用审计、
309 个 LPC/头文件的格式化与检查、14 个 JavaScript 语法检查和 OpenSpec 严格校验。
此次复核未发现阻塞提交的缺陷，未重测性能；正式存档转换与停服上线由维护者执行。
临时结果目录依次为 `mud-cloth-5dQIhC`、`mud-cloth-jsXBlX`、`mud-cloth-KPz1Rn`、
`mud-record-tests-XUroTM`；编译目录为 `mud-cloth-compile-01T1nP`、
`mud-cloth-compile-mglWTa`、`mud-cloth-compile-3I307X`，均不提交。
