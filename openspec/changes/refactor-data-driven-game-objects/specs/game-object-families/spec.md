# 游戏对象分类复用

## Purpose

明确各类对象在局部复用时必须保留的玩法与接入边界，让已有公共行为得到利用，同时允许不适合简化的对象保持原样；不以统一文件形式或迁移数量作为完成目标。

## ADDED Requirements

### Requirement: Selected varieties retain their gameplay properties

获准改造的品种 SHALL 保持名称、颜色、别名、描述、数值、材质、初始化顺序及衍生行为。不同行为或数值的对象 MUST NOT 因名称相同被合并。

#### Scenario: The five Beijing swords are evaluated or simplified

- **WHEN** 评估或局部简化北京五把普通剑
- **THEN** 原始属性作为对照基线，包括 gold 材质与其衍生稳定性；不强制合并程序，也不顺带改平衡

### Requirement: Families retain specialized behavior

每个获准改造的类别 SHALL 保留其原有行为与状态：装备限制、食品消耗、饮具液体、书籍研读、药物冷却、动物掉落、NPC 角色回调及随机生成等。特殊对象 SHALL 可以继续保留自己的 LPC 实现，不强制塞入通用数据表达。

#### Scenario: A food item also acts as a weapon

- **WHEN** 某食品同时可装备且吃完会变成另一种物体
- **THEN** 保留复合行为；不能等价简化就保持原代码

#### Scenario: Medicines already share a parent

- **WHEN** 复核已共用药力与冷却代码的一组药品
- **THEN** 继续复用现成行为，仅在确有维护收益时提取剩余重复，不统一不同药效或新增效果解释器

### Requirement: Existing business identities are preserved

公告板、任务物、容器和生成角色 SHALL 保持原有业务身份、持久内容、归属、权限及生命周期；局部参数化 MUST NOT 将它们替换成统一物品身份。

#### Scenario: A bulletin board needs more than a new constructor

- **WHEN** 共用程序会要求改动公告板原有加载、移动或历史留言恢复机制
- **THEN** 本次保留原板程序，不为合并文件扩展其生命周期

### Requirement: Partial adoption does not require global conversion

每批 SHALL 能在未改造对象继续运行的条件下独立接入。传统地图、唯一物、自制物、货币、复杂剧情/技能/任务及未选类别 SHALL 保持现状；游戏侧复用 MUST NOT 要求 mudcore 或 FluffOS 接入本游戏数据、外部服务或改变 efun 契约。

#### Scenario: Only one local family is simplified

- **WHEN** 一个经过验收的小组完成局部复用
- **THEN** 其他物品、NPC、命令、地图和框架无需同步改造即可继续使用原接口
