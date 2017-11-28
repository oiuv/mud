#include <ansi.h>
inherit BOOK;

void create()
{
        set_name(HIR "「唐诗选辑」" NOR, ({ "tangshi xuanji", "tangshi", "xuanji", "book" }));
        set_weight(500);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "本");
                set("long", HIR "一本在民间流传甚广的诗选。\n" NOR);
                set("value", 500);
                set("material", "paper");
                set("skill",
                ([
                        "name" : "literate",
                        "jing_cost" : 5,
                        "difficulty" : 10,
                        "max_skill" : 9,
                        "min_skill" : 0,
                ]) );
        }
}
