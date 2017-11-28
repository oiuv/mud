#include <ansi.h>
inherit BOOK;

void create()
{
        set_name(YEL "「千字文」" NOR, ({ "literate book3", "literate", "book3" }));
        set_weight(500);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "本");
                set("long", YEL "读书人必读的千字文。\n" NOR);
                set("value", 20000);
                set("material", "paper");
                set("skill",
                ([
                        "name": "literate",
                        "jing_cost":    20,
                        "difficulty":   20,
                        "max_skill":    99,
                        "min_skill":    50,
                ]) );
        }
}

