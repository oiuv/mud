// gao.c

inherit ITEM;
inherit F_FOOD;

void create()
{
     	set_name("四色点心", ({ "gao" }));
    	set_weight(1500);
    	if (clonep())
            	set_default_object(__FILE__);
    	else {
          	set("long", "四色点心形状精雅,似乎是用来玩赏一般\n");
          	set("unit", "块");
          	set("value", 50);
          	set("food_remaining", 4);
          	set("food_supply", 20);
     	}
}

