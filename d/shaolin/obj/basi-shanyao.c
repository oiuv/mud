// basi-shanyao.c °ÎË¿É½Ò©

inherit ITEM;
inherit F_FOOD;

void create()
{
	set_name("°ÎË¿É½Ò©", ({"basi shanyao", "shanyao"}));
	set_weight(200);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("long", "Ò»ÅèÉ«ÈôÃµ¹å£¬ÌğÄÛÏãÄÛµÄ°ÎË¿É½Ò©¡£\n");
		set("unit", "Åè");
		set("value", 150);
		set("food_remaining", 4);
		set("food_supply", 40);
	}
}
