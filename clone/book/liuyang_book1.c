inherit BOOK;

void create()
{
	set_name( "天山六阳掌法图上册", ({ "zhangfa tu1", "tu1" }));
	set_weight(200);
	if( clonep() )
		set_default_object(__FILE__);
	else {
		set("unit", "本");
		set("long", "这是六阳掌法上册，上面画着一些纷繁复杂的招式及修练法门。\n");
		set("value", 500);
		set("no_put", 1);
		set("material", "paper");
		set("skill", ([
			"name":	"liuyang-zhang",	
			"exp_required":	10000,	// minimum combat experience required
			"jing_cost":    20, 	// jing cost every time study this
			"difficulty":	20,	// the base int to learn this skill
			"max_skill":	49,	// the maximum level you can learn
			"min_skill":	10,	// the maximum level you can learn
		]) );
	}
}
