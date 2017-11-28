// jinshe2.c 
inherit BOOK;
inherit F_UNIQUE;

#include <ansi.h>

void setup()
{}

void create()
{
        set_name(YEL"「金蛇秘芨」"NOR"中册", ({ "jinshe book2","book2", }));
        set_weight(500);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "本");
                set("material", "paper");
                set("long",
        "这是一本用薄纸写成的书。上书：「金蛇秘芨」。\n"
        "书皮泛黄，看来已经保存很久了。\n", );
		set("skill", ([
			"name"        : "jinshe-zhui",
			"exp_required":	100000,
			"jing_cost"   :	40,
			"difficulty"  :	35,
			"max_skill"   : 119,
		]));
        }
}

