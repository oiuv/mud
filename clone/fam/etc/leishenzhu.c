inherit ITEM;
#include <ansi.h>

void create()
{
        set_name(HIM "雷神珠"  NOR, ({"leishen zhu", "leishen", "zhu"}));
        set_weight(300);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", HIM "一颗圆形的神珠，透射出绚目的光芒。\n" NOR);
                set("unit", "颗");
                set("value", 9000);
                set("can_be_enchased", 1);
                set("magic/type", "lighting");
                set("magic/power", 55 + random(16));
        }
        setup();
}

int query_autoload()
{
        return 1;
}

