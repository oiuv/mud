// gaoyao.c

inherit ITEM;
#include <ansi.h>

void setup()
{}

void init()
{
	add_action("do_tie", "tie");
}

void create()
{
	set_name("狗皮膏药", ({"goupi gaoyao", "goupi", "gaoyao"}));
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "帖");
		set("long", "这是一帖武林人士常贴(tie)的狗皮膏药。\n");
		set("value", 5000);
	}
	setup();
}

int do_tie(string arg)
{
	object me = this_player();
	if (!id(arg))
		return notify_fail("你要贴什么药？\n");
	if (me->is_busy())
		return notify_fail("现在你没空贴狗皮膏药了。\n");
	if ((int)me->query("eff_qi") == (int)me->query("max_qi"))
		return notify_fail("你现在不需要用狗皮膏药。\n");
	else {
		me->receive_curing("qi", 50);
		message_vision("$N啪的一声在伤口上贴了一帖狗皮膏药，气色看起来好多了。\n", me);
		me->start_busy(2);
		destruct(this_object());
		return 1;
	}
}

