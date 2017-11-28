// book-paper.c

inherit BOOK;

void create()
{
	set_name("易筋经文学篇", ({ "shu", "book" }));
	set_weight(50);
	if( clonep() )
		set_default_object(__FILE__);
	else {
		set("unit", "本");
		set("long", "这是一本薄薄的小册，上面密密麻麻的写满了蝇头小楷，八股文章。\n");
		set("value", 500);
		set("material", "silk");
		set("skill", ([
			"name":	"literate",	// name of the skill
			"jing_cost":	20,	// jing cost every time study this
			"difficulty":	20,	// the base int to learn this skill
			"max_skill":	119,	// the maximum level you can learn
			"min_skill":	100,	// the minimum level you can learn
		]) );
	}
}
