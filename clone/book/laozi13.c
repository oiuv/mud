// laozi13.c

#include <ansi.h>

inherit BOOK;

void create()
{
	set_name( "道德经「第十三章」", ({ "jing", "daode jing" }));
	set_weight(200);
	if( clonep() )
		set_default_object(__FILE__);
	else {
		set("unit", "本");
		set("long",
			CYN "\n"
			"\n\t\t\t第十三章\n\n"
			"\t宠辱若惊，贵大患若身。\n"
			"\t何谓宠辱若惊？宠为下，得之若惊，失之若惊，是谓宠辱若惊。\n"
			"\t何谓贵大患若身？吾所以有大患者，为吾有身，及吾无身，吾有\n"
			"何患？\n"
			"\t故贵以身为天下，若可寄天下；爱以身为天下，若可托天下。\n"
			"\n"NOR
		);
		set("value", 500);
		set("material", "paper");
		set("skill", ([
			"name":	"taoism",	// name of the skill
			"exp_required":	 0,	// minimum combat experience required
			"jing_cost":  10, 	// jing cost every time study this
			"difficulty":	15,	// the base int to learn this skill
			"max_skill":	39,	// the maximum level you can learn
			"min_skill" : 30,
		]) );
	}
}
