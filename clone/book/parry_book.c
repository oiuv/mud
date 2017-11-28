// parry-book.c

inherit BOOK;

void create()
{
	set_name( "招架入门",({ "parry book","book"}));
	set_weight(200);
	if( clonep() )
		set_default_object(__FILE__);
	else {
		set("unit", "本");
                set("long","这是一本走江湖武师写的关于趋避招架的书籍。\n");
		set("value", 1500);
		set("material", "paper");
		set("skill", ([
                        "name":         "parry",      //name of the skill
                        "exp_required": 1 ,           //minimum combat experience required
			"jing_cost":    10+random(10),// jing cost every time study this
			"difficulty":	10,           // the base int to learn this skill
			"min_skill":	0,            // the minimum level you can learn
			"max_skill":	19            // the maximum level you can learn
		]) );
	}
}
