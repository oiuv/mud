#include <ansi.h>
inherit ITEM;

int is_bag() { return 1; }

void create()
{
        set_name(NOR + WHT "包裹" NOR, ({ "bag" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "个");
                set("long", "这是一个包裹。\n");
                set("value", 0);
        }
        setup();
}
