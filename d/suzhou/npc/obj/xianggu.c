// huotui.c

inherit ITEM;
inherit F_FOOD;
#include <ansi.h>

void create()
{
	set_name(YEL"Çå³´Ïã¹½"NOR, ({ "qingchao xianggu", "xianggu" }) );
	if( clonep() )
		set_default_object(__FILE__);
	else {
		set("long", "Ò»µúÏãÅçÅçµÄÇå³´Ïã¹½¡£\n");
		set("unit", "µú");
		set("value", 120);
		set("food_remaining", 10);
		set("food_supply", 25);
		set("material", "meat");
	}
	setup();
}

