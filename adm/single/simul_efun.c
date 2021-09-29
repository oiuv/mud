#pragma optimize
// #pragma save_binary

#include <ansi.h>

#include "simul_efun/ansi.c"
#include "simul_efun/atoi.c"
#include "simul_efun/bitmap_font.c"
#include "simul_efun/boardcast.c"
#include "simul_efun/chinese.c"
#include "simul_efun/element_of_weighted.c"
#include "simul_efun/file.c"
#include "simul_efun/fluffos.c"
#include "simul_efun/gender.c"
#include "simul_efun/graph_draw.c"
#include "simul_efun/highest.c"
#include "simul_efun/json.c"
#include "simul_efun/lowest.c"
#include "simul_efun/message.c"
#include "simul_efun/object.c"
#include "simul_efun/override.c"
#include "simul_efun/path.c"
#include "simul_efun/range.c"
#include "simul_efun/sort_string.c"
#include "simul_efun/sum.c"
#include "simul_efun/user.c"
#include "simul_efun/wizard.c"
// This is the utilitis
#include "simul_efun/util.c"

void create()
{
    seteuid(getuid());
    debug_message("simul_efun loaded successfully.");
}
