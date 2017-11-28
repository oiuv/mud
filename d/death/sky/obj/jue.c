#include <ansi.h>
inherit ITEM;
void create()
{
        set_name(HIW "长生决" NOR, ({ "changsheng jue", "book", "jue" }));
        set_weight(50);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "本");
                set("long", "这便是四大奇书之一的长生决，传说可以修炼至高无上的武学。\n");
                set("value", 300);
                set("material", "paper");
                set("skill", ([
                        "name": "changsheng-jue",        // name of the skill
                        "exp_required": 100000,      // minimum combat experience required
                        "jing_cost":    50,     // jing cost every time study this
                        "difficulty":   50,     // the base int to learn this skill
                        "max_skill":    250      // the maximum level you can learn
                ]) );
        }
}

