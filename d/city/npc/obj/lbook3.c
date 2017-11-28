// lbook3.c
#include <ansi.h>
inherit ITEM;
void create()
{
        set_name(YEL"千字文"NOR, ({ "literateb3", "shu3", "book3" }));
        set_weight(500);
        if( clonep() )
                set_default_object(__FILE__);
        else
        {
                set("unit", "本");
                set("long","读书人必读的千字文。\n");
                set("value", 500000);
                set("material", "paper");
                set("skill",
                ([
                        "name": "literate",      // name of the skill
                        "exp_required": 1000,      // minimum combat experience required
                        "jing_cost":    10,      // jing cost every time study this
                        "difficulty":   15,      // the base int to learn this skill
                        "max_skill":    99,      // the maximum level you can learn
                        "min_skill":    80,      // minimun level required
                ]) );
        }
}
int query_autoload()
{
   return 1;
}
