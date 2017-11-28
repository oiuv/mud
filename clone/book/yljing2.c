// 云龙经

inherit BOOK;

void create()
{
	set_name("云龙经「下卷」", ({ "jing", "yunlong jing" }));
	set_weight(200);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "本");
		set("long", "\n这是一册云龙经「下卷」，封皮上一条长龙在云中若隐若现。\n");
		set("value", 1000);
		set("material", "paper");
		set("skill", ([
			"name":	"yunlong-xinfa",	// name of the skill
			"exp_required":	0,	// minimum combat experience required
			"jing_cost": 20+random(20), 	// jing cost every time study this
			"difficulty":	25,	// the base int to learn this skill
			"max_skill":	99,	// the maximum level you can learn
			"min_skill":	50,	// the minimum level you can learn
		]) );
	}
}
