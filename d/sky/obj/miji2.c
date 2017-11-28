#include <ansi.h>
inherit ITEM;
void create()
{
        set_name(HIC "四季剑法" NOR, ({ "jianfa miji", "book", "miji" }));
        set_weight(50);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "本");
                set("long", "这是一本薄薄的小册，上面记载了四季剑法的奥决。\n");
                set("value", 30);
                set("material", "paper");
                set("skill", ([
                        "name": "siji-jianfa",        // name of the skill
                        "exp_required": 0,      // minimum combat experience required
                        "jing_cost":    50,     // jing cost every time study this
                        "difficulty":   50,     // the base int to learn this skill
                        "max_skill":    150      // the maximum level you can learn
                ]) );
        }
}

