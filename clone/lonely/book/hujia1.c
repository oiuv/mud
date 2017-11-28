#include <ansi.h>
 
inherit BOOK;

void create()
{
        set_name(WHT "「胡家拳经」" NOR, ({ "hujia quanjing", "hujia", "quanjing", "jing", "book" }));
        set_weight(500);
        if (clonep())
                destruct(this_object());
        else {
                set("unit", "本");
                set("long", WHT "这是一本薄薄的书册，书皮已然发黄，看"
                            "样子已经有一段历史了。\n" NOR);
                set("value", 1);
                set("no_sell", "奶奶的，这本破书也能卖钱？");
                set("material", "paper");
                set("skill", ([
                        "name" : "hujia-quan",
                        "exp_required" : 10000,
                        "jing_cost"  : 100,
                        "difficulty" : 40,
                        "max_skill"  : 119,
                        "min_skill"  : 0
                ]));
        }
}
