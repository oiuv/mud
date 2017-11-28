#include <weapon.h>
#include <ansi.h>
inherit WHIP;

void create()
{
        set_name(HIY "流星锤" NOR, ({ "liuxing chui", "liuxing", "chui" }));
        set_weight(4500);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "柄");
                set("long", HIY "一柄金光闪闪的流星锤。\n" NOR);
                set("value", 2000);
                set("material", "leather");
        }
        init_whip(40);
        setup();
}
