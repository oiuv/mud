// sjping.c

#include <ansi.h>

inherit ITEM;

void create()
{
	set_name("四剪瓶", ({ "sijian ping", "ping" }));
	set_weight(500);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "个");
		set("long", "这是一个黑石瓶子，看上去听不起眼的。\n");
		set("value", 1000);
		set("material", "stone");
	}
	setup();
}
