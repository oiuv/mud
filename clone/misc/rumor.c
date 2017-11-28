// rumor.c

#include <ansi.h>

inherit ITEM;
inherit F_AUTOLOAD;

void setup()
{}

void create()
{
        set_name(HIM "谣言生成器" NOR, ({"rumor generator", "rumor"}));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "架");
                set("long", "这是一架看起来怪怪的仪器，涂得五颜六色，专供各类长舌人士造谣使用。\n");
                set("value", 1);
                set("no_sell", 1);
        }
        setup();
}

int query_autoload()
{
        return 1;
}
