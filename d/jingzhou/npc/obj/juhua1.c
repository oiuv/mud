#include <ansi.h>

inherit ITEM;

void create()
{
        set_name(HIG "绿菊花" NOR, ({ "lv juhua", "juhua" }));
        set("weight", 100);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long","一盆淡绿的菊花，叫做“春水碧波”。\n");
                set("unit", "盆");
                set("material", "wood");
        }
        setup();
}       

