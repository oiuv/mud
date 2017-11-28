// jinchuang-yao.c 金创药

#include <ansi.h>

inherit ITEM;

void create()
{

	set_name("金创药", ({"jin chuangyao", "yao"}));
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "包");
		set("long", "这是一包别具灵效的少林金创药，专治内外伤等。\n");
		set("value", 2000);
		set("only_do_effect", 1);
	}

	set("shaolin",1);
	setup();
}

int do_effect(object me)
{
	if (me->query("eff_qi") == me->query("max_qi"))
		return notify_fail("你现在不需要用金创药。\n");
	
	me->start_busy(1);
	me->receive_curing("qi", 50);
	message_vision(HIC "$N" HIC "吃下一包金创药，只觉精神振"
		       "作，气色看起来好多了。\n" NOR, me);

	destruct(this_object());
	return 1;
}

