// yunu_sword.c

inherit BOOK;

void create()
{
	set_name("玉女剑谱", ({ "yunu book", "book" }));
	set_weight(600);
	if( clonep() )
		set_default_object(__FILE__);
	else {
		set("unit", "本");
		set("long",
"封面上写著「玉女金针十三剑」\n");
		set("value", 100);
		set("material", "paper");
		set("skill", ([
			"name":		"yunu-sword",		// name of the skill
			"exp_required":	1000,			// minimum combat experience required
								// to learn this skill.
			"jing_cost":	30,			// jing cost every time study this
			"difficulty":	30,			// the base int to learn this skill
								// modify is jing_cost's (difficulty - int)*5%
			"max_skill":	40,			// the maximum level you can learn
			"min_skill":    15,
		]) );
	}
}
