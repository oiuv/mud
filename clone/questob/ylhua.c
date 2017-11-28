// ylhua.c

#include <ansi.h>

inherit ITEM;

void create()
{
	set_name("银镂花", ({ "yinlou hua", "hua" }));
	set_weight(300);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "朵");
		set("long", "这是一张用银箔雕刻的花，栩栩如生。\n");
		set("value", 4000);
		set("material", "silver");
	}
	setup();
}
