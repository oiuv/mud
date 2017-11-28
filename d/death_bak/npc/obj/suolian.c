#include <ansi.h>
#include <weapon.h>
inherit WHIP;

void create()
{
        set_name( HIW "ËøÁ´" NOR, ({ "suo lian", "suo", "lian" }));
        set_weight(300);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "¸ù");
                set("value", 30);
                set("material", "leather");
        }
        init_whip(50);
        setup();
}

