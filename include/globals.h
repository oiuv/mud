// globals.h
// this file will be automatically included by the driver

#ifndef GLOBALS_H
#define GLOBALS_H

#ifndef __SENSIBLE_MODIFIERS__
#define protected static
#define nosave static
#endif

// Important directories
#define BACKUP_DIR      "/backup/"
#define COMMAND_DIR     "/cmds/"
#define CONFIG_DIR      "/adm/etc/"
#define DATA_DIR        "/data/"
#define DUMP_DIR        "/dump/"
#define EVENT_DIR       "/adm/daemons/event/"
#define HELP_DIR        "/help/"
#define INC_DIR         "/include/"
#define ITEM_DIR        DATA_DIR "item/"
#define LOG_DIR         "/log/"
#define QUEST_DIR       "/adm/daemons/quest/"
#define	SHADOW_DIR      "/shadow/"
#define SHOP_DIR        "/clone/shop/"
#define STORY_DIR       "/adm/daemons/story/"
#define TEMP_DIR        "/temp/"

// Daemons
#define ALIAS_D         "/adm/daemons/aliasd"
#define BAN_D           "/adm/daemons/band"
#define BACKUP_D        "/adm/daemons/backupd"
#define CHANNEL_D       "/adm/daemons/channeld"
#define CHAR_D          "/adm/daemons/chard"
#define CHINESE_D       "/adm/daemons/chinesed"
#define CLOSE_D         "/adm/daemons/closed"
#define COMBAT_D        "/adm/daemons/combatd"
#define COMMAND_D       "/adm/daemons/commandd"
#define CONFIG_D        "/adm/daemons/configd"
#define CPU_D           "/adm/daemons/cpud"
#define DBASE_D         "/adm/daemons/dbased"
#define EMOTE_D         "/adm/daemons/emoted"
#define EVENT_D         "/adm/daemons/eventd"
#define EXAMINE_D       "/adm/daemons/examined"
#define FAMILY_D        "/adm/daemons/familyd"
#define FINGER_D        "/adm/daemons/fingerd"
#define FTP_D           "/adm/daemons/ftpd"
#define GIFT_D          "/adm/daemons/giftd"
#define INQUIRY_D       "/adm/daemons/inquiryd"
#define ITEM_D          "/adm/daemons/itemd"
#define LEAGUE_D        "/adm/daemons/leagued"
#define LOGIN_D         "/adm/daemons/logind"
#define ENCHASE_D       "/adm/daemons/enchased"
#define MAP_D           "/adm/daemons/mapd"
#define MASTER_D        "/adm/daemons/masterd"
#define MESSAGE_D       "/adm/daemons/network/messaged"
#define MONEY_D         "/adm/daemons/moneyd"
#define NAME_D          "/adm/daemons/named"
#define NATURE_D        "/adm/daemons/natured"
#define NEWS_D          "/adm/daemons/newsd"
#define NPC_D           "/adm/daemons/npcd"
#define PIG_D           "/adm/daemons/pigd"
#define PK_D            "/adm/daemons/pkd"
#define PROFILE_D       "/adm/daemons/profiled"
#define QUEST_D         "/adm/daemons/questd"
#define RANK_D          "/adm/daemons/rankd"
#define SECURITY_D      "/adm/daemons/securityd"
#define SHOP_D          "/adm/daemons/shopd"
#define STORY_D         "/adm/daemons/storyd"
#define ULTRA_D         "/adm/daemons/ultra_questd"
#define UPDATE_D        "/adm/daemons/updated"
#define VERSION_D       "/adm/daemons/versiond"
#define VIRTUAL_D       "/adm/daemons/virtuald"
#define VRM_SERVER      "/adm/daemons/vrm_server"
#define WEAPON_D        "/adm/daemons/weapond"
#define IP_D            "/adm/daemons/ipd"
#define TASK_D          "/adm/daemons/taskd"
// #define RZR_NPCD        "/adm/daemons/rzr_d"
// #define TIME_D          "/adm/daemons/timed"
// #define MAIL_D          "/adm/daemons/maild"
#define CLASS_D(x)      ("/kungfu/class/" + x)
#define CONDITION_D(x)  ("/kungfu/condition/" + x)
#define SKILL_D(x)      ("/kungfu/skill/" + x)
#define SPECIAL_D(x)    ("/kungfu/special/" + x)

// Clonable/Non-inheritable Standard Objects
#define COIN_OB         "/clone/money/coin"
#define CORPSE_OB       "/clone/misc/corpse"
#define GOLD_OB         "/clone/money/gold"
#define CASH_OB         "/clone/money/cash"
#define LOGIN_OB        "/clone/user/login"
#define MASTER_OB       "/adm/single/master"
#define MAILBOX_OB      "/clone/misc/mailbox"
#define SILVER_OB       "/clone/money/silver"
#define SIMUL_EFUN_OB   "/adm/single/simul_efun"
#define TEMP_OB         "/clone/misc/temp"
#define USER_OB         "/clone/user/user"
#define VOID_OB         "/clone/misc/void"

// Inheritable Standard Objects
#define BOOK            "/inherit/item/book"
#define BANK            "/inherit/room/bank"
#define BUILD_ROOM      "/inherit/room/buildroom"
#define BULLETIN_BOARD  "/inherit/misc/bboard"
#define CHALLENGER      "/inherit/char/challenger"
#define CHARACTER       "/inherit/char/char"
#define COMBINED_ITEM   "/inherit/item/combined"
#define EQUIP           "/inherit/misc/equip"
#define FIGHTER         "/inherit/char/fighter"
#define FORCE           "/inherit/skill/force"
#define HOCKSHOP        "/inherit/room/hockshop"
#define ILLNESS         "/inherit/condition/illness"
#define ITEM            "/inherit/item/item"
#define KNOWER          "/inherit/char/knower"
#define LIQUID          "/inherit/food/liquid"
#define MONEY           "/inherit/item/money"
#define NPC             "/inherit/char/npc"
#define	PIG_ROOM	    "/inherit/room/pigroom"
#define PILL            "/inherit/medicine/pill"
#define POISON          "/inherit/condition/poison"
#define POISON_INSECT   "/inherit/char/insect"
#define POWDER          "/inherit/medicine/powder"
#define PRIVATE_ROOM    "/inherit/room/privateroom"
#define QUARRY          "/inherit/char/quarry"
#define ROOM            "/inherit/room/room"
#define VRM             "/inherit/room/vrm"
#define RIVER           "/inherit/room/river"
#define SHAOLIN_SKILL   "/inherit/skill/shaolin"
#define SHOP            "/inherit/room/shop"
#define SKILL           "/inherit/skill/skill"
#define WAITER          "/inherit/char/waiter"
#define WORM            "/inherit/char/worm"
#define SNAKE           "/inherit/char/snake"

// User IDs
#define ROOT_UID        "Root"
#define BACKBONE_UID    "Backbone"

// Features
#define F_ACTION        "/feature/action.c"
#define F_ALIAS         "/feature/alias.c"
#define F_APPRENTICE    "/feature/apprentice.c"
#define F_ATTACK        "/feature/attack.c"
#define F_ATTRIBUTE     "/feature/attribute.c"
#define F_AUTOLOAD      "/feature/autoload.c"
#define F_BANKER        "/feature/banker.c"
#define F_CLEAN_UP      "/feature/clean_up.c"
#define F_COAGENT       "/feature/coagent.c"
#define F_COMMAND       "/feature/command.c"
#define F_CONDITION     "/feature/condition.c"
#define F_CUTABLE       "/feature/cutable.c"
#define F_DAMAGE        "/feature/damage.c"
#define F_DBASE         "/feature/dbase.c"
#define F_DEALER        "/feature/dealer.c"
#define F_EDIT          "/feature/edit.c"
#define F_EQUIP         "/feature/equip.c"
#define F_FINANCE       "/feature/finance.c"
#define F_FOOD          "/feature/food.c"
#define F_GUARDER       "/feature/guarder.c"
#define F_ITEMMAKE      "/feature/itemmake.c"
#define F_LIQUID        "/feature/liquid.c"
#define F_MASTER        "/feature/master.c"
#define F_MESSAGE       "/feature/message.c"
#define F_MORE          "/feature/more.c"
#define F_MOVE          "/feature/move.c"
#define F_NAME          "/feature/name.c"
#define F_NOCLONE       "/feature/noclone.c"
#define F_OBSAVE        "/feature/obsave.c"
#define F_PUNISHER      "/feature/punisher.c"
#define F_QUESTER       "/feature/quester.c"
#define F_SAVE          "/feature/save.c"
#define F_SHADOW        "/feature/shadow.c"
#define F_SHELL         "/feature/shell.c"
#define	F_SILENTDEST	"/feature/silentdest.c"
#define F_SKILL         "/feature/skill.c"
#define F_SSERVER       "/feature/sserver.c"
#define F_TEAM          "/feature/team.c"
#define F_TRANSPORT     "/feature/transport.c"
#define F_TREEMAP       "/feature/treemap.c"
#define F_VENDOR        "/feature/dealer.c"
#define F_UNIQUE        "/feature/unique.c"

// music instructment
#define F_XIAO          "/inherit/misc/_xiao.c"

// Others
// How many item does the user can carried, this value will
// affect commands:get steal put give, but there is may be
// some other event cause some object move to user, so in
// fact, the user may carry out.
#define MAX_ITEM_CARRIED        80

// Profiling switches
//
// If you changed any of these defines, you'll need reboot to make it
// in effect.

// Install information
#define INSTALL_COMBAT_TEST     1

#undef PROFILE_COMMANDS

#endif /* GLOBALS_H */
