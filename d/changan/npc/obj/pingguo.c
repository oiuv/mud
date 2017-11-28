//pingguo.c

inherit ITEM;
inherit F_FOOD;

void create()
{
        set_name("苹果", ({"ping guo", "pingguo", "guo"}));                    set_weight(80);
        if (clonep())
        	set_default_object(__FILE__);
        else 
	{
        	set("long", "一个大苹果。n");
    set("unit", "个");
        	set("value", 100);
        	set("food_remaining", 3);
        	set("food_supply", 20);
	}
}
