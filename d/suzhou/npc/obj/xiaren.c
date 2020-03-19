// xiaren.c

inherit ITEM;
inherit F_FOOD;
#include <ansi.h>

void create()
{
	set_name(WHT"菱白虾仁"NOR, ({ "lingbai xiaren", "xiaren" }) );
	if( clonep() )
		set_default_object(__FILE__);
	else {
		set("long", "一盆香喷喷热气腾腾的菱白虾仁。\n");
		set("unit", "盆");
		set("value", 180);
		set("food_remaining", 8);
		set("food_supply", 20);
		set("material", "meat");
	}
	setup();
}

