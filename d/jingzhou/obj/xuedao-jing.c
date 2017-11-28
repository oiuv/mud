// xdblade_book.c

#include <ansi.h>
#include <weapon.h>

inherit ITEM;

void create()
{
	set_name( HIR "【血刀刀谱】" NOR , ({"book","shu"}));
	set_weight(600);
	if( clonep() )
		set_default_object(__FILE__);
	else {
		set("unit", "本");
		set("long",
"封面上写著 "+HIR "【血刀刀谱】" NOR+"，还画着一些奇形怪状的倒立人形。\n");
		set("value", 0);
		set("material", "paper");
		set("skill", ([
			"name": 		"blade",		// name of the skill
			"exp_required":	1000,			// minimum combat experience required
											// to learn this skill.
			"jing_cost":		20,				// jing cost every time study this
			"difficulty":	20,				// the base int to learn this skill
											// modify is jing_cost's (difficulty - int)*5%
			"max_skill":	40				// the maximum level you can learn
											// from this object.
		]) );
	}
}
