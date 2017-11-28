#include <ansi.h>
 
inherit BOOK;

void create()
{
        set_name(WHT "「胡家刀谱」" NOR, ({ "hujia daopu", "hujia", "daopu", "pu", "book" }));
        set_weight(500);
        if (clonep())
                destruct(this_object());
        else {
                set("unit", "本");
                set("long", WHT "这是一本薄薄的书册，书皮已然发黄，封"
                            "面上写着「胡家刀谱」四个字。\n" NOR);
                set("value", 1);
                set("no_sell", "奶奶的，这本破书也能卖钱？");
                set("material", "paper");
                set("skill", ([
                        "name" : "blade",
                        "exp_required" : 30000,
                        "jing_cost"  : 120,
                        "difficulty" : 70,
                        "max_skill"  : 179,
                        "min_skill"  : 0
                ]));
        }
}
