//hamigua.c

inherit ITEM;
inherit F_FOOD;

void create()
{
        set_name("¹şÃÜ¹Ï", ({"hami gua", "hamigua", "gua"}));
        set_weight(80);
  	if (clonep())
  		set_default_object(__FILE__);
  	else 
	{
  		set("long", "Ò»¿ÅÉ¢·¢ÇåÏãµÄ¹şÃÜ¹Ï¡££\n");
  		set("unit", "¿Å");
  		set("value", 120);
  		set("food_remaining", 4);
  		set("food_supply", 30);
	}
}
