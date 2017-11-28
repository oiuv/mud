//hua.c 百香花

inherit ITEM;

#include <ansi.h>

void create()
{
	set_name(HIG"百香花"NOR, ({"baixiang hua", "baixiang"}));
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "朵");
		set("long", "这是一朵鲜艳的花，花香浓郁异常。\n");
		set("only_do_effect", 1);
	}
	setup();
}

int do_effect(object me)
{
        message_vision("$N把" + name() + "扔进嘴里，几下就吞了下去。\n", me);
	destruct(this_object());
	return 1;
}

