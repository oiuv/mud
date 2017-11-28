//bao2.c

inherit ITEM;
inherit F_FOOD;

void create()
{
        set_name("海鲜包子", ({"haixian baozi", "baozi"}));
        set_weight(80);
        if (clonep())
        	set_default_object(__FILE__);
        else 
	{
        	set("long", "一个香喷喷、热腾腾的海鲜灌汤包。\n");
        	set("unit", "个");
        	set("value", 25);
        	set("food_remaining", 2);
       	 	set("food_supply", 40);
	}
}

