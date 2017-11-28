// mala-doufu.c ÂéÀ±¶¹¸¯

inherit ITEM;
inherit F_FOOD;

void create()
{
	set_name("ÂéÀ±¶¹¸¯", ({"mala doufu", "doufu"}));
	set_weight(200);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("long", "Ò»ÅèÑÕÉ«ºìÁÁ£¬Ï¸ÖĞ´øÄÛ£¬ÏãÀ±¿É¿ÚµÄÂéÀ±¶¹¸¯¡£\n");
		set("unit", "Åè");
		set("value", 150);
		set("food_remaining", 4);
		set("food_supply", 40);
	}
}
