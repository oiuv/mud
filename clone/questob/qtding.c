// yuping.c

#include <ansi.h>

inherit ITEM;

void create()
{
	set_name("青铜鼎", ({ "qingtong ding", "ding" }));
	set_weight(1500);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "只");
		set("long", "这是一只古代的青铜鼎，上面雕着精美的花纹。\n");
		set("value", 10000);
		set("material", "copper");
	}
	setup();
}
