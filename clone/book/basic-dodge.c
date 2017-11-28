// basic_dodge.c

inherit BOOK;

void create()
{
	set_name("轻功入门", ({ "dodge book", "book" }));
	set_weight(600);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "本");
		set("long",
"封面上写著「轻功入门」\n");
		set("value", 200);
		set("material", "paper");
		set("skill", ([
			"name": 	"dodge",
			"exp_required":	1000,
			"jing_cost":	20,
			"difficulty":	20,
			"max_skill":	19,
		]));
	}
}
