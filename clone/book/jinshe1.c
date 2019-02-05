// jinshe1.c

inherit BOOK;
inherit F_UNIQUE;

#include <ansi.h>

void setup()
{}

void create()
{
        set_name(YEL"「金蛇秘芨」"NOR"上册", ({ "jinshe book1","book1", }));
        set_weight(500);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "本");
                set("material", "paper");
                set("long",
        "这是一本用薄纸写成的书。上书：「金蛇秘芨」。\n"
        "书皮泛黄，看来已经保存很久了。\n", );
		set("skill", ([
			"name"        : "jinshe-jian",
			"exp_required":	1000,
			"jing_cost"   :	55,
			"difficulty"  :	38,
			"min_skill"   : 50,
			"max_skill"   : 119,
		]));
        }
}
