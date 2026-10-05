# Proposal

## Why

剑器、饮具迁移完成后，继续优先处理数量多、共用行为明确的类别。当前 `/d` 下 67 份 BLADE 定义中，61 份仅包含固定初始化，可复用剑类已验证的虚拟生命周期，减少重复维护而不重写战斗规则。

## What Changes

- 将 61 份普通刀类定义集中到 `d/items/blade.lpc` 和 `blade_data.h`，继续继承原 BLADE；锯子、木镗等仍保留原刀类行为，不按显示名称重新分类。
- **BREAKING**：统一使用 `/d/items/blade/<id>`，同步全部实际引用并删除替代的旧源码，不留转发壳或运行期别名。当前定位 82 个文件中的 102 处静态引用及 3 个动态创建调用方。
- 按真实属性、显示和行为合并等价物品，使用简洁名称及稳定品种编号，数据按 ID 自然排序。原输入别名、伤害、实际重量、材质、耐久、动作和限制保持。
- 保留三份定义原有的 `init_blade(damage, 110)` 参数；不将其当作默认标志，不借迁移修正旧字段或数值。
- 六件特殊刀保留专用实现；其中屠龙刀仅替换产出断刀的路径，保留对砍条件、产物与销毁流程。
- 接入现有背包精确品种检查、离线记录转换、引用审计及隔离驱动回归，补齐实际供应、装备、交易、刷新和断刀产出验证。

## Capabilities

### New Capabilities

无。

### Modified Capabilities

无。沿用 `game-object-definitions`、`game-object-families`、`game-object-lifecycle`，只改变实现和规范身份，不改变既有行为要求；声明 `skip_specs: true`，不新增重复规范。

## Impact

源码基线为 `b5e94cd0550cf3c44911457ae5715b9ba4cb6172`。61 份旧定义替换为 2 个公共程序/数据文件，预计净减少 **59 个运行期定义文件**（编译源码减少 60 个）；测试、工具和文档另计。静态数据暂分 **52 组**，最终品种数以真实驱动对照为准。

涉及对应 NPC、房间、商店、屠龙刀产出引用，`feature/user_storage.c`、`tools/migrate_item_records.mjs` 及现有测试。同步 `docs/architecture/data-driven-items.md` 与 `help/changelog`。不迁移 `/clone` 兵器、其他武器类别或特殊回调，不改 mudcore、驱动、AI、存档结构及正式数据；不增加通用物品框架。范围与依据见 [analysis.md](analysis.md)，部署和推送不属于本轮实施。
