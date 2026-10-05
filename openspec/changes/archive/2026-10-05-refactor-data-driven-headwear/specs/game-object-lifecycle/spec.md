# Spec Delta

## MODIFIED Requirements

### Requirement: Preview distinguishes coverage from migration impact

工具 SHALL 默认只预览，报告输入方式、实际检查范围、检查文件数、受影响文件数和路径字段变更数。完整成功且零变更的结论 SHALL 仅适用于已检查范围，MUST NOT 将空范围、部分清单、转换失败或清单生成当作全库无需迁移。已迁移 CLOTH、BOOTS 和 HEAD SHALL 使用同一预览与转换流程，保留数量、价格、无关字段、幂等性、冲突拒绝和备份恢复约束。

#### Scenario: A complete preview finds no old identities

- **WHEN** 选定范围内全部记录完成验证且总变更数为零
- **THEN** 报告该已检查范围不需要转换，原文件保持不变；若没有发现任何存档则明确显示空范围

#### Scenario: A manually selected subset is checked

- **WHEN** 管理员仍通过清单只指定部分备份文件
- **THEN** 工具保留此用法，并报告仅检查了该清单，不宣称覆盖整个备份或正式服

#### Scenario: Old clothes and boots appear together

- **WHEN** 临时仓库或商店记录同时包含旧服装、旧鞋靴及已有规范路径
- **THEN** 一次转换得到相应规范身份，无关内容不变，同品同价库存正确合计，重复转换零变更；价格冲突仍整批拒绝

#### Scenario: Old headwear joins mixed family records

- **WHEN** 选定的临时玩家、商店或历史袋记录混合旧服装、旧鞋靴、本批旧头饰及规范路径
- **THEN** 同一次预览与转换覆盖三类获准映射，品种、数量和有效属性保持；等价头饰同品同价库存合计，价格冲突拒绝，未选特殊头饰路径及无关字段不变，重复转换零变更

#### Scenario: A conversion copy is requested

- **WHEN** 管理员在成功核对后显式指定全新输出目录
- **THEN** 工具生成可核对的原始备份、转换副本和报告，不覆盖输入或自动替换正式存档；失败不发布可误作成功的转换结果
