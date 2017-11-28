// basic_parry.c

inherit BOOK;

void create()
{
	set_name("招架入门", ({ "parry book", "book" }));
	set_weight(600);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "本");
		set("long",
"封面上写著「招架入门」\n");
		set("value", 200);
		set("material", "paper");
		set("skill", ([
			"name": 	"parry",
			"exp_required":	1000,
			"jing_cost":	20,
			"difficulty":	20,
			"max_skill":	19,
		]));
	}
}
