inherit ITEM;
#include <ansi.h>

void create()
{
        set_name(HIW "五" HIR "彩" HIY "玲" HIG "珑" HIM "珠" NOR, ({"wucai zhu", "wucai", "zhu"}));
        set_weight(300);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", HIM "绝世罕见的宝珠，周身缭绕着五色彩芒。\n" NOR);
                set("unit", "颗");
                set("value", 50000);
                set("can_be_enchased", 1);
                set("magic/type", "lighting");
                set("magic/power", 35 + random(16));

        }
        setup();
}

int query_autoload()
{
        return 1;
}

