#include <ansi.h>

inherit ITEM;
inherit F_FOOD;

void create()
{
        set_name(NOR + RED "¿¾Èâ" NOR, ({ "kao rou", "kao", "rou" }));
        set_weight(100);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", RED "ÕâÊÇÒ»¿éÏãÅçÅçµÄ¿¾Èâ¡£\n" NOR);
                set("unit", "¿é");
                set("food_remaining", 4);
                set("food_supply", 300);
        }
}
