// huoqiang.c

#include <ansi.h>
#include <weapon.h>

inherit STAFF;

void create()
{
	set_name("荷兰火枪", ({"helan huoqiang", "huoqiang"}));
	set_weight(5000);

	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "支");
		set("long", "一支荷兰火枪。可惜只能放一枪。\n");
		set("value", 10000);
		set("material", "bamboo");
		set("wield_msg", "$N抽出一支乌油的木柄火枪握在手中。\n");
		set("unwield_msg", "$N把手中的火枪背回背上。\n");
	}
	init_staff(30);
	setup();
}
