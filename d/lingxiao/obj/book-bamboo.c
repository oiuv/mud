// book2.c

inherit ITEM;

void create()
{
	set_name("旧竹片", ({ "bamboo", "shu", "book" }));
	set_weight(100);
	if( clonep() )
		set_default_object(__FILE__);
	else {
		set("unit", "片");
		set("long",
			"易筋经轻功篇\n"
			"这是一片两边去皮的旧竹片，正面和背面都画了无数个飞翔纵跃的小图形。\n");
		set("value", 500);
		set("material", "bamboo");
		set("skill", ([
			"name":	"dodge",	// name of the skill
			"exp_required":	0,	// minimum combat experience required
			"jing_cost":	10,	// jing cost every time study this
			"difficulty":	20,	// the base int to learn this skill
			"max_skill":	99	// the maximum level you can learn
		]) );
	}
}
