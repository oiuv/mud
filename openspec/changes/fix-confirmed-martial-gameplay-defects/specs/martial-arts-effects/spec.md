# Spec Delta

## ADDED Requirements

### Requirement: Corrected martial paths preserve intended skill contributions

已确认错拼技能、属性或伤害字段的路径 SHALL 使用对应真实数值，修复不改变无关公式、倍率、门槛和合法随机范围。共享动作 SHALL 按当前施招者计算；招式候选 MUST 满足原有等级比较语义，不因数组倒序或长度错误遗漏合法招式或提前解锁。

#### Scenario: Correct skill affects its intended contribution
- **WHEN** 其余配置相同的角色只改变真实吹箫技法或其他已修复错拼技能的等级
- **THEN** 对应技能贡献进入原公式，不依赖人为构造的错误技能记录

#### Scenario: Skill loading and level boundaries
- **WHEN** 无当前玩家加载技能，随后不同等级角色交替调用普通动作
- **THEN** 不报错、不沿用首次加载者数值，每次候选均符合该招原等级条件且合法末项可被选择

### Requirement: Corrected effects clean up their exact contribution

已修复的强化、阵法、恢复和控制 SHALL 撤回本次实际施加的状态与数值，保留其他独立效果；失败分支 MUST NOT 撤回未曾施加的增益。离战、离队、移动、资源不足及正常到期 SHALL 按原设计退出，不遗留阻止再次正常使用的标记。

#### Scenario: Failed enhancement and overlapping effects
- **WHEN** 强化判定失败，或角色在已有独立增益时结束本次强化
- **THEN** 失败不凭空降低属性；结束仅移除本次增量，原独立增益保持

#### Scenario: Formation or movement effect ends early
- **WHEN** 角色离开阵法、退出队伍或在防御回调前结束战斗
- **THEN** 对应效果与活动标记一致退出，随后满足条件时可再次正常使用

### Requirement: Corrected martial costs and target restrictions are effective

已修复的练习与招式 SHALL 检查其实际消耗资源、正确目标及实际持器；不足完整必要费用时不得产生相应效果或负资源。范围攻击 SHALL 保留明确的死亡保护约束，不以不存在的接口导致所有玩家免疫；既有伤害、随机与反噬规则保持。

#### Scenario: Resource and last ammunition boundaries
- **WHEN** 资源分别低于、等于和高于本次完整成本，或最后一枚暗器遇到第二次施展
- **THEN** 不足时拒绝相应动作，不透支、不重复扣不存在的弹药；足额时按原费用与效果结算

#### Scenario: Player target protection is checked correctly
- **WHEN** 碧云神吼作用于符合条件且无保护的玩家、有保护的玩家及普通 NPC
- **THEN** 无保护目标可按原判定受影响，有保护玩家遵守原保护规则，NPC 路径不被错误的玩家检查阻断

#### Scenario: Iron zither respects death protection
- **WHEN** 铁筝曲作用于有护命保护与无保护的同条件目标
- **THEN** 保护者不因此受伤或进入交战；无保护者按原公式处理

#### Scenario: Intentional one-way secret room
- **WHEN** 从明教9号甬道操作北石门并进入密室
- **THEN** 门状态与操作相符，不受首载顺序干扰，密室南行仍回0号甬道且不改变0号北门
