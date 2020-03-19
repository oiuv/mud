// huotui.c

inherit ITEM;
inherit F_FOOD;
#include <ansi.h>

void create()
{
	set_name(RED"樱桃火腿"NOR, ({ "yingtao huotui", "huotui" }) );
	if( clonep() )
		set_default_object(__FILE__);
	else {
		set("long", "一盆香喷喷热气腾腾的樱桃火腿。\n");
		set("unit", "盆");
		set("value", 200);
		set("food_remaining", 10);
		set("food_supply", 20);
		set("material", "meat");
	}
	setup();
}

