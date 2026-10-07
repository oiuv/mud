# 游戏对象生命周期与迁移

## Purpose

允许更换品种路径，同时保持生成、使用、交易和存取功能。以新品种虚拟路径复用现有路径式机制，不保留旧文件壳或运行期路径别名。

## Requirements

### Requirement: Canonical virtual identity supports reconstruction

迁移后的普通物品 SHALL 使用规范品种虚拟路径进行创建、查找、蓝图读取和品种比较，new(base_name(ob)) SHALL 创建同品种的新实例。所有实际引用 SHALL 同步迁移，等价物品的多个原入口 SHALL 统一到同一个规范路径；本批全部被替代的原物品源码 SHALL 在迁移完成时删除，MUST NOT 留下转发文件或运行期旧路径别名。品种 SHALL 以共用类中的唯一数据记录维护，不再为每个历史来源建立入口或重复定义。

#### Scenario: An NPC creates a migrated item

- **WHEN** NPC 通过更新后的品种路径创建装备
- **THEN** 得到原属性与使用效果的物品，继续按原方式移动并穿戴，物品名无需对应实体源文件

#### Scenario: A migrated family is accepted

- **WHEN** 一批物品完成抽象并准备验收
- **THEN** 迁移清单内的旧源码全部不存在，实际调用方均使用规范入口，运行期没有旧路径兼容文件或别名；新增同类物品先复用等价品种，确有差异时才增加数据记录

### Requirement: Spawn and commerce retain gameplay behavior

迁移 SHALL 保持数量、位置、归属、刷新、商品展示、价格、库存及付款规则，品种匹配 SHALL 使用归并后的规范身份；可修改引用和必要接入检查，不建立第二套商品识别协议。合并路径导致货表或刷新配置键重合时 SHALL 保留原数量和有效交易数据，MUST NOT 因 mapping 键覆盖而丢失配置。

#### Scenario: Two products share a class

- **WHEN** 同一个公共类提供两种有真实属性、显示或行为差异的商品
- **THEN** 商店和玩家交易继续区分各自价格、库存及交付对象，不串货

#### Scenario: Shops price the same canonical item differently

- **WHEN** 两家商店销售同一种规范物品但各自设置不同售价
- **THEN** 各自保留价格和库存，仍引用同一份物品定义，不为商店或来源地区复制商品 ID

#### Scenario: A room replenishes an item

- **WHEN** 房间刷新配置使用新品种路径
- **THEN** 补充数量、归位与装备行为不变

### Requirement: Persistence retains eligibility and record structure

物品存取 SHALL 保留原资格、数量和恢复结果，记录继续使用现有路径字段；必要的加载检查 SHALL 正确支持本批虚拟物品，不因缺少实体 .c 文件拒绝，也不无条件放开任意虚拟对象。未有的自动保存和实例快照能力 MUST NOT 顺带新增。

#### Scenario: A valid virtual item is stored and retrieved

- **WHEN** 一个符合原存放条件的虚拟品种被存入后取出
- **THEN** 按保存的新路径恢复对应品种和数量，记录结构不增加通用品种字段

#### Scenario: An item remains ineligible

- **WHEN** 物品仍有原禁止存放条件
- **THEN** 即使它采用虚拟路径，存取规则也不被放宽

### Requirement: Historical references are migrated without runtime aliases

删除原路径前 SHALL 核对持久引用；需要转换的记录 SHALL 通过一次性、字段明确的迁移保留对应品种、数量、有效属性及价格，不依赖运行期别名。原实体路径和归并前虚拟路径 SHALL 直接转换为规范路径，已规范化记录 SHALL 保持不变。验证 SHALL 使用临时记录，正式数据转换 SHALL 纳入部署备份与回退步骤。

#### Scenario: An old warehouse record references a removed file

- **WHEN** 临时旧记录经过本批路径转换后恢复
- **THEN** 得到对应新品种与原数量；无关字段保持原样，再次转换不改变结果

#### Scenario: A shop contains equivalent items at the same price

- **WHEN** 同一商店记录中的多个旧路径或新旧混合路径指向同一规范品种，且售价一致
- **THEN** 转换结果只保留规范路径，库存数量相加，售价和库存总数不丢失，重复转换为零变更

#### Scenario: Equivalent shop entries have conflicting prices

- **WHEN** 同一商店中待归并条目指向同一规范品种但售价不同，或存在其他无法无损归并的数据冲突
- **THEN** 转换明确报告冲突，不覆盖输入或选择一条覆盖其他条目，不发布可误作成功的转换结果，也不为绕过冲突建立重复运行期品种

#### Scenario: Records mix both migration generations

- **WHEN** 临时背包或已选定的旧袋记录同时包含原实体路径、归并前虚拟路径及规范路径
- **THEN** 它们都恢复为对应规范品种，各记录原数量和有效属性保留，无关字段不变，已有规范路径不重复转换

#### Scenario: Deployment is rolled back

- **WHEN** 已切换路径和记录的版本需要回退
- **THEN** 按对应代码与记录备份回退，不把仅撤销代码宣称为完整恢复

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

### Requirement: Hand equipment distribution and records survive canonicalization

手部装备迁移 SHALL 保持原 NPC 领取口令、各自资格、持有检查、库存、冷却及奖励分布；相同奖励的重复条目用于概率权重时 MUST NOT 因品种归并而去重。现有统一离线预览与转换 SHALL 同时覆盖服装、鞋靴、头饰和手部装备，保持旧路径到规范路径的恢复、原数量与价格、无关字段、幂等、冲突拒绝及原始备份；存取资格不因新路径放宽。

#### Scenario: Two suppliers hand out the same varieties under different rules

- **WHEN** 玩家向武修文或道相领取皮手套、铁指套
- **THEN** 均得到对应规范品种，分别保持原门槛、持有判断和共享库存，不给武修文新增道相的门派限制，其他护具分支不受影响

#### Scenario: An existing weighted reward pool is migrated

- **WHEN** 打铁僧在原条件下发放铁手掌
- **THEN** 普通品种与研读品种仍保持原 9:1 权重，原冷却、身上及地上持有判断和库存恢复不变

#### Scenario: Four item families appear in one backup

- **WHEN** 临时玩家、商店或已明确选择的旧袋记录混用四类旧路径与新规范路径
- **THEN** 同一次预览和转换保持各品种及数量，同品同价商店库存合计，价格冲突整批拒绝；未选物品和字段不变，原字节可恢复，再次转换零变更

### Requirement: Commerce conserves quantity and payment

购买数量、收费及商品售价 SHALL 为合法正整数；无效输入 MUST 在钱、物或库存变化前拒绝。NPC 商店、玩家商铺及摆摊 SHALL 使用一致的堆叠基本单位；创建时的默认数量 MUST NOT 增加成交或取回数量。

#### Scenario: Invalid payment or quantity
- **WHEN** 玩家输入零、负数或溢出数量/售价，或公共付款函数收到非正费用
- **THEN** 操作失败且资产与库存不变，不除零、不反向付款

#### Scenario: A stack has a default quantity above one
- **WHEN** 默认生成 50 颗的铁莲子上架一颗，再取回或被购买
- **THEN** 成交/取回恰好一颗，双方库存与持有总量守恒

### Requirement: Storage failure leaves assets intact

背包 SHALL 在拆分物品前检查准入；拒收或交付失败 MUST 保留原数量与记录且不留下不可取回的临时物。成功存取 SHALL 支持合法 `.c`、`.lpc` 实体物品和既有获准虚拟品种，保留原食物、临时状态等禁存边界。

#### Scenario: Rejected partial deposit
- **WHEN** 玩家尝试存入部分黄金、食物或带禁存状态的堆叠物
- **THEN** 明确拒绝，原物品数量不变，背包不增加记录

#### Scenario: Overweight withdrawal
- **WHEN** 玩家取出堆叠物时超重导致交付失败
- **THEN** 原背包数量保持，玩家收到失败反馈，不虚报成功或遗失物品

#### Scenario: A normal LPC book is stored
- **WHEN** 合法的 `.lpc` 枪法入门被存入后取出
- **THEN** 操作成功且品种数量不变，不放宽其他禁存规则

### Requirement: Container placement conserves stack quantity

普通容器放入 SHALL 在拆分前验证容器和物品准入；拒收、创建候选失败或移动失败 SHALL 保留玩家原有数量，MUST NOT 留下不可取回的无环境临时物或额外副本。成功放入及合并 SHALL 恰好转移请求数量；全量放入与批量放入继续遵守原准入规则，不放宽仓库或背包限制。

#### Scenario: A partial stack targets a non-container

- **WHEN** 玩家持有多枚钱币，尝试把其中一枚放进普通衣物
- **THEN** 操作明确拒绝，玩家持有总量不变，不创建遗留的无环境钱币

#### Scenario: A partial stack is refused by an existing rule

- **WHEN** 目标是专用仓库入口、容器件数已满，或待放物品禁止放入
- **THEN** 给出原用途的提示或拒绝，原数量和目标内容均不变

#### Scenario: Movement fails after validation

- **WHEN** 准入检查通过，但容器负重不足或物品移动返回失败
- **THEN** 本次拆分不造成数量损失，目标不增加数量，玩家可继续使用原有全部物品

#### Scenario: A partial stack is placed successfully

- **WHEN** 玩家把五件堆叠物中的两件放入合法容器，可能与其中已有同类物合并
- **THEN** 玩家剩三件、容器净增两件，合并不会造成重复创建或错误补偿

#### Scenario: Whole-stack and bulk placement still work

- **WHEN** 玩家放入整个堆叠，或批量放入多件物品
- **THEN** 每件物品独立按既有资格处理，成功数量与实际转移一致，拒绝项仍由玩家持有
