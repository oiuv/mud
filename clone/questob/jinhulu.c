// jinhulu.c

#include <ansi.h>

inherit ITEM;

void create()
{
	set_name("金葫芦", ({ "jin hulu", "hulu" }));
	set_weight(800);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "只");
		set("long", "这是一个黄金打制的葫芦，沉甸甸的。\n");
		set("value", 50000);
		set("material", "gold");
	}
	setup();
}
