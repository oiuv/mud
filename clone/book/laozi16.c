// laozi16.c

#include <ansi.h>

inherit BOOK;

void create()
{
	set_name( "道德经「第十六章」", ({ "jing", "daode jing" }));
	set_weight(200);
	if( clonep() )
		set_default_object(__FILE__);
	else {
		set("unit", "本");
		set("long",
			CYN "\n"
			"\n\t\t\t第十六\n\n"
			"\t致虚极，守静笃。\n"
			"\t万物并作，吾以观复。\n"
			"\t夫物芸芸，各复归其根。归根曰静，静曰复命。复命曰常，知常\n"
			"曰明。不知常，妄作凶。\n"
			"\t知常容，容乃公，公乃全，全乃天，天乃道，道乃久，没身不殆。\n"
			"\n"NOR
		);
		set("value", 500);
		set("material", "paper");
		set("skill", ([
			"name":	"taoism",	// name of the skill
			"exp_required":	 0,	// minimum combat experience required
			"jing_cost":  15, 	// jing cost every time study this
			"difficulty":	15,	// the base int to learn this skill
			"max_skill":	49,	// the maximum level you can learn
			"min_skill" : 40,
		]) );
	}
}
