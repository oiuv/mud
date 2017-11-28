#include <ansi.h>
inherit ITEM;
inherit F_FOOD;

void create()
{
	set_name(HIG "大葱" NOR, ({ "da cong", "cong","da" }) );
        set_weight(100);
        if( clonep() )
                set_default_object(__FILE__);
        else {
		set("long", "一捆新鲜的大葱。\n");
		set("unit", "捆");
		set("value", 2);
		set("food_remaining", 1);
		set("food_supply", 5);
        }
    setup();
}

