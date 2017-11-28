// dongshang.c 祛疮粉

inherit ITEM;
#include <ansi.h>

void setup()
{}

void init()
{
	add_action("do_mo", "mo");
}

void create()
{
	set_name(HIC"祛疮粉"NOR, ({"quchuang fen", "quchuangfen"}));
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "包");
		set("long", "这是一治疗冻疮的药粉，涂抹(mo)在患处立刻见效。\n");
		set("value", 300);
	}
	setup();
}

int do_mo(string arg)
{
	object me = this_player();
	if (!id(arg))
		return notify_fail("你要抹什么东西？\n");
	if (me->is_busy() )
		return notify_fail("别急，慢慢来。\n");
	if (!me->query_condition("ill_dongshang"))
	{
		write("你现在又没有被冻伤，往哪儿抹药？\n");
		return 1;
	} else {
		me->clear_condition("ill_dongshang");
		message_vision("$N把祛疮粉抹在冻伤的地方，冻疮消去了不少。\n", me);
		me->start_busy(2);
		destruct(this_object());
		return 1;
	}
}
