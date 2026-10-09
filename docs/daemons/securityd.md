# SECURITY_D - 现有安全权限实现

## 状态与后续开发

本文说明当前保留运行的六级权限实现，供维护和排障使用。**现有代码、账号角色及目录规则不迁移、不修改；新功能按[简化权限规范](../architecture/security-permissions.md)开发，仅区分玩家与管理员。**

新代码复用驱动 `wizardp()` 标记判断管理身份，并继续使用现有调用者、文件与对象安全机制；不复制旧中间等级或数字比较，不另建权限系统。

## 职责与调用关系

实现位于 [securityd.c](../../adm/daemons/securityd.c)。[master 的权限 apply](../../adm/single/master/valid.c) 将相关文件访问和身份切换检查委托给它；命令通过 `valid_grant()` 请求授权。

它同时承担人员权限、对象身份和运行期数据保护，不能因为代码通过 Git 审查就取消后两者。

## 现有等级与接口

当前 `wiz_levels` 依次为 `(player)`、`(immortal)`、`(apprentice)`、`(wizard)`、`(arch)`、`(admin)`，对应 0–5。这个顺序描述现状，**不是新功能的权限设计标准**。

| 接口 | 当前含义与限制 |
| --- | --- |
| `get_status(mixed ob)` | 根据对象 EUID（缺失时用 UID）或传入的身份字符串查询角色；未识别身份返回玩家 |
| `get_wiz_level(mixed ob)` | 返回角色在旧等级数组中的位置，供现有代码使用 |
| `query_wiz_levels()` | 返回现有等级列表 |
| `set_status(mixed ob, string status)` | 修改身份对应角色并写入巫师名单，要求调用对象 EUID 为 Root；不是 `set_wiz_level()` |
| `valid_grant(object ob, string min_level)` | 校验命令调用链、请求者及最低角色要求，并处理既有显式命令授权；第二个参数不是命令名 |
| `valid_seteuid(object ob, string uid)` | 判断对象是否允许切换 EUID；不等同于人员等级检查 |

`wizhood()`、`wiz_level()` 的 sefun 转发位于 [wizard.c](../../adm/single/simul_efun/wizard.c)。
`wizardp()` 是驱动的布尔巫师标记判断，不是 SECURITY_D 的接口，也不包含等级划分。新功能可直接用它判断管理身份，仍须保留调用者及具体操作约束。当前 [enable_player()](../../feature/command.c) 为多个旧巫师等级启用标记，因此它不等价于旧体系的 `(admin)` 等级；维护旧功能时不能直接用它替换已有授权检查。标记语义见[驱动文档](../../fluffos/docs/efun/mudlib/wizardp.md)。

维护已有按 `(admin)` 等级授权的命令时，保留正常命令调用上下文中的原入口：

```lpc
if (!SECURITY_D->valid_grant(me, "(admin)"))
    return 0;
```

这保留了旧命令的调用者和显式授权规则，不是新功能必须复制的等级判断。新管理员命令仍置于 `/cmds/adm/`，按简化规范使用 `wizardp(me)`；不要在后台对象中伪造玩家上下文来借用命令权限，也不能把单一身份标记当作完整的调用链授权。

## 文件访问与对象身份

`valid_read(string file, mixed user, string func)` 与
`valid_write(string file, mixed user, string func)` 根据请求对象的 EUID、角色、路径和操作类型判断访问；`func` 是 `read_file`、`save_object` 等操作名，不能省略其语义。

当前实现保留：

- 目录信任/排除规则：`trusted_read/write`、`exclude_read/write` 及扩展规则。
- 个人 `/u/<euid>/` 访问及旧角色目录规则，供现有功能继续运行。
- 玩家和对象存档路径检查；玩家保存时还会核对 UID、EUID 与角色 ID。
- Root 与管理员的既有特权，以及对象身份切换约束。

新功能不得通过统一提权为 Root 或让 `valid_*` 无条件返回成功来简化权限。

## 配置与持久化

- `WIZLIST` 定义在 [login.h](../../include/login.h)，路径为 `/adm/etc/wizlist`。巫师角色映射从此加载，`set_status()` 会重写名单并记录变更。
- `query_save_file()` 返回 `DATA_DIR "securityd"`；安全规则扩展、命令授权和站点特权等通过 `F_SAVE` 保存/恢复。不要把所有权限数据误认为都存于单一文件。
- `query_security(string para)` 查询规则；`set_security(string para, mapping ruler)` 设置支持的扩展规则；这些入口要求受信任调用者。
- `reset_security()` 将默认规则和扩展规则组合为生效规则。设置、重建和持久化是不同操作，不应假定任何配置修改都会自动完成全部步骤。
- 既有 `grant()`、`remove_grant()`、`query_grant()` 保留；新功能不因此新增逐人授权体系或中间等级。

## 维护边界

维护旧功能时保留原授权行为，新功能按简化规范使用现有安全机制。

旧系统正常即可长期共存，不列为默认迁移任务。仅在具体场景显示收益大于成本和风险时，按[迁移评估原则](../architecture/security-permissions.md#何时重新评估迁移)另行讨论。

如之后确认整体迁移，须同步处理等级名称、数字比较、命令路径和文件规则。尤其不能让移除后的最低等级名称落入 `get_status()` 的玩家默认值而意外放宽授权。
