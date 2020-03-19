//gourou.c

inherit ITEM;
inherit F_FOOD;

void create()
{
        set_name("红烧狗肉", ({"gou rou", "gou", "gourou"}));
        set_weight(300);
        if (clonep())
        	set_default_object(__FILE__);
        else 
	{
        	set("long", "一碗香喷喷的红烧狗肉\n");
        	set("unit", "碗");
        	set("value", 100);
        	set("food_remaining", 2);
        	set("food_supply", 100);
	}
}
