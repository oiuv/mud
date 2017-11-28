// shoufa.c 
inherit BOOK;

void create()
{
	set_name( "神龙八式手法",({ "shoufa book","shoufa","shu","book"}));
	set_weight(200);
	if( clonep() )
		set_default_object(__FILE__);
	else {
		set("unit", "本");
		set("long","这是一本神龙八式手法。\n");
		set("value", 5000);
		set("material", "paper");
		set("skill", ([
			"name": "shenlong-bashi",  //name of the skill
			"exp_required": 10000 , //minimum combat experience required
			"jing_cost": 20+random(30),// jing cost every time study this
			"difficulty":	40,	// the base int to learn this skill
			"max_skill":	60,	// the maximum level you can learn
			"min_skill":    20,
		]) );
	}
}
