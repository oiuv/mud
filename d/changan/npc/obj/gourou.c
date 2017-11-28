//gourou.c

inherit ITEM;
inherit F_FOOD;

void create()
{
        set_name("ºìÉÕ¹·Èâ", ({"gou rou", "gou", "gourou"}));
        set_weight(300);
        if (clonep())
        	set_default_object(__FILE__);
        else 
	{
        	set("long", "Ò»ÍëÏãÅçÅçµÄºìÉÕ¹·Èâ\n");
        	set("unit", "Íë");
        	set("value", 100);
        	set("food_remaining", 2);
        	set("food_supply", 100);
	}
}
