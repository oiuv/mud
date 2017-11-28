#include <ansi.h>
#include <weapon.h>
inherit HAMMER;

void create()
{
        set_name( HIW "¼ÏËø" NOR, ({ "jia suo", "suo", "jia" }));
        set_weight(300);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "¸ù");
                set("value", 30);
                set("material", "leather");
        }
        init_hammer(50);
        setup();
}

