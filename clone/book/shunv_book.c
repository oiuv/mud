//shunv-jian 淑女剑法

inherit BOOK;

void create()
{
	set_name("淑女剑谱", ({ "shunv book", "book" }));
	set_weight(600);
	if( clonep() )
		set_default_object(__FILE__);
	else {
		set("unit", "本");
		set("long",
"封面上写著「淑女剑法」\n");
		set("value", 100);
		set("material", "paper");
		set("skill", ([
			"name"			:	"shunv-jian",		// name of the skill
			"exp_required"	:	1000,				// minimum combat experience required
													// to learn this skill.
			"jing_cost"		:	30,					// jing cost every time study this
			"difficulty"	:	30,					// the base int to learn this skill
													// modify is jing_cost's (difficulty - int)*5%
			"max_skill"		:	99,					// the maximum level you can learn
			"min_skill"		:	10,
		]) );
	}
}
