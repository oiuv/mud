// zhangfapu.c 昊天掌法谱
// By Lgg,1998.9

#include <ansi.h>
inherit BOOK;
inherit F_UNIQUE;

void create()
{
        set_name(HIY"昊天掌法谱" NOR, ({ "zhangfa pu","pu", }));
        set_weight(1000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
             set("unit", "本");
             set("long",
        "这是一本很破旧的书，书里面好象还有一些小人挥舞拳脚的图形。\n",
         );
         set("material", "paper");
         set("skill", ([
                        "name":       "haotian-zhang",
                        "exp_required" : 10000,
                        "jing_cost":  30,
                        "difficulty": 20,
                        "max_skill":  80,
			"min_skill":  10,
                ]) );
        }
}

