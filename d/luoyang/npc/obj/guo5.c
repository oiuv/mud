#include <ansi.h>
inherit ITEM;
inherit F_FOOD;

void create()
{
        set_name(HIG "Î÷¹Ï" NOR, ({ "xigua" }) );
        set_weight(100);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "¸ö");
                set("value", 100);
                set("food_remaining", 5);
                set("food_supply", 20);
        }
    	setup();
}
