# Spec Delta

## Purpose

规范通用 mudcore 内置命令对实体源码、运行期对象和虚拟对象的处理，使独立宿主在使用双扩展名、选择可选模块及管理对象时得到准确反馈，并避免错误更新导致对象和环境内容意外丢失。

## ADDED Requirements

### Requirement: Commands distinguish source files from object identities

框架对象操作命令 SHALL 支持合法的无扩展名、`.c`、`.lpc` 对象路径及虚拟对象身份，不以实体 `.c` 文件是否存在作为统一加载前提。源码显示 SHALL 区分运行期对象名与真实源码；虚拟身份没有独立源码时 MUST NOT 伪造对应文件。已有命令权限和宿主覆盖 SHALL 保持。

#### Scenario: A valid virtual object has no matching source file

- **WHEN** 授权维护者使用对象检查命令访问没有同名实体源码的合法虚拟对象
- **THEN** 命令按对象加载结果工作，不因缺少 `.c` 文件拒绝它
- **AND** 信息显示保留虚拟身份，不把对象名拼成不存在的源码文件

#### Scenario: An area uses LPC source or a runtime clone identity

- **WHEN** 维护者查看 `.lpc` 区域或带克隆编号的区域信息
- **THEN** 运行期身份与实际源码被正确区分，不显示虚构的 `.c` 路径

### Requirement: Update validates targets before destructive work

框架 `update` SHALL 在销毁前校验目标身份：拒绝带克隆编号的目标，不自动改为更新其蓝图；VOID_OB 的等价路径拼写 SHALL 受到同样保护。合法实体或虚拟蓝图 SHALL 保持可重新加载。重载失败 MUST NOT 显示成功，也不能将虚拟路径擅自改成处理程序或公共父类路径。

#### Scenario: A clone is passed to update

- **WHEN** 维护者提交一个存活克隆的完整运行期路径
- **THEN** 命令拒绝该更新，克隆及其蓝图均保持原状

#### Scenario: An alternate spelling addresses the protected void

- **WHEN** VOID_OB 以无扩展名、显式源码扩展名或规范化后等价的路径提交
- **THEN** 更新在销毁前被拒绝，不因字符串拼写差异绕过保护

#### Scenario: A virtual blueprint is updated

- **WHEN** 维护者更新合法虚拟蓝图而该路径没有同名实体源码
- **THEN** 沿原虚拟身份重新加载，不重命名对象、不重载其他业务对象
- **AND** 创建拒绝或异常得到明确失败反馈，诊断信息可定位

### Requirement: Environment updates preserve contents safely

更新有内部对象的环境前，命令 SHALL 先安全安置这些对象；无法完成安全安置时 MUST NOT 销毁旧环境。成功后 SHALL 将仍受此次更新保管的对象送回新环境；重载失败时 SHALL 将其留在安全环境并报告失败。回迁 MUST NOT 抢回已被正常移动钩子转移到其他地点的对象，也不承诺任意宿主业务状态的事务回滚。

#### Scenario: An occupied room is reloaded successfully

- **WHEN** 房间内存在玩家和普通物品，且安全转移与重载均成功
- **THEN** 玩家和物品实例保持存活，重新位于成功加载的房间，不因重载丢失实例状态

#### Scenario: Reload fails after evacuation

- **WHEN** 内容已安全移出，但新环境编译失败或虚拟提供程序拒绝创建
- **THEN** 命令报告失败，存活内容仍处于安全环境，不被后续清理销毁

#### Scenario: Contents cannot be evacuated

- **WHEN** 安全环境不可用或内容转移失败
- **THEN** 旧环境不被销毁，失败明确可见；已发生的宿主移动副作用不伪装为完整回滚

### Requirement: Batch loading reports actual results without changing semantics

`loadall` 及其 `updateall` 别名 SHALL 保持批量加载语义，不强制销毁已加载对象；每个已处理目录 SHALL 如实报告成功及失败数量并记录失败对象，抛错和返回非对象都不得计为成功。扫描 SHALL 保留 `.lpc` 优先、双扩展名去重、隐藏目录及框架自身非独立源码目录过滤，不能把宿主同名目录一并过滤。异步子目录尚未完成时 MUST NOT 宣称整次扫描全部通过。

#### Scenario: One source fails while other sources load

- **WHEN** 目录中包含合法源码及编译失败的源码
- **THEN** 继续检查其他文件，失败数量和对象可见，不输出该目录全部成功的结论

#### Scenario: The updateall alias encounters an already loaded object

- **WHEN** 维护者通过该别名扫描包含驻留对象的目录
- **THEN** 驻留对象不被销毁，帮助明确这不是强制重新编译或按继承顺序热更新

#### Scenario: A host has its own tests directory

- **WHEN** 扫描同时经过框架 tests 目录、宿主 tests 目录和隐藏目录
- **THEN** 仅排除原约定的框架目录和隐藏路径，保留宿主目录扫描及宿主过滤覆盖

### Requirement: Object load failures terminate the affected command safely

对象检查与移动/观察命令 SHALL 区分加载成功、拒绝和异常；失败后不对空对象继续调用，不显示成功、不执行后续移动或业务方法。玩家提示 MUST NOT 泄露内部路径和异常原文，管理诊断 SHALL 保留可定位信息。命令入口的错误处理不得改变底层加载接口的异常契约或触发旧虚拟创建回退。

#### Scenario: A virtual exit rejects or throws

- **WHEN** 玩家移动或观察的出口提供程序返回拒绝或抛出异常
- **THEN** 当前命令安全结束，玩家位置不因该加载失败改变，提示可理解，异常可供宿主诊断

#### Scenario: An administrator cannot load an inspected object

- **WHEN** `all_inventory`、`call_other` 或 `variables` 的目标加载失败
- **THEN** 命令报告目标加载失败，不继续执行检查或业务方法，不产生空对象调用错误

### Requirement: File operations validate the resolved target

`CRLF` SHALL 先按现有 cwd 路径约定解析目标，再对同一目标检查、读取和写入；文件不存在、为目录或读写失败时 SHALL 明确报告失败，不误操作同名文件。该命令仍为实体文本文件工具，不将虚拟对象身份解析成其他源码代为修改。

#### Scenario: A relative file exists only under the selected cwd

- **WHEN** 授权维护者在非根 cwd 下处理相对文件名
- **THEN** 检查和转换均针对该 cwd 下的实际文件，不误报根目录同名文件不存在，也不修改根目录同名文件
