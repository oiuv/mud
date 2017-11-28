inherit ITEM;
#include <ansi.h>

void create()
{
        set_name(YEL "天罡碳" NOR, ({"tiangang tan", "tiangang", "tan"}));
        set_weight(300);
        if (clonep())
                set_default_object(__FILE__);
        else {
         	set("long", YEL "埋藏于极地中心的乌炭，可炼化世间万物。\n" NOR);
                set("unit", "块");
                set("value", 15000);
        }
        setup();
}

int query_autoload()
{
        return 1;
}

