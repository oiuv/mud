// xiaoshu.c 消暑丸

inherit ITEM;

#include <ansi.h>

void create()
{
	set_name(HIY"消暑丸"NOR, ({"xiaoshu wan", "xiaoshuwan"}));
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "包");
		set("long", "这是一包治疗中暑的药，立刻见效。\n");
		set("value", 600);
		set("only_do_effect", 1);
	}
	setup();
}

int do_effect(object me)
{
	if (!me->query_condition("ill_zhongshu"))
	{
		write("你现在又没有中暑，别乱吃药。\n");
		return 1;
	} else {
		me->clear_condition("ill_zhongshu");
		message_vision("$N吃下一包消暑丸，看起来精神多了。\n", me);
		me->start_busy(2);
		destruct(this_object());
		return 1;
	}
}
