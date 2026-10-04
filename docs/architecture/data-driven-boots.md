# 普通鞋靴数据化

鞋靴按 BOOTS 的足部穿戴、洗涤和晾干行为独立成类，不继承 CLOTH，因而没有撕布能力。
开发入口为 `d/items/boots.lpc` 与同目录 `boots_data.h`，创建使用无扩展名路径，例如
`new("/d/items/boots/caoxie")`；固定属性放 `properties`，实例可独立覆盖。

`create_virtual_object(key)` 只创建未初始化克隆；驱动赋予最终身份后通过 `virtual_start()`
设置默认蓝图并调用一次 `setup()`。不要直接带参数克隆 provider、手动调用初始化或创建逐品种文件。

当前实施范围、命名依据和排除项见 `openspec/changes/refactor-data-driven-boots/design.md`。
离线原始定义与哈希保存在 `tools/tests/boots/baseline.json`，不参与游戏运行。
代表验证：`node tools/tests/test_boots_objects.mjs bin/driver.exe`；全批加 `--all`。
测试只在临时 MUDLIB 运行，不读取正式存档、不启动正式游戏。

## 范围与归并依据

19 个旧定义归为 `zhanxue`（1）、`caoxie`（3）、`xiuhua_xiaoxie`（8）、`pixue`（3）、
`qilinxue`（1）、`jingzhi_xiuhua_xiaoxie`（1）、`qingbu_sengxie`（1）、`shaolin_sengxie`（1）。
两种绣花鞋颜色、描述、价值不同；两种僧鞋的 `shaolin` 属性不同，因此各自保留。
材质中的 `wood`、`boots` 是历史有效值，本批不改动。商品 ID 不携带旧目录信息。

17 处静态调用及钱正伦 `feet`、道相 `sengxie` 动态入口统一使用新路径；
领取口令、限额、门派条件和领取后属性覆盖不变。吴修文的防具列表无鞋，道尘仅发武器，均不改动。
3 份麻鞋（`d/lanzhou/npc/obj/shoes.c`、`d/lanzhou/obj/shoes.c`、`d/village/npc/obj/shoes.c`）
没有 `setup()`；`d/city/npc/cloth/shoes.c` 直接继承 EQUIP，仍保留原实现，不混入本表。

`node tools/tests/boots_inventory.mjs` 核对每份原源码和哈希；
`node tools/tests/audit_boots_migration.mjs` 核对调用、数据、排除项及无旧路径入口。
原文件删除后可从 Git 基线 `09e371bb` 恢复，不作为运行期依赖。

## 存档与切换

仓库只放行表内的精确鞋靴路径，原有拒存资格保留。旧路径不再可加载，因此上线前按
[统一物品迁移流程](data-driven-items.md#离线转换与部署)对停服备份执行预览，必要时生成副本。
转换器同时处理旧 CLOTH 和本批 BOOTS；不要只 `git pull` 后直接重启而略过存档检查。
回退须同时恢复匹配的代码和原始记录，本次开发不替维护者操作正式数据。

全部调用编译：`node tools/tests/compile_boots_callers.mjs bin/lpcc.exe`。
性能对照：`node tools/tests/test_boots_objects.mjs bin/driver.exe --bench`，使用独立进程各测三轮，
每轮相同 19 个历史来源请求、380 个实例。热创建与冷加载分别报告，内存为驱动估值而非 OS RSS。
