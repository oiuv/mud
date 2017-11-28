#include <ansi.h>
inherit BOOK;

void create()
{
        set_name(HIC "「河图」" NOR, ({ "he tu", "he", "tu" }));
        set_weight(500);
        if (clonep())
                destruct(this_object());
        else {
                set("unit", "本");
                set("long", HIY "这是一本用薄绢写成的书。上书二字古篆「"
                            HIC "河图" HIY "」。书皮已然\n泛黄，看来已经"
                            "保存很久了。\n" NOR);
                set("value", 1);
                set("no_sell", "嗯？你拿的这是啥破玩意？");
                set("material", "silk");
                set("skill", ([
                        "name" : "count",
                        "exp_required" : 1000000,
                        "jing_cost"  : 80,
                        "difficulty" : 80,
                        "max_skill"  : 199,
                        "min_skill"  : 100,
                        "need" : ([ "literate" : 300 ]),
                ]));
        }
}
