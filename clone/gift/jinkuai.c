#include <ansi.h>

inherit ITEM;

void create()
{
        set_name(YEL "金块" NOR, ({ "jin kuai", "jin", "kuai" }));
        set_weight(2000);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", "一锭黄澄澄的金块。\n");
                set("value", 150000);
                set("unit", "锭");
        }
}
