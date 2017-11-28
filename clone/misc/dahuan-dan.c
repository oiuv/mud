// dahuan-dan.c 大还丹

#include <ansi.h>

inherit ITEM;

void create()
{
	set_name("大还丹", ({"dahuan dan", "dahuan", "dan"}));
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "颗");
		set("long", "这是一颗紫红晶亮的大还丹。此丹乃少林珍药，提"
			    "高功力，灵效无比。\n");
		set("value", 10000);
		set("only_do_effect", 1);
	}

	setup();
}

int do_effect(object me)
{
	int force_limit, neili_limit;

	force_limit = me->query_skill("force")*10;
	neili_limit = me->query("max_neili");
	
	me->start_busy(2);
	if ((int)me->query_condition("bonze_drug" ) > 0)
	{
		me->add("max_neili", -1);
		message_vision(HIR "$N" HIR "吃下一颗大还丹，只觉得头"
			       "重脚轻，摇摇欲倒，原来服食太急太多，药"
			       "效适得其反！\n" NOR, me);
	} else
	if (neili_limit <= force_limit)
	{
		me->add("max_neili", 1);
		message_vision(HIG "$N" HIG "吃下一颗大还丹，只觉得体内"
			       "真力源源滋生，过紫宫，入泥丸透十二重楼，"
			       "遍布奇筋八脉，全身功力顿然提高！\n" NOR, me);
	}

	me->apply_condition("bonze_drug", 60);
	destruct(this_object());
	return 1;
}

