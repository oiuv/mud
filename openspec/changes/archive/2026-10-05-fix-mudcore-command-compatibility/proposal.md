# Proposal

## Why

mudcore 已支持双扩展名和通用虚拟对象，但内置命令仍存在销毁克隆后无法重载、可选 parser 被意外加载、失败显示成功及伪源码路径等缺陷。主 MUD 的命令修复不覆盖独立框架，需要在 mudcore 自身修复并独立验证。

## What Changes

- 修复 `update` 的对象身份检查、VOID_OB 保护及重载失败处理；销毁前拒绝克隆路径，安全保留被更新环境中的对象。
- 使 `which` 遵守 parser 开关，保留普通命令优先及宿主服务覆盖。
- 修复 `loadall` 的失败计数和反馈，保留双扩展名扫描、原过滤范围及历史覆盖入口；`updateall` 仍为批量加载别名，不改为强制热更新。
- 修正 `sa` 的对象/源码显示及 `CRLF` 的相对路径检查顺序。
- 完善 `all_inventory`、`call_other`、`variables`、`go`、`look` 的对象加载失败处理；虚拟提供程序拒绝或抛错不触发其他创建路线，不伪装成功。
- 在框架现有隔离测试中增加命令级用例，同步命令帮助、框架文档和未发布变更记录。

## Capabilities

### New Capabilities

- `mudcore/command-object-compatibility`：框架内置命令的源码与对象身份区分、安全更新、真实加载结果和文件路径处理。

### Modified Capabilities

- `mudcore/command-pipeline`：明确关闭 parser 时内置命令查询也不得加载谓词服务，并补充对应验收。

## Impact

- 实现范围为 `mudcore/cmds/wizard/` 的八个相关命令、`mudcore/verbs/common/go.c` 与 `look.c`；复用现有路径辅助函数和驱动接口，不新增全局对象管理框架或外部依赖。
- 测试与说明位于 `mudcore/tests/`、命令内嵌帮助、`mudcore/docs/` 和 `mudcore/CHANGELOG.md`。计划保存在父仓库 OpenSpec 中，框架实现不依赖父仓库业务。
- 保持 FluffOS 最低版本、UID/EUID、既有命令权限、别名和宿主覆盖契约；不改变通用虚拟创建协议，不迁移旧权限或存档。
- 不修改主库 `/cmds/`、食物迁移计划或正式数据，不重启正式服务；隔离回归不等于任意宿主实服已经验收。提交、推送和上线另按用户授权执行。
