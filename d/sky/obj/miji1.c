#include <ansi.h>
inherit ITEM;
void create()
{
        set_name(CYN "铁线拳密芨" NOR, ({ "miji", "book" }));
        set_weight(50);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "本");
                set("long", "这是一本薄薄的小册，上面记载了不少精妙的拳法。\n");
                set("value", 0);
                set("material", "paper");
                set("skill", ([
                        "name": "tiexian-quan",        // name of the skill
                        "exp_required": 0,      // minimum combat experience required
                        "jing_cost":    20,     // jing cost every time study this
                        "difficulty":   20,     // the base int to learn this skill
                        "max_skill":    150      // the maximum level you can learn
                ]) );
        }
}
