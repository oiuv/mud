#include <ansi.h>
inherit ITEM;

void create()
{
        set_name(YEL "八宝弥勒佛像" NOR, ({ "xiang" }) );
        set_weight(500000);
        set_max_encumbrance(800);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "座");
                set("long", "身上缀满各类宝石,翡翠,黄金的弥勒佛像.\n");
                set("value", 50);
        }
}
