# 武器分类核对记录

2026-10-07，对当前工作树作静态核对；未运行游戏、读取正式存档或完成迁移验收。CodeGraph 用于定位，未收录的 `.lpc` 直接读取源码确认。此表记录首批明确问题和已发现的关联例外，不声称全库所有武器已逐一审定。

## 已确认的问题与首批去向

| 当前对象或武学 | 源码现状 | 本批目标 |
| --- | --- | --- |
| `inherit/weapon/fork.c`、`_fork.c`、`include/weapon.h` | `fork` 类使用刺击动作、POINTED 标志，仍名为叉类 | 使用 SPEAR、F_SPEAR、init_spear 和基本枪法；不保留 FORK 兼容入口 |
| `d/items/fork/gangcha` | 唯一普通叉品种，独立 fork 数据表 | 迁到 `d/items/spear/gangcha`；仍称钢叉，原输入别名 `fork` 是物品别名，不是旧类型兼容 |
| `d/items/club/bintie_qiang` | 镔铁长枪归棍类，damage 10、weight 15000 | 迁到 `d/items/spear/bintie_qiang` |
| `clone/weapon/changqiang.c`、`b/yitian/npc/obj/spear.c` | 实体长枪继承 CLUB | 改为 SPEAR；实体路径本身不含错误类别，无须为改类顺带数据化 |
| `d/items/club/fangtian_ji` | 描述为方天画戟，使用棍类 | 归入本游戏枪系长兵器，迁到 `d/items/spear/fangtian_ji`；保留戟的名称和形象 |
| `kungfu/skill/zhongping-qiang.c`、`zhongping-qiang/ding.c` | 学习、练习、武器检查、有效等级及激发依赖 club | 改为 spear，保留无关学习条件、消耗和绝招授权 |
| `d/items/hammer/kaishan_fu`、`yufu` | 开山斧、玉斧在锤表中 | 分别迁到 `d/items/axe/kaishan_fu`、`yufu` |
| `clone/lonely/poyangfu.c`、`huangjinfu.c` | 破阳神斧、黄金斧继承 HAMMER，命中回调也查 hammer | 改为 AXE 及对应查询；保留单例、藏书与原特殊回调 |
| `pangen-cuojiefu`、`pangu-qishi`、`leiting-fu` 及绝招 | 三种斧法依赖 hammer | 改为 axe；不是把整个 hammer 体系改名 |
| `cmds/skill/enable.c` | 显式技能表有 club、hammer，缺少 spear、axe | 补齐新枪类及现有斧类的可用登记、显示与帮助 |

`feature/user_storage.c` 显式允许 `/d/items/fork` 的有效品种，需随入口改成枪类，不放宽任意虚拟路径。`cmds/skill/checkskill.c` 已列枪法，不代表基本枪法已完整实现。

## 已定位的关联使用者

- 中平枪法：`b/yitian/npc/bing2.c`、`d/tulong/yitian/npc/bing2.c`、`d/lingzhou/npc/hao.c`、`shiwushi.c`、`d/xiangyang/npc/menggubing.c`、`d/guiyun/npc/quanjinfa.c`。
- 仅持普通长枪并设基本棍法：两处倚天兵丁 `bing1.c`、杭州红花会弟子和清兵、黄河及灵州西夏兵等。按持器改 NPC 基本技能，不给普通兵丁凭空增加特殊枪法。
- 开山斧：古笃诚 `kungfu/class/duan/gu.c`、范松 `kungfu/class/riyue/fan.c`；两人的教学白名单、领悟奖励和战斗口令均含 hammer。
- 盘古七式：日月教 `fan/feng/qu/tong/yun/zhao.c`，屠龙场景 `b/tulong/npc/chang.c`、`guo.c`。风雷堂等角色还会金猿棍法，不能把其全部 club 技能替换或删除。
- 黄金斧有藏书交互；破阳神斧有独占取得和命中效果。这些专用对象不参加普通品种合并。
- `feature/skill.c` 的激发查询直接返回存储的映射；`combatd.c`、`perform.c` 有消费点。旧映射不转换不等于仍可将枪法作为棍法使用，须验证当前适用性而不写回存档。

## 不能机械改类的例外

| 对象 | 已核实事实 | 处置原则 |
| --- | --- | --- |
| 全金发、杆秤 | NPC 持杆秤，激发中平枪法；杆秤描述只有称量货物用途 | 不因 NPC 使用枪法就把所有杆秤认作枪。实施时核对这种专用持器的实际招式，记录明确处置，不能留成枪法与持器互相拒绝的半成品 |
| 常金鹏、西瓜锤 | 武器为一对钢链连接的钢制西瓜，NPC 却调用盘古七式 | 保留西瓜锤的特色，不把它更名成斧；须显式处理原来错配的激发与战斗调用，不为兼容而放宽全部斧法 |
| 童百熊铜锤、赵鹤雷震挡 | 盘古七式使用者持的并非已确认斧类物品 | 按各自兵器与武学用途核对，处置决定进入实施清单；不机械换成开山斧或删除特色武器 |
| `jinhuoqiang`、`huoqiang` | 金火枪在锤表，荷兰火枪在杖表 | 火器不等于长枪，本批不创建火器系统，不随“枪”字替换 |
| `liuxing-chui` | 特殊武学实际激发 whip | 柔性兵器不能仅按名称中的“锤”改成 hammer |
| `sunze-youfu`、`yunzhou-fufa` | 分别是损则有孚掌法、云帚拂法 | 拼音 fu 不是斧类证据，不改类 |
| `duanyun-fu` | 已正确使用 axe | 作为斧类回归对照，不重复迁移 |
| 打狗棒、伏魔杖、金猿棍 | 分属 STAFF 与 CLUB 武学 | 保留两套体系，不按“棒”字统一类别 |

具体例外涉及更换武学、删除可用绝招等额外玩法取舍时，实施前提交明确建议确认；这不妨碍先完成已确认的枪、叉、斧接口和正常使用链。

## 同名品种的细微差异

本轮用户另行授权核对已迁移普通武器数据，不再要求全部历史数值逐字相等才可合并。核对范围是 `d/items/` 的武器数据表及其实际调用，不顺带数据化 `/clone` 或调整防具。

已发现的具体候选：`axe_data.h` 中 `dabanfu` 与 `dabanfu2` 均叫大板斧，重量 6000、双手标志、材质、描述和持用文案相同，但 damage 分别为 25/35、value 为 1100/500。这是需要核对取得方式、定价和用途的候选，不凭此两项数值就宣称已可合并；与名称为板斧的 `banfu` 也不能仅因部分属性相同一并合并。

实施清单按“原 ID/路径—实际差异—调用及用途—保留或合并理由—目标 ID—目标值”记录。判断依据是是否表达必要的设计差异，不设自动百分比阈值，也不一律取最高值。每个合并组先选合理代表版本，必要微调逐字段列明；特殊身份、门派加成、装备档次和独有行为仍保留。

## 验证边界

玩家技能不复制、删除或转换；不读写正式存档。旧物品路径统一记录去向，但映射表不是运行期重定向，也不代表旧仓库、商店或 NPC 装备记录已处理。历史物品迁移快照保持原样，新回归以显式的分类与归并差异清单比较。
