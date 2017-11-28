#include <ansi.h>
inherit ITEM;
inherit F_FOOD;

void create()
{
	set_name( "萝卜" , ({ "luobo" }) );
        set_weight(100);
        if( clonep() )
                set_default_object(__FILE__);
        else {
		set("long", "一支新鲜的萝卜。\n");
		set("unit", "支");
		set("value", 2);
		set("food_remaining", 1);
		set("food_supply", 5);
        }
    setup();
}

