#include <ansi.h>
inherit BOOK;

void create()
{
        set_name(YEL "「黄帝内经」" NOR, ({ "medical book2", "medical", "book2" }));
        set_weight(500);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "本");
                set("long", YEL "黄帝内经乃是民间流传甚广的医书。\n" NOR);
                set("value", 10000);
                set("material", "paper");
                set("skill",
                ([
                        "name" : "medical",
                        "jing_cost"  : 25,
                        "difficulty" : 30,
                        "max_skill"  : 49,
                        "min_skill"  : 30,
                ]) );
        }
}
