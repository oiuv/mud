#include <ansi.h>
inherit ITEM;
inherit F_FOOD;

void create()
{
	set_name("土豆", ({ "tu dou", "tu","dou" }) );
        set_weight(100);
        if( clonep() )
                set_default_object(__FILE__);
        else {
		set("long", "普通的土豆。\n");
		set("unit", "个");
		set("value", 2);
		set("food_remaining", 1);
		set("food_supply", 5);
        }
    setup();
}

