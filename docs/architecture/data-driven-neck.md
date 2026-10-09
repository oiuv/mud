# 数据化颈饰

`d/items/neck.lpc` 直接继承 NECK，`neck_data.h` 保存 10 个品种，归并 15 份旧定义。正式路径为 `/d/items/neck/<id>`，例如 `new("/d/items/neck/yupei")`；同路径 `load_object()` 得到品种蓝图，不直接参数克隆 provider。不增加旧路径别名或逐品种文件。

数据采用 `name/ids/weight/properties`，固定描述与其他属性统一放蓝图，实例可独立覆盖并删除覆盖恢复默认值。ID 简短稳定，按自然顺序排列，编号不随排序改变；等价物品共用身份，真实差异保留。

## 保留的区别

- `jinxianglian` 的实际重量是 500；`jinxianglian2` 实际重量为 0，但普通属性 `weight` 为 500，不混为同品。
- `baijin_quan` 实际重量为 0，普通 `weight` 为 200。不要把旧 `set("weight", ...)` 改成实际负重。
- `shaolin_weibo` 保留 `shaolin=1`，普通 `weibo` 没有该标记；领取仍检查原 `weibo` 输入，而物品别名为 `wei bo` / `bo`，不新增别名修正旧行为。
- `xuantie_ling` 保留 `female_only=1` 和原穿戴判断：仅拒绝男性，女性和无性角色均允许；保留玉牌描述和材质，与其他目录的玄铁令 ITEM 不合并。
- `shane_bu` 继承 NECK，但没有 `armor_prop`，原本不能穿戴且不占槽位；不补护甲属性，也不增加阅读或技能行为。
- `yupei` 保留 `yu pei` 主输入名、`no_sell` 和原任务识别；只更新萧员外的创建路径，不改变湘湘救援、归还消耗和书籍奖励协议。

颈部槽位、实际装备属性、显示颜色、未设置属性和历史输入别名均按旧定义核验。初始化仍在驱动确定虚拟身份后的 `virtual_start()` 执行一次，同品种各实例状态独立。

## 存取与部署

背包只放行表内精确路径，不放开未知虚拟物品；穿戴中、临时状态、禁存、独特物品等限制保持。不新增自动保存能力。使用既有 `tools/migrate_item_records.mjs` 在停服备份中预览；15 条旧颈饰路径直接转换为当前品种，合并同品同价商店库存，保留玩家分立记录和数量，价格冲突整批拒绝。

按[统一部署说明](data-driven-items.md)核对清单覆盖范围和副本结果后，联合切换代码与记录；无受影响记录时无需转换。回退同时恢复原代码与原字节备份，不在运行期猜测历史身份，不操作正式数据。

## 隔离验证

```powershell
node tools/tests/neck_inventory.mjs
node tools/tests/audit_neck_migration.mjs
node tools/tests/compile_cloth_callers.mjs bin/lpcc.exe --neck
node tools/tests/test_cloth_objects.mjs bin/driver.exe --neck --all --baseline-only
node tools/tests/test_cloth_objects.mjs bin/driver.exe --neck --all
node tools/tests/test_cloth_objects.mjs bin/driver.exe --neck --bench
```

基线为 `57f106f8`，原文和哈希位于 `tools/tests/neck/baseline.json`。回归在临时目录使用真实驱动；NPC 状态与命令环境使用夹具，不能将局部剧情测试称为全流程正式服验收。

围脖领取对照旧/新两位供应者的门派要求、持有检查、共享库存及手套、指套、护腕、护腰、鞋靴和背心分支。原 `present("weibo", player)` 不匹配围脖的 `wei bo` 别名，旧版可再次领取；本批保留，不把历史行为顺手改成新的限领规则。

玉佩回归执行实际 `send_to_fight/check_rescure/check_daughter/cry_daughter`，验证发放、人物阻挡、领队状态、归还消耗与原书籍奖励入口。保存、跟随和交付命令仅观察调用，未模拟为正式成功；旧 `check_daughter()` 会安排未定义的 `announce_success` 回调，本批不修复，测试确认调度后取消该回调再直接核验重逢函数。完整剧情和正式上线不属于这份局部回归的结论。
