// 天山折梅手法图

inherit BOOK;

void create()
{
	set_name( "天山折梅手法图上卷", ({ "shoufa tu1", "tu1" }));
	set_weight(200);
	if( clonep() )
		set_default_object(__FILE__);
	else {
		set("unit", "幅");
		set("long", "这是一幅天山折梅手法图，上面画着一些纷繁复杂的招式。\n");
		set("value", 500);
		set("no_put", 1);
		set("material", "paper");
		set("skill", ([
			"name":	"zhemei-shou",	
			"exp_required":	10000,	// minimum combat experience required
			"jing_cost":    20, 	// jing cost every time study this
			"difficulty":	20,	// the base int to learn this skill
			"max_skill":	49,	// the maximum level you can learn
			"min_skill":    10,
		]) );
	}
}
