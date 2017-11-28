#include <ansi.h>
inherit ITEM;
inherit F_FOOD;

void create()
{
	set_name("白菜", ({ "bai cai", "bai","cai" }) );
        set_weight(100);
        if( clonep() )
                set_default_object(__FILE__);
        else {
		set("long", "普通的蔬菜，很新鲜，上面还滴着许许露水。\n");
		set("unit", "捆");
		set("value", 2);
		set("food_remaining", 1);
		set("food_supply", 5);
        }
    setup();
}

