#include <ansi.h>

inherit ITEM;

void dest();

void init()
{
       remove_call_out("dest");
       call_out("dest", 100);
}

void create()
{
	set_name("用过的百花腹蛇膏", ({"usedgao", "used gao"}));
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "张");
		set("long", "这是一张用过的百花腹蛇膏。\n");
		set("value", 1000);
		set("no_drop", "这样东西不能离开你!\n");
	}
	setup();
}


void dest()
{
        destruct(this_object());
}
