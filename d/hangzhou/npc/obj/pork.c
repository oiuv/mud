// pork.c 东坡肉
#include <ansi.h>
inherit ITEM;
inherit F_FOOD;

void create()
{
        set_name(RED"东坡肉"NOR, ({"pork"}));
        set_weight(1000);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", "一碗香喷喷的东坡肉，用文火煨肥猪肉而成，
苏东坡在牧守杭州时看到民间吃肉而烧制不得法，遗惠此法至千年以下。\n");
                set("unit", "碗");
                set("value", 120);
                set("food_remaining", 10);
                set("food_supply", 100);
        }
}
