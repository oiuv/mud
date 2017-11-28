// blade-book.c

inherit BOOK;

void create()
{
	set_name( "胡家刀谱",({ "blade book","book"}));
	set_weight(200);
	if( clonep() )
		set_default_object(__FILE__);
	else {
		set("unit", "本");
                set("long","这是一本胡家刀谱，记录了刀法微妙之处。\n");
		set("value", 50);
		set("material", "paper");
		set("skill", ([
                        "name":         "blade",      //name of the skill
                        "exp_required": 1000,         //minimum combat experience required
			"jing_cost":    30,           // jing cost every time study this
			"difficulty":	30,           // the base int to learn this skill
			"min_skill":	30,           // the minimum level you can learn
			"max_skill":	149           // the maximum level you can learn
		]) );
	}
}
