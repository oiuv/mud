// shizi.c

#include <weapon.h>
#include <ansi.h>

inherit THROWING;

void create()
{
        set_name(WHT "石子" NOR, ({ "shi zi", "shi", "zi" }) );
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "些");
                set("value", 0);
                set("base_unit", "颗");
                set("base_weight", 100);
                set("base_value", 0);
                set("material", "iron");
                set("long", "一颗不同的小石子。\n");
        }
        set_amount(10);
        init_throwing(2);
        setup();
}
