// bagua0.c

#include <ansi.h>

inherit BOOK;
 
void create()
{
        set_name(HIC "「河图」" NOR, ({ "hetu", "tu" }));
        set_weight(500);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "本");
                set("long", "这是一本用薄绢写成的书。上书二字古篆：“河图”。\n"
                            "书皮泛黄，看来已经保存很久了。\n");
                set("value", 0);
                set("material", "silk");
                set("skill", ([
                        "name":       "count",
                        "jing_cost":  25,
                        "difficulty": 20,
                        "max_skill":  69,
                        "min_skill":  40
                ]));
        }
}
