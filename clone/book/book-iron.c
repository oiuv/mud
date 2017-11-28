// book-iron.c

#include <armor.h>

inherit HANDS;

void create()
{
	set_name("铁手掌", ({ "iron hand", "hand", "shu", "book" }));
	set_weight(2000);
	if( clonep() )
		set_default_object(__FILE__);
	else
        {
		set("unit", "块");
		set("long",
			"易筋经攻防篇\n"
			"这是一块铁手掌，上面凹凹凸凸刻满了人形搏击的场面。\n");
		set("value", 500);
		set("material", "steel");
		set("armor_prop/armor", 5);
		set("armor_prop/hand", 5);
		set("armor_prop/strike", 5);
                set("armor_prop/unarmed_damage", 20);
		set("skill", ([
			"name":	"parry",	// name of the skill
			"exp_required":	0,	// minimum combat experience required
			"jing_cost":	10,	// jing cost every time study this
			"difficulty":	20,	// the base int to learn this skill
			"max_skill":	99,	// the maximum level you can learn
		]) );
	}
        setup();
}

void init()
{
	if( this_player() == environment() )
		add_action("do_study", "study");
}

int do_study(string arg)
{
	object me = this_player();

	if (! arg || ! id(arg))
		return notify_fail("你要学什么？\n");

	if (! me->can_improve_skill("parry"))
	{
		write("你的实战经验不足，无法继续研读铁手掌的武功。\n");
		return 1;
	}

	if (me->is_fighting() &&
	    (int)me->query_skill("parry", 1) >= 30 &&
	    (int)me->query_skill("parry", 1) <= 100)
	{
		me->receive_damage("jing", 20);
		me->improve_skill("parry", 20 + random(20));
		message_vision("$N一边战斗，一边抽空急急忙"
                               "忙地拿出铁手掌仔细研究。\n", me);
		return 1;
	}

	return 0;
}
