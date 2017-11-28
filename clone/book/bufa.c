// bufa.c
inherit BOOK;

void create()
{
	set_name( "意形步法",({ "bufa book","bufa","shu","book"}));
	set_weight(200);
	if( clonep() )
		set_default_object(__FILE__);
	else {
		set("unit", "本");
		set("long","这是一本意形步步法。\n");
		set("value", 5000);
		set("material", "paper");
		set("skill", ([
			"name": "yixingbu",  //name of the skill
			"exp_required": 10000 , //minimum combat experience required
			"jing_cost": 20+random(30),// jing cost every time study this
			"difficulty":	20,	// the base int to learn this skill
			"max_skill":	60,	// the maximum level you can learn
			"min_skill":    10,
		]) );
	}
}
