//juzi.c

inherit ITEM;
inherit F_FOOD;

void create()
{
        set_name("桔子", ({"ju zi", "juzi", "zi"}));
        set_weight(80);
        if (clonep())
        	set_default_object(__FILE__);
        else 
	{
        	set("long", "一个黄橙橙的桔子。n");
        	set("unit", "个");
        	set("value", 100);
        	set("food_remaining", 4);
        	set("food_supply", 20);
	}
}
