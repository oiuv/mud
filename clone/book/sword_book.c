// sword_book.c

inherit BOOK;

void create()
{
	set_name("华山剑谱", ({ "sword book", "book" }));
	set_weight(600);
	if( clonep() )
		set_default_object(__FILE__);
	else {
		set("unit", "本");
		set("long",
"封面上写著「华山剑法 -- 卷一（入门）」\n");
		set("value", 100);
		set("material", "paper");
		set("skill", ([
			"name": 	"sword",
			"exp_required":	1000,
			"jing_cost":	20,
			"difficulty":	20,
			"max_skill":	30,
		]));
	}
}
