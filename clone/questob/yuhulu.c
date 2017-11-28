// yuhulu.c

#include <ansi.h>

inherit ITEM;

void create()
{
	set_name("玉葫芦", ({ "yu hulu", "hulu" }));
	set_weight(300);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "只");
		set("long", "这是一个美玉雕刻的葫芦，玲珑精致。\n");
		set("value", 8000);
		set("material", "jade");
	}
	setup();
}
