// laozi8.c
// by Marz

#include <ansi.h>

inherit BOOK;

void create()
{
	set_name( "道德经「第八章」", ({ "jing", "daode jing" }));
	set_weight(200);
	if( clonep() )
		set_default_object(__FILE__);
	else {
		set("unit", "本");
		set("long",
			CYN "\n"
			"\n\t\t\t第八章\n\n"
			"\t上善若水。水善利万物而不争，处众人之所恶，故几于道。\n"
			"\t居善地，心善渊，与善仁，言善信，政善治，事善能，动善时。\n"
			"夫唯不争，故无尤。\n"
			"\n"NOR
		);
		set("value", 500);
		set("material", "paper");
		set("skill", ([
			"name":	"taoism",	// name of the skill
			"exp_required":	 0,	// minimum combat experience required
			"jing_cost":  10, 	// jing cost every time study this
			"difficulty":	15,	// the base int to learn this skill
			"max_skill":	29,	// the maximum level you can learn
			"min_skill" : 20,
		]) );
	}
}
