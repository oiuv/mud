// furong-huagu.c ‹Ω»ÿª®πΩ

inherit ITEM;
inherit F_FOOD;

void create()
{
	set_name("‹Ω»ÿª®πΩ", ({"furong huagu", "huagu"}));
	set_weight(200);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("long", "“ª≈ËÃ¿≥Ì÷≠≈®£¨Œ∂ª¨À¨ø⁄µƒ‹Ω»ÿª®πΩÃ¿°£\n");
		set("unit", "≈Ë");
		set("value", 150);
		set("food_remaining", 4);
		set("food_supply", 40);
	}
}
