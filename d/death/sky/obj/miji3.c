#include <ansi.h>
inherit ITEM;
void create()
{
        set_name(YEL "飞龙探云秘芨" NOR, ({ "tanyun miji", "book", "miji" }));
        set_weight(50);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "本");
                set("long", "李逍遥的家传绝学。\n");
                set("value", 500);
                set("material", "paper");
                set("skill", ([
                        "name": "feilong-shou",        // name of the skill
                        "exp_required": 0,      // minimum combat experience required
                        "jing_cost":    100,     // jing cost every time study this
                        "difficulty":   100,     // the base int to learn this skill
                        "max_skill":    150      // the maximum level you can learn
                ]) );
        }
}

