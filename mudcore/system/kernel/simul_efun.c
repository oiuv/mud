#include <ansi.h>
#include "simul_efun/all_environment.c"
#include "simul_efun/area.c"
#include "simul_efun/array.c"
#include "simul_efun/bit.c"
#include "simul_efun/bitmap_font.c"
#include "simul_efun/break_string.c"
#include "simul_efun/charset.c"
#include "simul_efun/color.c"
#include "simul_efun/element_of_weighted.c"
#include "simul_efun/expand_keys.c"
#include "simul_efun/file.c"
#include "simul_efun/gender.c"
#include "simul_efun/graph_draw.c"
#include "simul_efun/highest.c"
#include "simul_efun/json.c"
#include "simul_efun/lowest.c"
#include "simul_efun/message.c"
#include "simul_efun/number_string.c"
#include "simul_efun/override.c"
#include "simul_efun/path.c"
#include "simul_efun/percent.c"
#include "simul_efun/range.c"
#include "simul_efun/reduce.c"
#include "simul_efun/sum.c"
#include "simul_efun/util.c"

private void create()
{
    debug_message("[" + ctime() + "]CORE_SIMUL_EFUN_OB->create()!");
}

/**
 * simul_efun
 */

// domain_file should return the domain associated with a given file.
string domain_file(string file)
{
#ifdef WORLD_DIR
    string domain;
    if (sscanf(file, WORLD_DIR "%s/%*s", domain))
        return capitalize(domain);
#endif
    return ROOT_UID;
}

// creator_file should return the name of the creator of a specific file.
string creator_file(string file)
{
    string *path;

    path = explode(file, "/") - ({0});
    path -= ({"mudcore"});
    switch (path[0])
    {
    case "system":
    case "cmds":
        return ROOT_UID;
    case "world":
        if (sizeof(path) >= 3)
            return capitalize(path[1]);
    case "feature":
        return "Feature";
    case "inherit":
        return "Inherit";
    case "obj":
        return "Clone";
    case "std":
        return "STD_OB";
    case "wizard":
        if (sizeof(path) >= 3)
            return capitalize(path[1]);
    default:
        return "NONAME";
    }
}

// author_file should return the name of the author of a specific file.
string author_file(string file)
{
    return ROOT_UID;
}
