# 普通杖类数据化迁移

## Why

已有十二类普通物品完成数据化，杖类仍有 37 份固定初始化定义分散在地图目录。集中维护这批重复源码可继续提高维护效率，并复用现成的虚拟对象、离线转换和测试体系。

## What Changes

- 新增 `d/items/staff.lpc` 与 `staff_data.h`，为 [analysis.md](analysis.md) 列明的 37 份定义提供 `/d/items/staff/<id>` 规范入口；继承原 STAFF，保留长兵器标志、名称、属性和持用行为。
- 按实际显示、属性和行为归并等价定义，保留输入别名；静态预分组为 32 个品种，最终以真实驱动观测核实。ID 简短、稳定并自然排序。
- **BREAKING**：迁移全部实际调用并删除选定的 37 份旧文件，不保留转发壳或运行期别名；旧记录经现有离线转换器保留身份、数量和有效价格。
- 同步调用审计、存储接入、十三类累计回归及维护文档；预计净减 35 个运行期定义文件、36 个可编译物品源文件。
- 8 份化蛇、燃烧、吸烟、死亡销毁或禁克隆特殊对象保持原样；不调整旧数值、任务、父类行为或存储资格，不操作正式数据。

## Capabilities

### New Capabilities

无。

### Modified Capabilities

无。本批为保持行为的数据化重构，复用现有 `game-object-definitions`、`game-object-families`、`game-object-lifecycle` 和虚拟对象约定；不改变规范级要求，`.openspec.yaml` 声明 `skip_specs: true`，不新增重复增量规范。

## Impact

- 源码基线为已提交的 `32f587a5c46c10193ad3974069ce76e07b91a2a3`。37 份定义涉及 49 处静态引用及钱正伦、副将、道尘三个动态入口，预计共 44 个消费者。
- 精确扩展 `feature/user_storage.c` 和 `tools/migrate_item_records.mjs`，不扩大备份字段范围；新增 37 条历史路径映射后预计累计 1,113 条。
- 复用 `tools/tests/` 的冻结基线、隔离驱动、调用编译和性能入口；旧十二类快照不重写，更新 `docs/architecture/data-driven-items.md`。
- 不修改 mudcore、FluffOS、AI、公共武器父类或正式存档，不提高最低驱动版本。部署仍须备份并预览记录，按需转换后配套冷启动，回退代码与记录须成对恢复。
