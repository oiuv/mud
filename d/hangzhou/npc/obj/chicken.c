// chicken.c
#include <ansi.h>
inherit ITEM;
inherit F_FOOD;
void create()
{
        set_name(YEL"叫化童鸡"NOR, ({"chicken"}));
        set_weight(200);
        if (clonep())
                set_default_object(__FILE__);
        else
        {
                set("long", "一只被烤得流油，香味扑鼻的叫化鸡。\n");
                set("unit", "只");
                set("value", 120);
                set("food_remaining", 1);
                set("food_supply", 100);
        }
}
