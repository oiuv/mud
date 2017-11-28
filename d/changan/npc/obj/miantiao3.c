//miantiao3.c

inherit ITEM;
inherit F_FOOD;

void create()
{
        set_name("排骨面", ({"paigu mian", "miantiao", "mian"}));
        set_weight(100);
        if (clonep())
        	set_default_object(__FILE__);
        else
	{
                set("long", "一碗热气腾腾的面条。\n");
                set("unit", "碗");
                set("value", 200);
                set("food_remaining", 5);
                set("food_supply", 35);
	}
}

