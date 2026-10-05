# 颈饰数据化验证报告

日期：2026-10-05。固定源码基线 `57f106f88060abce0fd1172b24021a80948c6343`。
环境：Windows、Node.js v24.21.0，驱动 `fluffos 20260929-5270e7d6-91de2eaf`。
本报告记录隔离开发验收，不代表正式服部署或完整剧情验收。

## 实施结果

- 15 个旧 NECK 定义归并为 10 个规范品种，共用 `d/items/neck.lpc`、`neck_data.h`，按 ID 自然排序。
- 17 个调用文件完成 15 处静态引用、2 条围脖动态领取分支替换。商品键无冲突，没有改动领取资格、库存规则和剧情协议。
- 背包只登记表内精确路径；统一离线转换器新增 15 条映射，五类共 584 条历史路径。无新转换框架、运行期别名或逐品种壳。
- 已删除 15 个旧定义，净减少 13 个游戏定义文件；累计五类 303 个旧定义变为 10 个程序/数据文件，净减少 293 个。新增测试及文档不计入此口径。
- 原文、哈希、属性与调用保存在 `tools/tests/neck/baseline.json` 和 Git 历史；没有改动 mudcore、驱动、AI、正式服务或玩家存档。

## 旧行为与测试预期

功能和数据均以旧代码实际行为为准，不凭名称、字段名或测试假设改规则。

- 白金项圈实际重量为 0，普通 `weight` 为 200；两份荆州金项链实际重量为 0、普通 `weight` 为 500。其余金项链实际重量为 500，保留为不同品种。
- 玄铁令保留 `female_only=1`，旧穿戴命令只拒绝男性，女性与无性角色允许。
- 赏善罚恶簿继承 NECK 但没有 `armor_prop`，新旧均不能穿戴且不占颈部槽位。不新增阅读或护甲能力。
- 围脖的输入别名仍为 `wei bo` / `bo`。原领取函数以 `present("weibo", player)` 检查，因此已有围脖时仍可再次领取；本批不增加别名或新限领规则。

首次全批测试错误地假设所有 NECK 可穿戴、所有非女性均拒绝玄铁令，产生 6 条失败。
核对旧源码及实际对象后，只纠正测试预期，未修改游戏规则。新增剧情夹具的旧相对路径及
NPC 同名定位问题也在测试副本修正，未通过改动业务代码让测试通过。

## 验证结果

| 命令 / 检查 | 结果 |
| --- | --- |
| `node tools/tests/neck_inventory.mjs` | 15 份冻结原文、哈希、解析及 10 组核对通过 |
| `node tools/tests/test_cloth_objects.mjs bin/driver.exe --neck --all --baseline-only` | 64 项旧蓝图/克隆重量及属性检查通过 |
| `node tools/tests/test_cloth_objects.mjs bin/driver.exe --neck`（代表阶段） | 511 项代表品种检查通过 |
| `node tools/tests/test_cloth_objects.mjs bin/driver.exe --neck --all` | 删除旧定义并格式化后 2481 项断言，零失败 |
| 同一入口 `--all` | CLOTH 28382 项及迁移包装回归通过 |
| 同一入口 `--boots --all` / `--headwear --all` / `--hands --all` | 分别 2612、5669、4360 项，零失败 |
| 同一入口 `--village-startup` | 7 项真实房间/NPC 创建链路回归通过 |
| `node --test tools/tests/test_item_records.mjs` | 12 项通过，包括全部 15 条 NECK 映射和五类混合记录 |
| `node --test tools/tests/test_item_ids.mjs tools/tests/test_item_references.mjs` | 8 项通过，五表排序及 584 条历史路径无残余引用 |
| 五类 `audit_*_migration.mjs` | 精确调用替换、数据、旧文件清理及未选行为核对通过 |
| `node tools/tests/compile_cloth_callers.mjs bin/lpcc.exe --neck` | 24/24，含全部调用、湘湘、背包和五类 provider |
| 其余四类 `compile_*_callers.mjs bin/lpcc.exe` | CLOTH 752/752、BOOTS 18/18、HEAD 34/34、HANDS 38/38；列表有重叠，不合计为独立文件数 |
| 项目 formatter 及 `--check` | 本批 25 个 LPC/头文件通过，最终无待格式化文件 |
| `node --check` | 本批新增/修改 mjs 语法检查通过 |
| `openspec validate refactor-data-driven-neck --strict`、`git diff --check` | 通过 |

五类完整对象回归共 **43504 项断言，零失败**；包含重复来源和兼容性检查，不代表同等数量
独立场景。交易、货币、物品移动、房间刷新、穿脱、背包和序列化复用实际实现。
编译副本只重命名 `create` 入口，编译实际函数体但不执行 NPC 构造，不冒充实服启动。

五类合成记录测试实际执行 CLI 清单发现、默认预览、全新目录输出、原字节恢复及幂等。
玩家分立状态、数量、未知字段、未选旧袋和特殊物品不变；同品同价库存合计；全部 15 条
新增映射分别验证价格冲突整批拒绝。两个金项链品种独立保留，不读取或覆盖正式记录。

## 剧情覆盖与原有缺陷

围脖用旧/新两位供应者的实际领取函数对照门派条件、持有检查、共享库存与其他护具分支。
玉佩执行旧/新 `send_to_fight/check_rescure/check_daughter/cry_daughter`，覆盖发放、守卫
阻挡、已有领队拒绝、跟随请求、返回大厅、归还消耗和原《百变神通》奖励入口。
保存、跟随与交付命令仅观察调用；未模拟为实际成功，不声称完整救援剧情通过。

原 `check_daughter()` 安排 `announce_success` 回调，但员外及相关继承/公共代码中未找到
此函数；新旧夹具均确认缺失。测试确认两个回调已安排后取消调度，直接核验 `cry_daughter`
的物品消耗与奖励入口。本批仅记录该原有问题，不修复无关剧情，不要求维护者为此次迁移
执行完整剧情测试。

## 性能对照

`node tools/tests/test_cloth_objects.mjs bin/driver.exe --neck --bench`：旧/新各三个独立
驱动进程，顺序交替；每轮相同 15 个历史来源请求和 300 个实例。setup 计数探针关闭。
原始六组结果见 [benchmark.json](benchmark.json)。

| 指标（三轮算术平均） | 旧实现 | 新实现 |
| --- | ---: | ---: |
| 冷加载全部来源 | 43.267 ms | 26.589 ms |
| 热创建 300 个实例 | 1.866 ms | 26.896 ms |
| 平均每实例热创建 | 0.00622 ms | 0.08965 ms |
| 蓝图增量（每轮一致） | 80972 B | 58840 B |
| 300 实例增量（每轮一致） | 245720 B | 340440 B |

热创建约慢 14.4 倍，但每件增加约 0.0834 ms；蓝图与 300 实例合计增加 72588 B（约 70.9 KiB）。
这是本机微基准，`memory_info()` 是驱动估值而非 OS RSS；不外推整服吞吐或玩家延迟。
归并减少源码和蓝图重复，虚拟对象构造、默认值查询及复合状态隔离带来额外成本。

## 可复核输出与部署边界

用户临时目录中的最终 NECK：`mud-cloth-X9ylHz`；CLOTH：`mud-cloth-bXEl0Y`；
BOOTS：`mud-cloth-6oLzDX`；HEAD：`mud-cloth-jRrSOK`；HANDS：`mud-cloth-34m1HY`；
记录：`mud-record-tests-v8IRzS`；性能：`mud-cloth-z2rfgj`。这些临时输出不提交，可能被系统
清理；仓库保留冻结基线、测试脚本及性能计量。

上线须按[统一部署说明](../../../../docs/architecture/data-driven-items.md)在停服备份中预览，
仅转换确实受影响的记录，再联合部署代码与记录、冷启动；回退同样恢复配套代码和原字节
备份。开发验收不包含推送或发布，不代表正式服存档已经转换。

## 提交前补充：巫师克隆入口

实服发现 `clone` 强制追加 `.c` 并要求实体文件存在，导致虚拟颈饰在加载前被拒绝。
已改为实体对象解析实际扩展名、虚拟对象保留原路径并交由驱动加载，权限、数量和落点规则不变。

- 隔离真实驱动 `--clone-command`：39 项检查通过，覆盖冷/热虚拟克隆、实体双扩展名、相对路径、数量、无效对象及授权拒绝。
- 共享测试入口复测：NECK 2481 项、CLOTH 28382 项及离线迁移包装测试通过。
- 用户在实服更新 `/cmds/wiz/clone` 后成功克隆白金项圈；`info` 显示规范虚拟路径、复制/虚拟标记，UID/EUID 均为 Domain。

此记录只确认克隆入口及相关回归，不扩展为其他正式服玩法或存档迁移验收。
