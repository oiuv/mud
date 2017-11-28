inherit ITEM;
#include <ansi.h>

void create()
{
        set_name(HIY "幻石" NOR, ({"huan shi", "huan", "shi" }));
        set_weight(300);
        if (clonep())
                set_default_object(__FILE__);
        else {
         	set("long", HIY "一块神奇的幻石，散射出七彩光芒。\n" NOR);
                set("unit", "块");
                set("value", 8000);
                set("can_be_enchased", 1);
                set("magic/type", "magic");
                set("magic/power", 55 + random(16));
        }
        setup();
}

int query_autoload()
{
        return 1;
}

