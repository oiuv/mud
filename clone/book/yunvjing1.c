// yunvjing1.c 玉女心经上
// By Lgg,1998.9

#include <ansi.h>
inherit BOOK;
inherit F_UNIQUE;

void create()
{
        set_name(HIM "玉女心经上册" NOR, ({ "jing1", }));
        set_weight(500);
        if( clonep() )
                set_default_object(__FILE__);
        else {
             set("unit", "本");
             set("long",
        "这是一本写在薄绢上的书。封面上写着 玉女心经「上」。\n",
         );
         set("value", 0);
         set("material", "silk");
         set("skill", ([
                        "name":       "yunv-xinfa",
                        "exp_required" : 30000,
                        "jing_cost":  40,
                        "difficulty": 30,
                        "max_skill":  60,
			"min_skill":  30,
                ]) );
        }
}
