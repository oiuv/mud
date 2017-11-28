// puti-zi.c 菩提子

#include <ansi.h>

inherit ITEM;

void setup()
{
}

void create()
{
	set_name(HIG "菩提子" NOR, ({"puti zi", "zi"}));
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "颗");
		set("long", HIG "这是一颗晶莹如玉的菩提子，采自灵山佛祖座"
			    "前，珍稀无比，\n乃万年菩提树之实，功能化百劫"
			    "，渡千灾，与天地同寿。\n");
		set("value", 500000);
		set("only_do_effect", 1);
	}
	setup();
}

int do_effect(object me)
{
	int neili_limit;

	neili_limit = me->query_neili_limit();
	if ((int)me->query_condition("putizi_drug") > 0)
	{
		write("你觉得现在内息未定，经脉隐隐还能感到真气冲荡，不"
		      "敢贸然服食。\n");
		return 1;
	} else
	if (me->query("max_neili") < neili_limit)
	{
		me->add("max_neili", 100 + random(30));
		if (me->query("max_neili") > neili_limit)
			me->set("max_neili", neili_limit);
		me->set("neili", me->query("max_neili"));

		message_vision(HIY "$N" HIY "吃下一颗菩提子，顿然间只觉一股浩"
			       "荡无比的真气直冲顶门，连忙运功吸纳。\n" NOR,
			       me);
		me->apply_condition("putizi_drug", 1000);
	} else
	{
		message_vision(HIY "$N" HIY "一仰脖，吞下了一颗菩提子。\n" NOR,
			       me);
		tell_object(me, "你觉得没啥感觉，不如花生好吃。\n");
	}

	me->start_busy(random(5) + 5);
	destruct(this_object());
	return 1;
}

