#include <ansi.h>
inherit BOOK;

void create()
{
        set_name(HIC "「洛书」" NOR, ({ "luo shu", "luo", "shu" }));
        set_weight(500);
        if (clonep())
                destruct(this_object());
        else {
                set("unit", "本");
                set("long", HIY "这是一本用薄绢写成的书。上书二字古篆「"
                            HIC "洛书" HIY "」。书皮已然\n泛黄，看来已经"
                            "保存很久了。\n" NOR);
                set("value", 1);
                set("no_sell", "嗯？你拿的这是啥破玩意？");
                set("material", "silk");
                set("skill", ([
                        "name" : "count",
                        "exp_required" : 1000000,
                        "jing_cost"  : 120,
                        "difficulty" : 120,
                        "max_skill"  : 299,
                        "min_skill"  : 200,
                        "need" : ([ "literate" : 300 ]),
                ]));
        }
}
