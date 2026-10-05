# 游戏对象生命周期与迁移增量

## ADDED Requirements

### Requirement: Backup record discovery produces an explicit manifest

离线迁移工具 SHALL 支持从管理员显式指定的备份根目录发现玩家和商店存档，生成可复核、确定顺序的清单，并复用既有字段级转换。工具 MUST NOT 默认读取正式数据、扫描无关目录或跟随越界路径；历史袋记录仍 SHALL 显式选择。保存清单 SHALL 不覆盖已有文件，且 MUST NOT 被报告为完成内容检查或数据转换。

#### Scenario: A backup contains player and shop records

- **WHEN** 管理员指定包含玩家及商店目录的备份执行发现
- **THEN** 得到全部范围内普通存档的相对路径和记录种类，不需逐个输入账号，不改存档，不加载正式玩家对象

#### Scenario: Only the manifest is requested

- **WHEN** 管理员要求将发现结果保存为新清单
- **THEN** 工具只枚举路径并保存清单，不读取存档正文、不调用驱动或转换记录；文件已存在则拒绝覆盖

#### Scenario: Discovery cannot cover the requested backup

- **WHEN** 指定范围缺少目录、存在不可读取的记录或越界链接
- **THEN** 工具明确报告范围与失败原因，不发布完整检查或无需转换的结论

### Requirement: Preview distinguishes coverage from migration impact

工具 SHALL 默认只预览，报告输入方式、实际检查范围、检查文件数、受影响文件数和路径字段变更数。完整成功且零变更的结论 SHALL 仅适用于已检查范围，MUST NOT 将空范围、部分清单、转换失败或清单生成当作全库无需迁移。CLOTH 和本批鞋靴 SHALL 使用同一预览与转换流程，保留数量、价格、无关字段、幂等性、冲突拒绝和备份恢复约束。

#### Scenario: A complete preview finds no old identities

- **WHEN** 选定范围内全部记录完成验证且总变更数为零
- **THEN** 报告该已检查范围不需要转换，原文件保持不变；若没有发现任何存档则明确显示空范围

#### Scenario: A manually selected subset is checked

- **WHEN** 管理员仍通过清单只指定部分备份文件
- **THEN** 工具保留此用法，并报告仅检查了该清单，不宣称覆盖整个备份或正式服

#### Scenario: Old clothes and boots appear together

- **WHEN** 临时仓库或商店记录同时包含旧服装、旧鞋靴及已有规范路径
- **THEN** 一次转换得到相应规范身份，无关内容不变，同品同价库存正确合计，重复转换零变更；价格冲突仍整批拒绝

#### Scenario: A conversion copy is requested

- **WHEN** 管理员在成功核对后显式指定全新输出目录
- **THEN** 工具生成可核对的原始备份、转换副本和报告，不覆盖输入或自动替换正式存档；失败不发布可误作成功的转换结果
