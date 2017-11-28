// hua3.c

inherit ITEM;

#include <ansi.h>

void create()
{
	set_name(HIR "断肠花" NOR, ({"duanchang hua", "duanchang"}));
	if (clonep())
		set_default_object(__FILE__);
	else {
        	set("unit", "朵");
		set("long", "这是一朵断肠花，通体通红，鲜嫩欲滴，美丽异常。\n");
        	set("no_get", "你根本不敢近前。\n");
		set("only_do_effect", 1);
	}
        setup();
}

int do_effect(object me)
{
        message_vision("$N把" + name() + "扔进嘴里，几下就吞了下去。\n", me);
        me->set_temp("die_reason", "服下断肠花，中毒身亡了");
	me->die();
	destruct(this_object());
	return 1;
}
