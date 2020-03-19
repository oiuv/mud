#include <weapon.h>
#include <ansi.h>

inherit THROWING;

void create()
{
        set_name(CYN "棋子" NOR, ({ "qi zi", "qi", "zi" }) );
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "些");
                set("value", 0);
                set("base_unit", "颗");
                set("base_weight", 1);
                set("base_value", 0);
                set("material", "iron");
        }
        set_amount(40);
        init_throwing(10);
        setup();
}
