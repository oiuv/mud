#include <ansi.h>
inherit ITEM;
inherit F_FOOD;

void create()
{
	set_name(HIR "胡萝卜" NOR, ({ "hu luobo", "luobo","hu" }) );
        set_weight(100);
        if( clonep() )
                set_default_object(__FILE__);
        else {
		set("long", "大红色的新鲜胡萝卜。\n");
		set("unit", "个");
		set("value", 2);
		set("food_remaining", 1);
		set("food_supply", 5);
        }
    setup();
}

