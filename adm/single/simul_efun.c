// #pragma optimize
// #pragma save_binary

#include <ansi.h>

#include "simul_efun/atoi.c"
#include "simul_efun/chinese.c"
#include "simul_efun/file.c"
#include "simul_efun/gender.c"
#include "simul_efun/object.c"
#include "simul_efun/override.c"
#include "simul_efun/path.c"
#include "simul_efun/wizard.c"
#include "simul_efun/user.c"

// This must be after gender.c
#include "simul_efun/message.c"

// This is the utilitis
#include "simul_efun/util.c"

void create()
{
    seteuid(getuid());
    debug_message("simul_efun loaded successfully.");
}
