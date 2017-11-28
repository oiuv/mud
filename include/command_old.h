// command.h

#define ADM_PATH ({"/cmds/adm/", "/cmds/arch/", "/cmds/wiz/", "/cmds/app/", "/cmds/imm/", "/cmds/usr/","/cmds/std/", "/cmds/skill/"})
#define ARC_PATH ({"/cmds/adm/", "/cmds/arch/", "/cmds/wiz/", "/cmds/app/", "/cmds/imm/", "/cmds/usr/","/cmds/std/", "/cmds/skill/"})
#define WIZ_PATH ({"/cmds/adm/", "/cmds/arch/", "/cmds/wiz/", "/cmds/app/", "/cmds/imm/", "/cmds/usr/","/cmds/std/", "/cmds/skill/"})
#define APR_PATH ({"/cmds/adm/", "/cmds/arch/", "/cmds/wiz/", "/cmds/app/", "/cmds/imm/", "/cmds/usr/","/cmds/std/", "/cmds/skill/"})
#define IMM_PATH ({"/cmds/adm/", "/cmds/arch/", "/cmds/wiz/", "/cmds/app/", "/cmds/imm/", "/cmds/usr/","/cmds/std/", "/cmds/skill/"})
#define PLR_PATH ({"/cmds/adm/", "/cmds/arch/", "/cmds/wiz/", "/cmds/app/", "/cmds/imm/", "/cmds/usr/","/cmds/std/", "/cmds/skill/"})
#define UNR_PATH ({"/cmds/usr/", "/cmds/std/"})
#define NPC_PATH ({"/cmds/std/", "/cmds/skill/"})
#define PNE_PATH ({"/cmds/std/", "/cmds/usr/"})

// These are command objects that will also be called in those
// non-player objects.
#define ACCEPT_CMD              "/cmds/std/accept"
#define DAUB_CMD                "/cmds/std/daub"
#define DROP_CMD		"/cmds/std/drop"
#define GET_CMD			"/cmds/std/get"
#define GO_CMD			"/cmds/std/go"
#define	HELP_CMD		"/cmds/usr/help"
#define LOOK_CMD		"/cmds/std/look"
#define QUIT_CMD                "/cmds/usr/quit"
#define REMOVE_CMD		"/cmds/std/remove"
#define REPLY_CMD               "/cmds/std/reply"
#define SKIP_CMD                "/cmds/usr/skip"
#define TELL_CMD		"/cmds/std/tell"
#define UPTIME_CMD		"/cmds/usr/uptime"
#define WEAR_CMD                "/cmds/std/wear"
#define WHO_CMD			"/cmds/usr/who"
#define WIELD_CMD               "/cmds/std/wield"
#define XUE_CMD                 "/cmds/skill/xue"

// wizard command object
#define EXAMINE_CMD             "/cmds/arch/examine"
