// shanhu-baicai.c Éºº÷°×²Ë

inherit ITEM;
inherit F_FOOD;

void create()
{
	set_name("Éºº÷°×²Ë", ({"shanhu baicai", "baicai"}));
	set_weight(200);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("long", "Ò»Åèºì°×Ïà¼ä£¬´àÄÛË¬¿Ú£¬ÇåÏãÓÕÈËµÄÉºº÷°×²Ë¡£\n");
		set("unit", "Åè");
		set("value", 150);
		set("food_remaining", 4);
		set("food_supply", 40);
	}
}
