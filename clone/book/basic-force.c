// basic_force.c

inherit BOOK;

void create()
{
	set_name("内功入门", ({ "force book", "book" }));
	set_weight(600);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "本");
		set("long",
"封面上写著「内功入门」\n");
		set("value", 200);
		set("material", "paper");
		set("skill", ([
			"name": 	"force",
			"exp_required":	1000,
			"jing_cost":	20,
			"difficulty":	20,
			"max_skill":	19,
		]));
	}
}
