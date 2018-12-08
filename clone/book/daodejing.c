// daodejing.c

inherit BOOK;

void create()
{
	set_name( "道德经", ({ "shu", "book" }));
	set_weight(200);
	if( clonep() )
		set_default_object(__FILE__);
	else {
		set("unit", "本");
		set("long", "这是一册道德经。\n");
		set("value", 500);
		set("material", "paper");
		set("skill", ([
			"name":	"taoism",	// name of the skill
			"exp_required":	100000,	// minimum combat experience required
			"jing_cost":    20+random(20),// jing cost every time study this
			"difficulty":	30,	// the base int to learn this skill
			"max_skill":	119,	// the maximum level you can learn
			"min_skill" : 60,
		]) );
	}
}
