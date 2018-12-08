// laozi18.c

#include <ansi.h>

inherit BOOK;

void create()
{
	set_name( "道德经「第十八章」", ({ "jing", "daode jing" }));
	set_weight(200);
	if( clonep() )
		set_default_object(__FILE__);
	else {
		set("unit", "本");
		set("long",
			CYN "\n"
			"\n\t\t\t第十八章\n\n"
			"\t大道废，有仁义；智慧出，有大伪；六亲不和，有孝慈；国家昏\n"
			"乱，有忠臣。\n"
			"\n"NOR
		);
		set("value", 500);
		set("material", "paper");
		set("skill", ([
			"name":	"taoism",	// name of the skill
			"exp_required":	 0,	// minimum combat experience required
			"jing_cost":	15, 	// jing cost every time study this
			"difficulty":	15,	// the base int to learn this skill
			"max_skill":	59,	// the maximum level you can learn
			"min_skill" : 50,
		]) );
	}
}
