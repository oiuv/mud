#include <ansi.h>
 
inherit BOOK;

void create()
{
        set_name(WHT "「迅雷剑经」" NOR, ({ "xunlei jianjing", "jianjing", "xunlei", "jing", "book" }));
        set_weight(500);
        if (clonep())
                destruct(this_object());
        else {
                set("unit", "本");
                set("long", WHT "这是一本薄薄的书册，书皮已然发"
                            "黄，看样子已经有一段历史了。\n" NOR);
                set("value", 1);
                set("no_sell", "这本破书你自己留着吧。");
                set("material", "paper");
                set("skill", ([
                        "name":       "xunlei-jian",
                        "jing_cost":  100,
                        "difficulty": 30,
                        "max_skill":  119,
                        "min_skill":  0
                ]));
        }
}
