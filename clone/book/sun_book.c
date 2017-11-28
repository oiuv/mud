// sun-book.c
#include <ansi.h>
inherit BOOK;

void create()
{
	set_name( HIR"一阳指诀"NOR,({ "sunfinger book","book"}));
	set_weight(200);
	if( clonep() )
		set_default_object(__FILE__);
	else {
		set("unit", "本");
                set("long","这是一本一阳指密诀。\n");
		set("value", 500);
		set("material", "paper");
		set("skill", ([
                        "name":         "sun-finger"  ,//name of the skill
                        "exp_required": 1000 ,        //minimum combat experience required
			"jing_cost":    20+random(20),// jing cost every time study this
			"difficulty":	20,           // the base int to learn this skill
			"min_skill":	10,           // the minimum level you can learn
			"max_skill":	99            // the maximum level you can learn
		]) );
	}
}
