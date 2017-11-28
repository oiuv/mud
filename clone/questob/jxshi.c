// jxshi.c

#include <ansi.h>

inherit ITEM;

void create()
{
	set_name("鸡血石", ({ "jixue shi", "shi" }));
	set_weight(500);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "块");
		set("long", "这是一块暗红色的鸡血石。\n");
		set("value", 1500);
		set("material", "stone");
	}
	setup();
}
