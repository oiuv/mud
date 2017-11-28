#include <ansi.h>

inherit ITEM;

void create()
{
        set_name(MAG "野菊花" NOR, ({ "ye juhua", "juhua" }));
        set("weight", 10);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long","一朵平平常常的野菊花，香味淡淡的。\n");
                set("unit", "朵");
                set("material", "wood");
        }
        setup();
}       


