// basic_throwing.c

inherit BOOK;

void create()
{
	set_name("暗器入门", ({ "throwing book", "book" }));
	set_weight(600);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "本");
		set("long",
"封面上写著「暗器入门」\n");
		set("value", 200);
		set("material", "paper");
		set("skill", ([
			"name": 	"throwing",
			"exp_required":	1000,
			"jing_cost":	20,
			"difficulty":	20,
			"max_skill":	19,
		]));
	}
}
