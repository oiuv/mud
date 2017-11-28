// xiaren.c

inherit ITEM;
inherit F_FOOD;
#include <ansi.h>

void create()
{
	set_name(WHT"Áâ°×ÏºÈÊ"NOR, ({ "lingbai xiaren", "xiaren" }) );
	if( clonep() )
		set_default_object(__FILE__);
	else {
		set("long", "Ò»ÅèÏãÅçÅçÈÈÆøÌÚÌÚµÄÁâ°×ÏºÈÊ¡£\n");
		set("unit", "Åè");
		set("value", 180);
		set("food_remaining", 8);
		set("food_supply", 20);
		set("material", "meat");
	}
	setup();
}

