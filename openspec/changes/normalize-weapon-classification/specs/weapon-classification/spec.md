# 武器分类规范化

## Purpose

让武器的实际形制、战斗类别、品种身份和可用武学形成一致的游戏规则，纠正历史错类并提供完整的基本枪法学习与使用链，同时保留独立棍杖体系和既有玩家修为，不依靠旧路径或跨类兼容掩盖不规范。

## ADDED Requirements

### Requirement: Weapon classification reflects actual use

系统 SHALL 以武器形制、实际用法及所属武学体系判断类别。枪、叉及核定的枪系长兵器 SHALL 使用统一枪类；实际斧类 SHALL 归斧类，不以历史继承错误作为保留理由。斧类动作及伤害类型 SHALL 体现利器劈砍，实际锤类 SHALL 保持钝击语义，不因此另建伤害机制或修改无关数值。仅名称相似 MUST NOT 导致无关武器或武学改类；特殊持器与武学矛盾 SHALL 明确核对处置，不以全局跨类放行绕过。

#### Scenario: A spear and an axe are classified correctly

- **WHEN** 玩家装备本批镔铁长枪或开山斧
- **THEN** 分别按枪、斧显示和使用对应基本技能，普通攻击与类别相符，不再按棍、锤结算其类别

#### Scenario: A fork retains its appearance

- **WHEN** 玩家取得归入枪类的钢叉
- **THEN** 钢叉仍使用原物品名称和输入别名，但使用枪类技能，而非另设可激发的叉类

#### Scenario: A similar name does not prove the same category

- **WHEN** 核对火枪、流星锤或名称拼音中含 fu 的武学
- **THEN** 依据实际能力和用途判断，不把火器当长枪、软兵器当普通锤，或把掌法和拂法当斧法

### Requirement: Correct categories have canonical item paths

获准改类的普通品种 SHALL 将数据、正式路径及全部实际调用一起迁至正确类别。被替代入口 MUST NOT 保留为转发、旧类别数据副本或混合类别分派。每个有效规范入口 SHALL 正确支持蓝图查询、独立实例及同品种重建；已删除或未知入口 SHALL 拒绝创建，不能默默替换为其他品种。

#### Scenario: A former club variety is requested as a spear

- **WHEN** 调用方使用新的枪类品种路径创建镔铁长枪
- **THEN** 获得正确枪类物品及规范身份；原棍类路径不再是有效入口

#### Scenario: New canonical items are stored

- **WHEN** 本批新路径物品符合原存放资格并被存取
- **THEN** 通过规范路径恢复对应物品，不因其虚拟身份拒绝，也不放开未授权的任意对象路径

### Requirement: Specialized martial arts use matching basic skills

中平枪法及圣骑士戟武学 SHALL 使用基本枪法；盘根错节斧、盘古七式、雷霆斧法 SHALL 使用基本斧法。学习、练习、激发、普通攻击、招架适用性、绝招及相关特殊武器效果 SHALL 对类别一致，不继续接受旧错类激发。除明确分类和归并清单外，原贡献、内力、领悟授权、消耗和独有交互 SHALL 保持。

#### Scenario: A player uses a spear art with a spear

- **WHEN** 玩家主动学会基本枪法、满足原其他条件并按枪类激发中平枪法
- **THEN** 能以合适枪类武器练习、战斗及使用已领悟的绝招；持普通棍不能绕过枪类持器要求

#### Scenario: A lance challenger uses the matching discipline

- **WHEN** 英国挑战者持圣骑士戟进入战斗
- **THEN** 使用枪类基础技能与圣骑士戟武学，原主动绝招通过对应枪类入口执行；等级缩放及其他挑战能力不变

#### Scenario: A unique axe keeps its special function

- **WHEN** 破阳神斧或黄金斧按正确斧类武学使用
- **THEN** 原命中效果和既有独占、藏书行为仍可触发，类别检查不再依赖基本锤法

### Requirement: Hammer wielders share a dedicated hammer art

系统 SHALL 提供共用的撼山锤法 `hanshan-chuifa`，支持 `hammer` 与 `parry`，并具有可用的学习、练习、普通攻击及绝招实现。常金鹏、童百熊、赵鹤 SHALL 分别保留西瓜锤、铜锤、雷震挡及其锤类身份，以撼山锤法替换原盘古七式配置，同步招架、战斗调用与既有教学入口，保留 NPC 原等级及无关门槛。三人 MUST NOT 分别拥有重复实现；撼山锤法 MUST NOT 接受斧类持器，盘古七式 MUST NOT 为这三人保留锤系兼容。锤法招式与伤害 SHALL 体现钝击，而非将锤描述为有刃斧类。

#### Scenario: The three hammer wielders fight normally

- **WHEN** 分别创建常金鹏、童百熊、赵鹤并使用原锤类武器战斗
- **THEN** 三人以原等级的基本锤法和撼山锤法正常攻击、招架及调用对应绝招，不再调用盘古七式的锤系绝招，也不因分类调整获得更高等级

#### Scenario: A qualified player learns the new hammer art

- **WHEN** 玩家满足原教学资格，通过本次调整的既有师父入口学习撼山锤法及取得其绝招
- **THEN** 教学白名单和相关传授逻辑接受新锤法，满足条件后可持锤练习、激发与施展绝招；贡献、身份等无关门槛不变

#### Scenario: Axes and hammers cannot bypass their art requirements

- **WHEN** 角色尝试把撼山锤法激发为斧法、持斧练习或施展其绝招，或对盘古七式进行对应的锤系尝试
- **THEN** 系统拒绝不匹配的激发、练习和绝招；按各自正确类别使用时正常生效

### Requirement: Teachers and NPCs support their actual weapon arts

教授枪法的师父 SHALL 提供可正常学习的基本枪法；只有枪系用途的原基本棍法 SHALL 替换为基本枪法，同时教授实际棍系武学的 SHALL 保留棍法并提供枪法。斧法教学 SHALL 同样与正确基本技能一致。NPC 的持器、基础技能、特殊激发和战斗调用 SHALL 相互匹配，不凭此提高原等级。除已确认的三名持锤 NPC 以撼山锤法替换盘古七式、全金发以采燕功替换中平枪法外，MUST NOT 额外给予未有的特殊武学；没有教学能力的 NPC MUST NOT 因本次替换获得教学能力。

全金发 SHALL 保留钢制杆秤的棍类身份与原属性，保持 65 级基本棍法，以 65 级采燕功用于棍法和招架。其原轻功、内功、徒手及其他配置 SHALL 保持，MUST NOT 因此次替换增加主动绝招、绝招传授或改造采燕功本身；正常教学使用既有师父机制和采燕功条件。

#### Scenario: A spear-only teacher is updated

- **WHEN** 玩家按原资格向只教授枪系武学的师父学习基本功
- **THEN** 可学习基本枪法，原教学入口不再以基本棍法充当枪法前置

#### Scenario: A teacher has genuine club arts too

- **WHEN** 同一师父既教枪法又教真正棍法
- **THEN** 两种基本技能各自可学，枪类调整不删除棍系学习入口

#### Scenario: An ordinary spear guard fights

- **WHEN** 原仅掌握基本棍法并持长枪的普通兵丁使用调整后的武器
- **THEN** 使用对应等级的基本枪法正常战斗，不凭分类修正获得额外特殊枪法或无法执行的战斗指令

#### Scenario: Quan Jinfa keeps his steel balance as a club

- **WHEN** 全金发持原杆秤战斗，或符合条件的玩家通过既有教学入口学习
- **THEN** 棍法与招架使用 65 级采燕功，原中平枪法配置被替换；杆秤不改为枪、不换路径，原轻功激发及其他能力保持，教学不另设额外资格或绝招奖励

### Requirement: Basic spear learning is publicly accessible

系统 SHALL 提供陈有德的基本枪法教学及《枪法入门》秘籍两种公共学习途径。陈有德 SHALL 允许原经验限制之外的老玩家缴纳 500 铜钱，按正常学习机制补学基本枪法至 80 级；此项资格 MUST NOT 解锁其他基本功，原新手教学及其他规则 SHALL 保持。秘籍 SHALL 沿用既有 BOOK、买卖和研读机制，其基础价值、经验要求、精神消耗参数、难度和等级配置 SHALL 与现有基本武功入门秘籍一致，不另建研读系统、不绕过正常学习条件，也不自动授予特殊武学或绝招。

#### Scenario: An experienced player learns basic spear from Chen

- **WHEN** 实战经验已达到 3500、基本枪法不足 80 级的玩家向陈有德缴纳 500 铜钱，并满足正常学习条件
- **THEN** 可学习基本枪法至陈有德的 80 级教学上限；仅有这项缴费资格不能向他学习其他基本功，玩家原有技能与领悟记录不被转换

#### Scenario: Existing teaching rules remain intact

- **WHEN** 新手按原方式缴费学习，或老玩家仅凭枪法补学资格请求学习其他基本功
- **THEN** 新手原教学行为保持，老玩家的其他请求不因枪法补学而获准；未缴费或费用不足不能获得新的补学资格

#### Scenario: A player buys and studies the introductory spear book

- **WHEN** 玩家从陈有德的五本初始备货中购买《枪法入门》，并满足既有识字、经验、精神和研读场所等条件
- **THEN** 通过原现货买卖规则付款并取得书籍，通过 `study` 提升基本枪法；书籍基础价值为 200、经验要求为 1000、精神消耗参数与难度均为 20、`max_skill` 为 19，实际消耗及等级判断沿用原研读机制

#### Scenario: A book does not bypass study requirements

- **WHEN** 玩家不满足《枪法入门》的既有研读条件，或已有基本枪法超过该书的等级配置
- **THEN** 研读按原规则拒绝，不以新枪类为由放宽条件，不改变其他秘籍或自动授予特殊枪法、绝招

### Requirement: Existing player skills are not migrated

本轮 MUST NOT 转换、删除或补偿玩家既有基本技能、熟练度、特殊武学、激发或绝招领悟记录，不进行登录自动迁移，也不自动赠送撼山锤法及绝招。玩家 SHALL 自行学习所需的基本武功或新锤法并主动按正确类别激发。系统 SHALL 在使用激发时遵守当前适用类别，但 MUST NOT 借校验写改旧记录或为旧错类激发提供兼容效果。

#### Scenario: An existing club practitioner logs in

- **WHEN** 已有棍法修为的玩家在更新后登录
- **THEN** 棍法等级及熟练度保持，不自动获得枪法；真正棍系武学仍可正常使用

#### Scenario: A saved mapping refers to a previous category

- **WHEN** 旧激发记录仍将中平枪法用于棍类，玩家尚未重新学习和激发
- **THEN** 原记录不被转换或删除，但不据此获得枪法的棍类攻击、有效等级加成或绝招；主动改正后可正常使用

#### Scenario: An existing Pangu practitioner logs in

- **WHEN** 已有基本锤法、盘古七式及其绝招领悟记录的玩家在更新后登录
- **THEN** 原技能、熟练度、激发和领悟记录保持，不自动获得撼山锤法或新绝招；旧锤系激发不能绕过盘古七式的新类别要求

### Requirement: Club and staff remain independent disciplines

棍与杖 SHALL 保持独立基本技能、武器类别和专属武学。本次 MUST NOT 合并它们或引入未经设计的强弱差异；后续新增武学 SHALL 依据实际用法和体系选类，不因底层机制相近随意归类。

#### Scenario: Existing club and staff arts are used

- **WHEN** 角色按原方式使用金猿棍法、打狗棒法或伏魔杖法
- **THEN** 各自原类别、学习与使用链保持，不因枪类规范化被统一或迁移

### Requirement: Delivery distinguishes code validation from saved item compatibility

交付 SHALL 公开分类、合并及删除路径的变化，并提供玩家重新学习说明。旧物品持久引用可能受影响时 SHALL 明示风险；未经授权 MUST NOT 读取、转换、删除正式存档或以运行期别名隐藏影响。代码及新路径测试通过 MUST NOT 被宣称为旧物品存档无损升级。

#### Scenario: A removed path may remain in a warehouse record

- **WHEN** 本批报告包含已删除的旧物品路径，但正式仓库记录未检查或转换
- **THEN** 报告明确旧引用可能无法恢复、存量处置须另行确定，不声称直接更新即可兼容，也不自动丢弃旧物品
