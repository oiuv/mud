// jili.c

#include <weapon.h>
#include <ansi.h>

inherit THROWING;

void create()
{
        set_name("铁蒺藜", ({ "tie jili", "jili" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "些");
                set("base_unit", "枚");
                set("base_weight", 300);
                set("base_value", 0);
                set("material", "iron");
                set("long", HIG "铁蒺藜经常用于淬毒暗器，寸许大小。\n"NOR);
        }

        set_amount(50);
        init_throwing(50);
        setup();
}

