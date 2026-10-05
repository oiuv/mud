# 数据化护腕

`d/items/wrists.lpc` 直接继承 WRISTS，`wrists_data.h` 将 6 份固定初始化定义归并为 4 个品种。正式路径为 `/d/items/wrists/<id>`，例如 `new("/d/items/wrists/huwan")`；同路径 `load_object()` 得到品种蓝图。不要参数克隆 provider，不增加逐品种文件或运行期别名。

## 品种与行为

数据沿用 `name/ids/weight/properties`，ID 自然升序排列；固定描述和属性属于蓝图，各实例可独立覆盖并恢复默认，复合状态互不影响。

| ID | 保留的区别 |
| --- | --- |
| `huwan` | 三份相同布护腕合并；实际重量 500、价值 1300、护甲 5 |
| `shaolin_huwan` | 铁护腕；重量 500、价值 6000、护甲 5、shaolin=1 |
| `tie_huwan` | 同类铁护腕，无 shaolin 标记，保持独立品种 |
| `wanlian` | 鎏金腕链；实际重量 0，普通 weight 属性 200、价值 5000、护甲 1 |

腕链未调用旧 `set_weight()`，不能把普通属性改成实际负重。保留原材质、名称、输入别名、腕部槽位和派生描述，不增加洗涤、撕布或其他类别行为。`virtual_start()` 在驱动确定身份后初始化一次，UID/EUID 保持 Domain。

武修文与道相只改 `huwan` 创建路径，仍保留持有检查和共享 `huju_count`；道相要求少林身份，武修文原函数没有此检查，不替他补上。围脖、手套、指套、护腰、鞋靴和背心分支保持旧行为。

`d/luoyang/npc/obj/wanlun1.c` 绞金腕轮有死亡销毁回调，留在原路径。除非确认 BUG，否则按旧代码实际功能验收，不因命名推测修改玩法。

## 存取与部署

背包只接纳已登记的四个精确虚拟路径；穿戴中、临时状态、禁存、独特物品和未知对象仍拒绝，不增加自动保存。统一离线转换器新增 6 条旧路径，六类合计 590 条历史路径直接到达当前身份。

按[统一部署说明](data-driven-items.md)停服备份、预览并按需转换，核对数量和价格后联合部署代码与记录。无受影响记录时无需转换；不能仅热更新旧实例。回退同时恢复配套代码及原字节记录。

## 隔离验证

源码基线 `61abfde3`；`tools/tests/wrists/baseline.json` 保存原文、哈希、分组和引用，`weight-baseline.json` 保存真实驱动的旧蓝图/克隆观察值。

```powershell
node tools/tests/wrists_inventory.mjs
node tools/tests/audit_wrists_migration.mjs
node tools/tests/compile_cloth_callers.mjs bin/lpcc.exe --wrists
node tools/tests/test_cloth_objects.mjs bin/driver.exe --wrists --all --baseline-only
node tools/tests/test_cloth_objects.mjs bin/driver.exe --wrists --all
node tools/tests/test_cloth_objects.mjs bin/driver.exe --wrists --bench
```

测试复用真实装备、交易、领取与存取函数，NPC/玩家环境使用临时夹具，不等同正式服完整验收。旧对象只在临时测试副本重建，不是运行期兼容壳。性能对照采用相同 6 个来源、120 实例，旧/新各 3 个独立驱动进程；`memory_info()` 不是 OS RSS。
