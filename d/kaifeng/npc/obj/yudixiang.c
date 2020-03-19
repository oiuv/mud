#include <ansi.h>
inherit ITEM;

void create()
{
        set_name(HIW "白玉雕玉皇像" NOR, ({ "xiang" }) );
        set_weight(500000);
        set_max_encumbrance(800);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "座");
                set("long", "玉帝手持玉版，端坐微笑不语。\n");
                set("value", 50);
        }
}

