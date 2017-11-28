// kongquedan.c

#include <ansi.h>

inherit ITEM;

void create()
{
	set_name(BLU "孔雀胆" NOR, ({"kongque dan", "dan"}));
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("long", "一瓶剧毒的毒药, 如果用来炼暗器有见血封喉之效. \n");
		set("unit", "粒");
		set("value", 20000);
		set("only_do_effect", 1);
	}
	setup();
}

int do_effect(object me)
{
	message_vision("$N仰头张口吞下一粒" + name() + "。\n", me);
        me->set_temp("die_reason", "吃了孔雀胆，中毒死了");
	me->die();
	destruct(this_object());
	return 1;
}
