// rice.c

#include <ansi.h>

inherit ITEM;
inherit F_FOOD;

void create()
{
	set_name(WHT "°×Ã×·¹" NOR, ({ "rice", "mi fan" }) );
	if( clonep() )
		set_default_object(__FILE__);
	else {
		set("long", "Ò»ÍëÏãÅçÅçµÄ°×Ã×·¹¡£\n");
		set("unit", "Íë");
		set("value", 10);
		set("food_remaining", 4);
		set("food_supply", 30);
		set("material", "rice");
	}
	setup();
}
