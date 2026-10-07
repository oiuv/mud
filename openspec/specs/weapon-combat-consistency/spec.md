# weapon-combat-consistency Specification

## Purpose

保证既有兵器的双手占用、主副手转换、招架碰撞和指定武学资源及临时加成真实一致，避免操作顺序和状态字段错误改变玩法。功能验收与类别强度平衡分开，不通过修复隐式新增兵器被动、双持输出或玩家存档迁移。

## Requirements

### Requirement: Hand occupancy is independent of operation order

系统 SHALL 对装备和手持命令执行一致的双手占用规则：双手武器独占双手；单手主武器最多与一件副武器或一件手持物品共存，同一物品不得重复占位。尝试装备或换持失败时 SHALL 保留原装备、手持物品、属性和可用动作；原耐久、重量及物品资格要求 SHALL 保持。

#### Scenario: A secondary weapon is added after a two-handed weapon

- **WHEN** 角色先持用双手板斧再尝试装备可作副手的匕首，或先装备匕首再尝试持用双手板斧
- **THEN** 两种顺序都拒绝第二件冲突装备，原有装备和属性不变

#### Scenario: Both hands are already occupied

- **WHEN** 角色持有主副两把武器后尝试再拿物品，或装备与手持操作将产生三项占用
- **THEN** 冲突操作失败，不留下三项同时占用的状态

#### Scenario: A legal held item becomes the main weapon

- **WHEN** 角色将手中可用的单手武器转为主武器且无其他冲突
- **THEN** 转换成功，物品不同时作为手持物品和主武器，属性只计算一次

#### Scenario: Changing the held item fails

- **WHEN** 角色已有手持物品，并尝试换为超重或不符合要求的物品
- **THEN** 原手持物品保持，失败候选不占用双手，玩家收到符合游戏语境的失败提示

### Requirement: A valid secondary weapon becomes the main weapon

系统 SHALL 在主武器被正常卸下或通过既有物品生命周期移走后，将仍合法的副武器自动转为主武器，并同步实际加成与武学动作。转持 SHALL 检查物品仍归当前角色、可用资格及双手占用；不合法副武器 SHALL 解除装备而不被销毁或丢弃。副手阶段 MUST NOT 凭此获得属性叠加或额外攻击。

#### Scenario: The player unwields the main sword

- **WHEN** 主手为剑、副手为匕首的角色卸下剑
- **THEN** 匕首自动作为主武器，旧剑加成被扣除，匕首加成生效一次，攻击使用当前合法短兵武学而非徒手

#### Scenario: The main weapon leaves the owner

- **WHEN** 原主武器经正常移动、脱手或销毁流程离开，角色仍有合法副武器
- **THEN** 副武器正常转持，角色不保留原主武器属性，不出现失效装备引用

#### Scenario: Repeated switches preserve property totals

- **WHEN** 两件可作副手的武器反复持用、换位与卸下
- **THEN** 只有当前主武器贡献其武器属性，没有重复增加、重复扣除或递归换位

#### Scenario: The secondary weapon is no longer usable

- **WHEN** 主武器卸下时副武器已损坏到不可用或已不属于该角色
- **THEN** 不强行转持，不阻止主武器卸下，失效装备状态清除且不额外处置物品归属

### Requirement: Parry effects use an explicit attack outcome

攻击后效果 SHALL 能区分实际伤害与闪避、招架、命中结果；默认钝击的兵器碰撞 SHALL 仅在真实招架且双方参与兵器仍有效时按原规则执行。伤害数值 MUST NOT 被当作结果码。原重量、刚性、力量比较、自制兵器保护和暗器数量消耗 SHALL 保持，不扩大到没有该效果的特殊武学。

#### Scenario: A blunt attack is parried by a weapon

- **WHEN** 使用既有默认钝击动作的攻击被对方兵器真实招架，且比较条件达到原脱手或损坏分支
- **THEN** 对应兵器碰撞效果可实际发生，并保持原保护条件

#### Scenario: Zero damage does not imply a parry

- **WHEN** 攻击被闪避，或命中后伤害被降为零或负数但没有发生招架
- **THEN** 不触发仅属于招架的钝击碰撞

#### Scenario: Protected weapons and unrelated actions are used

- **WHEN** 防守兵器满足原自制保护条件，或攻击动作本来没有兵器碰撞效果
- **THEN** 不绕过原保护或强加新效果；已有暗器动作仍按原规则扣除数量

### Requirement: Axe and hammer finishers require enough inner energy

「开天辟地」和「撼山震岳」SHALL 要求当前内力至少 500 才能发动；成功扣 500、自忙 3，失败扣 300、自忙 4。原武学、持器、内功、领悟和伤害条件 SHALL 保持，拒绝发动 MUST NOT 消耗内力、施加忙乱或造成伤害。

#### Scenario: Inner energy is below the maximum cost

- **WHEN** 角色其余条件合格，但当前内力分别为 399、400 或 499
- **THEN** 两种绝招均拒绝发动，原资源和战斗状态不变

#### Scenario: The exact required inner energy is available

- **WHEN** 角色以 500 内力合法发动其中一种绝招
- **THEN** 成功分支剩余 0 内力、失败分支剩余 200 内力，分别保持原忙乱与伤害结果，不产生负内力

### Requirement: Luohan formation effects apply and clear exactly once

罗汉棍阵 SHALL 按原增量公式及上限向双方施加实际可查询的膂力和身法加成，双方处于同一有效组阵状态期间 MUST NOT 重复参与组阵。阵法结束、脱战、离开、失去所需武器或一方消失后，SHALL 撤销该阵加成与状态且不影响其他加成；重复清理 MUST NOT 再次扣减属性。原资格、资源消耗和目标控制时长 SHALL 保持。

#### Scenario: Two qualified partners form the formation

- **WHEN** 双方满足原棍法、持器、共同敌人及资源条件并成功组阵
- **THEN** 双方膂力和身法均增加原公式算出的数值，任一方再次参与组阵被拒绝

#### Scenario: The formation ends while another effect remains

- **WHEN** 组阵后任一方脱战、离开或失去所需武器，且双方还有其他合法属性加成
- **THEN** 本阵增量和状态完整撤销，其他加成保留，再次检查不继续减少属性

#### Scenario: One partner disappears

- **WHEN** 一名搭档对象消失，后续阵法检查执行
- **THEN** 存活对象的本阵增量和状态正确解除，不访问失效对象，不重复扣减
