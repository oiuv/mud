// throw-book.c
#include <ansi.h>
inherit BOOK;

void create()
{
	set_name( GRN"天山器法"NOR,({ "throwing book","book"}));
	set_weight(200);
	if( clonep() )
		set_default_object(__FILE__);
	else {
		set("unit", "本");
                set("long","这是一本星宿派武功密籍。\n");
		set("value", 500);
		set("material", "paper");
		set("skill", ([
                        "name":         "feixing-shu",//name of the skill
                        "exp_required": 1000 ,        //minimum combat experience required
			"jing_cost":    20+random(20),// jing cost every time study this
			"difficulty":	20,           // the base int to learn this skill
			"min_skill":	10,           // the minimum level you can learn
			"max_skill":	99            // the maximum level you can learn
		]) );
	}
}
