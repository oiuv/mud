// jinchuang-yao.c 金创药

#include <ansi.h>

inherit ITEM;

void setup()
{}

void init()
{
	add_action("do_eat", "eat");
}

void create()
{

	set_name("金创药", ({"jin chuangyao", "jin"}));
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "包");
		set("long", "这是一包别具灵效的金创药，专治内外伤等。\n");
		set("value", 2000);
		set("no_drop", "这样东西不能离开你。\n");
	}

	set("shaolin",1);
	setup();
}

int do_eat(string arg)
{
	object me = this_player();

	if (!id(arg)) return notify_fail("你要吃什么？\n");

	if (me->query("eff_qi") == me->query("max_qi"))
		return notify_fail("你现在不需要用金创药。\n");
	
	if ( (int)me->query_condition("bonze_drug" ) > 0 )
	{
		this_player()->add("eff_qi", -50);
		message_vision(HIR "$N吃下一包金创药，只觉胸口烦恶欲呕，四肢乏力，原来服食太急太多，药效适得其反！\n" NOR, me);
	}
	else
	{
		this_player()->receive_curing("qi", 50);
		message_vision(HIC "$N吃下一包金创药，只觉精神振作，气色看起来好多了。\n" NOR, me);
	}

	me->apply_condition("bonze_drug", 15);

	destruct(this_object());
	return 1;

}

