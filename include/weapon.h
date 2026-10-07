// weapon.h

#ifndef __WEAPON__
#define __WEAPON__

#define DEFAULT_WEAPON_LIMB "右手"

// 武器特性位标记，保存在 flag 属性中；用 | 组合，用 & 检查单项。
// 例如 POINTED | LONG 表示带尖的长兵器；武功类别另由 skill_type 决定。
// 当前 EDGED、POINTED、LONG 仅记录特征，不自动改变伤害类型、伤害值或攻击距离。
#define TWO_HANDED  1 // 需要双手使用，参与装备及手持物品限制。
#define SECONDARY   2 // 可作为副武器，也可作为主武器；匕首默认带此标记。
#define EDGED       4 // 带刃，如刀、剑、斧。
#define POINTED     8 // 带尖，如枪、暗器。
#define LONG       16 // 长兵器，如棍、杖、枪；不代表必须双手使用。

#define AXE      "/inherit/weapon/axe"      // 斧
#define BLADE    "/inherit/weapon/blade"    // 刀
#define CLUB     "/inherit/weapon/club"     // 棍
#define DAGGER   "/inherit/weapon/dagger"   // 短兵（匕首等）
#define HAMMER   "/inherit/weapon/hammer"   // 锤
#define PIN      "/inherit/weapon/pin"      // 针
#define SPEAR    "/inherit/weapon/spear"    // 枪（含叉、戟）
#define STAFF    "/inherit/weapon/staff"    // 杖
#define SWORD    "/inherit/weapon/sword"    // 剑
#define THROWING "/inherit/weapon/throwing" // 暗器
#define WHIP     "/inherit/weapon/whip"     // 鞭
#define XSWORD   "/inherit/weapon/xsword"   // 箫（兼具剑类战斗与吹奏能力）

#define F_AXE      "/inherit/weapon/_axe"
#define F_BLADE    "/inherit/weapon/_blade"
#define F_CLUB     "/inherit/weapon/_club"
#define F_DAGGER   "/inherit/weapon/_dagger"
#define F_HAMMER   "/inherit/weapon/_hammer"
#define F_PIN      "/inherit/weapon/_pin"
#define F_SPEAR    "/inherit/weapon/_spear"
#define F_SWORD    "/inherit/weapon/_sword"
#define F_STAFF    "/inherit/weapon/_staff"
#define F_THROWING "/inherit/weapon/_throwing"
#define F_WHIP     "/inherit/weapon/_whip"

#endif
