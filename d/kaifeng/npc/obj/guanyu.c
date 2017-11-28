#include <ansi.h>
inherit ITEM;

void create()
{
        set_name(YEL "关帝神像" NOR, ({ "xiang" }) );
        set_weight(500000);
        set_max_encumbrance(800);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "座");
                set("long", "红面长须，一手持刀，一手拿着《春秋》。\n");
                set("value", 50);
        }
}
