// six-book.c

#include <ansi.h>

inherit BOOK;

string skl_name();

void create()
{
	set_name(HIC "六脉神剑谱" NOR, ({ "sixfinger book", "book"}));
	set_weight(200);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "本");
                set("long","这是一幅图。上面都是纵横交叉的直线、圆圈和弧形。\n");
		set("value", 500);
		set("material", "paper");
		set("skill", ([
                        "name":         (: skl_name :), //name of the skill
                        "exp_required": 500000,         //minimum combat experience required
			"jing_cost":    100,            // jing cost every time study this
			"difficulty":	45,             // the base int to learn this skill
			"min_skill":	0,              // the minimum level you can learn
			"max_skill":	120,            // the maximum level you can learn
                        "need" : ([ "force" : 999 ]),
		]) );
	}
}

string skl_name()
{
        string *sks;

        sks = keys(SKILL_D("six-finger")->query_sub_skills());
        return sks[random(sizeof(sks))];
}
