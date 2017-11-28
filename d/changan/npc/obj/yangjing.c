//yangjing.c

#include <ansi.h>

inherit ITEM;

void create()
{
	set_name(HIG "养精丹" NOR, ({ "yangjing dan", "dan" }));
	if (clonep())
		set_default_object(__FILE__);
	else 
	{
		set("unit", "粒");
		set("value", 2000);
                set("only_do_effect", 1);
	}

	setup();
}

int do_effect(object me)
{
	message_vision("$N吃下一粒" + name() + "。\n", me);
	me->receive_curing("jing", me->query("max_jing") / 50);
	destruct(this_object());
	return 1;
}
