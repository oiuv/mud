#include <ansi.h>
inherit ITEM;

void create()
{
        set_name(WHT "脏盘子" NOR, ({"zhang panzi"}));
        set_weight(3);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "叠");
                set("long", WHT "一叠刚刚用过的脏盘子。\n" NOR);
                set("value", 1);
        }
        setup();
}
