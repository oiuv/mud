// jinyantu.c 金雁图谱
// By Lgg,1998.9

#include <ansi.h>
inherit BOOK;
inherit F_UNIQUE;

void create()
{
        set_name(HIC"金雁图谱" NOR, ({ "jinyan tu","tu", }));
        set_weight(800);
        if( clonep() )
                set_default_object(__FILE__);
        else {
             set("unit", "本");
             set("long",
        "这是本很普通的书，书里面好象有一些小人飞舞的图形。\n",
         );
         set("material", "paper");
         set("skill", ([
                        "name":       "jinyan-gong",
                        "exp_required" : 10000,
                        "jing_cost":  25,
                        "difficulty": 18,
                        "max_skill":  60,
			"min_skill":  10,
                ]) );
        }
}
