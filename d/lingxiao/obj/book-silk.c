// book-silk.c

inherit ITEM;

void create()
{
	set_name("薄绢", ({ "silk", "shu", "book" }));
	set_weight(50);
	if( clonep() )
		set_default_object(__FILE__);
	else {
		set("unit", "束");
		set("long",
			"这是小册易筋经修行篇\n"
			"由一束薄绢钉成，里面密密麻麻的画了不少打坐吐呐的姿势。\n");
		set("value", 500);
		set("material", "silk");
		set("skill", ([
			"name":	"force",	// name of the skill
			"exp_required":	0,	// minimum combat experience required
			"jing_cost":	10,	// jing cost every time study this
			"difficulty":	20,	// the base int to learn this skill
			"max_skill":	99	// the maximum level you can learn
		]) );
	}
}
