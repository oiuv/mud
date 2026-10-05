# Proposal

## Why

服装、鞋靴、头饰和手部装备已完成数据化。继续归并颈饰，消除地图中的重复定义，保持简单的品种路径和现有玩法，不新增物品框架。

## What Changes

- 将 `/d` 中 15 份 NECK 初始化定义迁入 `d/items/neck.lpc` 与 `neck_data.h`。按实际属性静态分为 10 个品种，完整来源和固定短 ID 见 design.md；运行等价仍须真实驱动验证。
- 功能与数据以旧代码的实际行为为准，不根据名称、注释或直觉调整规则；只有明确确认的 BUG 才作为独立修复记录原因、范围和验证，不混入默认归并改动。
- 等价定义合并，保留两种金项链的实际重量差异、白金项圈的普通 weight 属性、少林围脖标记、玄铁令仅拒绝男性穿戴的判断，以及龙凤玉佩原剧情用途。赏善罚恶簿虽继承 NECK，但未设置 armor_prop，保留原本不能穿戴的行为。
- 沿用单层 `properties`、品种蓝图、`create_virtual_object` / `virtual_start`；数据按 ID 自然升序排列，编号稳定，不添加实例属性层、逐品种文件或运行期旧路径别名。
- **BREAKING**：统一实际调用并删除选中的 15 个旧定义。目前定位 15 个文件中的 15 处静态引用，以及武修文、道相各一条围脖动态领取分支。
- 现有背包精确接入颈饰，统一离线转换器增加本批路径；保留前三批和手部装备的历史映射，测试五类混合记录。

## Capabilities

### New Capabilities

无。

### Modified Capabilities

无。本批是在既有 `game-object-definitions`、`game-object-families`、`game-object-lifecycle` 约定内迁移下一组数据，不改变能力要求；`.openspec.yaml` 使用 `skip_specs: true`，不为批次重复增加规范。命名、稳定编号与排序遵循当前 AGENTS.md，以及已完成头饰变更的命名约定；不改写其他变更或主规范。

## Impact

基线为已提交、尚未推送的 `57f106f88060abce0fd1172b24021a80948c6343`。新增颈饰共用程序、数据、离线基线、测试及维护说明；修改实际调用、`feature/user_storage.c`、既有转换器与测试接入。预计 15 个旧定义变为 2 个文件，游戏定义文件净减少 13 个。

保留 ARMOR、WAIST、WRISTS 等其他类别，不改 mudcore、驱动、AI 或正式存档；不修复无关剧情缺陷，不自动发布。全批实施及隔离开发验收已完成，结果见 [validation.md](validation.md)。上线仍由维护者在停服备份上预览、按需转换，再联合切换代码与记录。
