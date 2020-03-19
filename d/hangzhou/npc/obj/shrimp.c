// shrimp.c 龙井虾仁
#include <ansi.h>
inherit ITEM;
inherit F_FOOD;

void create()
{
        set_name(RED"龙井虾仁"NOR, ({"shrimp"}));
        set_weight(1300);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", "酽酽浓浓的一盘龙井虾仁。\n");
                set("unit", "碗");
                set("value", 50);
                set("food_remaining", 5);
                set("food_supply", 20);
        }
}
