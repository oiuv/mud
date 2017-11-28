#include <ansi.h>
inherit ITEM;

void create()
{
        set_name(YEL "三清神像" NOR, ({ "xiang" }) );
        set_weight(500000);
        set_max_encumbrance(800);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "座");
                set("long", "道家的三清神像，据说老子一气化三清。\n");
                set("value", 50);
        }
}
