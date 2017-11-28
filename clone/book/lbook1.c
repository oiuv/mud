#include <ansi.h>
inherit BOOK;

void create()
{
        set_name(YEL "「三字经」" NOR, ({ "literate book1", "literate", "book1" }));
        set_weight(500);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "本");
                set("long", YEL "读书人必读的三字经。\n" NOR);
                set("value", 1000);
                set("material", "paper");
                set("skill",
                ([
                        "name": "literate",
                        "jing_cost":    15,
                        "difficulty":   25,
                        "max_skill":    29,
                        "min_skill":    10,
                ]) );
        }
}
