// laozi2.c

#include <ansi.h>

inherit BOOK;

void create()
{
	set_name( "道德经「第二章」", ({ "jing", "daode jing" }));
	set_weight(200);
	if( clonep() )
		set_default_object(__FILE__);
	else {
		set("unit", "本");
		set("long",
			CYN "\n"
			"\n\t\t\t第二章\n\n"
			"\t天下皆知美之为美，斯恶已。皆知善之为善，斯不善已。\n"
			"\t有无相生，难易相成，长短相形，高下相盈，音声相和，前后相\n"
			"随。恒也。\n"
			"\t是以圣人处无为之事，行不言之教；万物作而弗始，生而弗有，\n"
			"为而弗恃，功成而不居。夫唯弗居，是以不去。\n"
			"\n"NOR
		);
		set("value", 500);
		set("material", "paper");
		set("skill", ([
			"name":	"taoism",	// name of the skill
			"exp_required":	 0,	// minimum combat experience required
			"jing_cost":  10, 	// jing cost every time study this
			"difficulty":	15,	// the base int to learn this skill
			"max_skill":	19,	// the maximum level you can learn
			"min_skill" : 10,
		]) );
	}
}
