// daodejing-i.c

inherit BOOK;

void create()
{
	set_name( "道德经「上卷」", ({ "jing", "daode jing" }));
	set_weight(200);
	if( clonep() )
		set_default_object(__FILE__);
	else {
		set("unit", "本");
		set("long", "这是一册道德经「上卷」，由体道第一始至去用第四十止。\n");
		set("value", 500);
		set("material", "paper");
		set("skill", ([
			"name":	"taoism",	// name of the skill
			"exp_required":	50000,	// minimum combat experience required
			"jing_cost":    20+random(10), 	// jing cost every time study this
			"difficulty":	25,	// the base int to learn this skill
			"max_skill":	99,	// the maximum level you can learn
			"min_skill" : 0,
		]) );
	}
}
