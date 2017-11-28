// rice.c

inherit ITEM;
inherit F_FOOD;
#include <ansi.h>

void create()
{
	set_name(YEL"»ÆÃ×·¹"NOR, ({ "rice", "mi fan" }) );
	if( clonep() )
		set_default_object(__FILE__);
	else {
		set("long", "Ò»ÍëÏãÅçÅçµÄ»ÆÃ×·¹¡£\n");
		set("unit", "Íë");
		set("value", 80);
		set("food_remaining", 4);
		set("food_supply", 30);
		set("material", "rice");
	}
	setup();
}

