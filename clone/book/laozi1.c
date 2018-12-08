// laozi1.c
// Marz

#include <ansi.h>

inherit BOOK;

void create()
{
	set_name( "道德经「第一章」", ({ "jing", "daode jing" }));
	set_weight(200);
	if( clonep() )
		set_default_object(__FILE__);
	else {
		set("unit", "本");
		set("long",
			CYN
			"\n\t\t\t第一章\n\n"
			"\n\t道可道，非常道。名可名，非常名。\n"
			"\t无名天地之始；有名万物之母。\n"
			"\t故常无，欲以观其妙；常有，欲以观其徼。\n"
			"\t此两者，同出而异名，同谓之玄。玄之又玄，众妙之门。\n\n"
			NOR
		);
		set("value", 500);
		set("material", "paper");
		set("skill", ([
			"name":	"taoism",	// name of the skill
			"exp_required":	 0,	// minimum combat experience required
			"jing_cost":  10, 	// jing cost every time study this
			"difficulty":	15,	// the base int to learn this skill
			"max_skill":	9,	// the maximum level you can learn
		]) );
	}
}
