#include <ansi.h>
inherit ITEM;

void create()
{
        set_name(HIW "獨角獸之角" NOR, ({ "unicorn horn", "unicorn", "horn" }));
        set_weight(1000);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", HIW "獨角獸的角，似乎可以賣個好價錢。\n" NOR);
                set("unit", "根");
                set("value", 700000);
        }
        setup();
}
